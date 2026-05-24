import type {
  CSSProperties,
  PointerEvent,
} from 'react'
import type { CanvasSide } from '../../entities'

export type CanvasStickyQuickCreateControlPoint = Readonly<{
  direction: CanvasSide
  x: number
  y: number
}>

export type CanvasStickyQuickCreateControlProps = {
  controls: readonly CanvasStickyQuickCreateControlPoint[]
  onQuickCreate: (direction: CanvasSide) => boolean
}

export function CanvasStickyQuickCreateControl({
  controls,
  onQuickCreate,
}: CanvasStickyQuickCreateControlProps) {
  if (controls.length === 0) {
    return null
  }

  function stopPointer(event: PointerEvent<HTMLButtonElement>) {
    event.stopPropagation()
  }

  return (
    <>
      {controls.map((control) => (
        <button
          key={control.direction}
          type="button"
          className="sticky-quick-create"
          data-direction={control.direction}
          aria-label={`Create sticky note ${control.direction}`}
          title="Create sticky note"
          style={getCanvasStickyQuickCreateStyle(control)}
          onClick={() => onQuickCreate(control.direction)}
          onPointerDown={stopPointer}
        >
          +
        </button>
      ))}
    </>
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
