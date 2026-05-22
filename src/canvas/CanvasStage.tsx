import type { PointerEvent, RefObject } from 'react'
import {
  type Bounds,
  type CanvasItem,
  type Interaction,
  type RectItem,
  type ResizeHandle,
  type TextItem,
  type Tool,
  type Viewport,
} from './CanvasModel'
import type { CanvasOverlayState } from './CanvasOverlayEngine'
import { getItemBounds } from './CanvasTree'

type CanvasStageProps = {
  activeMode: Tool
  gesture: Interaction['kind']
  items: CanvasItem[]
  overlays: CanvasOverlayState
  selected: Set<string>
  svgRef: RefObject<SVGSVGElement | null>
  viewport: Viewport
  onCanvasPointerDown: (event: PointerEvent<SVGSVGElement>) => void
  onContextMenu: (event: PointerEvent<SVGSVGElement>) => void
  onItemPointerDown: (
    event: PointerEvent<SVGGElement>,
    itemId: string,
  ) => void
  onPointerCancel: (event: PointerEvent<SVGSVGElement>) => void
  onPointerMove: (event: PointerEvent<SVGSVGElement>) => void
  onPointerUp: (event: PointerEvent<SVGSVGElement>) => void
  onResizePointerDown: (
    event: PointerEvent<SVGRectElement>,
    handle: ResizeHandle,
  ) => void
  onTextDoubleClick: (item: RectItem | TextItem) => void
}

export function CanvasStage({
  activeMode,
  gesture,
  items,
  overlays,
  selected,
  svgRef,
  viewport,
  onCanvasPointerDown,
  onContextMenu,
  onItemPointerDown,
  onPointerCancel,
  onPointerMove,
  onPointerUp,
  onResizePointerDown,
  onTextDoubleClick,
}: CanvasStageProps) {
  return (
    <svg
      ref={svgRef}
      className="canvas-stage"
      data-mode={activeMode}
      data-gesture={gesture}
      onContextMenu={onContextMenu}
      onPointerDown={onCanvasPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
    >
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" className="grid-line" />
        </pattern>
      </defs>

      <rect className="canvas-hit" width="100%" height="100%" />

      <g
        transform={`translate(${viewport.x} ${viewport.y}) scale(${viewport.scale})`}
      >
        {overlays.grid ? (
          <rect
            className="grid-plane"
            x="-10000"
            y="-10000"
            width="20000"
            height="20000"
          />
        ) : null}

        {items.map((item) =>
          renderCanvasItem({
            item,
            onItemPointerDown,
            onTextDoubleClick,
            outlineIds: overlays.itemOutlineIds,
            selected,
          }),
        )}

        {overlays.draftRect ? (
          <rect
            className="draft-rect"
            x={overlays.draftRect.x}
            y={overlays.draftRect.y}
            width={overlays.draftRect.w}
            height={overlays.draftRect.h}
            vectorEffect="non-scaling-stroke"
          />
        ) : null}

        {overlays.selectionBounds ? (
          <rect
            className="selection-bounds"
            x={overlays.selectionBounds.x}
            y={overlays.selectionBounds.y}
            width={overlays.selectionBounds.w}
            height={overlays.selectionBounds.h}
            vectorEffect="non-scaling-stroke"
          />
        ) : null}

        {overlays.resizeHandles.length > 0 ? (
          <g className="resize-handles">
            {overlays.resizeHandles.map(({ handle, point, size }) => (
              <rect
                key={handle}
                className="resize-handle"
                data-handle={handle}
                x={point.x - size / 2}
                y={point.y - size / 2}
                width={size}
                height={size}
                vectorEffect="non-scaling-stroke"
                onPointerDown={(event) => onResizePointerDown(event, handle)}
              />
            ))}
          </g>
        ) : null}

        {overlays.marquee ? (
          <rect
            className="marquee"
            x={overlays.marquee.x}
            y={overlays.marquee.y}
            width={overlays.marquee.w}
            height={overlays.marquee.h}
            vectorEffect="non-scaling-stroke"
          />
        ) : null}
      </g>
    </svg>
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
          <SelectionOutline bounds={bounds} kind="group" />
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

      {hasOutline ? (
        <SelectionOutline bounds={bounds} />
      ) : null}
    </g>
  )
}

function SelectionOutline({
  bounds,
  kind,
}: {
  bounds: Bounds
  kind?: 'group'
}) {
  return (
    <rect
      className={kind === 'group' ? 'item-outline group-outline' : 'item-outline'}
      x={bounds.x}
      y={bounds.y}
      width={bounds.w}
      height={bounds.h}
      vectorEffect="non-scaling-stroke"
    />
  )
}
