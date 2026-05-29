export const CANVAS_APP_CUSTOM_FOCUS_EVENT = 'canvas-app:custom-focus'

export type CanvasAppCustomFocus = {
  data?: unknown
  itemId: string
  ownerId: string
  targetId: string
}

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

export function isCanvasAppCustomFocusEvent(
  event: Event,
): event is CustomEvent<CanvasAppCustomFocus> {
  return (
    event.type === CANVAS_APP_CUSTOM_FOCUS_EVENT &&
    isCanvasAppCustomFocus((event as CustomEvent).detail)
  )
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
