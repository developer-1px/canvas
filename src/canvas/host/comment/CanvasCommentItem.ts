import type { Bounds } from '../../core'
import type {
  CanvasCommentItem,
  CanvasItem,
} from '../model'

export const CANVAS_COMMENT_ITEM_SIZE = 36
export const CANVAS_COMMENT_BODY_MAX_LENGTH = 240
export const CANVAS_COMMENT_DEFAULT_BODY = 'Comment'
const CANVAS_COMMENT_BODY_CARD_GAP = 10
const CANVAS_COMMENT_BODY_CARD_HEIGHT = 88
const CANVAS_COMMENT_BODY_CARD_WIDTH = 220

export type CreateCanvasCommentItemInput = {
  attachedTo?: string
  body: string
  id: string
  resolved?: boolean
  x: number
  y: number
}

export function createCanvasCommentItem({
  attachedTo,
  body,
  id,
  resolved,
  x,
  y,
}: CreateCanvasCommentItemInput): CanvasCommentItem {
  const item: CanvasCommentItem = {
    body,
    h: CANVAS_COMMENT_ITEM_SIZE,
    id,
    type: 'comment',
    w: CANVAS_COMMENT_ITEM_SIZE,
    x,
    y,
  }

  if (attachedTo !== undefined) {
    item.attachedTo = attachedTo
  }

  if (resolved !== undefined) {
    item.resolved = resolved
  }

  return item
}

export function isCanvasCommentItem(
  item: CanvasItem,
): item is CanvasCommentItem {
  return item.type === 'comment'
}

export function getCanvasCommentBodyBounds(
  item: CanvasCommentItem,
): Bounds {
  return {
    h: CANVAS_COMMENT_BODY_CARD_HEIGHT,
    w: CANVAS_COMMENT_BODY_CARD_WIDTH,
    x: item.x + item.w + CANVAS_COMMENT_BODY_CARD_GAP,
    y: item.y,
  }
}

export function isCanvasCommentAttachedTo(
  item: CanvasItem,
  attachedIds: ReadonlySet<string>,
): item is CanvasCommentItem {
  return isCanvasCommentItem(item) &&
    item.attachedTo !== undefined &&
    attachedIds.has(item.attachedTo)
}

export function translateCanvasCommentItem<TItem extends CanvasCommentItem>({
  dx,
  dy,
  item,
}: {
  dx: number
  dy: number
  item: TItem
}): TItem {
  return {
    ...item,
    x: item.x + dx,
    y: item.y + dy,
  }
}

export function isCanvasCommentItemStorageShape(
  value: Record<string, unknown>,
): value is CanvasCommentItem {
  return (
    value.type === 'comment' &&
    typeof value.body === 'string' &&
    value.body.trim().length > 0 &&
    value.body.length <= CANVAS_COMMENT_BODY_MAX_LENGTH &&
    (value.attachedTo === undefined || typeof value.attachedTo === 'string') &&
    (value.resolved === undefined || typeof value.resolved === 'boolean') &&
    isPositiveFiniteNumber(value.w) &&
    isPositiveFiniteNumber(value.h)
  )
}

function isPositiveFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
}
