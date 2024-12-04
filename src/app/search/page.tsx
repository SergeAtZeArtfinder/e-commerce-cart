import { redirect } from 'next/navigation'

import type { Metadata } from 'next'
import type { PageProps } from '@/types'

import prisma from '@/lib/db/prisma'
import ProductCard from '@/components/ProductCard'

export const generateMetadata = async ({
  searchParams,
}: PageProps<{}, { q?: string }>): Promise<Metadata> => {
  const query = searchParams.q
  if (!query) {
    redirect('/')
  }

  return {
    title: `Search: ${query} - Flowmazon`,
    description: `Search results for "${query}"`,
    openGraph: {
      type: 'website',
      title: `Search for "${query}"`,
      description: `Search results for "${query}"`,
    },
  }
}

const SearchPage = async ({ searchParams }: PageProps<{}, { q?: string }>) => {
  const query = searchParams.q
  if (!query) {
    redirect('/')
  }
  const products = await prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ],
    },
  })

  return (
    <>
      <h1 className="mb-3 text-3xl font-bold">
        Search for &quot;{query}&quot;
      </h1>
      <div className="my-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      {products.length === 0 && (
        <p className="text-center">No products found</p>
      )}
    </>
  )
}

export default SearchPage
