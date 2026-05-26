import type {
  EditingText,
  Tool,
} from '../../../../entities'
import type { CanvasAppPointerInput } from './CanvasAppPointerInput'
import { capturePointer } from './CanvasPointerGeometry'
import type {
  CanvasPointerInteractionStartEffectContext,
  CanvasTextEditInteractionStartEffectContext,
} from './CanvasPointerInteractionEffectContracts'
import type { CanvasItemPointerInteractionStartResult } from './CanvasItemPointerInteractionStart'
import type {
  CanvasPointerInteractionStartResult,
} from './CanvasPointerInteractionResultContracts'
import type { CanvasResizePointerInteractionStartResult } from './CanvasResizePointerInteractionStart'
import type {
  CanvasArrowEndpointPointerInteractionStartResult,
} from './CanvasArrowEndpointPointerInteractionStart'

export function applyCanvasPointerInteractionStartEffect({
  context,
  event,
  start,
}: {
  context: CanvasPointerInteractionStartEffectContext
  event: CanvasAppPointerInput
  start: CanvasPointerInteractionStartResult
}) {
  if (start.kind === 'none') {
    return false
  }

  event.preventDefault()

  if (start.capturePointer) {
    capturePointer(context.stageElement, event.pointerId)
  }

  if (start.kind === 'created-text') {
    context.commitItemsChange({ type: 'add', items: [start.item] }, {
      before: context.selection,
      after: [start.item.id],
    })
    context.setEditing(start.edit)
    context.setTool('select')
    return true
  }

  if (start.kind === 'created-item') {
    context.commitItemsChange({ type: 'add', items: [start.item] }, {
      before: context.selection,
      after: [start.item.id],
    })

    if (start.edit) {
      context.setEditing(start.edit)
    }

    if (start.toolAfterCreate) {
      context.setTool(start.toolAfterCreate)
    }

    return true
  }

  if (start.clearSelection) {
    context.setSelection([])
  }

  context.interactionRef.current = start.interaction

  if (start.draftRect) {
    context.setDraftRect(start.draftRect)
  }

  if (start.draftStroke) {
    context.setDraftStroke(start.draftStroke)
  }

  if (start.draftArrow) {
    context.setDraftArrow(start.draftArrow)
  }

  if (start.laserTrail) {
    context.setLaserTrail(start.laserTrail)
  }

  context.setGesture(start.gesture)
  return true
}

export function applyCanvasItemPointerInteractionStartEffect({
  clearLastClick,
  context,
  event,
  start,
}: {
  clearLastClick: () => void
  context: CanvasPointerInteractionStartEffectContext
  event: CanvasAppPointerInput
  start: CanvasItemPointerInteractionStartResult
}) {
  event.preventDefault()
  event.stopPropagation()

  if (start.clearLastClick) {
    clearLastClick()
  }

  if (start.commitSelection) {
    context.commitSelection(start.commitSelection)
  }

  if (start.liveItems) {
    context.setLiveItems(start.liveItems)
  }

  if (start.selection) {
    context.setSelection(start.selection)
  }

  if (start.kind === 'none') {
    context.interactionRef.current = { kind: 'none' }
    context.setGesture('none')
    return true
  }

  capturePointer(context.stageElement, event.pointerId)
  context.interactionRef.current = start.interaction
  context.setGesture('move')
  return true
}

export function applyCanvasResizePointerInteractionStartEffect({
  context,
  event,
  start,
}: {
  context: CanvasPointerInteractionStartEffectContext
  event: CanvasAppPointerInput
  start:
    | CanvasArrowEndpointPointerInteractionStartResult
    | CanvasResizePointerInteractionStartResult
}) {
  if (start.kind === 'none') {
    return false
  }

  event.preventDefault()
  event.stopPropagation()

  if (start.capturePointer) {
    capturePointer(context.stageElement, event.pointerId)
  }

  context.interactionRef.current = start.interaction
  context.setGesture(start.gesture)
  return true
}

export function applyCanvasTextEditInteractionStartEffect({
  context,
  start,
}: {
  context: CanvasTextEditInteractionStartEffectContext
  start:
    | { kind: 'none' }
    | {
        editing: EditingText
        kind: 'text-edit'
        selection: string[]
        tool: Extract<Tool, 'select'>
      }
}) {
  if (start.kind === 'none') {
    return false
  }

  context.commitSelection(start.selection)
  context.setEditing(start.editing)
  context.setTool(start.tool)
  return true
}
