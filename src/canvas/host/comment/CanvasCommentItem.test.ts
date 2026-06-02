import { describe, expect, it } from 'vitest'
import {
  CANVAS_COMMENT_DEFAULT_AUTHOR_NAME,
  CANVAS_COMMENT_BODY_MAX_LENGTH,
  CANVAS_COMMENT_DEFAULT_BODY,
  CANVAS_COMMENT_DEFAULT_CREATED_AT,
  CANVAS_COMMENT_ITEM_SIZE,
  createCanvasCommentItem,
  createCanvasCommentThreadMessage,
  getCanvasCommentBodyBounds,
  getCanvasCommentTextPatchUpdates,
  getCanvasCommentThreadMessages,
  isCanvasCommentItemStorageShape,
  setCanvasCommentResolved,
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
      thread: [{
        authorName: CANVAS_COMMENT_DEFAULT_AUTHOR_NAME,
        body: 'Needs follow-up',
        createdAt: CANVAS_COMMENT_DEFAULT_CREATED_AT,
        id: 'comment-1:message-1',
      }],
      type: 'comment',
      w: CANVAS_COMMENT_ITEM_SIZE,
      x: 10,
      y: 20,
    })
    expect(CANVAS_COMMENT_DEFAULT_BODY).toBe('Comment')
  })

  it('places the editable body card beside the comment pin', () => {
    expect(getCanvasCommentBodyBounds(createCanvasCommentItem({
      body: 'Needs follow-up',
      id: 'comment-1',
      x: 10,
      y: 20,
    }))).toEqual({
      h: 132,
      w: 220,
      x: 56,
      y: 20,
    })
  })

  it('derives thread messages from new and legacy comments', () => {
    const threaded = createCanvasCommentItem({
      body: 'Needs follow-up',
      id: 'comment-1',
      thread: [
        createCanvasCommentThreadMessage({
          authorName: 'Ari',
          body: 'Needs follow-up',
          createdAt: '2026-06-02T00:00:00.000Z',
          id: 'message-1',
        }),
        createCanvasCommentThreadMessage({
          authorName: 'Bo',
          body: '@ari fixed',
          createdAt: '2026-06-02T00:01:00.000Z',
          id: 'message-2',
        }),
      ],
      x: 10,
      y: 20,
    })
    const legacy = {
      body: 'Legacy body',
      h: CANVAS_COMMENT_ITEM_SIZE,
      id: 'comment-legacy',
      type: 'comment' as const,
      w: CANVAS_COMMENT_ITEM_SIZE,
      x: 10,
      y: 20,
    }

    expect(getCanvasCommentThreadMessages(threaded).map((message) =>
      message.body,
    )).toEqual(['Needs follow-up', '@ari fixed'])
    expect(getCanvasCommentThreadMessages(legacy)).toEqual([{
      authorName: CANVAS_COMMENT_DEFAULT_AUTHOR_NAME,
      body: 'Legacy body',
      createdAt: CANVAS_COMMENT_DEFAULT_CREATED_AT,
      id: 'comment-legacy:legacy-body',
    }])
  })

  it('creates text patches that keep legacy body and first thread message synced', () => {
    const legacy = {
      body: 'Legacy body',
      h: CANVAS_COMMENT_ITEM_SIZE,
      id: 'comment-legacy',
      type: 'comment' as const,
      w: CANVAS_COMMENT_ITEM_SIZE,
      x: 10,
      y: 20,
    }

    expect(getCanvasCommentTextPatchUpdates(legacy, 'Updated')).toEqual([
      {
        field: 'body',
        operation: 'replace',
        value: 'Updated',
      },
      {
        field: 'thread',
        operation: 'add',
        value: [{
          authorName: CANVAS_COMMENT_DEFAULT_AUTHOR_NAME,
          body: 'Updated',
          createdAt: CANVAS_COMMENT_DEFAULT_CREATED_AT,
          id: 'comment-legacy:message-1',
        }],
      },
    ])
    expect(getCanvasCommentTextPatchUpdates(
      createCanvasCommentItem({
        body: 'Draft',
        id: 'comment-1',
        x: 10,
        y: 20,
      }),
      'Final',
    )).toEqual([
      {
        field: 'body',
        operation: 'replace',
        value: 'Final',
      },
      {
        field: 'thread/0/body',
        operation: 'replace',
        value: 'Final',
      },
    ])
  })

  it('toggles resolved state without deleting the thread', () => {
    const item = createCanvasCommentItem({
      body: 'Needs follow-up',
      id: 'comment-1',
      x: 10,
      y: 20,
    })

    expect(setCanvasCommentResolved(item, true)).toEqual({
      ...item,
      resolved: true,
    })
    expect(setCanvasCommentResolved(item, true).thread).toEqual(item.thread)
  })

  it('accepts non-empty bodies and ordered threads with visible positive bounds', () => {
    expect(isCanvasCommentItemStorageShape({
      attachedTo: 'rect-1',
      body: 'Needs follow-up',
      h: CANVAS_COMMENT_ITEM_SIZE,
      id: 'comment-1',
      resolved: false,
      thread: [{
        authorName: 'Ari',
        body: 'Needs follow-up',
        createdAt: '2026-06-02T00:00:00.000Z',
        id: 'message-1',
      }],
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
    expect(isCanvasCommentItemStorageShape({
      body: 'Needs follow-up',
      h: CANVAS_COMMENT_ITEM_SIZE,
      id: 'comment-1',
      thread: [],
      type: 'comment',
      w: CANVAS_COMMENT_ITEM_SIZE,
      x: 10,
      y: 20,
    })).toBe(false)
    expect(isCanvasCommentItemStorageShape({
      body: 'Needs follow-up',
      h: CANVAS_COMMENT_ITEM_SIZE,
      id: 'comment-1',
      thread: [{
        authorName: '',
        body: 'Needs follow-up',
        createdAt: '2026-06-02T00:00:00.000Z',
        id: 'message-1',
      }],
      type: 'comment',
      w: CANVAS_COMMENT_ITEM_SIZE,
      x: 10,
      y: 20,
    })).toBe(false)
  })
})
