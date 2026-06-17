export type CanvasEventListenerTarget = {
  addEventListener: (
    type: string,
    listener: EventListener,
    options?: boolean | AddEventListenerOptions,
  ) => void
  removeEventListener: (
    type: string,
    listener: EventListener,
    options?: boolean | EventListenerOptions,
  ) => void
}

export type CanvasEventListenerCleanup = () => boolean

export type CanvasEventListenerInput<TEvent extends Event = Event> = {
  listener: (event: TEvent) => void
  options?: boolean | AddEventListenerOptions
  removeOptions?: boolean | EventListenerOptions
  target?: CanvasEventListenerTarget | null
  type: string
}

export type CanvasEventListenersInput = {
  listeners: readonly CanvasEventListenerInput[]
}

export function bindCanvasEventListener<TEvent extends Event = Event>({
  listener,
  options,
  removeOptions = options,
  target,
  type,
}: CanvasEventListenerInput<TEvent>): CanvasEventListenerCleanup {
  if (!target) {
    return () => false
  }

  let isBound = true
  const eventListener = listener as EventListener

  target.addEventListener(type, eventListener, options)

  return () => {
    if (!isBound) {
      return false
    }

    target.removeEventListener(type, eventListener, removeOptions)
    isBound = false

    return true
  }
}

export function bindCanvasEventListeners({
  listeners,
}: CanvasEventListenersInput): CanvasEventListenerCleanup {
  const cleanups = listeners.map((listener) =>
    bindCanvasEventListener(listener)
  )

  return () =>
    cleanups.reduceRight(
      (didCleanup, cleanup) => cleanup() || didCleanup,
      false,
    )
}
