import type { CanvasComponentItem } from '../../entities'
import { CanvasSvgText } from './CanvasSvgComponentText'

export function CanvasSvgShapeComponentRenderer({
  item,
}: {
  item: CanvasComponentItem
}) {
  if (item.component === 'connector') {
    return <ConnectorComponent item={item} />
  }

  return <VoteComponent item={item} />
}

function ConnectorComponent({ item }: { item: CanvasComponentItem }) {
  const y = item.y + item.h / 2

  return (
    <>
      <rect
        className="component-hit"
        x={item.x}
        y={item.y}
        width={item.w}
        height={item.h}
      />
      <line
        x1={item.x + 8}
        y1={y}
        x2={item.x + item.w - 12}
        y2={y}
        stroke={item.stroke}
        strokeWidth="2.4"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d={`M ${item.x + item.w - 22} ${y - 7} L ${item.x + item.w - 10} ${y} L ${
          item.x + item.w - 22
        } ${y + 7}`}
        fill="none"
        stroke={item.stroke}
        strokeWidth="2.4"
        vectorEffect="non-scaling-stroke"
      />
      <circle cx={item.x + 8} cy={y} r="5" fill={item.stroke} />
    </>
  )
}

function VoteComponent({ item }: { item: CanvasComponentItem }) {
  return (
    <>
      <circle
        cx={item.x + item.w / 2}
        cy={item.y + item.h / 2}
        r={Math.min(item.w, item.h) / 2 - 2}
        fill={item.fill}
        stroke={item.stroke}
        vectorEffect="non-scaling-stroke"
      />
      <circle
        cx={item.x + item.w / 2}
        cy={item.y + item.h / 2}
        r="13"
        fill={item.accent}
      />
      <CanvasSvgText
        x={item.x + item.w / 2 - 9}
        y={item.y + item.h / 2 + 28}
        text={item.body ?? item.title}
        strong
      />
    </>
  )
}
