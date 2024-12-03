'use client'

import { formatPrice } from '@/lib/format'
import clsx from 'clsx'
import React from 'react'

interface Props {
  price: number
  className?: string
  currency?: 'USD' | 'GBP' | 'EUR'
}

const PriceTag = ({ price, className, currency }: Props): JSX.Element => {
  return (
    <span className={clsx('badge', className)}>
      {formatPrice(price, currency)}
    </span>
  )
}

export default PriceTag
