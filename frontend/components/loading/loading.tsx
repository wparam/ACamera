export default function Loading() {

  return (
    <div className="h-screen w-screen flex items-center justify-center">
      <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  )
}