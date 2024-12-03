'use client'

interface PageProps {
  error: Error
  reset: () => void
}
const Page = ({ error, reset }: PageProps) => {
  return (
    <div className="h-full flex flex-col justify-center items-center gap-2">
      <h1 className="text-3xl font-bold underline text-center">
        Error occurred
      </h1>
      {error.message && (
        <p className="text-lg text-center text-red-600">{error.message}</p>
      )}
      <button
        onClick={() => reset()}
        className="px-2 py-1 text-white rounded bg-red-500 hover:bg-red-600 active:bg-red-700"
      >
        reset
      </button>
    </div>
  )
}

export default Page
