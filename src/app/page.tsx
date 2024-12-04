import Image from 'next/image'
import Link from 'next/link'

import { PageProps } from '@/types'

import PaginationBar from '@/components/PaginationBar'
import ProductCard from '@/components/ProductCard'
import prisma from '@/lib/db/prisma'

const PAGE_SIZE = 6
const HERO_ITEMS_COUNT = 1

const Homepage = async ({ searchParams }: PageProps<{}, { page?: string }>) => {
  const totalItemsCount = await prisma.product.count()
  const currentPage = searchParams.page ? parseInt(searchParams.page) : 1
  const totalPages = Math.ceil((totalItemsCount - HERO_ITEMS_COUNT) / PAGE_SIZE)
  const skip =
    (currentPage - 1) * PAGE_SIZE + (currentPage === 1 ? 0 : HERO_ITEMS_COUNT)
  const take = PAGE_SIZE + (currentPage === 1 ? HERO_ITEMS_COUNT : 0)

  const products = await prisma.product.findMany({
    orderBy: {
      id: 'desc',
    },
    skip,
    take,
  })

  return (
    <div className="flex flex-col items-center">
      {currentPage === 1 && (
        <div className="hero rounded-xl bg-base-200">
          <div className="hero-content flex-col lg:flex-row">
            <Image
              src={products[0].imageUrl}
              alt={products[0].name}
              width={400}
              height={800}
              className="w-full max-w-sm rounded-lg shadow-xl"
              priority
            />
            <div>
              <h1 className="text-5xl font-bold">{products[0].name}</h1>
              <p className="py-6">{products[0].description}</p>
              <Link
                href={`/products/${products[0].id}`}
                className="btn btn-primary"
              >
                Check it out
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="my-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {(currentPage === 1 ? products.slice(1) : products).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {totalPages > 1 && (
        <PaginationBar currentPage={currentPage} totalPages={totalPages} />
      )}
    </div>
  )
}

export default Homepage
