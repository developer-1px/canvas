import { describe, expect, it } from 'vitest'
import type {
  ArrowItem,
  CanvasCommentItem,
  CanvasComponentItem,
  RectItem,
  TextItem,
} from '../model'
import {
  getCanvasEditableTextBounds,
  getCanvasEditableTextPatchOperation,
  getCanvasEditableTextPatchField,
  getCanvasEditableTextPatchUpdates,
  getCanvasEditableTextValue,
  getCommittedCanvasEditableTextValue,
  isCanvasEditableTextItem,
  isCanvasEditableTextItemStorageShape,
  isCanvasTextItem,
  shouldCommitCanvasEditableTextOnEnter,
} from './CanvasEditableTextItem'

const rectItem: RectItem = {
  fill: '#ffffff',
  h: 60,
  id: 'rect-1',
  stroke: '#111827',
  text: 'Frame',
  type: 'rect',
  w: 80,
  x: 0,
  y: 0,
}

const textItem: TextItem = {
  h: 40,
  id: 'text-1',
  text: 'Label',
  type: 'text',
  w: 120,
  x: 0,
  y: 0,
}

const arrowItem: ArrowItem = {
  end: { x: 240, y: 120 },
  h: 24,
  id: 'arrow-1',
  start: { x: 80, y: 120 },
  stroke: '#334155',
  strokeWidth: 3,
  text: 'Next step',
  type: 'arrow',
  w: 184,
  x: 68,
  y: 108,
}

const commentItem: CanvasCommentItem = {
  body: 'Question',
  h: 36,
  id: 'comment-1',
  type: 'comment',
  w: 36,
  x: 40,
  y: 56,
}

describe('CanvasEditableTextItem', () => {
  it('recognizes items editable by the text editor', () => {
    expect(isCanvasEditableTextItem(rectItem)).toBe(true)
    expect(isCanvasEditableTextItem(textItem)).toBe(true)
    expect(isCanvasTextItem(textItem)).toBe(true)
    expect(isCanvasTextItem(rectItem)).toBe(false)
    expect(isCanvasEditableTextItem(arrowItem)).toBe(true)
    expect(isCanvasEditableTextItem(commentItem)).toBe(true)
    expect(isCanvasEditableTextItem(createComponentItem('sticky'))).toBe(true)
    expect(isCanvasEditableTextItem(createComponentItem('section'))).toBe(true)
    expect(isCanvasEditableTextItem(createComponentItem('status-card')))
      .toBe(false)
  })

  it('owns rect and text item storage shapes', () => {
    expect(isCanvasEditableTextItemStorageShape(rectItem)).toBe(true)
    expect(isCanvasEditableTextItemStorageShape({
      ...rectItem,
      text: undefined,
    })).toBe(true)
    expect(isCanvasEditableTextItemStorageShape({
      ...rectItem,
      shape: 'ellipse',
    })).toBe(true)
    expect(isCanvasEditableTextItemStorageShape({
      ...rectItem,
      shape: 'diamond',
    })).toBe(true)
    expect(isCanvasEditableTextItemStorageShape(textItem)).toBe(true)
    expect(isCanvasEditableTextItemStorageShape({
      ...textItem,
      fontSize: 18,
      opacity: 0.7,
      textAlign: 'center',
    })).toBe(true)
    expect(isCanvasEditableTextItemStorageShape({
      ...rectItem,
      fill: 1,
    })).toBe(false)
    expect(isCanvasEditableTextItemStorageShape({
      ...rectItem,
      shape: 'oval',
    })).toBe(false)
    expect(isCanvasEditableTextItemStorageShape({
      ...textItem,
      text: undefined,
    })).toBe(false)
    expect(isCanvasEditableTextItemStorageShape({
      ...textItem,
      fontSize: 0,
    })).toBe(false)
    expect(isCanvasEditableTextItemStorageShape({
      ...textItem,
      textAlign: 'justify',
    })).toBe(false)
    expect(isCanvasEditableTextItemStorageShape(arrowItem)).toBe(true)
  })

  it('normalizes editable text values by item kind', () => {
    expect(getCanvasEditableTextValue(rectItem)).toBe('Frame')
    expect(getCanvasEditableTextValue({ ...rectItem, text: undefined }))
      .toBe('')
    expect(getCanvasEditableTextValue(textItem)).toBe('Label')
    expect(getCanvasEditableTextValue(createComponentItem('sticky'))).toBe(
      'Decision note',
    )
    expect(getCanvasEditableTextValue(createComponentItem('section'))).toBe(
      'Status',
    )
    expect(getCanvasEditableTextValue(arrowItem)).toBe('Next step')
    expect(getCanvasEditableTextValue(commentItem)).toBe('Question')
    expect(getCanvasEditableTextValue({
      ...arrowItem,
      text: undefined,
    })).toBe('')
    expect(getCanvasEditableTextValue({
      ...createComponentItem('sticky'),
      body: undefined,
    })).toBe('')
  })

  it('keeps empty text items visible while allowing empty rect and sticky text', () => {
    expect(getCommittedCanvasEditableTextValue({
      item: textItem,
      value: '   ',
    })).toBe('Text')
    expect(getCommittedCanvasEditableTextValue({
      item: rectItem,
      value: '   ',
    })).toBe('   ')
    expect(getCommittedCanvasEditableTextValue({
      item: createComponentItem('sticky'),
      value: '',
    })).toBe('')
    expect(getCommittedCanvasEditableTextValue({
      item: createComponentItem('section'),
      value: '',
    })).toBe('')
    expect(getCommittedCanvasEditableTextValue({
      item: arrowItem,
      value: '',
    })).toBe('')
    expect(getCommittedCanvasEditableTextValue({
      item: commentItem,
      value: '',
    })).toBe('Comment')
  })

  it('owns the patch operation for editable text storage', () => {
    expect(getCanvasEditableTextPatchOperation({
      ...rectItem,
      text: undefined,
    })).toBe('add')
    expect(getCanvasEditableTextPatchOperation({
      ...createComponentItem('sticky'),
      body: undefined,
    })).toBe('add')
    expect(getCanvasEditableTextPatchOperation(rectItem)).toBe('replace')
    expect(getCanvasEditableTextPatchOperation(textItem)).toBe('replace')
    expect(getCanvasEditableTextPatchOperation({
      ...arrowItem,
      text: undefined,
    })).toBe('add')
    expect(getCanvasEditableTextPatchOperation(arrowItem)).toBe('replace')
    expect(getCanvasEditableTextPatchOperation(commentItem)).toBe('replace')
    expect(getCanvasEditableTextPatchOperation(createComponentItem('sticky')))
      .toBe('replace')
    expect(getCanvasEditableTextPatchOperation(createComponentItem('section')))
      .toBe('replace')
    expect(getCanvasEditableTextPatchField(createComponentItem('sticky')))
      .toBe('body')
    expect(getCanvasEditableTextPatchField(createComponentItem('section')))
      .toBe('title')
    expect(getCanvasEditableTextPatchField(commentItem)).toBe('body')
  })

  it('keeps comment body and first thread message synced during text edits', () => {
    expect(getCanvasEditableTextPatchUpdates(commentItem, 'Answer')).toEqual([
      {
        field: 'body',
        operation: 'replace',
        value: 'Answer',
      },
      {
        field: 'thread',
        operation: 'add',
        value: [{
          authorName: 'You',
          body: 'Answer',
          createdAt: 'Just now',
          id: 'comment-1:message-1',
        }],
      },
    ])
    expect(getCanvasEditableTextPatchUpdates({
      ...commentItem,
      thread: [{
        authorName: 'Ari',
        body: 'Question',
        createdAt: '2026-06-02T00:00:00.000Z',
        id: 'message-1',
      }],
    }, 'Answer')).toEqual([
      {
        field: 'body',
        operation: 'replace',
        value: 'Answer',
      },
      {
        field: 'thread/0/body',
        operation: 'replace',
        value: 'Answer',
      },
    ])
  })

  it('adds sticky height updates when committed text needs more room', () => {
    expect(getCanvasEditableTextPatchUpdates(
      createComponentItem('sticky', {
        h: 148,
        w: 188,
      }),
      'x'.repeat(180),
    )).toEqual([
      {
        field: 'body',
        operation: 'replace',
        value: 'x'.repeat(180),
      },
      {
        field: 'h',
        operation: 'replace',
        value: 302,
      },
    ])

    expect(getCanvasEditableTextPatchUpdates(
      createComponentItem('sticky', {
        h: 148,
        w: 188,
      }),
      'Short note',
    )).toEqual([
      {
        field: 'body',
        operation: 'replace',
        value: 'Short note',
      },
    ])
  })

  it('derives connector label editing bounds from arrow geometry', () => {
    expect(getCanvasEditableTextBounds(arrowItem)).toEqual({
      h: 32,
      w: 96,
      x: 112,
      y: 104,
    })
  })

  it('derives section title editing bounds from the title area', () => {
    expect(getCanvasEditableTextBounds(createComponentItem('section'))).toEqual({
      h: 32,
      w: 156,
      x: 92,
      y: 128,
    })
  })

  it('derives comment body editing bounds beside the comment pin', () => {
    expect(getCanvasEditableTextBounds(commentItem)).toEqual({
      h: 132,
      w: 220,
      x: 86,
      y: 56,
    })
  })

  it('keeps connector Enter available for multiline labels', () => {
    expect(shouldCommitCanvasEditableTextOnEnter(textItem)).toBe(true)
    expect(shouldCommitCanvasEditableTextOnEnter(arrowItem)).toBe(false)
  })
})

function createComponentItem(
  component: string,
  overrides: Partial<CanvasComponentItem> = {},
): CanvasComponentItem {
  return {
    accent: '#2563eb',
    body: 'Decision note',
    component,
    fill: '#eff6ff',
    h: 96,
    id: 'component-1',
    stroke: '#93c5fd',
    title: 'Status',
    type: 'component',
    w: 180,
    x: 80,
    y: 120,
    ...overrides,
  }
}
