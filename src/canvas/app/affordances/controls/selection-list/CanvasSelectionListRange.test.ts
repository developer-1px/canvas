import { describe, expect, it } from 'vitest'
import {
  getCanvasSelectionListModifierState,
  getCanvasSelectionListRangeIds,
  getCanvasSelectionListSelectionPlan,
} from './CanvasSelectionListRange'

const ids = ['title', 'note', 'image', 'footer'] as const

describe('CanvasSelectionListRange', () => {
  it('returns ids from anchor to target in list order', () => {
    expect(getCanvasSelectionListRangeIds({
      anchorId: 'title',
      ids,
      targetId: 'image',
    })).toEqual(['title', 'note', 'image'])

    expect(getCanvasSelectionListRangeIds({
      anchorId: 'footer',
      ids,
      targetId: 'note',
    })).toEqual(['note', 'image', 'footer'])
  })

  it('falls back to the target when the anchor is missing', () => {
    expect(getCanvasSelectionListRangeIds({
      anchorId: null,
      ids,
      targetId: 'image',
    })).toEqual(['image'])

    expect(getCanvasSelectionListRangeIds({
      anchorId: 'missing',
      ids: ['title', 'image'],
      targetId: 'image',
    })).toEqual(['image'])
  })

  it('returns an empty range when the target is missing', () => {
    expect(getCanvasSelectionListRangeIds({
      anchorId: 'title',
      ids,
      targetId: null,
    })).toEqual([])

    expect(getCanvasSelectionListRangeIds({
      anchorId: 'title',
      ids: ['title', 'image'],
      targetId: 'missing',
    })).toEqual([])
  })

  it('normalizes selection list modifier state', () => {
    expect(getCanvasSelectionListModifierState({
      ctrlKey: false,
      metaKey: false,
      shiftKey: true,
    })).toEqual({
      additive: false,
      mode: 'range',
      range: true,
    })

    expect(getCanvasSelectionListModifierState({
      ctrlKey: false,
      hasRangeAnchor: false,
      metaKey: true,
      shiftKey: true,
    })).toEqual({
      additive: true,
      mode: 'additive',
      range: false,
    })

    expect(getCanvasSelectionListModifierState({
      ctrlKey: false,
      metaKey: false,
      shiftKey: false,
    })).toEqual({
      additive: false,
      mode: 'replace',
      range: false,
    })
  })

  it('plans replace selection gestures with a new range anchor', () => {
    expect(getCanvasSelectionListSelectionPlan({
      anchorId: 'title',
      ctrlKey: false,
      ids,
      metaKey: false,
      selectedIds: ['title', 'footer'],
      shiftKey: false,
      targetId: 'image',
    })).toEqual({
      anchorId: 'image',
      mode: 'replace',
      selectedIds: ['image'],
      targetId: 'image',
    })
  })

  it('plans additive selection gestures by toggling the target in list order', () => {
    expect(getCanvasSelectionListSelectionPlan({
      anchorId: 'title',
      ctrlKey: false,
      ids,
      metaKey: true,
      selectedIds: ['footer', 'title'],
      shiftKey: false,
      targetId: 'image',
    })).toEqual({
      anchorId: 'image',
      mode: 'additive',
      selectedIds: ['title', 'image', 'footer'],
      targetId: 'image',
    })

    expect(getCanvasSelectionListSelectionPlan({
      anchorId: 'title',
      ctrlKey: true,
      ids,
      metaKey: false,
      selectedIds: ['title', 'image', 'footer'],
      shiftKey: false,
      targetId: 'image',
    })).toEqual({
      anchorId: 'image',
      mode: 'additive',
      selectedIds: ['title', 'footer'],
      targetId: 'image',
    })
  })

  it('plans range selection gestures from a stable anchor', () => {
    expect(getCanvasSelectionListSelectionPlan({
      anchorId: 'title',
      ctrlKey: false,
      ids,
      metaKey: false,
      selectedIds: ['footer'],
      shiftKey: true,
      targetId: 'image',
    })).toEqual({
      anchorId: 'title',
      mode: 'range',
      selectedIds: ['title', 'note', 'image'],
      targetId: 'image',
    })
  })

  it('falls back to replace selection when a range gesture has no valid anchor', () => {
    expect(getCanvasSelectionListSelectionPlan({
      anchorId: 'missing',
      ctrlKey: false,
      ids,
      metaKey: false,
      selectedIds: ['footer'],
      shiftKey: true,
      targetId: 'image',
    })).toEqual({
      anchorId: 'image',
      mode: 'replace',
      selectedIds: ['image'],
      targetId: 'image',
    })
  })

  it('keeps current selection and anchor for invalid targets', () => {
    expect(getCanvasSelectionListSelectionPlan({
      anchorId: 'note',
      ctrlKey: false,
      ids,
      metaKey: false,
      selectedIds: ['footer', 'missing', 'note', 'note'],
      shiftKey: false,
      targetId: 'missing',
    })).toEqual({
      anchorId: 'note',
      mode: 'replace',
      selectedIds: ['note', 'footer'],
      targetId: null,
    })
  })
})
