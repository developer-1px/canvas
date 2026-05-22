import type { CanvasAffordanceConfig } from '../affordance/CanvasAffordances'
import type {
  Bounds,
  Point,
  ResizeHandle,
  Viewport
} from '../../core'
import {
  handlePoint,
  RESIZE_HANDLES,
} from '../primitives/CanvasPrimitives'
import type { CanvasSceneAdapter } from '../scene/CanvasSceneAdapter'
import type { CanvasSnapGuides } from '../snap/CanvasSnapEngine'

export type CanvasResizeHandleOverlay = {
  handle: ResizeHandle
  point: Point
  size: number
}

export type CanvasOverlayState = {
  alignmentGuides: CanvasSnapGuides['alignmentGuides']
  draftRect: Bounds | null
  grid: boolean
  itemOutlineIds: Set<string>
  marquee: Bounds | null
  resizeHandles: CanvasResizeHandleOverlay[]
  selectionBounds: Bounds | null
  spacingGuides: CanvasSnapGuides['spacingGuides']
}

export function createCanvasOverlayState({
  config,
  draftRect,
  marquee,
  scene,
  selection,
  snapGuides,
  viewport,
}: {
  config: CanvasAffordanceConfig
  draftRect: Bounds | null
  marquee: Bounds | null
  scene: CanvasSceneAdapter
  selection: string[]
  snapGuides: CanvasSnapGuides
  viewport: Viewport
}): CanvasOverlayState {
  const selectedBounds = scene.getBounds(selection)

  return {
    alignmentGuides: config.overlays.alignmentGuides
      ? snapGuides.alignmentGuides
      : [],
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
    spacingGuides: config.overlays.spacingGuides
      ? snapGuides.spacingGuides
      : [],
  }
}
