import { describe, expect, it } from 'vitest'
import {
  CANVAS_COMMENT_BODY_MAX_LENGTH,
  CANVAS_COMMENT_ITEM_SIZE,
  createCanvasCommentItem,
  isCanvasCommentItemStorageShape,
} from './CanvasCommentItem'

describe('CanvasCommentItem', () => {
  it('creates the persisted comment item shape', () => {
    expect(createCanvasCommentItem({
      attachedTo: 'rect-1',
      body: 'Needs follow-up',
      id: 'comment-1',
      x: 10,
      y: 20,
    })).toEqual({
      attachedTo: 'rect-1',
      body: 'Needs follow-up',
      h: CANVAS_COMMENT_ITEM_SIZE,
      id: 'comment-1',
      type: 'comment',
      w: CANVAS_COMMENT_ITEM_SIZE,
      x: 10,
      y: 20,
    })
  })

  it('accepts non-empty bodies with visible positive bounds', () => {
    expect(isCanvasCommentItemStorageShape({
      attachedTo: 'rect-1',
      body: 'Needs follow-up',
      h: CANVAS_COMMENT_ITEM_SIZE,
      id: 'comment-1',
      resolved: false,
      type: 'comment',
      w: CANVAS_COMMENT_ITEM_SIZE,
      x: 10,
      y: 20,
    })).toBe(true)
    expect(isCanvasCommentItemStorageShape({
      attachedTo: 12,
      body: 'Needs follow-up',
      h: CANVAS_COMMENT_ITEM_SIZE,
      id: 'comment-1',
      type: 'comment',
      w: CANVAS_COMMENT_ITEM_SIZE,
      x: 10,
      y: 20,
    })).toBe(false)
    expect(isCanvasCommentItemStorageShape({
      body: '',
      h: CANVAS_COMMENT_ITEM_SIZE,
      id: 'comment-1',
      type: 'comment',
      w: CANVAS_COMMENT_ITEM_SIZE,
      x: 10,
      y: 20,
    })).toBe(false)
    expect(isCanvasCommentItemStorageShape({
      body: 'x'.repeat(CANVAS_COMMENT_BODY_MAX_LENGTH + 1),
      h: CANVAS_COMMENT_ITEM_SIZE,
      id: 'comment-1',
      type: 'comment',
      w: 0,
      x: 10,
      y: 20,
    })).toBe(false)
  })
})
