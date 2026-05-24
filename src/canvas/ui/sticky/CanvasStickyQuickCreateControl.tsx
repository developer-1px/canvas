import type {
  CSSProperties,
  PointerEvent,
} from 'react'

export type CanvasStickyQuickCreateControlPoint = Readonly<{
  x: number
  y: number
}>

export type CanvasStickyQuickCreateControlProps = {
  point: CanvasStickyQuickCreateControlPoint | null
  onQuickCreate: () => boolean
}

export function CanvasStickyQuickCreateControl({
  point,
  onQuickCreate,
}: CanvasStickyQuickCreateControlProps) {
  if (!point) {
    return null
  }

  function stopPointer(event: PointerEvent<HTMLButtonElement>) {
    event.stopPropagation()
  }

  return (
    <button
      type="button"
      className="sticky-quick-create"
      aria-label="Create sticky note"
      title="Create sticky note"
      style={getCanvasStickyQuickCreateStyle(point)}
      onClick={onQuickCreate}
      onPointerDown={stopPointer}
    >
      +
    </button>
  )
}

function getCanvasStickyQuickCreateStyle(
  point: CanvasStickyQuickCreateControlPoint,
): CSSProperties {
  return {
    left: point.x,
    top: point.y,
  }
}
