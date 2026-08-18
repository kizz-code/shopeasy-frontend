import { PackageOpen } from 'lucide-react'
import { Link } from 'react-router-dom'

// One component for "nothing here yet", "nothing matched" and "that failed",
// so those three states look the same everywhere in the app.
export default function EmptyState({
  icon: Icon = PackageOpen,
  title,
  message,
  actionLabel,
  onAction,
  actionTo,
}) {
  return (
    <div className="text-center py-20 px-4">
      <div className="w-20 h-20 bg-dark-800 border border-dark-600 rounded-full flex items-center justify-center mx-auto mb-5">
        <Icon size={30} className="text-dark-500" />
      </div>
      <h3 className="font-semibold text-white text-xl mb-2">{title}</h3>
      {message && <p className="text-dark-400 mb-6 max-w-md mx-auto">{message}</p>}

      {actionTo ? (
        <Link to={actionTo} className="btn-primary inline-block">{actionLabel}</Link>
      ) : actionLabel && onAction ? (
        <button onClick={onAction} className="btn-primary">{actionLabel}</button>
      ) : null}
    </div>
  )
}
