import { getCart } from '@/lib/db/cart'
import CartEntry from '@/components/CartEntry'
import { setProductQtyAction } from '@/lib/actions'
import { formatPrice } from '@/lib/format'

export const metadata = {
  title: 'Your Cart - Flowmazon',
  description: 'Shopping Cart',
}

const CartPage = async () => {
  const cart = await getCart()

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Shopping Cart</h1>
      {cart?.items.map((item) => (
        <CartEntry
          key={item.id}
          cartItem={item}
          updateQuantityAction={setProductQtyAction}
        />
      ))}
      {!cart?.items.length && <p>Your cart is empty</p>}
      <div className="flex flex-col items-end sm:items-center">
        <p className="mb-3 font-bold">
          Total: {formatPrice(cart?.subTotal ?? 0)}
        </p>
        <button className="btn btn-primary sm:w-[200px]">Checkout</button>
      </div>
    </div>
  )
}

export default CartPage
