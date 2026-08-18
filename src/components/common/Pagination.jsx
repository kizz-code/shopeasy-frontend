import { ChevronLeft, ChevronRight } from 'lucide-react'

// Shows a sliding window of at most five page numbers around the current page,
// so the control stays the same width whether there are 3 pages or 300.
function pageWindow(current, total, size = 5) {
  const start = Math.max(1, Math.min(current - Math.floor(size / 2), total - size + 1))
  const count = Math.min(size, total)
  return Array.from({ length: count }, (_, i) => start + i)
}

export default function Pagination({ pagination, onPageChange }) {
  if (!pagination || pagination.totalPages <= 1) return null

  const { currentPage, totalPages, hasPrevPage, hasNextPage } = pagination

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-2 mt-12">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!hasPrevPage}
        className="btn-secondary py-2 px-3 sm:px-4 text-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
      >
        <ChevronLeft size={16} />
        <span className="hidden sm:inline">Previous</span>
      </button>

      <div className="flex items-center gap-1">
        {pageWindow(currentPage, totalPages).map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            aria-current={page === currentPage ? 'page' : undefined}
            className={`w-10 h-10 rounded-xl text-sm font-medium transition-colors
              ${page === currentPage
                ? 'bg-brand-500 text-white'
                : 'bg-dark-700 text-dark-200 border border-dark-600 hover:bg-dark-600'}`}
          >
            {page}
          </button>
        ))}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasNextPage}
        className="btn-secondary py-2 px-3 sm:px-4 text-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight size={16} />
      </button>
    </nav>
  )
}
