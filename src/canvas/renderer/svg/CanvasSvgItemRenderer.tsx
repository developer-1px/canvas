import type { PointerEvent } from 'react'
import type {
  CanvasItem,
  RectItem,
  TextItem
} from '../../host/model'
import { CanvasSvgSelectionOutline } from './CanvasSvgOverlayRenderer'
import { getCanvasItemBounds } from '../../host'
import { CanvasSvgComponentRenderer } from './CanvasSvgComponentRenderer'

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
          locked: false,
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
  locked: boolean
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
  locked,
  onItemPointerDown,
  onTextDoubleClick,
  outlineIds,
  selected,
}: RenderCanvasItemArgs) {
  const isSelected = selected.has(item.id)
  const isLocked = locked || item.locked === true
  const hasOutline = outlineIds.has(item.id)
  const bounds = getCanvasItemBounds(item)

  if (item.type === 'group') {
    return (
      <g
        key={item.id}
        className="canvas-item canvas-group"
        data-locked={isLocked || undefined}
        data-selected={isSelected}
        data-type="group"
        pointerEvents={isLocked ? 'none' : undefined}
        onPointerDown={
          isLocked ? undefined : (event) => onItemPointerDown(event, item.id)
        }
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
            locked: isLocked,
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
        data-locked={isLocked || undefined}
        data-selected={isSelected}
        data-type={item.type}
        pointerEvents={isLocked ? 'none' : undefined}
        onPointerDown={
          isLocked ? undefined : (event) => onItemPointerDown(event, item.id)
        }
      >
        <CanvasSvgComponentRenderer item={item} />
        {hasOutline ? <CanvasSvgSelectionOutline bounds={bounds} /> : null}
      </g>
    )
  }

  return (
    <g
      key={item.id}
      className="canvas-item"
      data-locked={isLocked || undefined}
      data-selected={isSelected}
      data-type={item.type}
      pointerEvents={isLocked ? 'none' : undefined}
      onPointerDown={
        isLocked ? undefined : (event) => onItemPointerDown(event, item.id)
      }
      onDoubleClick={isLocked ? undefined : () => onTextDoubleClick(item)}
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
