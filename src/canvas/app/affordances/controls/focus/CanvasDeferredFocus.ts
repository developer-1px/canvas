export type CanvasFocusableElement = {
  focus: (options?: FocusOptions) => void
  select?: () => void
}

export type CanvasAnimationFrameRequest = (
  callback: FrameRequestCallback,
) => number

export type CanvasAnimationFrameCancel = (handle: number) => void

export type CanvasFocusElementInput<
  TElement extends CanvasFocusableElement = CanvasFocusableElement,
> = {
  element: TElement | null
  preventScroll?: boolean
  select?: boolean
}

export type CanvasDeferredFocusInput<
  TElement extends CanvasFocusableElement = CanvasFocusableElement,
> = {
  preventScroll?: boolean
  requestAnimationFrame?: CanvasAnimationFrameRequest | null
  resolveElement: () => TElement | null
  select?: boolean
}

export type CanvasDeferredFocusCancelInput = {
  cancelAnimationFrame?: CanvasAnimationFrameCancel | null
  frame: number | null
}

export function focusCanvasElement<TElement extends CanvasFocusableElement>({
  element,
  preventScroll = true,
  select = false,
}: CanvasFocusElementInput<TElement>) {
  if (!element) {
    return false
  }

  element.focus({ preventScroll })

  if (select) {
    element.select?.()
  }

  return true
}

export function focusCanvasElementOnNextFrame<
  TElement extends CanvasFocusableElement = CanvasFocusableElement,
>({
  preventScroll = true,
  requestAnimationFrame = getCanvasAnimationFrameRequest(),
  resolveElement,
  select = false,
}: CanvasDeferredFocusInput<TElement>) {
  if (!requestAnimationFrame) {
    return null
  }

  return requestAnimationFrame(() => {
    focusCanvasElement({
      element: resolveElement(),
      preventScroll,
      select,
    })
  })
}

export function cancelCanvasDeferredFocus({
  cancelAnimationFrame = getCanvasAnimationFrameCancel(),
  frame,
}: CanvasDeferredFocusCancelInput) {
  if (frame === null || !cancelAnimationFrame) {
    return false
  }

  cancelAnimationFrame(frame)

  return true
}

function getCanvasAnimationFrameRequest(): CanvasAnimationFrameRequest | null {
  return typeof requestAnimationFrame === 'undefined'
    ? null
    : requestAnimationFrame
}

function getCanvasAnimationFrameCancel(): CanvasAnimationFrameCancel | null {
  return typeof cancelAnimationFrame === 'undefined'
    ? null
    : cancelAnimationFrame
}
