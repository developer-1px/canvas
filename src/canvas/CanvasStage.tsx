import type { PointerEvent, RefObject } from 'react'
import {
  type CanvasItem,
  type Interaction,
  type RectItem,
  type ResizeHandle,
  type TextItem,
  type Tool,
  type Viewport,
} from './CanvasModel'
import type { CanvasOverlayState } from './CanvasOverlayEngine'
import {
  CanvasSvgInteractionOverlays,
  CanvasSvgOverlayDefs,
  CanvasSvgOverlayPlane,
  CanvasSvgSelectionOutline,
} from './CanvasSvgOverlayRenderer'
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
      <CanvasSvgOverlayDefs />

      <rect className="canvas-hit" width="100%" height="100%" />

      <g
        transform={`translate(${viewport.x} ${viewport.y}) scale(${viewport.scale})`}
      >
        <CanvasSvgOverlayPlane overlays={overlays} />

        {items.map((item) =>
          renderCanvasItem({
            item,
            onItemPointerDown,
            onTextDoubleClick,
            outlineIds: overlays.itemOutlineIds,
            selected,
          }),
        )}

        <CanvasSvgInteractionOverlays
          overlays={overlays}
          onResizePointerDown={onResizePointerDown}
        />
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
