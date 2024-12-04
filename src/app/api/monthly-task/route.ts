import { NextResponse } from 'next/server'
import prisma from '@/lib/db/prisma'

export const GET = async (req: Request) => {
  const oneMonthAgo = new Date()
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)

  const batchResult = await prisma.cart.deleteMany({
    where: {
      AND: [
        {
          updatedAt: {
            lt: oneMonthAgo,
          },
        },
        {
          userId: null,
        },
      ],
    },
  })

  const message = `Monthly task executed. Deleted ${batchResult.count} abandoned carts.`
  console.log(message)

  return NextResponse.json({ message })
}
