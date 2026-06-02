import type { CSSProperties } from 'react'
import type { CanvasComponentItem } from '../../entities'
import { CanvasContentEditableText } from '../affordances/editing/text-editor/CanvasContentEditableText'
import { useCanvasInlineTextEditing } from '../affordances/editing/text-editor/CanvasInlineTextEditingContext'

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
  const style = getCanvasDemoSvgComponentTextStyle(item)

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
        <div className="component-section-title" style={style}>
          {item.title}
        </div>
        {item.body ? (
          <div className="component-section-body" style={style}>
            {item.body}
          </div>
        ) : null}
      </div>
    </foreignObject>
  )
}

export function CanvasDemoSvgComponentText({
  compact,
  item,
}: CanvasDemoSvgComponentTextProps) {
  const style = getCanvasDemoSvgComponentTextStyle(item)

  return (
    <foreignObject x={item.x} y={item.y} width={item.w} height={item.h}>
      <div
        className={
          compact
            ? 'component-text component-text-compact'
            : 'component-text'
        }
      >
        <div className="component-title" style={style}>
          {item.title}
        </div>
        {item.body ? (
          <div className="component-body" style={style}>
            {item.body}
          </div>
        ) : null}
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
  const editor = useCanvasInlineTextEditing()
  const style = getCanvasDemoSvgComponentTextStyle(item)

  return (
    <foreignObject x={item.x} y={item.y} width={item.w} height={item.h}>
      <div className="component-sticky-text">
        {showTitle ? (
          <div className="component-sticky-title" style={style}>
            {item.title}
          </div>
        ) : null}
        <CanvasContentEditableText
          className="component-sticky-body"
          editor={editor}
          id={item.id}
          style={style}
          value={item.body ?? ''}
        />
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
    <text
      x={x}
      y={y}
      className={strong ? 'component-svg-title' : 'component-svg-text'}
    >
      {text}
    </text>
  )
}

function getCanvasDemoSvgComponentTextStyle(
  item: CanvasComponentItem,
): CSSProperties | undefined {
  if (item.fontSize === undefined && item.textAlign === undefined) {
    return undefined
  }

  return {
    fontSize: item.fontSize,
    textAlign: item.textAlign,
  }
}
