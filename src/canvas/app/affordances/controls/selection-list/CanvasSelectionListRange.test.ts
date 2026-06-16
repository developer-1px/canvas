import { describe, expect, it } from 'vitest'
import { getCanvasSelectionListRangeIds } from './CanvasSelectionListRange'

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
})
