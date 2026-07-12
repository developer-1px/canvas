import type {
  Bounds,
  CanvasItem,
  EditingText,
  Tool,
  Viewport,
} from '../../../../entities'
import type {
  CanvasDraftArrowOverlay,
  CanvasDraftShapeOverlay,
  CanvasLaserTrailOverlay,
  CanvasDraftStrokeOverlay,
  CanvasSnapGuides,
} from '../../../../engine'
import type { Interaction } from './CanvasInteractionState'
import type {
  CanvasPointerCreationInteraction,
} from './CanvasPointerCreationGrammar'
import type {
  CanvasAppFoundationExtensionEffect,
} from '../../../extensions/foundation-extensions'

export type CanvasPointerCreationStartResult =
  | { kind: 'none' }
  | {
      kind: 'interaction'
      capturePointer: true
      clearSelection?: boolean
      draftArrow?: CanvasDraftArrowOverlay
      draftRect?: CanvasDraftShapeOverlay
      draftStroke?: CanvasDraftStrokeOverlay
      gesture: Interaction['kind']
      interaction: Interaction
      laserTrail?: CanvasLaserTrailOverlay
    }
  | {
      kind: 'extension-effects'
      capturePointer: false
      effects: readonly CanvasAppFoundationExtensionEffect[]
    }
  | {
      kind: 'created-item'
      capturePointer: false
      edit?: EditingText
      item: CanvasItem
      toolAfterCreate?: Tool
    }
  | {
      kind: 'created-text'
      capturePointer: false
      edit: EditingText
      item: CanvasItem
    }

export type CanvasPointerInteractionStartResult =
  | CanvasPointerCreationStartResult
  | {
      kind: 'interaction'
      capturePointer: true
      clearSelection?: boolean
      draftArrow?: CanvasDraftArrowOverlay
      draftRect?: CanvasDraftShapeOverlay
      draftStroke?: CanvasDraftStrokeOverlay
      gesture: Interaction['kind']
      interaction: Interaction
      laserTrail?: CanvasLaserTrailOverlay
    }

export type CanvasPointerCreationPreviewResult =
  | { kind: 'none' }
  | {
      draftArrow?: CanvasDraftArrowOverlay
      draftRect?: CanvasDraftShapeOverlay
      draftStroke?: CanvasDraftStrokeOverlay
      interaction?: CanvasPointerCreationInteraction
      kind: 'preview'
      snapGuides?: CanvasSnapGuides
    }

export type CanvasPointerInteractionPreviewResult =
  | { kind: 'none' }
  | {
      draftArrow?: CanvasDraftArrowOverlay
      draftRect?: CanvasDraftShapeOverlay
      draftStroke?: CanvasDraftStrokeOverlay
      interaction?: Interaction
      kind: 'preview'
      laserTrail?: CanvasLaserTrailOverlay
      liveItems?: CanvasItem[]
      marquee?: Bounds
      selection?: string[]
      snapGuides?: CanvasSnapGuides
      viewport?: Viewport
    }
