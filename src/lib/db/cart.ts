import { cookies } from 'next/headers'
import { CartItem, Prisma } from '@prisma/client'
import { getServerSession } from 'next-auth'

import { Cart } from '@prisma/client'

import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from './prisma'

export type CartWithProducts = Prisma.CartGetPayload<{
  include: {
    items: {
      include: {
        product: true
      }
    }
  }
}>

export type CartItemWithProducts = Prisma.CartItemGetPayload<{
  include: {
    product: true
  }
}>

export type ShoppingCart = CartWithProducts & {
  size: number
  subTotal: number
}

/**
 * @description Creates a new cart and sets a cookie with the cart ID
 * for future retrieval, eg. in case of guest users
 */
export const createCart = async (): Promise<ShoppingCart> => {
  const session = await getServerSession(authOptions)
  let newCart: Cart

  if (session) {
    newCart = await prisma.cart.create({
      data: {
        userId: session.user.id,
      },
    })
  } else {
    newCart = await prisma.cart.create({
      data: {},
    })
    // if anonymous user create a cookie with the cart ID
    // Note: needs encryption and secure, httpOnly settings if to be used in production
    cookies().set('localCartId', newCart.id)
  }

  return {
    ...newCart,
    items: [],
    size: 0,
    subTotal: 0,
  }
}

export const getCart = async (): Promise<ShoppingCart | null> => {
  const session = await getServerSession(authOptions)
  let cart: CartWithProducts | null = null

  if (session) {
    cart = await prisma.cart.findFirst({
      where: {
        userId: session.user.id,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    })
  } else {
    const localCartId = cookies().get('localCartId')?.value

    cart = localCartId
      ? await prisma.cart.findUnique({
          where: {
            id: localCartId,
          },
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        })
      : null
  }

  if (!cart) {
    return null
  }

  return {
    ...cart,
    size: cart.items.reduce((totalQty, item) => totalQty + item.quantity, 0),
    subTotal: cart.items.reduce(
      (totalPrice, item) => totalPrice + item.product.price * item.quantity,
      0
    ),
  }
}

/**
 * @description merges the anonymous cart into the user cart
 * We want to call it just after the login ASAP
 * In the authOptions, create an event on login
 * at src/app/api/auth/[...nextauth]/route.ts
 */
export const mergeAnonymousCartIntoUserCart = async (userId: string) => {
  // 1 fetch local cart if exists
  const localCartId = cookies().get('localCartId')?.value
  const localCart = localCartId
    ? await prisma.cart.findUnique({
        where: {
          id: localCartId,
        },
        include: {
          items: true,
        },
      })
    : null

  // 2. if no local cart, there is nothing to merge. return
  if (!localCart) {
    return
  }

  // 3. fetch user cart if exists
  const userCart = await prisma.cart.findFirst({
    where: {
      userId,
    },
    include: {
      items: true,
    },
  })

  // 4. we want to make a Prisma DB transaction operation
  // because we shall make several db operations in one go
  // and if any of them fails, we want to rollback the entire transaction
  await prisma.$transaction(async (tx) => {
    if (userCart) {
      const mergedItems = mergeCartItems(localCart.items, userCart.items)

      // 5. delete user cart items, and set these new merged items instead
      await tx.cartItem.deleteMany({
        where: {
          cartId: userCart.id,
        },
      })

      // we want to omit the previously existing item IDs
      await tx.cartItem.createMany({
        data: mergedItems.map((item) => ({
          cartId: userCart.id,
          productId: item.productId,
          quantity: item.quantity,
        })),
      })
    } else {
      // 6. if user cart does not exist, create a new cart and set these local cart items
      await tx.cart.create({
        data: {
          userId,
          items: {
            createMany: {
              data: localCart.items.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
              })),
            },
          },
        },
      })
    }

    // 7. delete the old local cart, because not needed any more
    // as it has been merged into the user cart
    await tx.cart.delete({
      where: {
        id: localCart.id,
      },
    })
    // 8. delete the local cart cookie
    cookies().set('localCartId', '', {
      expires: new Date(0),
    })
  })
}

function mergeCartItems(...cartItems: CartItem[][]) {
  return cartItems.reduce((acc, items) => {
    items.forEach((item) => {
      const existingItem = acc.find((i) => i.productId === item.productId)
      if (existingItem) {
        existingItem.quantity += item.quantity
      } else {
        acc.push(item)
      }
    })
    return acc
  }, [] as CartItem[])
}
