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
