import { Inter } from 'next/font/google'
import Navbar from '@/components/Navbar'

import './globals.css'
import Footer from '@/components/Footer'

const inter = Inter({
  subsets: ['latin'],
})

export const metadata = {
  title: 'Flowmazon',
  description: 'E-commerce - We make your wallet cry',
}

type Props = {
  children: React.ReactNode
}

export default function RootLayout({ children }: Props) {
  return (
    <html lang="en">
      {/*
        <head /> will contain the components returned by the nearest parent
        head.tsx. Find out more at https://beta.nextjs.org/docs/api-reference/file-conventions/head
      */}
      <head />
      <body className={inter.className}>
        <Navbar />
        <main className="p-4 max-w-7xl min-w-[320px] mx-auto">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
