import type { CanvasAffordanceConfig } from './CanvasAffordances'
import {
  handlePoint,
  RESIZE_HANDLES,
  type Bounds,
  type Point,
  type ResizeHandle,
  type Viewport,
} from './CanvasModel'

export type CanvasResizeHandleOverlay = {
  handle: ResizeHandle
  point: Point
  size: number
}

export type CanvasOverlayState = {
  draftRect: Bounds | null
  grid: boolean
  itemOutlineIds: Set<string>
  marquee: Bounds | null
  resizeHandles: CanvasResizeHandleOverlay[]
  selectionBounds: Bounds | null
}

export function createCanvasOverlayState({
  config,
  draftRect,
  marquee,
  selectedBounds,
  selection,
  viewport,
}: {
  config: CanvasAffordanceConfig
  draftRect: Bounds | null
  marquee: Bounds | null
  selectedBounds: Bounds | null
  selection: string[]
  viewport: Viewport
}): CanvasOverlayState {
  return {
    draftRect: config.overlays.draftRect ? draftRect : null,
    grid: config.overlays.grid,
    itemOutlineIds: config.overlays.itemOutline
      ? new Set(selection)
      : new Set(),
    marquee: config.overlays.marquee ? marquee : null,
    resizeHandles:
      config.overlays.resizeHandles && selectedBounds
        ? RESIZE_HANDLES.map((handle) => ({
            handle,
            point: handlePoint(selectedBounds, handle),
            size: 10 / viewport.scale,
          }))
        : [],
    selectionBounds:
      config.overlays.selectionBounds && selectedBounds && selection.length > 1
        ? selectedBounds
        : null,
  }
}
