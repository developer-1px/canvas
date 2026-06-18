export const CANVAS_APP_CUSTOM_FOCUS_EVENT = 'canvas-app:custom-focus'

export type CanvasAppCustomFocus = {
  data?: unknown
  itemId: string
  ownerId: string
  targetId: string
}

export type CanvasAppCustomFocusClear = {
  itemId: string
  ownerId: string
  targetId?: string
  type: 'clear'
}

export type CanvasAppCustomFocusEventDetail =
  | CanvasAppCustomFocus
  | CanvasAppCustomFocusClear

export function dispatchCanvasAppCustomFocus(
  target: EventTarget,
  focus: CanvasAppCustomFocus,
) {
  target.dispatchEvent(new CustomEvent(CANVAS_APP_CUSTOM_FOCUS_EVENT, {
    bubbles: true,
    composed: true,
    detail: focus,
  }))
}

export function dispatchCanvasAppCustomFocusClear(
  target: EventTarget,
  clear: Omit<CanvasAppCustomFocusClear, 'type'>,
) {
  target.dispatchEvent(new CustomEvent(CANVAS_APP_CUSTOM_FOCUS_EVENT, {
    bubbles: true,
    composed: true,
    detail: {
      ...clear,
      type: 'clear',
    },
  }))
}

export function isCanvasAppCustomFocusEvent(
  event: Event,
): event is CustomEvent<CanvasAppCustomFocusEventDetail> {
  const detail = (event as CustomEvent).detail

  return (
    event.type === CANVAS_APP_CUSTOM_FOCUS_EVENT &&
    (isCanvasAppCustomFocus(detail) || isCanvasAppCustomFocusClear(detail))
  )
}

export function reduceCanvasAppCustomFocus({
  current,
  event,
}: {
  current: CanvasAppCustomFocus | null
  event: CanvasAppCustomFocusEventDetail
}) {
  return isCanvasAppCustomFocusClear(event)
    ? getClearedCanvasAppCustomFocus({ current, clear: event })
    : event
}

export function getCanvasAppCustomFocusForSelection({
  focus,
  selection,
}: {
  focus: CanvasAppCustomFocus | null
  selection: readonly string[]
}) {
  if (!focus || selection.includes(focus.itemId)) {
    return focus
  }

  return null
}

function getClearedCanvasAppCustomFocus({
  current,
  clear,
}: {
  current: CanvasAppCustomFocus | null
  clear: CanvasAppCustomFocusClear
}) {
  if (!current) {
    return null
  }

  if (
    current.itemId !== clear.itemId ||
    current.ownerId !== clear.ownerId ||
    (clear.targetId && current.targetId !== clear.targetId)
  ) {
    return current
  }

  return null
}

function isCanvasAppCustomFocus(value: unknown): value is CanvasAppCustomFocus {
  return (
    isRecord(value) &&
    typeof value.itemId === 'string' &&
    value.itemId.length > 0 &&
    typeof value.ownerId === 'string' &&
    value.ownerId.length > 0 &&
    typeof value.targetId === 'string' &&
    value.targetId.length > 0
  )
}

function isCanvasAppCustomFocusClear(
  value: unknown,
): value is CanvasAppCustomFocusClear {
  return (
    isRecord(value) &&
    value.type === 'clear' &&
    typeof value.itemId === 'string' &&
    value.itemId.length > 0 &&
    typeof value.ownerId === 'string' &&
    value.ownerId.length > 0 &&
    (
      value.targetId === undefined ||
      typeof value.targetId === 'string' && value.targetId.length > 0
    )
  )
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
