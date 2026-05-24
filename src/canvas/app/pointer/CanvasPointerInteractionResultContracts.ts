import type {
  Bounds,
  CanvasItem,
  EditingText,
  Viewport,
} from '../../entities'
import type {
  CanvasDraftArrowOverlay,
  CanvasDraftStrokeOverlay,
  CanvasSnapGuides,
} from '../../engine'
import type { Interaction } from './CanvasInteractionState'
import type {
  CanvasPointerCreationInteraction,
} from './CanvasPointerCreationGrammar'

export type CanvasPointerCreationStartResult =
  | { kind: 'none' }
  | {
      kind: 'interaction'
      capturePointer: true
      clearSelection?: boolean
      draftArrow?: CanvasDraftArrowOverlay
      draftRect?: Bounds
      draftStroke?: CanvasDraftStrokeOverlay
      gesture: Interaction['kind']
      interaction: Interaction
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
      draftRect?: Bounds
      draftStroke?: CanvasDraftStrokeOverlay
      gesture: Interaction['kind']
      interaction: Interaction
    }

export type CanvasPointerCreationPreviewResult =
  | { kind: 'none' }
  | {
      draftArrow?: CanvasDraftArrowOverlay
      draftRect?: Bounds
      draftStroke?: CanvasDraftStrokeOverlay
      interaction?: CanvasPointerCreationInteraction
      kind: 'preview'
      snapGuides?: CanvasSnapGuides
    }

export type CanvasPointerInteractionPreviewResult =
  | { kind: 'none' }
  | {
      draftArrow?: CanvasDraftArrowOverlay
      draftRect?: Bounds
      draftStroke?: CanvasDraftStrokeOverlay
      interaction?: Interaction
      kind: 'preview'
      liveItems?: CanvasItem[]
      marquee?: Bounds
      selection?: string[]
      snapGuides?: CanvasSnapGuides
      viewport?: Viewport
    }
