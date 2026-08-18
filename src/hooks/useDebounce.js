import { useState, useEffect } from 'react'

/**
 * Holds back a fast-changing value until it stops changing for `delay` ms.
 *
 * The search box updates state on every keystroke so the input stays responsive,
 * but the value we actually send to the API is the debounced one. Typing "laptop"
 * fires one request instead of six.
 */
export default function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    // Cleanup runs before the next effect, so each new keystroke cancels the
    // timer set by the previous one.
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}
