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
    await prisma.cartItem.update({
      where: {
        id: itemInTheCart.id,
      },
      data: {
        quantity: {
          increment: 1,
        },
      },
    })
  } else {
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity: 1,
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
    await prisma.cartItem.delete({
      where: {
        id: itemInTheCart.id,
      },
    })

    revalidatePath('/cart', 'page')
    return
  }

  if (itemInTheCart) {
    await prisma.cartItem.update({
      where: {
        id: itemInTheCart.id,
      },
      data: {
        quantity,
      },
    })
  } else {
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity,
      },
    })
  }

  revalidatePath('/cart', 'page')
}
