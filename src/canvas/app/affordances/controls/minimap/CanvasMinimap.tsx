import {
  useRef,
  useState,
  type PointerEvent,
} from 'react'
import type { Point } from '../../../../entities'
import {
  getCanvasMinimapWorldPoint,
  type CanvasMinimapReadModel,
} from './CanvasMinimapModel'

type CanvasMinimapProps = {
  model: CanvasMinimapReadModel | null
  onNavigateToWorldPoint: (point: Point) => void
}

export function CanvasMinimap({
  model,
  onNavigateToWorldPoint,
}: CanvasMinimapProps) {
  const svgRef = useRef<SVGSVGElement | null>(null)
  const [activePointerId, setActivePointerId] = useState<number | null>(null)

  if (!model) {
    return null
  }

  const navigate = (event: PointerEvent<SVGSVGElement>) => {
    const point = getMinimapSvgPoint(event, svgRef.current, model)

    if (!point) {
      return
    }

    onNavigateToWorldPoint(getCanvasMinimapWorldPoint({ model, point }))
  }
  const handlePointerDown = (event: PointerEvent<SVGSVGElement>) => {
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
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
        ref={svgRef}
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
  svg: SVGSVGElement | null,
  model: CanvasMinimapReadModel,
): Point | null {
  const rect = svg?.getBoundingClientRect()

  if (!rect || rect.width <= 0 || rect.height <= 0) {
    return null
  }

  return {
    x: (event.clientX - rect.left) * model.size.w / rect.width,
    y: (event.clientY - rect.top) * model.size.h / rect.height,
  }
}
