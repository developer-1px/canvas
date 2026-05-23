import type {
  Dispatch,
  MutableRefObject,
  SetStateAction,
} from 'react'
import type {
  Bounds,
  CanvasItem,
  Viewport,
} from '../../entities'
import {
  EMPTY_CANVAS_SNAP_GUIDES,
  type CanvasDraftArrowOverlay,
  type CanvasDraftStrokeOverlay,
  type CanvasSnapGuides,
} from '../../engine'
import type { CanvasAppStageElement } from '../stage/CanvasAppStageElement'
import type { CanvasAppPointerInput } from './CanvasAppPointerInput'
import type { Interaction } from './CanvasInteractionState'
import { releasePointer } from './CanvasPointerGeometry'
import { cancelCanvasPointerInteraction } from './CanvasPointerInteractionLifecycle'
import type { CanvasPointerInteractionPreviewResult } from './CanvasPointerInteractionPreview'

export type CanvasPointerInteractionDragEffectContext = {
  interactionRef: MutableRefObject<Interaction>
  setDraftArrow: Dispatch<SetStateAction<CanvasDraftArrowOverlay | null>>
  setDraftRect: Dispatch<SetStateAction<Bounds | null>>
  setDraftStroke: Dispatch<SetStateAction<CanvasDraftStrokeOverlay | null>>
  setGesture: Dispatch<SetStateAction<Interaction['kind']>>
  setLiveItems: Dispatch<SetStateAction<CanvasItem[]>>
  setMarquee: Dispatch<SetStateAction<Bounds | null>>
  setSelection: Dispatch<SetStateAction<string[]>>
  setSnapGuides: Dispatch<SetStateAction<CanvasSnapGuides>>
  setViewport: Dispatch<SetStateAction<Viewport>>
  stageElement: CanvasAppStageElement
}

export function applyCanvasPointerInteractionPreviewEffect({
  context,
  preview,
}: {
  context: CanvasPointerInteractionDragEffectContext
  preview: CanvasPointerInteractionPreviewResult
}) {
  if (preview.kind === 'none') {
    return false
  }

  if (preview.snapGuides) {
    context.setSnapGuides(preview.snapGuides)
  }

  if (preview.viewport) {
    context.setViewport(preview.viewport)
  }

  if (preview.interaction) {
    context.interactionRef.current = preview.interaction
  }

  if (preview.liveItems) {
    context.setLiveItems(preview.liveItems)
  }

  if (preview.marquee) {
    context.setMarquee(preview.marquee)
  }

  if (preview.selection) {
    context.setSelection(preview.selection)
  }

  if (preview.draftRect) {
    context.setDraftRect(preview.draftRect)
  }

  if (preview.draftStroke) {
    context.setDraftStroke(preview.draftStroke)
  }

  if (preview.draftArrow) {
    context.setDraftArrow(preview.draftArrow)
  }

  return true
}

export function applyCanvasPointerInteractionEndEffect({
  context,
  event,
}: {
  context: CanvasPointerInteractionDragEffectContext
  event: Pick<CanvasAppPointerInput, 'pointerId'>
}) {
  releasePointer(context.stageElement, event.pointerId)
  resetCanvasPointerInteractionDragEffect(context)
}

export function applyCanvasPointerInteractionCancelEffect({
  context,
  event,
  interaction,
}: {
  context: CanvasPointerInteractionDragEffectContext
  event: Pick<CanvasAppPointerInput, 'pointerId'>
  interaction: Interaction
}) {
  cancelCanvasPointerInteraction({
    interaction,
    setLiveItems: context.setLiveItems,
    setSelection: context.setSelection,
  })

  applyCanvasPointerInteractionEndEffect({ context, event })
}

function resetCanvasPointerInteractionDragEffect(
  context: CanvasPointerInteractionDragEffectContext,
) {
  context.interactionRef.current = { kind: 'none' }
  context.setGesture('none')
  context.setMarquee(null)
  context.setDraftArrow(null)
  context.setDraftRect(null)
  context.setDraftStroke(null)
  context.setSnapGuides(EMPTY_CANVAS_SNAP_GUIDES)
}
