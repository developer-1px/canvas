import type {
  CanvasItem,
  EditingText,
  Point,
  Tool,
} from '../../../entities'
import {
  type CanvasAffordanceConfig,
  type CanvasPointerGesture,
} from '../../../engine'
import {
  CANVAS_COMMENT_DEFAULT_BODY,
  CANVAS_COMMENT_ITEM_SIZE,
  createCanvasCommentItem,
} from '../../../host'
import {
  CANVAS_POINTER_COMMENT_CREATION_KINDS,
  type CanvasPointerCommentCreationKind,
} from './CanvasPointerCreationGrammar'

export type CanvasPointerCommentCreationStartResult =
  | { kind: 'none' }
  | {
      capturePointer: false
      edit: EditingText
      item: CanvasItem
      kind: 'created-item'
      toolAfterCreate: Extract<Tool, 'select'>
    }

export function isCanvasPointerCommentCreationGesture(
  gesture: CanvasPointerGesture,
): gesture is CanvasPointerCommentCreationKind {
  return CANVAS_POINTER_COMMENT_CREATION_KINDS.includes(
    gesture as CanvasPointerCommentCreationKind,
  )
}

export function startCanvasPointerCommentCreation({
  config,
  createId,
  pointerGesture,
  startWorld,
  targetItemId,
}: {
  config: CanvasAffordanceConfig
  createId: (prefix: string) => string
  pointerGesture: CanvasPointerGesture
  startWorld: Point
  targetItemId?: string
}): CanvasPointerCommentCreationStartResult | null {
  if (!isCanvasPointerCommentCreationGesture(pointerGesture)) {
    return null
  }

  if (!config.gestures.createComment) {
    return { kind: 'none' }
  }

  const offset = CANVAS_COMMENT_ITEM_SIZE / 2
  const item = createCanvasCommentItem({
    attachedTo: targetItemId,
    body: CANVAS_COMMENT_DEFAULT_BODY,
    id: createId('comment'),
    x: startWorld.x - offset,
    y: startWorld.y - offset,
  })

  return {
    capturePointer: false,
    edit: { id: item.id, value: item.body },
    item,
    kind: 'created-item',
    toolAfterCreate: 'select',
  }
}
