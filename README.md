## Youtube
https://www.youtube.com/watch?v=AaiijESQH5o

## MongoDB w Prisma
- if existing database, can pull and Prisma will generate the models automatically based on data
```sh
npx prisma db pull
```
- otherwise, you can create your own Model locally, then push that data model to db
```sh
npx prisma db push
```
- when done, we need to generate our prisma client to match our latest updates
```sh
npx prisma generate
```

## Removing abandoned shopping carts
when anonymous user created a cart an never used it - it will accumulate the shopping carts not in use, which need to be deleted.
- IF cart has no userID and the latest updated date is long ago - then it can be removed
- such job needs to run periodically

1. Firstly we need to refactor all places where we are create/update/delete cartItems directly, by achieving the same operation via the cart entity;
   
example:
```ts
await prisma.cartItem.delete({
      where: {
        id: itemInTheCart.id,
      },
})
```
to be replaced by cart operation so we can have updatedAt entry in the cart:
```ts
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
```
the same can be done for update and create item
2. However, the updating referenced child entity, will NOT update the parent, eg. an update to `cartItem` will not change the `cart.updatedAt` value, we either need to pass every time the `cart.updatedAt: new Date()` in each operation. Or we can extend the prisma client at its initialization file by extending it, so when cart children updated the cart's `updatedAt` value is updated as well.
here:

```ts
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
```
2. Then set a Cron job on Vercel, or a cron job ( by lambda ) on mMongo Atlas cloud. [`Vercel cron jobs`](https://vercel.com/docs/cron-jobs/quickstart)

### Intro to Next.js V3

https://scottmoss.notion.site/scottmoss/Intro-to-Next-js-V3-6cefbdba58d94e3897dcb8d7e7fc0337

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
