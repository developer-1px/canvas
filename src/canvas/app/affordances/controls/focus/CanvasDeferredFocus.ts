import {
  cancelCanvasAnimationFrameTask,
  scheduleCanvasAnimationFrameTask,
  type CanvasAnimationFrameTaskCancel,
  type CanvasAnimationFrameTaskRequest,
} from '../../interaction/frame/CanvasAnimationFrameTask'

export type CanvasFocusableElement = {
  focus: (options?: FocusOptions) => void
  select?: () => void
}

export type CanvasAnimationFrameRequest = CanvasAnimationFrameTaskRequest

export type CanvasAnimationFrameCancel = CanvasAnimationFrameTaskCancel

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
  requestAnimationFrame,
  resolveElement,
  select = false,
}: CanvasDeferredFocusInput<TElement>) {
  return scheduleCanvasAnimationFrameTask({
    requestAnimationFrame,
    task: () => {
      focusCanvasElement({
        element: resolveElement(),
        preventScroll,
        select,
      })
    },
  })
}

export function cancelCanvasDeferredFocus({
  cancelAnimationFrame,
  frame,
}: CanvasDeferredFocusCancelInput) {
  return cancelCanvasAnimationFrameTask({
    cancelAnimationFrame,
    frame,
  })
}
