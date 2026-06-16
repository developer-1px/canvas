import { describe, expect, it } from 'vitest'

import {
  deleteCanvasSelectionItems,
  getCanvasSelectableItemIds,
  getCanvasSelectedItemIds,
  mapCanvasSelectionItems,
} from './CanvasSelectionItems'

type TestItem = {
  hidden?: boolean
  id: string
  locked?: boolean
  name: string
}

const items: TestItem[] = [
  { id: 'a', name: 'Alpha' },
  { id: 'b', locked: true, name: 'Beta' },
  { hidden: true, id: 'c', name: 'Gamma' },
  { id: 'd', name: 'Delta' },
]

describe('CanvasSelectionItems', () => {
  it('returns selectable item ids in item order', () => {
    expect(getCanvasSelectableItemIds({
      getItemId,
      isItemSelectable: isVisible,
      items,
    })).toEqual(['a', 'b', 'd'])
  })

  it('returns selected selectable ids in item order', () => {
    expect(getCanvasSelectedItemIds({
      getItemId,
      isItemSelectable: isEditable,
      items,
      selection: ['d', 'b', 'a'],
    })).toEqual(['a', 'd'])
  })

  it('deletes selected editable items while preserving selected locked items', () => {
    expect(deleteCanvasSelectionItems({
      getItemId,
      isItemSelectable: isEditable,
      items: [...items],
      selection: ['a', 'b', 'd'],
    }).map(getItemId)).toEqual(['b', 'c'])
  })

  it('maps selected editable items and leaves unsupported items unchanged', () => {
    const locked = mapCanvasSelectionItems({
      getItemId,
      isItemSelectable: isEditable,
      items: [...items],
      mapItem: (item) => ({ ...item, locked: true }),
      selection: ['a', 'b', 'd'],
    })

    expect(locked).toMatchObject([
      { id: 'a', locked: true },
      { id: 'b', locked: true },
      { id: 'c' },
      { id: 'd', locked: true },
    ])
    expect(locked[2]).not.toHaveProperty('locked')
  })
})

function getItemId(item: TestItem) {
  return item.id
}

function isVisible(item: TestItem) {
  return item.hidden !== true
}

function isEditable(item: TestItem) {
  return item.locked !== true
}
