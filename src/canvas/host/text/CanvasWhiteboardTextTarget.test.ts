import { describe, expect, it } from 'vitest'
import type {
  CanvasCommentItem,
  CanvasComponentItem,
  CanvasImageItem,
  TextItem,
} from '../model'
import {
  getCanvasEditableTextBounds,
  getCanvasEditableTextPatchUpdates,
  getCanvasEditableTextValue,
} from './CanvasEditableTextItem'
import { CANVAS_WHITEBOARD_TEXT_TARGET } from './CanvasWhiteboardTextTarget'

const textItem: TextItem = {
  h: 40,
  id: 'text-1',
  text: 'Label',
  type: 'text',
  w: 120,
  x: 0,
  y: 0,
}

const stickyItem: CanvasComponentItem = {
  accent: '#f59e0b',
  body: 'Idea',
  component: 'sticky',
  fill: '#fef3c7',
  h: 120,
  id: 'sticky-1',
  stroke: '#f59e0b',
  title: 'Sticky',
  type: 'component',
  w: 120,
  x: 40,
  y: 40,
}

const commentItem: CanvasCommentItem = {
  body: 'Question',
  h: 36,
  id: 'comment-1',
  resolved: false,
  type: 'comment',
  w: 160,
  x: 200,
  y: 80,
}

const imageItem: CanvasImageItem = {
  h: 90,
  id: 'image-1',
  mimeType: 'image/png',
  naturalHeight: 90,
  naturalWidth: 160,
  src: 'data:image/png;base64,',
  type: 'image',
  w: 160,
  x: 320,
  y: 40,
}

describe('CanvasWhiteboardTextTarget', () => {
  it('accepts whiteboard editable text items and rejects the rest', () => {
    expect(CANVAS_WHITEBOARD_TEXT_TARGET.canEdit(textItem)).toBe(true)
    expect(CANVAS_WHITEBOARD_TEXT_TARGET.canEdit(stickyItem)).toBe(true)
    expect(CANVAS_WHITEBOARD_TEXT_TARGET.canEdit(commentItem)).toBe(true)
    expect(CANVAS_WHITEBOARD_TEXT_TARGET.canEdit(imageItem)).toBe(false)
  })

  it('mirrors the whiteboard editable text value rules', () => {
    expect(CANVAS_WHITEBOARD_TEXT_TARGET.getValue(textItem)).toBe(
      getCanvasEditableTextValue(textItem),
    )
    expect(CANVAS_WHITEBOARD_TEXT_TARGET.getValue(stickyItem)).toBe(
      getCanvasEditableTextValue(stickyItem),
    )
    expect(CANVAS_WHITEBOARD_TEXT_TARGET.getValue(imageItem)).toBe('')
  })

  it('keeps committed value fallbacks for empty text', () => {
    expect(
      CANVAS_WHITEBOARD_TEXT_TARGET.getCommittedValue({
        item: textItem,
        value: '  ',
      }),
    ).toBe('Text')
    expect(
      CANVAS_WHITEBOARD_TEXT_TARGET.getCommittedValue({
        item: commentItem,
        value: '',
      }),
    ).not.toBe('')
    expect(
      CANVAS_WHITEBOARD_TEXT_TARGET.getCommittedValue({
        item: imageItem,
        value: 'kept',
      }),
    ).toBe('kept')
  })

  it('projects editor bounds only for editable items', () => {
    expect(CANVAS_WHITEBOARD_TEXT_TARGET.getEditorBounds(textItem)).toEqual(
      getCanvasEditableTextBounds(textItem),
    )
    expect(CANVAS_WHITEBOARD_TEXT_TARGET.getEditorBounds(imageItem)).toBeNull()
  })

  it('commits on enter for non-arrow editable items only', () => {
    expect(CANVAS_WHITEBOARD_TEXT_TARGET.commitsOnEnter(stickyItem)).toBe(true)
    expect(CANVAS_WHITEBOARD_TEXT_TARGET.commitsOnEnter(imageItem)).toBe(false)
  })

  it('plans the same commit patch updates as the whiteboard text module', () => {
    expect(
      CANVAS_WHITEBOARD_TEXT_TARGET.planCommitUpdates(stickyItem, 'Next'),
    ).toEqual(getCanvasEditableTextPatchUpdates(stickyItem, 'Next'))
    expect(
      CANVAS_WHITEBOARD_TEXT_TARGET.planCommitUpdates(imageItem, 'Next'),
    ).toEqual([])
  })
})
