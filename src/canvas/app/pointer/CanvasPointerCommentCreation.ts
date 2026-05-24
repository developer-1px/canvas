import type {
  CanvasItem,
  Point,
} from '../../entities'
import {
  type CanvasAffordanceConfig,
  type CanvasPointerGesture,
} from '../../engine'
import {
  CANVAS_COMMENT_ITEM_SIZE,
  createCanvasCommentItem,
} from '../../host'
import {
  CANVAS_POINTER_COMMENT_CREATION_KINDS,
  type CanvasPointerCommentCreationKind,
} from './CanvasPointerCreationGrammar'

const CANVAS_DEFAULT_COMMENT_BODY = 'Comment'

export type CanvasPointerCommentCreationStartResult =
  | { kind: 'none' }
  | {
      capturePointer: false
      item: CanvasItem
      kind: 'created-item'
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

  return {
    capturePointer: false,
    item: createCanvasCommentItem({
      attachedTo: targetItemId,
      body: CANVAS_DEFAULT_COMMENT_BODY,
      id: createId('comment'),
      x: startWorld.x - offset,
      y: startWorld.y - offset,
    }),
    kind: 'created-item',
  }
}
