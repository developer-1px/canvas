import type { CanvasItem } from '../../entities'
import {
  isCanvasDrawingItem,
  type CanvasDrawingItem,
} from '../../host'
import {
  CANVAS_SVG_ARROW_MARKER_IRI,
  createCanvasSvgPathData,
} from '../../renderer'

export type CanvasDemoSvgDrawingItem = CanvasDrawingItem

export function isCanvasDemoSvgDrawingItem(
  item: CanvasItem,
): item is CanvasDemoSvgDrawingItem {
  return isCanvasDrawingItem(item)
}

export function renderCanvasDemoSvgDrawingItem({
  item,
}: {
  item: CanvasDemoSvgDrawingItem
}) {
  if (item.type === 'arrow') {
    return (
      <>
        <line
          className="arrow-hit"
          x1={item.start.x}
          y1={item.start.y}
          x2={item.end.x}
          y2={item.end.y}
          vectorEffect="non-scaling-stroke"
        />
        <line
          className="arrow-item"
          x1={item.start.x}
          y1={item.start.y}
          x2={item.end.x}
          y2={item.end.y}
          stroke={item.stroke}
          strokeWidth={item.strokeWidth}
          markerEnd={CANVAS_SVG_ARROW_MARKER_IRI}
          vectorEffect="non-scaling-stroke"
        />
      </>
    )
  }

  const pathData = createCanvasSvgPathData(item.points)

  return (
    <>
      <path
        className={`${item.type}-hit`}
        d={pathData}
        vectorEffect="non-scaling-stroke"
      />
      <path
        className={`${item.type}-item`}
        d={pathData}
        opacity={item.opacity}
        stroke={item.stroke}
        strokeWidth={item.strokeWidth}
        vectorEffect="non-scaling-stroke"
      />
    </>
  )
}
