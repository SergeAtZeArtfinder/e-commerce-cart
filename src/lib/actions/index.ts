'use server'

import { revalidatePath } from 'next/cache'

import prisma from '@/lib/db/prisma'
import { getCart, createCart } from '../db/cart'

export const incrementProductQtyAction = async (productId: string) => {
  let cart = await getCart()
  if (!cart) {
    cart = await createCart()
  }

  const itemInTheCart = cart.items.find((item) => item.productId === productId)

  if (itemInTheCart) {
    await prisma.cart.update({
      where: {
        id: cart.id,
      },
      data: {
        items: {
          update: {
            where: {
              id: itemInTheCart.id,
            },
            data: {
              quantity: {
                increment: 1,
              },
            },
          },
        },
      },
    })
  } else {
    await prisma.cart.update({
      where: {
        id: cart.id,
      },
      data: {
        items: {
          create: {
            productId,
            quantity: 1,
          },
        },
      },
    })
  }

  revalidatePath('/products/[id]', 'page')
}

export const setProductQtyAction = async (
  productId: string,
  quantity: number
) => {
  let cart = await getCart()
  if (!cart) {
    cart = await createCart()
  }

  const itemInTheCart = cart.items.find((item) => item.productId === productId)

  if (itemInTheCart && quantity <= 0) {
    await prisma.cart.update({
      where: {
        id: cart.id,
      },
      data: {
        items: {
          delete: {
            id: itemInTheCart.id,
          },
        },
      },
    })

    revalidatePath('/cart', 'page')
    return
  }

  if (itemInTheCart) {
    await prisma.cart.update({
      where: {
        id: cart.id,
      },
      data: {
        items: {
          update: {
            where: {
              id: itemInTheCart.id,
            },
            data: {
              quantity,
            },
          },
        },
      },
    })
  } else {
    await prisma.cart.update({
      where: {
        id: cart.id,
      },
      data: {
        items: {
          create: {
            productId,
            quantity,
          },
        },
      },
    })
  }

  revalidatePath('/cart', 'page')
}
