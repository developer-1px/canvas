import { useEffect } from 'react'

export function useWindowEvent<K extends keyof WindowEventMap>(
  type: K,
  handler: (event: WindowEventMap[K]) => void,
  enabledOrOptions: boolean | AddEventListenerOptions = true,
  options?: AddEventListenerOptions,
) {
  useEffect(() => {
    const enabled = typeof enabledOrOptions === 'boolean'
      ? enabledOrOptions
      : true
    const listenerOptions = typeof enabledOrOptions === 'boolean'
      ? options
      : enabledOrOptions

    if (!enabled) {
      return undefined
    }

    window.addEventListener(type, handler, listenerOptions)

    return () => {
      window.removeEventListener(type, handler, listenerOptions)
    }
  }, [enabledOrOptions, handler, options, type])
}
