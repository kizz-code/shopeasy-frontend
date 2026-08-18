export default function LoadingSpinner({ fullScreen = false, size = 'md' }) {
  const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' }
  const spinner = (
    <div
      role="status"
      aria-label="Loading"
      className={`${sizes[size]} border-2 border-dark-600 border-t-brand-500 rounded-full animate-spin`}
    />
  )

  if (!fullScreen) return spinner

  return (
    <div className="fixed inset-0 bg-dark-900 flex flex-col items-center justify-center gap-4 z-50">
      {spinner}
      <p className="text-dark-400 text-sm">Loading…</p>
    </div>
  )
}
