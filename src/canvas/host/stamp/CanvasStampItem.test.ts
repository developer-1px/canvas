import { describe, expect, it } from 'vitest'
import {
  CANVAS_STAMP_ITEM_SIZE,
  createCanvasStampItem,
  isCanvasStampItemStorageShape,
} from './CanvasStampItem'

describe('CanvasStampItem', () => {
  it('creates the persisted stamp item shape', () => {
    expect(createCanvasStampItem({
      id: 'stamp-1',
      label: '+1',
      stamp: 'thumbs-up',
      x: 10,
      y: 20,
    })).toEqual({
      h: CANVAS_STAMP_ITEM_SIZE,
      id: 'stamp-1',
      label: '+1',
      stamp: 'thumbs-up',
      type: 'stamp',
      w: CANVAS_STAMP_ITEM_SIZE,
      x: 10,
      y: 20,
    })
  })

  it('accepts stable stamp ids with visible positive bounds', () => {
    expect(isCanvasStampItemStorageShape({
      h: CANVAS_STAMP_ITEM_SIZE,
      id: 'stamp-1',
      label: '+1',
      stamp: 'thumbs-up',
      type: 'stamp',
      w: CANVAS_STAMP_ITEM_SIZE,
      x: 10,
      y: 20,
    })).toBe(true)
    expect(isCanvasStampItemStorageShape({
      h: CANVAS_STAMP_ITEM_SIZE,
      attachedTo: 'rect-1',
      id: 'stamp-1',
      label: '+1',
      stamp: 'thumbs-up',
      type: 'stamp',
      w: CANVAS_STAMP_ITEM_SIZE,
      x: 10,
      y: 20,
    })).toBe(false)
    expect(isCanvasStampItemStorageShape({
      h: CANVAS_STAMP_ITEM_SIZE,
      id: 'stamp-1',
      label: '+1',
      stamp: 'Thumbs Up',
      type: 'stamp',
      w: CANVAS_STAMP_ITEM_SIZE,
      x: 10,
      y: 20,
    })).toBe(false)
    expect(isCanvasStampItemStorageShape({
      h: CANVAS_STAMP_ITEM_SIZE,
      id: 'stamp-1',
      label: '',
      stamp: 'thumbs-up',
      type: 'stamp',
      w: 0,
      x: 10,
      y: 20,
    })).toBe(false)
  })
})
