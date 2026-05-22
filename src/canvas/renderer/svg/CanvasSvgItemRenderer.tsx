import type { PointerEvent } from 'react'
import type {
  CanvasComponentItem,
  CanvasItem,
  RectItem,
  TextItem,
} from '../../host/CanvasModel'
import { CanvasSvgSelectionOutline } from './CanvasSvgOverlayRenderer'
import { getItemBounds } from '../../host/CanvasTree'

type CanvasSvgItemRendererProps = {
  items: CanvasItem[]
  outlineIds: Set<string>
  selected: Set<string>
  onItemPointerDown: (
    event: PointerEvent<SVGGElement>,
    itemId: string,
  ) => void
  onTextDoubleClick: (item: RectItem | TextItem) => void
}

export function CanvasSvgItemRenderer({
  items,
  onItemPointerDown,
  onTextDoubleClick,
  outlineIds,
  selected,
}: CanvasSvgItemRendererProps) {
  return (
    <>
      {items.map((item) =>
        renderCanvasItem({
          item,
          onItemPointerDown,
          onTextDoubleClick,
          outlineIds,
          selected,
        }),
      )}
    </>
  )
}

type RenderCanvasItemArgs = {
  item: CanvasItem
  outlineIds: Set<string>
  selected: Set<string>
  onItemPointerDown: (
    event: PointerEvent<SVGGElement>,
    itemId: string,
  ) => void
  onTextDoubleClick: (item: RectItem | TextItem) => void
}

function renderCanvasItem({
  item,
  onItemPointerDown,
  onTextDoubleClick,
  outlineIds,
  selected,
}: RenderCanvasItemArgs) {
  const isSelected = selected.has(item.id)
  const hasOutline = outlineIds.has(item.id)
  const bounds = getItemBounds(item)

  if (item.type === 'group') {
    return (
      <g
        key={item.id}
        className="canvas-item canvas-group"
        data-selected={isSelected}
        data-type="group"
        onPointerDown={(event) => onItemPointerDown(event, item.id)}
      >
        <rect
          className="group-hit"
          x={bounds.x}
          y={bounds.y}
          width={bounds.w}
          height={bounds.h}
        />
        {item.children.map((child) =>
          renderCanvasItem({
            item: child,
            onItemPointerDown,
            onTextDoubleClick,
            outlineIds,
            selected,
          }),
        )}
        {hasOutline ? (
          <CanvasSvgSelectionOutline bounds={bounds} kind="group" />
        ) : null}
      </g>
    )
  }

  if (item.type === 'component') {
    return (
      <g
        key={item.id}
        className="canvas-item"
        data-component={item.component}
        data-selected={isSelected}
        data-type={item.type}
        onPointerDown={(event) => onItemPointerDown(event, item.id)}
      >
        <CanvasComponent item={item} />
        {hasOutline ? <CanvasSvgSelectionOutline bounds={bounds} /> : null}
      </g>
    )
  }

  return (
    <g
      key={item.id}
      className="canvas-item"
      data-selected={isSelected}
      data-type={item.type}
      onPointerDown={(event) => onItemPointerDown(event, item.id)}
      onDoubleClick={() => onTextDoubleClick(item)}
    >
      {item.type === 'rect' ? (
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
      ) : (
        <foreignObject x={item.x} y={item.y} width={item.w} height={item.h}>
          <div className="canvas-text">{item.text}</div>
        </foreignObject>
      )}

      {hasOutline ? <CanvasSvgSelectionOutline bounds={bounds} /> : null}
    </g>
  )
}

function CanvasComponent({ item }: { item: CanvasComponentItem }) {
  if (item.component === 'connector') {
    return <ConnectorComponent item={item} />
  }

  if (item.component === 'vote') {
    return <VoteComponent item={item} />
  }

  if (item.component === 'table') {
    return <TableComponent item={item} />
  }

  if (item.component === 'image') {
    return <ImageComponent item={item} />
  }

  if (item.component === 'section') {
    return <SectionComponent item={item} />
  }

  if (item.component === 'kanban') {
    return <KanbanComponent item={item} />
  }

  if (item.component === 'checklist') {
    return <ChecklistComponent item={item} />
  }

  if (item.component === 'label') {
    return <LabelComponent item={item} />
  }

  if (item.component === 'sticky') {
    return <StickyComponent item={item} />
  }

  return <CardComponent item={item} />
}

function CardComponent({ item }: { item: CanvasComponentItem }) {
  return (
    <>
      <rect
        className="component-card"
        x={item.x}
        y={item.y}
        width={item.w}
        height={item.h}
        rx="8"
        fill={item.fill}
        stroke={item.stroke}
        vectorEffect="non-scaling-stroke"
      />
      <rect
        x={item.x}
        y={item.y}
        width="6"
        height={item.h}
        rx="3"
        fill={item.accent}
      />
      <ComponentText item={item} />
    </>
  )
}

function StickyComponent({ item }: { item: CanvasComponentItem }) {
  return (
    <>
      <rect
        className="component-card"
        x={item.x}
        y={item.y}
        width={item.w}
        height={item.h}
        rx="3"
        fill={item.fill}
        stroke={item.stroke}
        vectorEffect="non-scaling-stroke"
      />
      <path
        d={`M ${item.x + item.w - 28} ${item.y} L ${item.x + item.w} ${
          item.y
        } L ${item.x + item.w} ${item.y + 28} Z`}
        fill="rgba(255, 255, 255, 0.45)"
      />
      <ComponentText item={item} />
    </>
  )
}

function LabelComponent({ item }: { item: CanvasComponentItem }) {
  return (
    <>
      <rect
        className="component-hit"
        x={item.x}
        y={item.y}
        width={item.w}
        height={item.h}
      />
      <ComponentText item={item} compact />
    </>
  )
}

function SectionComponent({ item }: { item: CanvasComponentItem }) {
  return (
    <>
      <rect
        className="component-section"
        x={item.x}
        y={item.y}
        width={item.w}
        height={item.h}
        rx="8"
        fill={item.fill}
        stroke={item.stroke}
        vectorEffect="non-scaling-stroke"
      />
      <ComponentText item={item} compact />
    </>
  )
}

function ChecklistComponent({ item }: { item: CanvasComponentItem }) {
  const rows = item.items ?? []

  return (
    <>
      <rect
        className="component-card"
        x={item.x}
        y={item.y}
        width={item.w}
        height={item.h}
        rx="8"
        fill={item.fill}
        stroke={item.stroke}
        vectorEffect="non-scaling-stroke"
      />
      <ComponentHeader item={item} />
      {rows.map((row, index) => {
        const y = item.y + 50 + index * 28

        return (
          <g key={row}>
            <rect
              x={item.x + 18}
              y={y}
              width="14"
              height="14"
              rx="3"
              fill="none"
              stroke={item.accent}
              vectorEffect="non-scaling-stroke"
            />
            {index === 0 ? (
              <path
                d={`M ${item.x + 21} ${y + 7} L ${item.x + 25} ${y + 11} L ${
                  item.x + 31
                } ${y + 3}`}
                fill="none"
                stroke={item.accent}
                strokeWidth="1.8"
                vectorEffect="non-scaling-stroke"
              />
            ) : null}
            <SvgText x={item.x + 42} y={y + 12} text={row} />
          </g>
        )
      })}
    </>
  )
}

function KanbanComponent({ item }: { item: CanvasComponentItem }) {
  const rows = item.items ?? []

  return (
    <>
      <rect
        className="component-card"
        x={item.x}
        y={item.y}
        width={item.w}
        height={item.h}
        rx="8"
        fill={item.fill}
        stroke={item.stroke}
        vectorEffect="non-scaling-stroke"
      />
      <ComponentHeader item={item} />
      {rows.map((row, index) => (
        <g key={row}>
          <rect
            x={item.x + 14}
            y={item.y + 48 + index * 40}
            width={item.w - 28}
            height="28"
            rx="5"
            fill="#ffffff"
            stroke="#e2e8f0"
            vectorEffect="non-scaling-stroke"
          />
          <SvgText x={item.x + 26} y={item.y + 66 + index * 40} text={row} />
        </g>
      ))}
    </>
  )
}

function TableComponent({ item }: { item: CanvasComponentItem }) {
  const cols = 3
  const rows = 3
  const cellW = item.w / cols
  const cellH = item.h / rows

  return (
    <>
      <rect
        className="component-card"
        x={item.x}
        y={item.y}
        width={item.w}
        height={item.h}
        rx="6"
        fill={item.fill}
        stroke={item.stroke}
        vectorEffect="non-scaling-stroke"
      />
      <rect x={item.x} y={item.y} width={item.w} height={cellH} fill="#ecfeff" />
      {[1, 2].map((index) => (
        <line
          key={`col-${index}`}
          x1={item.x + cellW * index}
          y1={item.y}
          x2={item.x + cellW * index}
          y2={item.y + item.h}
          stroke="#cbd5e1"
          vectorEffect="non-scaling-stroke"
        />
      ))}
      {[1, 2].map((index) => (
        <line
          key={`row-${index}`}
          x1={item.x}
          y1={item.y + cellH * index}
          x2={item.x + item.w}
          y2={item.y + cellH * index}
          stroke="#cbd5e1"
          vectorEffect="non-scaling-stroke"
        />
      ))}
      {(item.columns ?? []).map((column, index) => (
        <SvgText
          key={column}
          x={item.x + cellW * index + 12}
          y={item.y + 26}
          text={column}
          strong
        />
      ))}
      {(item.items ?? []).map((cell, index) => (
        <SvgText
          key={`${cell}-${index}`}
          x={item.x + cellW * (index % 3) + 12}
          y={item.y + cellH * (Math.floor(index / 3) + 1) + 26}
          text={cell}
        />
      ))}
    </>
  )
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
      <SvgText
        x={item.x + item.w / 2 - 9}
        y={item.y + item.h / 2 + 28}
        text={item.body ?? item.title}
        strong
      />
    </>
  )
}

function ImageComponent({ item }: { item: CanvasComponentItem }) {
  return (
    <>
      <rect
        className="component-card"
        x={item.x}
        y={item.y}
        width={item.w}
        height={item.h}
        rx="8"
        fill={item.fill}
        stroke={item.stroke}
        vectorEffect="non-scaling-stroke"
      />
      <path
        d={`M ${item.x + 18} ${item.y + item.h - 22} L ${item.x + 78} ${
          item.y + 88
        } L ${item.x + 122} ${item.y + 122} L ${item.x + item.w - 18} ${
          item.y + 58
        }`}
        fill="none"
        stroke={item.accent}
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
      />
      <circle cx={item.x + item.w - 42} cy={item.y + 36} r="10" fill={item.accent} />
      <ComponentText item={item} compact />
    </>
  )
}

function ComponentHeader({ item }: { item: CanvasComponentItem }) {
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

function ComponentText({
  compact,
  item,
}: {
  compact?: boolean
  item: CanvasComponentItem
}) {
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

function SvgText({
  strong,
  text,
  x,
  y,
}: {
  strong?: boolean
  text: string
  x: number
  y: number
}) {
  return (
    <text x={x} y={y} className={strong ? 'component-svg-title' : 'component-svg-text'}>
      {text}
    </text>
  )
}
