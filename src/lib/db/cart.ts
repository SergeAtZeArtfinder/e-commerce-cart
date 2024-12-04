import { cookies } from 'next/headers'
import { Prisma } from '@prisma/client'

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
  const newCart = await prisma.cart.create({
    data: {},
  })

  // Note: needs encryption and secure, httpOnly settings if to be used in production
  cookies().set('localCartId', newCart.id)

  return {
    ...newCart,
    items: [],
    size: 0,
    subTotal: 0,
  }
}

export const getCart = async (): Promise<ShoppingCart | null> => {
  const localCartId = cookies().get('localCartId')?.value

  const cart = localCartId
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
