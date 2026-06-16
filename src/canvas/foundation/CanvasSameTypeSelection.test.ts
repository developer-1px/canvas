import { describe, expect, it } from 'vitest'

import {
  canSelectSameTypeCanvasItems,
  selectSameTypeCanvasItems,
} from './CanvasSameTypeSelection'

type TestItem = {
  hidden?: boolean
  id: string
  kind: 'image' | 'shape' | 'text'
  shape?: 'ellipse' | 'rect'
}

const items: TestItem[] = [
  { id: 'rect-1', kind: 'shape', shape: 'rect' },
  { id: 'rect-2', kind: 'shape', shape: 'rect' },
  { id: 'ellipse-1', kind: 'shape', shape: 'ellipse' },
  { id: 'text-1', kind: 'text' },
  { hidden: true, id: 'rect-hidden', kind: 'shape', shape: 'rect' },
  { id: 'image-1', kind: 'image' },
]

describe('CanvasSameTypeSelection', () => {
  it('selects selectable items with the same type key as the current selection', () => {
    expect(selectSameTypeCanvasItems({
      getItemId: (item) => item.id,
      getItemType: getTestItemType,
      isItemSelectable: (item) => item.hidden !== true,
      items,
      selection: ['rect-1'],
    })).toEqual(['rect-1', 'rect-2'])
  })

  it('preserves the current selection when no selected item is selectable', () => {
    expect(selectSameTypeCanvasItems({
      getItemId: (item) => item.id,
      getItemType: getTestItemType,
      isItemSelectable: (item) => item.hidden !== true,
      items,
      selection: ['rect-hidden'],
    })).toEqual(['rect-hidden'])
  })

  it('reports availability only when selection can grow', () => {
    expect(canSelectSameTypeCanvasItems({
      getItemId: (item) => item.id,
      getItemType: getTestItemType,
      items,
      selection: [],
    })).toBe(false)
    expect(canSelectSameTypeCanvasItems({
      getItemId: (item) => item.id,
      getItemType: getTestItemType,
      items,
      selection: ['image-1'],
    })).toBe(false)
    expect(canSelectSameTypeCanvasItems({
      getItemId: (item) => item.id,
      getItemType: getTestItemType,
      items,
      selection: ['rect-1'],
    })).toBe(true)
  })
})

function getTestItemType(item: TestItem) {
  return item.kind === 'shape' ? `${item.kind}:${item.shape}` : item.kind
}
