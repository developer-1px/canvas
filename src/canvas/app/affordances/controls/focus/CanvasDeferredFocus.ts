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

export type CanvasElementSelectorRoot = ParentNode | null | (() => ParentNode | null)

export type CanvasElementSelectorMatch<TElement extends Element = Element> = ({
  element,
  elements,
  index,
}: {
  element: TElement
  elements: TElement[]
  index: number
}) => boolean

export type CanvasElementSelectorInput<TElement extends Element = Element> = {
  match?: CanvasElementSelectorMatch<TElement>
  root: CanvasElementSelectorRoot
  selector: string
}

export type CanvasDeferredSelectorFocusInput<
  TElement extends Element & CanvasFocusableElement = HTMLElement,
> = CanvasElementSelectorInput<TElement> & {
  preventScroll?: boolean
  requestAnimationFrame?: CanvasAnimationFrameRequest | null
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

export function resolveCanvasElementBySelector<
  TElement extends Element = Element,
>({
  match,
  root,
  selector,
}: CanvasElementSelectorInput<TElement>) {
  const resolvedRoot = typeof root === 'function' ? root() : root

  if (!resolvedRoot || !selector) {
    return null
  }

  try {
    if (!match) {
      return resolvedRoot.querySelector<TElement>(selector)
    }

    const elements = Array.from(
      resolvedRoot.querySelectorAll<TElement>(selector),
    )

    return elements.find((element, index) => match({
      element,
      elements,
      index,
    })) ?? null
  } catch {
    return null
  }
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

export function focusCanvasElementBySelectorOnNextFrame<
  TElement extends Element & CanvasFocusableElement = HTMLElement,
>({
  match,
  preventScroll = true,
  requestAnimationFrame,
  root,
  selector,
  select = false,
}: CanvasDeferredSelectorFocusInput<TElement>) {
  return focusCanvasElementOnNextFrame<TElement>({
    preventScroll,
    requestAnimationFrame,
    resolveElement: () => {
      const input: CanvasElementSelectorInput<TElement> = {
        root,
        selector,
      }

      if (match) {
        input.match = match
      }

      return resolveCanvasElementBySelector(input)
    },
    select,
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
