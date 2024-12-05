import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'

import type { NextAuthOptions } from 'next-auth'

import prisma from '@/lib/db/prisma'
import { mergeAnonymousCartIntoUserCart } from '@/lib/db/cart'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      session.user.id = user.id
      session.user.role =
        user.email === process.env.ADMIN_EMAIL ? 'ADMIN' : 'USER'

      return session
    },
  },
  events: {
    async signIn({ user }) {
      await mergeAnonymousCartIntoUserCart(user.id)
    },
  },
}
