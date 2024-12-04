import Image from 'next/image'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getServerSession } from 'next-auth'

import logo from '@/assets/logo.png'
import { getCart } from '@/lib/db/cart'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import ShoppingCartButton from './ShoppingCartButton'
import UserMenuButton from './UserMenuButton'

const searchAction = async (formData: FormData) => {
  'use server'

  const searchQuery = formData.get('searchQuery')?.toString()
  if (searchQuery) {
    redirect(`/search?q=${searchQuery}`)
  }
}

const Navbar = async () => {
  const cart = await getCart()
  const session = await getServerSession(authOptions)
  return (
    <header className="bg-base-100">
      <nav className="navbar max-w-7xl mx-auto flex-col sm:flex-row gap-2">
        <div className="flex-1">
          <Link href="/" className="btn btn-ghost text-xl normal-case">
            <Image src={logo} alt="Flowmazon" width={40} height={40} />
            Flowmazon
          </Link>
        </div>
        <div className="flex-none gap-2">
          <form action={searchAction}>
            <div className="form-control">
              <input
                type="text"
                name="searchQuery"
                placeholder="Search"
                className="input input-bordered w-full min--w-[100px]"
              />
            </div>
          </form>
          <ShoppingCartButton cart={cart} />
          <UserMenuButton session={session} />
        </div>
      </nav>
    </header>
  )
}

export default Navbar
