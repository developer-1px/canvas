import type { CanvasStampItem } from '../../entities'

export function renderCanvasDemoSvgStampItem({
  item,
}: {
  item: CanvasStampItem
}) {
  const radius = Math.min(item.w, item.h) / 2

  return (
    <>
      <rect
        className="stamp-item"
        x={item.x}
        y={item.y}
        width={item.w}
        height={item.h}
        rx={radius}
      />
      <text
        className="stamp-label"
        x={item.x + item.w / 2}
        y={item.y + item.h / 2}
        dominantBaseline="central"
      >
        {item.label}
      </text>
      <rect
        className="stamp-hit"
        x={item.x}
        y={item.y}
        width={item.w}
        height={item.h}
        rx={radius}
      />
    </>
  )
}
