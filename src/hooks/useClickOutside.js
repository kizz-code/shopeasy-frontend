import { useEffect, useRef } from 'react'

/**
 * Calls `onOutside` when a click lands anywhere outside the returned ref.
 * Used to close dropdowns, which otherwise stay open until you click them again.
 */
export default function useClickOutside(onOutside) {
  const ref = useRef(null)

  useEffect(() => {
    const handler = (event) => {
      if (ref.current && !ref.current.contains(event.target)) onOutside()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onOutside])

  return ref
}
