import type { CanvasCustomItem } from '../../entities'

export function CanvasWhiteboardSvgUnknownCustomItem({
  item,
}: {
  item: CanvasCustomItem
}) {
  return (
    <>
      <rect
        className="component-card"
        x={item.x}
        y={item.y}
        width={item.w}
        height={item.h}
        rx="8"
        fill="#ffffff"
        stroke="#cbd5e1"
        vectorEffect="non-scaling-stroke"
      />
      <foreignObject x={item.x} y={item.y} width={item.w} height={item.h}>
        <div className="canvas-text">{item.title}</div>
      </foreignObject>
    </>
  )
}
