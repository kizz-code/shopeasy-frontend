import { useState, useEffect } from 'react'
import { ImageOff } from 'lucide-react'

/**
 * A product image that degrades gracefully.
 *
 * Product images are URLs typed in by an admin, so they can be missing, wrong, or
 * point at a host that refuses to serve them. A plain <img> shows a broken icon in
 * that case, which looks like the app is broken rather than the link. This falls
 * back to a neutral placeholder instead.
 */
export default function ProductImage({ src, alt = '', className = '', ...rest }) {
  const [failed, setFailed] = useState(false)

  // A new src deserves a fresh attempt, otherwise a previously failed image would
  // keep the placeholder forever after the URL is corrected.
  useEffect(() => setFailed(false), [src])

  if (!src || failed) {
    return (
      <div
        className={`grid place-items-center bg-dark-700 text-dark-500 ${className}`}
        role="img"
        aria-label={alt ? `${alt} (image unavailable)` : 'No image'}
        {...rest}
      >
        <ImageOff size={20} />
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={className}
      {...rest}
    />
  )
}
