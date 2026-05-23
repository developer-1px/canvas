import type { PointerEvent, ReactNode, RefCallback } from 'react'
import type {
  CanvasInteractionKind,
  ResizeHandle,
  Tool,
  Viewport,
} from '../../core'
import type { CanvasOverlayState } from '../../engine'
import {
  CanvasSvgInteractionOverlays,
  CanvasSvgOverlayDefs,
  CanvasSvgOverlayPlane,
} from './CanvasSvgOverlayRenderer'

type CanvasSvgStageProps = {
  activeMode: Tool
  children?: ReactNode
  gesture: CanvasInteractionKind
  onStageElement?: RefCallback<SVGSVGElement>
  overlays: CanvasOverlayState
  viewport: Viewport
  onCanvasPointerDown: (event: PointerEvent<SVGSVGElement>) => void
  onContextMenu: (event: PointerEvent<SVGSVGElement>) => void
  onPointerCancel: (event: PointerEvent<SVGSVGElement>) => void
  onPointerMove: (event: PointerEvent<SVGSVGElement>) => void
  onPointerUp: (event: PointerEvent<SVGSVGElement>) => void
  onResizePointerDown: (
    event: PointerEvent<SVGRectElement>,
    handle: ResizeHandle,
  ) => void
}

export function CanvasSvgStage({
  activeMode,
  children,
  gesture,
  onStageElement,
  overlays,
  viewport,
  onCanvasPointerDown,
  onContextMenu,
  onPointerCancel,
  onPointerMove,
  onPointerUp,
  onResizePointerDown,
}: CanvasSvgStageProps) {
  return (
    <svg
      ref={onStageElement}
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

        {children}

        <CanvasSvgInteractionOverlays
          overlays={overlays}
          onResizePointerDown={onResizePointerDown}
        />
      </g>
    </svg>
  )
}
