import { describe, expect, it } from 'vitest'
import {
  getCanvasSelectionListKeyboardIntent,
  runCanvasSelectionListKeyboardIntent,
} from './CanvasSelectionListKeyboard'

const ids = ['title', 'note', 'image', 'footer'] as const

describe('CanvasSelectionListKeyboard', () => {
  it('plans arrow, home, and end focus movement without changing selection', () => {
    expect(getCanvasSelectionListKeyboardIntent({
      anchorId: 'title',
      ctrlKey: false,
      focusedId: 'note',
      ids,
      key: 'ArrowDown',
      metaKey: false,
      selectedIds: ['note'],
      shiftKey: false,
    })).toEqual({
      focusId: 'image',
      index: 2,
      kind: 'move-focus',
      preventDefault: true,
      selectionPlan: null,
      stopPropagation: true,
    })

    expect(getCanvasSelectionListKeyboardIntent({
      anchorId: null,
      ctrlKey: false,
      focusedId: 'missing',
      ids,
      key: 'ArrowUp',
      metaKey: false,
      selectedIds: [],
      shiftKey: false,
    })).toEqual({
      focusId: 'footer',
      index: 3,
      kind: 'move-focus',
      preventDefault: true,
      selectionPlan: null,
      stopPropagation: true,
    })

    expect(getCanvasSelectionListKeyboardIntent({
      anchorId: null,
      ctrlKey: false,
      focusedId: 'image',
      ids,
      key: 'Home',
      metaKey: false,
      selectedIds: [],
      shiftKey: false,
    })).toMatchObject({
      focusId: 'title',
      index: 0,
      kind: 'move-focus',
    })

    expect(getCanvasSelectionListKeyboardIntent({
      anchorId: null,
      ctrlKey: false,
      focusedId: 'image',
      ids,
      key: 'End',
      metaKey: false,
      selectedIds: [],
      shiftKey: false,
    })).toMatchObject({
      focusId: 'footer',
      index: 3,
      kind: 'move-focus',
    })
  })

  it('plans shift navigation as range selection from a stable anchor', () => {
    expect(getCanvasSelectionListKeyboardIntent({
      anchorId: 'title',
      ctrlKey: false,
      focusedId: 'note',
      ids,
      key: 'ArrowDown',
      metaKey: false,
      selectedIds: ['footer'],
      shiftKey: true,
    })).toEqual({
      focusId: 'image',
      index: 2,
      kind: 'move-focus',
      preventDefault: true,
      selectionPlan: {
        anchorId: 'title',
        mode: 'range',
        selectedIds: ['title', 'note', 'image'],
        targetId: 'image',
      },
      stopPropagation: true,
    })
  })

  it('plans enter and space against the focused item', () => {
    expect(getCanvasSelectionListKeyboardIntent({
      anchorId: 'title',
      ctrlKey: false,
      focusedId: 'note',
      ids,
      key: 'Enter',
      metaKey: false,
      selectedIds: ['footer'],
      shiftKey: false,
    })).toEqual({
      focusId: 'note',
      index: 1,
      kind: 'select-focused',
      preventDefault: true,
      selectionPlan: {
        anchorId: 'note',
        mode: 'replace',
        selectedIds: ['note'],
        targetId: 'note',
      },
      stopPropagation: true,
    })

    expect(getCanvasSelectionListKeyboardIntent({
      anchorId: 'title',
      ctrlKey: false,
      focusedId: 'image',
      ids,
      key: ' ',
      metaKey: true,
      selectedIds: ['title', 'image'],
      shiftKey: false,
    })).toEqual({
      focusId: 'image',
      index: 2,
      kind: 'select-focused',
      preventDefault: true,
      selectionPlan: {
        anchorId: 'image',
        mode: 'additive',
        selectedIds: ['title'],
        targetId: 'image',
      },
      stopPropagation: true,
    })
  })

  it('does not consume unsupported keys or empty lists', () => {
    expect(getCanvasSelectionListKeyboardIntent({
      anchorId: null,
      ctrlKey: false,
      focusedId: 'title',
      ids,
      key: 'Escape',
      metaKey: false,
      selectedIds: ['title'],
      shiftKey: false,
    })).toEqual({
      kind: 'none',
      preventDefault: false,
      stopPropagation: false,
    })

    expect(getCanvasSelectionListKeyboardIntent({
      anchorId: null,
      ctrlKey: false,
      focusedId: null,
      ids: [],
      key: 'ArrowDown',
      metaKey: false,
      selectedIds: [],
      shiftKey: false,
    })).toEqual({
      kind: 'none',
      preventDefault: false,
      stopPropagation: false,
    })
  })

  it('runs handled keyboard intents by consuming the event and applying callbacks', () => {
    let preventDefaultCount = 0
    let stopPropagationCount = 0
    let focusedId: string | null = null
    let focusedIndex: number | null = null
    let selectedIds: readonly string[] = []
    let anchorId: string | null = null

    expect(runCanvasSelectionListKeyboardIntent({
      anchorId: 'title',
      event: {
        ctrlKey: false,
        key: 'ArrowDown',
        metaKey: false,
        preventDefault: () => {
          preventDefaultCount += 1
        },
        shiftKey: true,
        stopPropagation: () => {
          stopPropagationCount += 1
        },
      },
      focusedId: 'note',
      ids,
      onFocusItem: (id, index) => {
        focusedId = id
        focusedIndex = index
      },
      onSelectionPlan: (plan) => {
        selectedIds = plan.selectedIds
        anchorId = plan.anchorId
      },
      selectedIds: ['footer'],
    })).toBe(true)

    expect(preventDefaultCount).toBe(1)
    expect(stopPropagationCount).toBe(1)
    expect(focusedId).toBe('image')
    expect(focusedIndex).toBe(2)
    expect(selectedIds).toEqual(['title', 'note', 'image'])
    expect(anchorId).toBe('title')
  })
})
