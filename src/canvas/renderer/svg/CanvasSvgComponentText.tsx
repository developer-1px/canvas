import type { CanvasComponentItem } from '../../host'

type CanvasSvgComponentTextProps = {
  compact?: boolean
  item: CanvasComponentItem
}

type CanvasSvgTextProps = {
  strong?: boolean
  text: string
  x: number
  y: number
}

export function CanvasSvgComponentHeader({
  item,
}: {
  item: CanvasComponentItem
}) {
  return (
    <>
      <rect
        x={item.x}
        y={item.y}
        width={item.w}
        height="36"
        rx="8"
        fill={item.accent}
      />
      <rect x={item.x} y={item.y + 24} width={item.w} height="12" fill={item.accent} />
      <text
        x={item.x + 14}
        y={item.y + 23}
        className="component-svg-title component-svg-title-invert"
      >
        {item.title}
      </text>
    </>
  )
}

export function CanvasSvgComponentText({
  compact,
  item,
}: CanvasSvgComponentTextProps) {
  return (
    <foreignObject x={item.x} y={item.y} width={item.w} height={item.h}>
      <div
        className={
          compact
            ? 'component-text component-text-compact'
            : 'component-text'
        }
      >
        <div className="component-title">{item.title}</div>
        {item.body ? <div className="component-body">{item.body}</div> : null}
      </div>
    </foreignObject>
  )
}

export function CanvasSvgText({
  strong,
  text,
  x,
  y,
}: CanvasSvgTextProps) {
  return (
    <text x={x} y={y} className={strong ? 'component-svg-title' : 'component-svg-text'}>
      {text}
    </text>
  )
}
