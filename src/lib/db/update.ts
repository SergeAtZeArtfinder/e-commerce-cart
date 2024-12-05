import prisma from './prisma'

export const updateQty = async () => {
  'use server'
  try {
    await prisma.product.updateMany({
      data: {
        quantity: 100,
      },
    })
    console.log('Done! 👍')
  } catch (error) {
    console.log('error :>> ', error)
  }
}
