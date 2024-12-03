import './globals.css'

export const metadata = {
  title: 'NextJS v.14 Code Polygon',
  description: 'Code polygon for latest Next.js v.14, features and patterns',
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
      <body>{children}</body>
    </html>
  )
}
