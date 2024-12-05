'use client'

import React from 'react'
import { Product } from '@prisma/client'
import Link from 'next/link'
import PriceTag from '../PriceTag'
import Image from 'next/image'

interface Props {
  product: Product
}

const ProductCard = ({ product }: Props): JSX.Element => {
  const isNew =
    Date.now() - new Date(product.createdAt).getTime() < 1000 * 60 * 60 * 24 * 7
  return (
    <Link
      href={`/products/${product.id}`}
      className="card w-full bg-base-100 hover:shadow-xl transition-shadow"
    >
      <figure>
        <Image
          src={product.imageUrl}
          alt={product.name}
          width={800}
          height={400}
          className="h-48 object-cover"
        />
      </figure>
      <div className="card-body">
        <h2 className="card-title">{product.name}</h2>
        {isNew && <span className="badge badge-secondary">New</span>}
        <p>{product.description}</p>
        <div className="mt-auto ml-auto text-sm">
          {product.quantity > 0 ? (
            <p>Qty: {product.quantity}</p>
          ) : (
            <p>Out of stock</p>
          )}
        </div>
        <PriceTag price={product.price} />
      </div>
    </Link>
  )
}

export default ProductCard
