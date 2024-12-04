import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  return new PrismaClient()
}

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>
} & typeof global

const prismaBase = globalThis.prismaGlobal ?? prismaClientSingleton()

const prisma = prismaBase.$extends({
  query: {
    cart: {
      async update({ query, args }) {
        args.data = { ...args.data, updatedAt: new Date() }
        return query(args)
      },
    },
  },
})

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prismaBase
