import type { CanvasOverlayState } from '../../engine'
import {
  getCanvasSvgShapeGeometry,
  type CanvasSvgShapeGeometry,
} from '../../host'

export function CanvasSvgDraftShapeOverlay({
  draftRect,
}: {
  draftRect: NonNullable<CanvasOverlayState['draftRect']>
}) {
  const geometry = getCanvasSvgShapeGeometry({
    bounds: draftRect,
    shapeType: draftRect.shapeType ?? 'rect',
  })

  return renderCanvasSvgDraftShapeGeometry(geometry)
}

function renderCanvasSvgDraftShapeGeometry(
  geometry: CanvasSvgShapeGeometry,
) {
  if (geometry.kind === 'ellipse') {
    return (
      <ellipse
        className="draft-rect"
        cx={geometry.cx}
        cy={geometry.cy}
        rx={geometry.rx}
        ry={geometry.ry}
        vectorEffect="non-scaling-stroke"
      />
    )
  }

  if (geometry.kind === 'path') {
    return (
      <path
        className="draft-rect"
        d={geometry.d}
        vectorEffect="non-scaling-stroke"
      />
    )
  }

  return (
    <rect
      className="draft-rect"
      x={geometry.x}
      y={geometry.y}
      width={geometry.width}
      height={geometry.height}
      vectorEffect="non-scaling-stroke"
    />
  )
}
