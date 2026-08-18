import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Resets the scroll position when the route changes.
 *
 * A browser resets scroll on a full page load, but a single-page app never
 * reloads - React Router swaps the components and leaves the window where it
 * was. Without this, clicking a category link from halfway down the homepage
 * drops you halfway down the product list, past the heading and the active
 * filter, which makes a filtered page look like an unfiltered one.
 *
 * This watches the pathname only, not the query string. Changing a filter or a
 * page number rewrites the query while the user is reading the list, and yanking
 * them to the top for that would be worse than leaving them alone.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}
