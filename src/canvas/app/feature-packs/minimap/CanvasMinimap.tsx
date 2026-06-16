import {
  useState,
  type PointerEvent,
} from 'react'
import type { Point } from '../../../entities'
import {
  getCanvasMinimapPointFromViewportOffset,
  getCanvasMinimapWorldPoint,
  type CanvasMinimapReadModel,
} from './CanvasMinimapModel'

export type CanvasMinimapProps = {
  model: CanvasMinimapReadModel | null
  onNavigateToWorldPoint: (point: Point) => void
}

export function CanvasMinimap({
  model,
  onNavigateToWorldPoint,
}: CanvasMinimapProps) {
  const [activePointerId, setActivePointerId] = useState<number | null>(null)

  if (!model) {
    return null
  }

  const navigate = (event: PointerEvent<SVGSVGElement>) => {
    const point = getMinimapSvgPoint(event, model)

    if (!point) {
      return
    }

    onNavigateToWorldPoint(getCanvasMinimapWorldPoint({ model, point }))
  }
  const handlePointerDown = (event: PointerEvent<SVGSVGElement>) => {
    event.preventDefault()
    setActivePointerId(event.pointerId)
    navigate(event)
  }
  const handlePointerMove = (event: PointerEvent<SVGSVGElement>) => {
    if (activePointerId !== event.pointerId) {
      return
    }

    navigate(event)
  }
  const clearPointer = (event: PointerEvent<SVGSVGElement>) => {
    if (activePointerId === event.pointerId) {
      setActivePointerId(null)
    }
  }

  return (
    <div className="canvas-minimap" data-empty={model.isEmpty ? 'true' : 'false'}>
      <svg
        aria-label="Canvas minimap"
        className="canvas-minimap-map"
        role="img"
        viewBox={`0 0 ${model.size.w} ${model.size.h}`}
        onPointerCancel={clearPointer}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={clearPointer}
      >
        <rect
          className="canvas-minimap-world"
          x={model.displayBounds.x}
          y={model.displayBounds.y}
          width={model.displayBounds.w}
          height={model.displayBounds.h}
          rx="3"
        />
        {model.itemRects.map((item) => (
          <rect
            className="canvas-minimap-item"
            key={item.id}
            x={item.rect.x}
            y={item.rect.y}
            width={item.rect.w}
            height={item.rect.h}
            rx="1.5"
          />
        ))}
        <rect
          className="canvas-minimap-viewport"
          x={model.viewportRect.x}
          y={model.viewportRect.y}
          width={model.viewportRect.w}
          height={model.viewportRect.h}
          rx="2"
        />
      </svg>
    </div>
  )
}

function getMinimapSvgPoint(
  event: PointerEvent<SVGSVGElement>,
  model: CanvasMinimapReadModel,
): Point | null {
  return getCanvasMinimapPointFromViewportOffset({
    model,
    offset: {
      x: event.nativeEvent.offsetX,
      y: event.nativeEvent.offsetY,
    },
    viewportSize: {
      h: event.currentTarget.clientHeight,
      w: event.currentTarget.clientWidth,
    },
  })
}
