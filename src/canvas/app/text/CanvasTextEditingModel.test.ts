import { describe, expect, it, vi } from 'vitest'
import type {
  ArrowItem,
  CanvasCommentItem,
  CanvasComponentItem,
  EditingText,
  RectItem,
  TextItem,
} from '../../entities'
import {
  commitCanvasTextEditing,
  getCanvasTextEditorStyle,
} from './CanvasTextEditingModel'

describe('CanvasTextEditingModel', () => {
  it('commits text edits through the document change contract', () => {
    const commitItemsChange = vi.fn()
    const setEditing = vi.fn()

    commitCanvasTextEditing({
      commitItemsChange,
      editing: createEditing('Updated'),
      editingItem: createTextItem(),
      selection: ['text-1'],
      setEditing,
    })

    expect(commitItemsChange).toHaveBeenCalledWith(
      { type: 'set-text', id: 'text-1', text: 'Updated' },
      { before: ['text-1'], after: ['text-1'] },
    )
    expect(setEditing).toHaveBeenCalledWith(null)
  })

  it('uses the default text placeholder only for empty text items', () => {
    const textCommit = vi.fn()
    const rectCommit = vi.fn()
    const stickyCommit = vi.fn()
    const commentCommit = vi.fn()

    commitCanvasTextEditing({
      commitItemsChange: textCommit,
      editing: createEditing('   '),
      editingItem: createTextItem(),
      selection: ['text-1'],
      setEditing: vi.fn(),
    })
    commitCanvasTextEditing({
      commitItemsChange: rectCommit,
      editing: createEditing('   ', 'rect-1'),
      editingItem: createRectItem(),
      selection: ['rect-1'],
      setEditing: vi.fn(),
    })
    commitCanvasTextEditing({
      commitItemsChange: stickyCommit,
      editing: createEditing('', 'component-sticky'),
      editingItem: createStickyItem(),
      selection: ['component-sticky'],
      setEditing: vi.fn(),
    })
    commitCanvasTextEditing({
      commitItemsChange: commentCommit,
      editing: createEditing('', 'comment-1'),
      editingItem: createCommentItem(),
      selection: ['comment-1'],
      setEditing: vi.fn(),
    })

    expect(textCommit).toHaveBeenCalledWith(
      { type: 'set-text', id: 'text-1', text: 'Text' },
      { before: ['text-1'], after: ['text-1'] },
    )
    expect(rectCommit).toHaveBeenCalledWith(
      { type: 'set-text', id: 'rect-1', text: '   ' },
      { before: ['rect-1'], after: ['rect-1'] },
    )
    expect(stickyCommit).toHaveBeenCalledWith(
      { type: 'set-text', id: 'component-sticky', text: '' },
      { before: ['component-sticky'], after: ['component-sticky'] },
    )
    expect(commentCommit).toHaveBeenCalledWith(
      { type: 'set-text', id: 'comment-1', text: 'Comment' },
      { before: ['comment-1'], after: ['comment-1'] },
    )
  })

  it('allows empty connector labels to stay empty', () => {
    const commitItemsChange = vi.fn()

    commitCanvasTextEditing({
      commitItemsChange,
      editing: createEditing('', 'arrow-1'),
      editingItem: createArrowItem(),
      selection: ['arrow-1'],
      setEditing: vi.fn(),
    })

    expect(commitItemsChange).toHaveBeenCalledWith(
      { type: 'set-text', id: 'arrow-1', text: '' },
      { before: ['arrow-1'], after: ['arrow-1'] },
    )
  })

  it('clears editing without document changes when the edited item disappeared', () => {
    const commitItemsChange = vi.fn()
    const setEditing = vi.fn()

    commitCanvasTextEditing({
      commitItemsChange,
      editing: createEditing('Updated'),
      editingItem: null,
      selection: ['text-1'],
      setEditing,
    })

    expect(commitItemsChange).not.toHaveBeenCalled()
    expect(setEditing).toHaveBeenCalledWith(null)
  })

  it('ignores commit when no text edit is active', () => {
    const commitItemsChange = vi.fn()
    const setEditing = vi.fn()

    commitCanvasTextEditing({
      commitItemsChange,
      editing: null,
      editingItem: createTextItem(),
      selection: ['text-1'],
      setEditing,
    })

    expect(commitItemsChange).not.toHaveBeenCalled()
    expect(setEditing).not.toHaveBeenCalled()
  })

  it('projects item bounds into viewport text editor style', () => {
    expect(getCanvasTextEditorStyle({
      editing: createEditing('Updated'),
      editingItem: createTextItem({
        h: 30,
        w: 80,
        x: 10,
        y: 20,
      }),
      viewport: { scale: 2, x: 5, y: 7 },
    })).toEqual({
      fontSize: 32,
      height: 60,
      left: 25,
      minHeight: 60,
      top: 47,
      width: 160,
    })

    expect(getCanvasTextEditorStyle({
      editing: null,
      editingItem: createTextItem(),
      viewport: { scale: 1, x: 0, y: 0 },
    })).toBeUndefined()
    expect(getCanvasTextEditorStyle({
      editing: createEditing('Updated'),
      editingItem: null,
      viewport: { scale: 1, x: 0, y: 0 },
    })).toBeUndefined()
  })

  it('projects connector label bounds instead of the full arrow bounds', () => {
    expect(getCanvasTextEditorStyle({
      editing: createEditing('Route', 'arrow-1'),
      editingItem: createArrowItem(),
      viewport: { scale: 2, x: 5, y: 7 },
    })).toEqual({
      fontSize: 32,
      height: 64,
      left: 229,
      minHeight: 64,
      top: 215,
      width: 192,
    })
  })
})

function createEditing(value: string, id = 'text-1'): EditingText {
  return {
    id,
    value,
  }
}

function createTextItem(overrides: Partial<TextItem> = {}): TextItem {
  return {
    h: 40,
    id: 'text-1',
    text: 'Text',
    type: 'text',
    w: 120,
    x: 10,
    y: 20,
    ...overrides,
  }
}

function createRectItem(overrides: Partial<RectItem> = {}): RectItem {
  return {
    fill: '#ffffff',
    h: 40,
    id: 'rect-1',
    stroke: '#111111',
    text: 'Label',
    type: 'rect',
    w: 120,
    x: 10,
    y: 20,
    ...overrides,
  }
}

function createStickyItem(
  overrides: Partial<CanvasComponentItem> = {},
): CanvasComponentItem {
  return {
    accent: '#ca8a04',
    body: 'Decision note',
    component: 'sticky',
    fill: '#fef3c7',
    h: 148,
    id: 'component-sticky',
    stroke: '#eab308',
    title: 'Sticky',
    type: 'component',
    w: 188,
    x: 10,
    y: 20,
    ...overrides,
  }
}

function createArrowItem(overrides: Partial<ArrowItem> = {}): ArrowItem {
  return {
    end: { x: 240, y: 120 },
    h: 24,
    id: 'arrow-1',
    start: { x: 80, y: 120 },
    stroke: '#334155',
    strokeWidth: 3,
    text: 'Route',
    type: 'arrow',
    w: 184,
    x: 68,
    y: 108,
    ...overrides,
  }
}

function createCommentItem(
  overrides: Partial<CanvasCommentItem> = {},
): CanvasCommentItem {
  return {
    body: 'Question',
    h: 36,
    id: 'comment-1',
    type: 'comment',
    w: 36,
    x: 10,
    y: 20,
    ...overrides,
  }
}
