import type { PointerEvent } from 'react'
import type { CanvasItem, RectItem, TextItem } from './CanvasModel'
import { CanvasSvgSelectionOutline } from './CanvasSvgOverlayRenderer'
import { getItemBounds } from './CanvasTree'

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
