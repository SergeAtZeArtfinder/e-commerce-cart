'use client'

import React, { useTransition } from 'react'

import type { CartItemWithProducts } from '@/lib/db/cart'
import Image from 'next/image'
import Link from 'next/link'
import { formatPrice } from '@/lib/format'

const Options = ({ quantityAvailable }: { quantityAvailable: number }) => {
  const quantityOptions = Array.from(
    { length: quantityAvailable + 1 },
    (_, i) => i
  ).map((i) => (
    <option key={i} value={i}>
      {i === 0 ? '0 Remove' : i}
    </option>
  ))

  return <>{quantityOptions}</>
}

interface Props {
  cartItem: CartItemWithProducts
  updateQuantityAction: (productId: string, quantity: number) => Promise<void>
}

const CartEntry = ({
  cartItem: { product, quantity },
  updateQuantityAction,
}: Props): JSX.Element => {
  const [isPending, startTransition] = useTransition()
  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <Image
          src={product.imageUrl}
          alt={product.name}
          width={200}
          height={200}
          className="rounded-lg"
        />
        <div>
          <Link href={`/products/${product.id}`} className="font-bold">
            {product.name}
          </Link>
          <div>Price: {formatPrice(product.price)}</div>
          <div className="my-1 flex items-center gap-2">
            Quantity:
            <select
              defaultValue={quantity}
              onChange={(e) => {
                startTransition(async () => {
                  await updateQuantityAction(
                    product.id,
                    parseInt(e.target.value, 10)
                  )
                })
              }}
              disabled={product.quantity <= 0}
              className="select select-bordered w-full max-w-[80px]"
            >
              <Options quantityAvailable={product.quantity} />
            </select>
          </div>
          <div className="flex items-center gap-3">
            Total: {formatPrice(product.price * quantity)}
            {isPending && (
              <span className="loading loading-spinner loading-sm" />
            )}
          </div>
        </div>
      </div>
      <div className="divider"></div>
    </div>
  )
}

export default CartEntry
