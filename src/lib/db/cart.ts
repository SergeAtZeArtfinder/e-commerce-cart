import { cookies } from 'next/headers'
import { Prisma } from '@prisma/client'
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
