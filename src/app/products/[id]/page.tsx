import { notFound } from 'next/navigation'
import { unstable_cache as cache } from 'next/cache'
import Image from 'next/image'

import type { Metadata } from 'next'
import type { PageProps } from '@/types'

import prisma from '@/lib/db/prisma'
import PriceTag from '@/components/PriceTag'
import AddToCartButton from '@/components/AddToCartButton'
import { incrementProductQtyAction } from '@/lib/actions'

const getProduct = cache(async (id: string) => {
  const product = await prisma.product.findUnique({
    where: { id },
  })

  if (!product) {
    return notFound()
  }

  return product
})

export const generateMetadata = async ({
  params,
}: PageProps<{ id: string }>): Promise<Metadata> => {
  const product = await getProduct(params.id)
  return {
    title: product.name + ' - Flowmazon',
    description: product.description,
    openGraph: {
      type: 'website',
      title: product.name,
      description: product.description,
      images: [
        {
          url: product.imageUrl,
        },
      ],
    },
  }
}

const ProductDetailsPage = async ({
  params: { id },
}: PageProps<{ id: string }>) => {
  const product = await getProduct(id)

  return (
    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
      <Image
        src={product.imageUrl}
        alt={product.name}
        width={500}
        height={500}
        className="rounded-lg"
        priority
      />
      <div>
        <h1 className="text-5xl font-bold">{product.name}</h1>
        <PriceTag price={product.price} className="mt-4" />
        <p className="py-4">{product.description}</p>
        <AddToCartButton
          productId={product.id}
          action={incrementProductQtyAction}
        />
      </div>
    </div>
  )
}

export default ProductDetailsPage
