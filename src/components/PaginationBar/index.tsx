'use client'

import clsx from 'clsx'
import Link from 'next/link'
import React from 'react'

interface Props {
  currentPage: number
  totalPages: number
}

const getPages = ({ currentPage, totalPages }: Props) => {
  const maxPage = Math.min(totalPages, Math.max(currentPage + 4, 10))
  const minPage = Math.max(1, Math.min(currentPage - 5, maxPage - 9))
  const pages: number[] = []

  for (let page = minPage; page <= maxPage; page++) {
    pages.push(page)
  }

  return pages
}

const PaginationBar = ({ currentPage, totalPages }: Props): JSX.Element => {
  return (
    <>
      <div className="join hidden sm:block">
        {getPages({ currentPage, totalPages }).map((page) => (
          <Link
            key={page}
            href={page > 1 ? `?page=${page}` : '/'}
            className={clsx(
              'btn join-item',
              currentPage === page && 'btn-active pointer-events-none'
            )}
          >
            {page}
          </Link>
        ))}
      </div>
      <div className="join block sm:hidden">
        {currentPage > 1 && (
          <Link href={`?page=${currentPage - 1}`} className="btn join-item">
            «
          </Link>
        )}
        <button className="join-item btn pointer-events-none">
          Page {currentPage}
        </button>
        {currentPage < totalPages && (
          <Link href={`?page=${currentPage + 1}`} className="btn join-item">
            »
          </Link>
        )}
      </div>
    </>
  )
}

export default PaginationBar
