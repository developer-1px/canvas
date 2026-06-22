import type {
  Bounds,
  CanvasItem,
  EditingText,
} from '../../../../entities'
import type { CanvasSnapGuides } from '../../../../engine'
import type { Interaction } from './CanvasInteractionState'

export type CanvasPointerComponentCreationInteraction = Extract<
  Interaction,
  { kind: 'create-section' }
>

export type CanvasPointerComponentCreationStartResult =
  | { kind: 'none' }
  | {
      capturePointer: true
      draftRect: Bounds
      gesture: CanvasPointerComponentCreationInteraction['kind']
      interaction: CanvasPointerComponentCreationInteraction
      kind: 'interaction'
    }
  | {
      capturePointer: false
      edit?: EditingText
      item: CanvasItem
      kind: 'created-item'
    }

export type CanvasPointerComponentCreationPreviewResult =
  | { kind: 'none' }
  | {
      draftRect: Bounds
      interaction: CanvasPointerComponentCreationInteraction
      kind: 'preview'
      snapGuides: CanvasSnapGuides
    }
