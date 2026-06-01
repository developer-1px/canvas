import type { Bounds } from '../../core'
import type {
  CanvasCommentItem,
  CanvasCommentThreadMessage,
  CanvasItem,
} from '../model'

export const CANVAS_COMMENT_ITEM_SIZE = 36
export const CANVAS_COMMENT_BODY_MAX_LENGTH = 240
export const CANVAS_COMMENT_DEFAULT_BODY = 'Comment'
export const CANVAS_COMMENT_DEFAULT_AUTHOR_NAME = 'You'
export const CANVAS_COMMENT_DEFAULT_CREATED_AT = 'Just now'
const CANVAS_COMMENT_BODY_CARD_GAP = 10
const CANVAS_COMMENT_BODY_CARD_HEIGHT = 132
const CANVAS_COMMENT_BODY_CARD_WIDTH = 220

export type CreateCanvasCommentItemInput = {
  attachedTo?: string
  authorName?: string
  body: string
  createdAt?: string
  id: string
  resolved?: boolean
  thread?: CanvasCommentThreadMessage[]
  x: number
  y: number
}

export type CanvasCommentTextPatchUpdate = {
  field: string
  operation: 'add' | 'replace'
  value: CanvasCommentThreadMessage[] | string
}

export function createCanvasCommentItem({
  attachedTo,
  authorName = CANVAS_COMMENT_DEFAULT_AUTHOR_NAME,
  body,
  createdAt = CANVAS_COMMENT_DEFAULT_CREATED_AT,
  id,
  resolved,
  thread,
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
  const messages = thread ?? [
    createCanvasCommentThreadMessage({
      authorName,
      body,
      createdAt,
      id: `${id}:message-1`,
    }),
  ]

  if (attachedTo !== undefined) {
    item.attachedTo = attachedTo
  }

  if (resolved !== undefined) {
    item.resolved = resolved
  }

  item.thread = messages

  return item
}

export function createCanvasCommentThreadMessage({
  authorName = CANVAS_COMMENT_DEFAULT_AUTHOR_NAME,
  body,
  createdAt = CANVAS_COMMENT_DEFAULT_CREATED_AT,
  id,
}: {
  authorName?: string
  body: string
  createdAt?: string
  id: string
}): CanvasCommentThreadMessage {
  return {
    authorName,
    body,
    createdAt,
    id,
  }
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

export function getCanvasCommentThreadMessages(
  item: CanvasCommentItem,
): CanvasCommentThreadMessage[] {
  return item.thread && item.thread.length > 0
    ? [...item.thread]
    : [createCanvasCommentThreadMessage({
        body: item.body,
        id: `${item.id}:legacy-body`,
      })]
}

export function getCanvasCommentTextPatchUpdates(
  item: CanvasCommentItem,
  text: string,
): CanvasCommentTextPatchUpdate[] {
  const updates: CanvasCommentTextPatchUpdate[] = [{
    field: 'body',
    operation: 'replace',
    value: text,
  }]
  const thread = getCanvasCommentThreadMessages(item)
  const [firstMessage] = thread

  if (item.thread && item.thread.length > 0 && firstMessage) {
    updates.push({
      field: 'thread/0/body',
      operation: 'replace',
      value: text,
    })
  } else {
    updates.push({
      field: 'thread',
      operation: 'add',
      value: [createCanvasCommentThreadMessage({
        body: text,
        id: `${item.id}:message-1`,
      })],
    })
  }

  return updates
}

export function setCanvasCommentResolved<TItem extends CanvasCommentItem>(
  item: TItem,
  resolved: boolean,
): TItem {
  return {
    ...item,
    resolved,
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
    (
      value.thread === undefined ||
      isCanvasCommentThreadMessageArray(value.thread)
    ) &&
    isPositiveFiniteNumber(value.w) &&
    isPositiveFiniteNumber(value.h)
  )
}

function isCanvasCommentThreadMessageArray(
  value: unknown,
): value is CanvasCommentThreadMessage[] {
  return Array.isArray(value) &&
    value.length > 0 &&
    value.every(isCanvasCommentThreadMessageStorageShape)
}

function isCanvasCommentThreadMessageStorageShape(
  value: unknown,
): value is CanvasCommentThreadMessage {
  return isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.authorName === 'string' &&
    value.authorName.trim().length > 0 &&
    typeof value.createdAt === 'string' &&
    value.createdAt.trim().length > 0 &&
    typeof value.body === 'string' &&
    value.body.trim().length > 0 &&
    value.body.length <= CANVAS_COMMENT_BODY_MAX_LENGTH
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isPositiveFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
}
