import { describe, expect, it } from 'vitest'
import {
  getCanvasSelectionListModifierState,
  getCanvasSelectionListRangeIds,
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
})
