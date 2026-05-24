import type { CanvasCommentItem } from '../../entities'

export function renderCanvasDemoSvgCommentItem({
  item,
}: {
  item: CanvasCommentItem
}) {
  const radius = Math.min(10, item.w / 3)
  const tailStartX = item.x + item.w * 0.38
  const tailStartY = item.y + item.h
  const tailEndX = item.x + item.w * 0.22
  const tailEndY = item.y + item.h + 7

  return (
    <>
      <rect
        className="comment-item"
        x={item.x}
        y={item.y}
        width={item.w}
        height={item.h}
        rx={radius}
      />
      <path
        className="comment-tail"
        d={`M ${tailStartX} ${tailStartY} L ${tailEndX} ${tailEndY} L ${tailStartX + 7} ${tailStartY} Z`}
      />
      <path
        className="comment-line"
        d={`M ${item.x + 10} ${item.y + 13} H ${item.x + item.w - 10} M ${item.x + 10} ${item.y + 21} H ${item.x + item.w - 14}`}
      />
      <rect
        className="comment-hit"
        x={item.x}
        y={item.y}
        width={item.w}
        height={item.h + 7}
        rx={radius}
      />
    </>
  )
}
