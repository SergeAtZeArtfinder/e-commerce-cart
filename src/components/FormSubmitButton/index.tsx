'use client'
import { useFormStatus } from 'react-dom'
import React, { ComponentProps } from 'react'
import clsx from 'clsx'

interface Props extends ComponentProps<'button'> {}

const FormSubmitButton = ({
  children,
  className,
  ...restButtonProps
}: Props): JSX.Element => {
  const { pending } = useFormStatus()
  return (
    <button
      {...restButtonProps}
      type="submit"
      disabled={pending}
      className={clsx('btn btn-primary', className)}
    >
      {pending && <span className="loading loading-spinner loading-xs" />}
      {children}
    </button>
  )
}

export default FormSubmitButton
