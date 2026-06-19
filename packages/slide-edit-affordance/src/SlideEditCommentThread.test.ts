import { describe, expect, it } from 'vitest'

import {
  getSlideEditCommentThreadJSONPasteValue,
  getSlideEditCommentThreadJSONPasteValueFromText,
  getSlideEditCommentThreadJSONPasteValueFromValue,
  getSlideEditCommentThreadPasteCommandEffect,
  SLIDE_EDIT_COMMENT_THREAD_JSON_MIME_TYPE,
} from './SlideEditCommentThread'
import {
  getSlideEditCommentThreadJSONPasteValue as getSlideEditCommentThreadJSONPasteValueFromPackage,
  getSlideEditCommentThreadJSONPasteValueFromText as getSlideEditCommentThreadJSONPasteValueFromTextFromPackage,
  getSlideEditCommentThreadJSONPasteValueFromValue as getSlideEditCommentThreadJSONPasteValueFromValueFromPackage,
} from './index'

describe('SlideEditCommentThread', () => {
  it('reads custom MIME direct comment thread JSON values first', () => {
    expect(getSlideEditCommentThreadJSONPasteValue({
      dataTransfer: createDataTransfer({
        [SLIDE_EDIT_COMMENT_THREAD_JSON_MIME_TYPE]: JSON.stringify({
          body: '  Main review  ',
          createdAt: '  2026-06-18T10:00:00Z  ',
          resolved: true,
          thread: [
            {
              authorName: 'Reviewer',
              body: 'Old first message',
              createdAt: '2026-06-18T09:00:00Z',
              id: 'message-a',
            },
            '  Follow-up  ',
          ],
        }),
        'application/json':
          '{"comment":{"body":"Ignored generic wrapper"}}',
      }),
    })).toEqual({
      fields: ['body', 'createdAt', 'messages', 'resolved'],
      format: 'json',
      patch: {
        body: 'Main review',
        createdAt: '2026-06-18T10:00:00Z',
        messages: [
          {
            authorName: 'Reviewer',
            body: 'Main review',
            createdAt: '2026-06-18T09:00:00Z',
            id: 'message-a',
          },
          {
            body: 'Follow-up',
          },
        ],
        resolved: true,
      },
      payloadLength: expect.any(Number),
      sourceType: SLIDE_EDIT_COMMENT_THREAD_JSON_MIME_TYPE,
      surface: 'comment-thread',
    })

    expect(getSlideEditCommentThreadJSONPasteValueFromPackage({
      dataTransfer: createDataTransfer({
        [SLIDE_EDIT_COMMENT_THREAD_JSON_MIME_TYPE]:
          '{"text":"Package export"}',
      }),
    })).toMatchObject({
      patch: {
        body: 'Package export',
        messages: [
          {
            body: 'Package export',
          },
        ],
      },
    })
  })

  it('reads wrapped comment review payloads from general JSON candidates', () => {
    expect(getSlideEditCommentThreadJSONPasteValue({
      dataTransfer: createDataTransfer({
        'application/json': JSON.stringify({
          commentThread: {
            messages: [
              {
                authorName: 'AI',
                text: 'Check spacing',
              },
            ],
            resolved: false,
          },
        }),
      }),
    })).toMatchObject({
      fields: ['messages', 'resolved'],
      patch: {
        messages: [
          {
            authorName: 'AI',
            body: 'Check spacing',
          },
        ],
        resolved: false,
      },
      wrapper: 'commentThread',
    })

    expect(getSlideEditCommentThreadJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/json': JSON.stringify({
          reviewComment: {
            body: 'Keep this concise',
            replies: ['Reply one'],
          },
        }),
      }),
      storagePolicy: {
        maxBodyLength: 9,
        maxMessageBodyLength: 5,
      },
    })).toMatchObject({
      fields: ['body', 'messages'],
      patch: {
        body: 'Keep this',
        messages: [
          {
            body: 'Keep this',
          },
        ],
      },
      wrapper: 'reviewComment',
    })
  })

  it('reads comment thread JSON from text and parsed values', () => {
    const directText = '{"body":"Body"}'

    expect(getSlideEditCommentThreadJSONPasteValueFromText(
      directText,
      { sourceType: 'custom/test' },
    )).toEqual({
      fields: ['body', 'messages'],
      format: 'json',
      patch: {
        body: 'Body',
        messages: [
          {
            body: 'Body',
          },
        ],
      },
      payloadLength: directText.length,
      sourceType: 'custom/test',
      surface: 'comment-thread',
    })
    expect(getSlideEditCommentThreadJSONPasteValueFromValue({
      comment: {
        body: 'Wrapped',
        resolved: true,
      },
    }, { mode: 'wrapped', sourceType: 'application/json' })).toMatchObject({
      fields: ['body', 'messages', 'resolved'],
      patch: {
        body: 'Wrapped',
        messages: [
          {
            body: 'Wrapped',
          },
        ],
        resolved: true,
      },
      sourceType: 'application/json',
      wrapper: 'comment',
    })
    expect(getSlideEditCommentThreadJSONPasteValueFromTextFromPackage(
      JSON.stringify({
        reviewComment: {
          body: 'Keep this concise',
          replies: ['Reply one'],
        },
      }),
      {
        mode: 'wrapped',
        storagePolicy: {
          maxBodyLength: 9,
          maxMessageBodyLength: 5,
        },
      },
    )).toMatchObject({
      patch: {
        body: 'Keep this',
        messages: [
          {
            body: 'Keep this',
          },
        ],
      },
      wrapper: 'reviewComment',
    })
    expect(getSlideEditCommentThreadJSONPasteValueFromValueFromPackage({
      text: 'Package export',
    })).toMatchObject({
      payloadLength: 0,
      patch: {
        body: 'Package export',
        messages: [
          {
            body: 'Package export',
          },
        ],
      },
      sourceType: 'value',
    })
    expect(getSlideEditCommentThreadJSONPasteValueFromText(
      '{"body":"Direct generic body"}',
      { mode: 'wrapped' },
    )).toBeNull()
  })

  it('converts comment thread paste values to patch command effects', () => {
    const pasteValue = getSlideEditCommentThreadJSONPasteValue({
      dataTransfer: createDataTransfer({
        'application/json': JSON.stringify({
          comment: {
            body: 'Body',
            messages: [
              {
                text: 'Needs id',
              },
              {
                body: 'Existing id',
                id: 'existing',
              },
            ],
            resolved: true,
          },
        }),
      }),
    })!

    expect(getSlideEditCommentThreadPasteCommandEffect({
      createMessageId: ({ index }) => `generated-${index}`,
      pasteValue,
      slideId: 'slide-a',
      target: {
        commentId: 'comment-a',
      },
    })).toEqual({
      metadata: {
        fields: ['body', 'messages', 'resolved'],
        format: 'json',
        messageCount: 2,
        payloadLength: expect.any(Number),
        resolved: true,
        targetIds: ['comment-a'],
      },
      payload: {
        commentId: 'comment-a',
        id: 'patch-comment-thread',
        patch: {
          body: 'Body',
          messages: [
            {
              body: 'Body',
              id: 'generated-0',
            },
            {
              body: 'Existing id',
              id: 'existing',
            },
          ],
          resolved: true,
        },
      },
      selection: {
        commentIds: ['comment-a'],
        slideId: 'slide-a',
      },
      type: 'slide-command-effect',
    })
  })

  it('ignores unavailable comment thread paste routes', () => {
    const pasteValue = getSlideEditCommentThreadJSONPasteValue({
      dataTransfer: createDataTransfer({
        [SLIDE_EDIT_COMMENT_THREAD_JSON_MIME_TYPE]:
          '{"body":"Body"}',
      }),
    })!

    expect(getSlideEditCommentThreadPasteCommandEffect({
      pasteValue,
      target: null,
    })).toBeNull()
    expect(getSlideEditCommentThreadPasteCommandEffect({
      pasteValue,
      target: {
        commentId: 'comment-a',
        isLocked: true,
      },
    })).toBeNull()
    expect(getSlideEditCommentThreadPasteCommandEffect({
      pasteValue,
      target: {
        commentId: 'comment-a',
        isHidden: true,
      },
    })).toBeNull()
    expect(getSlideEditCommentThreadJSONPasteValue({
      dataTransfer: null,
    })).toBeNull()
    expect(getSlideEditCommentThreadJSONPasteValue({
      dataTransfer: createDataTransfer({
        'application/json': '{"body":"Direct generic body"}',
      }),
    })).toBeNull()
    expect(getSlideEditCommentThreadJSONPasteValue({
      dataTransfer: createDataTransfer({
        [SLIDE_EDIT_COMMENT_THREAD_JSON_MIME_TYPE]: 'not json',
      }),
    })).toBeNull()
  })
})

function createDataTransfer(values: Record<string, string>) {
  return {
    getData: (type: string) => values[type] ?? '',
  }
}
