import type { CanvasComponentItem } from '../../entities'

type CanvasDemoSvgComponentTextProps = {
  compact?: boolean
  item: CanvasComponentItem
}

type CanvasDemoSvgTextProps = {
  strong?: boolean
  text: string
  x: number
  y: number
}

export function CanvasDemoSvgComponentHeader({
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
        rx="7"
        fill="transparent"
      />
      <line
        x1={item.x + 12}
        y1={item.y + 36}
        x2={item.x + item.w - 12}
        y2={item.y + 36}
        stroke="#f1f4f8"
        vectorEffect="non-scaling-stroke"
      />
      <text
        x={item.x + 14}
        y={item.y + 24}
        className="component-svg-title"
      >
        {item.title}
      </text>
    </>
  )
}

export function CanvasDemoSvgSectionText({
  item,
}: {
  item: CanvasComponentItem
}) {
  return (
    <foreignObject
      data-section-id={item.id}
      x={item.x}
      y={item.y}
      width={item.w}
      height={item.h}
    >
      <div className="component-section-label" data-section-id={item.id}>
        <div
          className="component-section-accent"
          style={{ background: item.accent }}
        />
        <div className="component-section-title">{item.title}</div>
        {item.body ? (
          <div className="component-section-body">{item.body}</div>
        ) : null}
      </div>
    </foreignObject>
  )
}

export function CanvasDemoSvgComponentText({
  compact,
  item,
}: CanvasDemoSvgComponentTextProps) {
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

export function CanvasDemoSvgStickyText({
  item,
}: {
  item: CanvasComponentItem
}) {
  const showTitle = item.title.trim().length > 0 && item.title !== 'Sticky'

  return (
    <foreignObject x={item.x} y={item.y} width={item.w} height={item.h}>
      <div className="component-sticky-text">
        {showTitle ? (
          <div className="component-sticky-title">{item.title}</div>
        ) : null}
        {item.body ? (
          <div className="component-sticky-body">{item.body}</div>
        ) : null}
      </div>
    </foreignObject>
  )
}

export function CanvasDemoSvgText({
  strong,
  text,
  x,
  y,
}: CanvasDemoSvgTextProps) {
  return (
    <text x={x} y={y} className={strong ? 'component-svg-title' : 'component-svg-text'}>
      {text}
    </text>
  )
}
