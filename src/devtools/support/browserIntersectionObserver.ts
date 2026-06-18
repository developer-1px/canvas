export function observeBrowserIntersection(
  target: Element,
  callback: IntersectionObserverCallback,
  options?: IntersectionObserverInit,
  fallback?: () => void,
) {
  if (typeof IntersectionObserver === 'undefined') {
    fallback?.()
    return () => undefined
  }

  const observer = new IntersectionObserver(callback, options)
  observer.observe(target)

  return () => observer.disconnect()
}
