import type {
  MouseEvent,
  PointerEvent,
} from 'react'

export type CanvasAppEventInput = {
  preventDefault: () => void
  stopPropagation: () => void
}

export type CanvasAppPointerInput = CanvasAppEventInput & {
  altKey: boolean
  button: number
  clientX: number
  clientY: number
  ctrlKey: boolean
  metaKey: boolean
  pointerId: number
  shiftKey: boolean
}

type CanvasAppEventSource = Pick<
  MouseEvent<Element>,
  'preventDefault' | 'stopPropagation'
>

type CanvasAppPointerSource = Pick<
  PointerEvent<Element>,
  | 'altKey'
  | 'button'
  | 'clientX'
  | 'clientY'
  | 'ctrlKey'
  | 'metaKey'
  | 'pointerId'
  | 'preventDefault'
  | 'shiftKey'
  | 'stopPropagation'
>

export function createCanvasAppEventInput(
  event: CanvasAppEventSource,
): CanvasAppEventInput {
  return {
    preventDefault: () => event.preventDefault(),
    stopPropagation: () => event.stopPropagation(),
  }
}

export function createCanvasAppPointerInput(
  event: CanvasAppPointerSource,
): CanvasAppPointerInput {
  return {
    altKey: event.altKey,
    button: event.button,
    clientX: event.clientX,
    clientY: event.clientY,
    ctrlKey: event.ctrlKey,
    metaKey: event.metaKey,
    pointerId: event.pointerId,
    preventDefault: () => event.preventDefault(),
    shiftKey: event.shiftKey,
    stopPropagation: () => event.stopPropagation(),
  }
}
