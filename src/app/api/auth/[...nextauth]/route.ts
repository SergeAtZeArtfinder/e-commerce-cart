import NextAuth from 'next-auth/next'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'

import type { NextAuthOptions } from 'next-auth'

import prisma from '@/lib/db/prisma'
import { env } from '@/lib/env'
import { mergeAnonymousCartIntoUserCart } from '@/lib/db/cart'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      session.user.id = user.id

      return session
    },
  },
  events: {
    async signIn({ user }) {
      await mergeAnonymousCartIntoUserCart(user.id)
    },
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
