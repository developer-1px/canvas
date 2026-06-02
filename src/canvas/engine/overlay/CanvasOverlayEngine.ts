import type { CanvasAffordanceConfig } from '../affordance/CanvasAffordances'
import type {
  Bounds,
  Point,
  ResizeHandle,
  Viewport
} from '../../core'
import type { CanvasShapeType } from '../../entities'
import {
  handlePoint,
  RESIZE_HANDLES,
} from '../primitives/CanvasPrimitives'
import type { CanvasSceneAdapter } from '../../foundation/CanvasSceneAdapter'
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

export type CanvasDraftShapeOverlay = Bounds & {
  shapeType?: CanvasShapeType
}

export type CanvasDraftStrokeOverlay = {
  kind: 'marker' | 'highlight' | 'path'
  opacity: number
  points: Point[]
  stroke: string
  strokeWidth: number
}

export type CanvasLaserTrailOverlay = {
  points: Point[]
}

export type CanvasEmoteBurstOverlay = {
  emote: string
  id: string
  label: string
  particles: readonly CanvasEmoteBurstParticle[]
  point: Point
}

export type CanvasEmoteBurstParticle = {
  dx: number
  dy: number
}

export type CanvasPresenceOverlay = {
  color: string
  id: string
  label: string
  point: Point
  selectionBounds?: Bounds
}

export type CanvasOverlayState = {
  alignmentGuides: CanvasSnapGuides['alignmentGuides']
  draftArrow: CanvasDraftArrowOverlay | null
  draftRect: CanvasDraftShapeOverlay | null
  draftStroke: CanvasDraftStrokeOverlay | null
  emoteBursts: readonly CanvasEmoteBurstOverlay[]
  grid: boolean
  itemOutlineIds: Set<string>
  laserTrail: CanvasLaserTrailOverlay | null
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
  emoteBursts = [],
  laserTrail,
  marquee,
  presence = [],
  scene,
  selection,
  snapGuides,
  viewport,
}: {
  config: CanvasAffordanceConfig
  draftArrow: CanvasDraftArrowOverlay | null
  draftRect: CanvasDraftShapeOverlay | null
  draftStroke: CanvasDraftStrokeOverlay | null
  emoteBursts?: readonly CanvasEmoteBurstOverlay[]
  laserTrail: CanvasLaserTrailOverlay | null
  marquee: Bounds | null
  presence?: readonly CanvasPresenceOverlay[]
  scene: CanvasSceneAdapter
  selection: string[]
  snapGuides: CanvasSnapGuides
  viewport: Viewport
}): CanvasOverlayState {
  const selectedBounds = scene.getBounds(selection)
  const canResizeSelection = scene.canResizeSelection?.(selection) ?? true

  return {
    alignmentGuides: config.overlays.alignmentGuides
      ? snapGuides.alignmentGuides
      : [],
    draftArrow: config.overlays.draftArrow ? draftArrow : null,
    draftRect: config.overlays.draftRect ? draftRect : null,
    draftStroke: config.overlays.draftStroke ? draftStroke : null,
    emoteBursts: config.overlays.emoteBursts ? [...emoteBursts] : [],
    grid: config.overlays.grid,
    itemOutlineIds: config.overlays.itemOutline
      ? new Set(selection)
      : new Set(),
    laserTrail: config.overlays.laserTrail ? laserTrail : null,
    marquee: config.overlays.marquee ? marquee : null,
    presence: config.overlays.presence ? [...presence] : [],
    resizeHandles:
      config.overlays.resizeHandles && selectedBounds && canResizeSelection
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
