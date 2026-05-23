import type { CanvasEditableTextItem } from '../../host'

export type CanvasDemoSvgRectTextItem = CanvasEditableTextItem

export function renderCanvasDemoSvgRectTextItem({
  item,
}: {
  item: CanvasDemoSvgRectTextItem
}) {
  if (item.type === 'rect') {
    return (
      <>
        <rect
          className="rect-item"
          x={item.x}
          y={item.y}
          width={item.w}
          height={item.h}
          rx="6"
          fill={item.fill}
          stroke={item.stroke}
          vectorEffect="non-scaling-stroke"
        />
        {item.text ? (
          <foreignObject x={item.x} y={item.y} width={item.w} height={item.h}>
            <div className="canvas-text canvas-rect-text">{item.text}</div>
          </foreignObject>
        ) : null}
      </>
    )
  }

  return (
    <foreignObject x={item.x} y={item.y} width={item.w} height={item.h}>
      <div className="canvas-text">{item.text}</div>
    </foreignObject>
  )
}
