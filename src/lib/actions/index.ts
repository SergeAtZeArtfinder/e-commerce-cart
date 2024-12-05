'use server'

import { revalidatePath } from 'next/cache'

import prisma from '@/lib/db/prisma'
import { getCart, createCart } from '../db/cart'

export const incrementProductQtyAction = async (productId: string) => {
  await prisma.$transaction(async (tx) => {
    let cart = await getCart()
    if (!cart) {
      cart = await createCart()
    }

    const itemInTheCart = cart.items.find(
      (item) => item.productId === productId
    )

    if (itemInTheCart) {
      await tx.cart.update({
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
                product: {
                  update: {
                    quantity: {
                      decrement: 1,
                    },
                  },
                },
              },
            },
          },
        },
      })
    } else {
      await tx.cart.update({
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
      await tx.product.update({
        where: {
          id: productId,
        },
        data: {
          quantity: {
            decrement: 1,
          },
        },
      })
    }
  })

  revalidatePath('/cart', 'page')
  revalidatePath('/products/[id]', 'page')
}

export const setProductQtyAction = async (
  productId: string,
  quantity: number
) => {
  await prisma.$transaction(async (tx) => {
    let cart = await getCart()
    if (!cart) {
      cart = await createCart()
    }

    const itemInTheCart = cart.items.find(
      (item) => item.productId === productId
    )
    if (itemInTheCart && quantity <= 0) {
      await tx.cart.update({
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

      await tx.product.update({
        where: {
          id: productId,
        },
        data: {
          quantity: {
            increment: itemInTheCart.quantity,
          },
        },
      })

      revalidatePath('/cart', 'page')
      revalidatePath('/products/[id]', 'page')
      return
    }

    if (itemInTheCart) {
      const difference = quantity - itemInTheCart.quantity
      await tx.cart.update({
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
                product: {
                  update: {
                    quantity:
                      difference > 0
                        ? {
                            decrement: difference,
                          }
                        : {
                            increment: Math.abs(difference),
                          },
                  },
                },
              },
            },
          },
        },
      })
    } else {
      await tx.cart.update({
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
      await tx.product.update({
        where: {
          id: productId,
        },
        data: {
          quantity: {
            decrement: quantity,
          },
        },
      })
    }
  })

  revalidatePath('/cart', 'page')
  revalidatePath('/products/[id]', 'page')
}
