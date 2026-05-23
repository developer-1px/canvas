import type {
  Dispatch,
  MutableRefObject,
  SetStateAction,
} from 'react'
import type {
  Bounds,
  CanvasItem,
  EditingText,
  Tool,
} from '../../entities'
import type {
  CanvasDraftArrowOverlay,
  CanvasDraftStrokeOverlay,
} from '../../engine'
import type {
  CommitCanvasItemsChange,
  CommitCanvasSelection,
} from '../workflow/CanvasWorkflowContract'
import type { CanvasAppStageElement } from '../stage/CanvasAppStageElement'
import type { CanvasAppPointerInput } from './CanvasAppPointerInput'
import type { Interaction } from './CanvasInteractionState'
import { capturePointer } from './CanvasPointerGeometry'
import type { CanvasItemPointerInteractionStartResult } from './CanvasItemPointerInteractionStart'
import type { CanvasPointerInteractionStartResult } from './CanvasPointerInteractionStart'
import type { CanvasResizePointerInteractionStartResult } from './CanvasResizePointerInteractionStart'

export type CanvasPointerInteractionStartEffectContext = {
  commitItemsChange: CommitCanvasItemsChange
  commitSelection: CommitCanvasSelection
  interactionRef: MutableRefObject<Interaction>
  selection: string[]
  setDraftArrow: Dispatch<SetStateAction<CanvasDraftArrowOverlay | null>>
  setDraftRect: Dispatch<SetStateAction<Bounds | null>>
  setDraftStroke: Dispatch<SetStateAction<CanvasDraftStrokeOverlay | null>>
  setEditing: Dispatch<SetStateAction<EditingText | null>>
  setGesture: Dispatch<SetStateAction<Interaction['kind']>>
  setLiveItems: Dispatch<SetStateAction<CanvasItem[]>>
  setSelection: Dispatch<SetStateAction<string[]>>
  setTool: Dispatch<SetStateAction<Tool>>
  stageElement: CanvasAppStageElement
}

export type CanvasTextEditInteractionStartEffectContext = {
  commitSelection: CommitCanvasSelection
  setEditing: Dispatch<SetStateAction<EditingText | null>>
  setTool: Dispatch<SetStateAction<Tool>>
}

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
  start: CanvasResizePointerInteractionStartResult
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
