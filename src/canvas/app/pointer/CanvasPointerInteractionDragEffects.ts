import {
  EMPTY_CANVAS_SNAP_GUIDES,
} from '../../engine'
import type { CanvasAppPointerIdInput } from './CanvasAppPointerInput'
import type { Interaction } from './CanvasInteractionState'
import { releasePointer } from './CanvasPointerGeometry'
import type {
  CanvasPointerInteractionDragEffectContext,
} from './CanvasPointerInteractionEffectContracts'
import { cancelCanvasPointerInteraction } from './CanvasPointerInteractionLifecycle'
import type {
  CanvasPointerInteractionPreviewResult,
} from './CanvasPointerInteractionResultContracts'

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

  if (preview.laserTrail) {
    context.setLaserTrail(preview.laserTrail)
  }

  return true
}

export function applyCanvasPointerInteractionEndEffect({
  context,
  event,
}: {
  context: CanvasPointerInteractionDragEffectContext
  event: CanvasAppPointerIdInput
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
  event: CanvasAppPointerIdInput
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
  context.setLaserTrail(null)
  context.setSnapGuides(EMPTY_CANVAS_SNAP_GUIDES)
}
