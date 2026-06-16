import { describe, expect, it } from 'vitest'

import {
  cloneCanvasSelectionItems,
  deleteCanvasSelectionItems,
  getCanvasSelectableItemIds,
  getCanvasSelectedItemIds,
  mapCanvasSelectionItems,
} from './CanvasSelectionItems'

type TestItem = {
  groupId?: string
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

  it('clones selected editable items with stable group id remaps', () => {
    const sourceItems: TestItem[] = [
      { groupId: 'group-a', id: 'a', name: 'Alpha' },
      { groupId: 'group-a', id: 'b', locked: true, name: 'Beta' },
      { id: 'c', name: 'Gamma' },
      { groupId: 'group-a', id: 'd', name: 'Delta' },
    ]
    const createdGroupIds: string[] = []

    const clones = cloneCanvasSelectionItems({
      cloneItem: ({ cloneIndex, item, sourceId, targetGroupId }) => {
        const clone = {
          ...item,
          id: `${sourceId}-copy-${cloneIndex}`,
          name: `${item.name} Copy`,
        }

        if (targetGroupId) {
          clone.groupId = targetGroupId
        } else {
          delete clone.groupId
        }

        return clone
      },
      createGroupId: (sourceGroupId) => {
        const targetGroupId = `${sourceGroupId}-copy`

        createdGroupIds.push(targetGroupId)

        return targetGroupId
      },
      getItemGroupId: (item) => item.groupId,
      getItemId,
      isItemSelectable: isEditable,
      items: sourceItems,
      selection: ['d', 'b', 'c', 'a'],
    })

    expect(clones).toEqual([
      {
        groupId: 'group-a-copy',
        id: 'a-copy-0',
        name: 'Alpha Copy',
      },
      {
        id: 'c-copy-1',
        name: 'Gamma Copy',
      },
      {
        groupId: 'group-a-copy',
        id: 'd-copy-2',
        name: 'Delta Copy',
      },
    ])
    expect(createdGroupIds).toEqual(['group-a-copy'])
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
