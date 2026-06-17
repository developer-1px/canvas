export type CanvasAppEventInput = {
  preventDefault: () => void
  stopPropagation: () => void
}

export type CanvasAppScreenPointInput = {
  clientX: number
  clientY: number
}

export type CanvasAppPointerIdInput = {
  pointerId: number
}

export type CanvasAppPointerInput = CanvasAppEventInput &
  CanvasAppScreenPointInput &
  CanvasAppPointerIdInput & {
    altKey: boolean
    button: number
    ctrlKey: boolean
    metaKey: boolean
    shiftKey: boolean
  }

export type CanvasAppPointerScreenInput =
  CanvasAppScreenPointInput & CanvasAppPointerIdInput

export type CanvasAppEventSource = CanvasAppEventInput

export type CanvasPointerTransformModifierInput = {
  altKey: boolean
  shiftKey: boolean
}

export type CanvasPointerTransformModifierState = {
  constrainAngle: boolean
  preserveAspectRatio: boolean
  resizeFromCenter: boolean
}

export const CANVAS_RESIZE_POINTER_MODIFIERS_MODEL =
  'canvas-resize-pointer-modifiers'

export type CanvasAppPointerSource = CanvasAppEventInput &
  CanvasAppScreenPointInput &
  CanvasAppPointerIdInput & {
    altKey: boolean
    button: number
    ctrlKey: boolean
    metaKey: boolean
    shiftKey: boolean
  }

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

export function getCanvasPointerTransformModifierState({
  altKey,
  shiftKey,
}: CanvasPointerTransformModifierInput): CanvasPointerTransformModifierState {
  return {
    constrainAngle: shiftKey,
    preserveAspectRatio: shiftKey,
    resizeFromCenter: altKey,
  }
}
