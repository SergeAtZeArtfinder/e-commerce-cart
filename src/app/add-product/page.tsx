import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { authOptions } from '@/lib/authOptions'
import FormSubmitButton from '@/components/FormSubmitButton'
import prisma from '@/lib/db/prisma'

export const metadata = {
  title: 'Add product - Flowmazon',
}

const addProductSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  imageUrl: z.string().url(),
  price: z.string().transform((value) => parseInt(value, 10)),
})

const addProduct = async (formData: FormData) => {
  'use server'
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/api/auth/signin?callbackUrl=/add-product')
  }

  const values = Object.fromEntries(formData)
  const validation = addProductSchema.safeParse(values)
  if (!validation.success) {
    throw new Error(validation.error.errors[0].message)
  }

  await prisma.product.create({
    data: validation.data,
  })

  revalidatePath('/')
  redirect('/')
}

const AddProductPage = async () => {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/api/auth/signin?callbackUrl=/add-product')
  }

  if (session.user.role !== 'ADMIN') {
    redirect('/')
  }

  return (
    <div>
      <h1 className="mb-3 text-lg font-bold">Add product</h1>
      <form action={addProduct}>
        <input
          required
          name="name"
          placeholder="Name"
          type="text"
          className="input-bordered input mb-3 w-full"
        />
        <textarea
          required
          name="description"
          placeholder="Description"
          className="textarea-bordered textarea mb-3 w-full"
        />
        <input
          required
          name="imageUrl"
          placeholder="Image URL"
          type="url"
          className="input-bordered input mb-3 w-full"
        />
        <input
          required
          name="price"
          placeholder="Price"
          type="number"
          className="input-bordered input mb-3 w-full"
        />
        <FormSubmitButton className="btn-block">Add product</FormSubmitButton>
      </form>
    </div>
  )
}

export default AddProductPage
