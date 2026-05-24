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

export type CanvasDraftArrowOverlay = {
  end: Point
  routing?: 'elbow' | 'straight'
  start: Point
}

export type CanvasDraftStrokeOverlay = {
  kind: 'marker' | 'highlight'
  opacity: number
  points: Point[]
  stroke: string
  strokeWidth: number
}

export type CanvasPresenceOverlay = {
  color: string
  id: string
  label: string
  point: Point
}

export type CanvasOverlayState = {
  alignmentGuides: CanvasSnapGuides['alignmentGuides']
  draftArrow: CanvasDraftArrowOverlay | null
  draftRect: Bounds | null
  draftStroke: CanvasDraftStrokeOverlay | null
  grid: boolean
  itemOutlineIds: Set<string>
  marquee: Bounds | null
  presence?: readonly CanvasPresenceOverlay[]
  resizeHandles: CanvasResizeHandleOverlay[]
  selectionBounds: Bounds | null
  spacingGuides: CanvasSnapGuides['spacingGuides']
}

export function createCanvasOverlayState({
  config,
  draftArrow,
  draftRect,
  draftStroke,
  marquee,
  presence = [],
  scene,
  selection,
  snapGuides,
  viewport,
}: {
  config: CanvasAffordanceConfig
  draftArrow: CanvasDraftArrowOverlay | null
  draftRect: Bounds | null
  draftStroke: CanvasDraftStrokeOverlay | null
  marquee: Bounds | null
  presence?: readonly CanvasPresenceOverlay[]
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
    draftArrow: config.overlays.draftArrow ? draftArrow : null,
    draftRect: config.overlays.draftRect ? draftRect : null,
    draftStroke: config.overlays.draftStroke ? draftStroke : null,
    grid: config.overlays.grid,
    itemOutlineIds: config.overlays.itemOutline
      ? new Set(selection)
      : new Set(),
    marquee: config.overlays.marquee ? marquee : null,
    presence: config.overlays.presence ? [...presence] : [],
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
