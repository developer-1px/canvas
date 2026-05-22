import type { PointerEvent } from 'react'
import type { CanvasOverlayState } from './CanvasOverlayEngine'
import type { Bounds, ResizeHandle } from './CanvasPrimitives'

type CanvasSvgInteractionOverlaysProps = {
  overlays: CanvasOverlayState
  onResizePointerDown: (
    event: PointerEvent<SVGRectElement>,
    handle: ResizeHandle,
  ) => void
}

export function CanvasSvgOverlayDefs() {
  return (
    <defs>
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" className="grid-line" />
      </pattern>
    </defs>
  )
}

export function CanvasSvgOverlayPlane({
  overlays,
}: {
  overlays: CanvasOverlayState
}) {
  return overlays.grid ? (
    <rect
      className="grid-plane"
      x="-10000"
      y="-10000"
      width="20000"
      height="20000"
    />
  ) : null
}

export function CanvasSvgInteractionOverlays({
  overlays,
  onResizePointerDown,
}: CanvasSvgInteractionOverlaysProps) {
  return (
    <>
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
    </>
  )
}

export function CanvasSvgSelectionOutline({
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
