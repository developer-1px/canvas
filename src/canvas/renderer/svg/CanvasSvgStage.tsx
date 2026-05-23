import type { PointerEvent, RefObject } from 'react'
import type {
  CanvasItem,
  CanvasInteractionKind,
  RectItem,
  ResizeHandle,
  TextItem,
  Tool,
  Viewport,
} from '../../entities'
import type { CanvasOverlayState } from '../../engine'
import { CanvasSvgItemRenderer } from './CanvasSvgItemRenderer'
import {
  CanvasSvgInteractionOverlays,
  CanvasSvgOverlayDefs,
  CanvasSvgOverlayPlane,
} from './CanvasSvgOverlayRenderer'

type CanvasSvgStageProps = {
  activeMode: Tool
  gesture: CanvasInteractionKind
  getComponentPresentation: (component: string) => string
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

export function CanvasSvgStage({
  activeMode,
  gesture,
  getComponentPresentation,
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
}: CanvasSvgStageProps) {
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

        <CanvasSvgItemRenderer
          getComponentPresentation={getComponentPresentation}
          items={items}
          onItemPointerDown={onItemPointerDown}
          onTextDoubleClick={onTextDoubleClick}
          outlineIds={overlays.itemOutlineIds}
          selected={selected}
        />

        <CanvasSvgInteractionOverlays
          overlays={overlays}
          onResizePointerDown={onResizePointerDown}
        />
      </g>
    </svg>
  )
}
