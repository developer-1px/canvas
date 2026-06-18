import { describe, expect, it } from 'vitest'

import {
  cloneCanvasSelectionItems,
  deleteCanvasSelectionItems,
  getCanvasGroupedItemSelection,
  getCanvasFullySelectedItemGroupIds,
  getCanvasGroupExpandedSelectionIds,
  getCanvasGroupedItemPointerSelection,
  getCanvasItemGroupIndexRange,
  getCanvasItemGroupMemberIds,
  getCanvasItemGroupMemberIdsForGroup,
  getCanvasSelectableItemIds,
  getCanvasSingleItemSelection,
  getCanvasSelectedItemGroupIds,
  getCanvasSelectedItemIds,
  getCanvasSelectedItems,
  groupCanvasSelectionItems,
  mapCanvasSelectionItems,
  removeCanvasSelectionIds,
  ungroupCanvasSelectionItems,
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

  it('returns selected selectable items in item order', () => {
    expect(getCanvasSelectedItems({
      getItemId,
      isItemSelectable: isEditable,
      items,
      selection: ['d', 'missing', 'b', 'a', 'd'],
    })).toMatchObject([
      { id: 'a' },
      { id: 'd' },
    ])
  })

  it('deletes selected editable items while preserving selected locked items', () => {
    expect(deleteCanvasSelectionItems({
      getItemId,
      isItemSelectable: isEditable,
      items: [...items],
      selection: ['a', 'b', 'd'],
    }).map(getItemId)).toEqual(['b', 'c'])
  })

  it('removes ids from selection while preserving remaining order', () => {
    expect(removeCanvasSelectionIds({
      ids: ['b', 'missing'],
      selection: ['a', 'b', 'd'],
    })).toEqual(['a', 'd'])

    expect(removeCanvasSelectionIds({
      ids: new Set(['a', 'd']),
      selection: ['a', 'b', 'd'],
    })).toEqual(['b'])
  })

  it('selects or toggles a single item id', () => {
    expect(getCanvasSingleItemSelection({
      additive: false,
      itemId: 'd',
      selection: ['a', 'b'],
    })).toEqual(['d'])

    expect(getCanvasSingleItemSelection({
      additive: true,
      itemId: 'd',
      selection: ['a', 'b'],
    })).toEqual(['a', 'b', 'd'])

    expect(getCanvasSingleItemSelection({
      additive: true,
      itemId: 'b',
      selection: ['a', 'b', 'd', 'b'],
    })).toEqual(['a', 'd'])
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

  it('groups selected selectable items and returns grouped ids in item order', () => {
    const result = groupCanvasSelectionItems({
      getItemId,
      groupId: 'group-new',
      groupItem: ({ groupId, item }) => ({ ...item, groupId }),
      isItemSelectable: isEditable,
      items: [...items],
      selection: ['d', 'b', 'a'],
    })

    expect(result.items).toEqual([
      { groupId: 'group-new', id: 'a', name: 'Alpha' },
      { id: 'b', locked: true, name: 'Beta' },
      { hidden: true, id: 'c', name: 'Gamma' },
      { groupId: 'group-new', id: 'd', name: 'Delta' },
    ])
    expect(result.selection).toEqual(['a', 'd'])
  })

  it('keeps source items and selection when fewer than two items can be grouped', () => {
    const sourceItems = [...items]
    const selection = ['a', 'b']
    const result = groupCanvasSelectionItems({
      getItemId,
      groupId: 'group-new',
      groupItem: ({ groupId, item }) => ({ ...item, groupId }),
      isItemSelectable: isEditable,
      items: sourceItems,
      selection,
    })

    expect(result.items).toBe(sourceItems)
    expect(result.selection).toEqual(selection)
  })

  it('returns selected group ids once in item order', () => {
    const sourceItems: TestItem[] = [
      { groupId: 'group-a', id: 'a', name: 'Alpha' },
      { groupId: 'group-a', id: 'b', name: 'Beta' },
      { groupId: 'group-b', id: 'c', name: 'Gamma' },
      { id: 'd', name: 'Delta' },
    ]

    expect(getCanvasSelectedItemGroupIds({
      getItemGroupId: (item) => item.groupId,
      getItemId,
      items: sourceItems,
      selection: ['c', 'b', 'a', 'd'],
    })).toEqual(['group-a', 'group-b'])
  })

  it('returns fully selected group ids in item order', () => {
    const sourceItems: TestItem[] = [
      { groupId: 'group-b', id: 'b1', name: 'Beta 1' },
      { groupId: 'group-a', id: 'a1', name: 'Alpha 1' },
      { groupId: 'group-b', hidden: true, id: 'b2', name: 'Beta 2' },
      { groupId: 'group-a', id: 'a2', name: 'Alpha 2' },
      { groupId: 'group-c', id: 'c1', name: 'Gamma 1' },
      { groupId: 'group-c', id: 'c2', name: 'Gamma 2' },
      { id: 'd', name: 'Delta' },
    ]

    expect(getCanvasFullySelectedItemGroupIds({
      getItemGroupId: (item) => item.groupId,
      getItemId,
      isItemSelectable: isVisible,
      items: sourceItems,
      selection: ['a2', 'b1', 'c1', 'a1', 'd'],
    })).toEqual(['group-b', 'group-a'])
  })

  it('returns group member ids for a target item in item order', () => {
    const sourceItems: TestItem[] = [
      { groupId: 'group-a', id: 'a', name: 'Alpha' },
      { groupId: 'group-a', hidden: true, id: 'b', name: 'Beta' },
      { groupId: 'group-b', id: 'c', name: 'Gamma' },
      { groupId: 'group-a', id: 'd', name: 'Delta' },
    ]

    expect(getCanvasItemGroupMemberIds({
      getItemGroupId: (item) => item.groupId,
      getItemId,
      isItemSelectable: isVisible,
      itemId: 'a',
      items: sourceItems,
    })).toEqual(['a', 'd'])
  })

  it('returns group member ids for an explicit group id in item order', () => {
    const sourceItems: TestItem[] = [
      { groupId: 'group-a', id: 'a', name: 'Alpha' },
      { groupId: 'group-a', hidden: true, id: 'b', name: 'Beta' },
      { groupId: 'group-b', id: 'c', name: 'Gamma' },
      { groupId: 'group-a', id: 'd', name: 'Delta' },
    ]

    expect(getCanvasItemGroupMemberIdsForGroup({
      getItemGroupId: (item) => item.groupId,
      getItemId,
      groupId: 'group-a',
      isItemSelectable: isVisible,
      items: sourceItems,
    })).toEqual(['a', 'd'])
  })

  it('expands group row selection ids to selectable item ids and dedupes in order', () => {
    const sourceItems: TestItem[] = [
      { groupId: 'group-a', id: 'a', name: 'Alpha' },
      { groupId: 'group-b', id: 'b', name: 'Beta' },
      { groupId: 'group-a', hidden: true, id: 'c', name: 'Gamma' },
      { groupId: 'group-a', id: 'd', name: 'Delta' },
      { id: 'loose', name: 'Loose' },
    ]

    expect(getCanvasGroupExpandedSelectionIds({
      getItemGroupId: (item) => item.groupId,
      getItemId,
      getSelectionGroupId: (id) =>
        id.startsWith('group-row:') ? id.slice('group-row:'.length) : null,
      isItemSelectable: isVisible,
      items: sourceItems,
      selection: [
        'group-row:group-a',
        'loose',
        'missing',
        'group-row:missing',
        'a',
      ],
    })).toEqual(['a', 'd', 'loose'])
  })

  it('returns the first and last selectable index for an explicit group id', () => {
    const sourceItems: TestItem[] = [
      { groupId: 'group-a', id: 'a', name: 'Alpha' },
      { groupId: 'group-b', id: 'b', name: 'Beta' },
      { groupId: 'group-a', hidden: true, id: 'c', name: 'Gamma' },
      { groupId: 'group-a', id: 'd', name: 'Delta' },
    ]

    expect(getCanvasItemGroupIndexRange({
      getItemGroupId: (item) => item.groupId,
      groupId: 'group-a',
      isItemSelectable: isVisible,
      items: sourceItems,
    })).toEqual({ firstIndex: 0, lastIndex: 3 })

    expect(getCanvasItemGroupIndexRange({
      getItemGroupId: (item) => item.groupId,
      groupId: 'group-missing',
      items: sourceItems,
    })).toBeNull()
  })

  it('selects explicit group members on non-additive selection', () => {
    const sourceItems: TestItem[] = [
      { groupId: 'group-a', id: 'a', name: 'Alpha' },
      { groupId: 'group-a', id: 'b', name: 'Beta' },
      { groupId: 'group-b', id: 'c', name: 'Gamma' },
      { groupId: 'group-a', id: 'd', name: 'Delta' },
    ]

    expect(getCanvasGroupedItemSelection({
      additive: false,
      fallbackSelection: ['fallback'],
      getItemGroupId: (item) => item.groupId,
      getItemId,
      groupId: 'group-a',
      items: sourceItems,
      selection: ['c'],
    })).toEqual(['a', 'b', 'd'])
  })

  it('toggles explicit group members on additive selection', () => {
    const sourceItems: TestItem[] = [
      { groupId: 'group-a', id: 'a', name: 'Alpha' },
      { groupId: 'group-a', id: 'b', name: 'Beta' },
      { id: 'c', name: 'Gamma' },
      { groupId: 'group-a', id: 'd', name: 'Delta' },
    ]

    expect(getCanvasGroupedItemSelection({
      additive: true,
      fallbackSelection: ['fallback'],
      getItemGroupId: (item) => item.groupId,
      getItemId,
      groupId: 'group-a',
      items: sourceItems,
      selection: ['d', 'c', 'a', 'b'],
    })).toEqual(['c'])

    expect(getCanvasGroupedItemSelection({
      additive: true,
      fallbackSelection: ['fallback'],
      getItemGroupId: (item) => item.groupId,
      getItemId,
      groupId: 'group-a',
      items: sourceItems,
      selection: ['c', 'd'],
    })).toEqual(['c', 'd', 'a', 'b'])
  })

  it('returns fallback selection when grouped pointer target has no group', () => {
    expect(getCanvasGroupedItemPointerSelection({
      additive: false,
      fallbackSelection: ['fallback'],
      getItemGroupId: (item) => item.groupId,
      getItemId,
      itemId: 'a',
      items,
      selection: ['d'],
    })).toEqual(['fallback'])
  })

  it('selects grouped pointer members on non-additive pointer input', () => {
    const sourceItems: TestItem[] = [
      { groupId: 'group-a', id: 'a', name: 'Alpha' },
      { groupId: 'group-a', id: 'b', name: 'Beta' },
      { groupId: 'group-b', id: 'c', name: 'Gamma' },
      { groupId: 'group-a', id: 'd', name: 'Delta' },
    ]

    expect(getCanvasGroupedItemPointerSelection({
      additive: false,
      fallbackSelection: ['fallback'],
      getItemGroupId: (item) => item.groupId,
      getItemId,
      itemId: 'd',
      items: sourceItems,
      selection: ['c'],
    })).toEqual(['a', 'b', 'd'])
  })

  it('removes grouped pointer members when every member is already selected', () => {
    const sourceItems: TestItem[] = [
      { groupId: 'group-a', id: 'a', name: 'Alpha' },
      { groupId: 'group-a', id: 'b', name: 'Beta' },
      { id: 'c', name: 'Gamma' },
      { groupId: 'group-a', id: 'd', name: 'Delta' },
    ]

    expect(getCanvasGroupedItemPointerSelection({
      additive: true,
      fallbackSelection: ['fallback'],
      getItemGroupId: (item) => item.groupId,
      getItemId,
      itemId: 'a',
      items: sourceItems,
      selection: ['d', 'c', 'a', 'b'],
    })).toEqual(['c'])
  })

  it('adds missing grouped pointer members after the current selection', () => {
    const sourceItems: TestItem[] = [
      { groupId: 'group-a', id: 'a', name: 'Alpha' },
      { groupId: 'group-a', id: 'b', name: 'Beta' },
      { id: 'c', name: 'Gamma' },
      { groupId: 'group-a', id: 'd', name: 'Delta' },
    ]

    expect(getCanvasGroupedItemPointerSelection({
      additive: true,
      fallbackSelection: ['fallback'],
      getItemGroupId: (item) => item.groupId,
      getItemId,
      itemId: 'b',
      items: sourceItems,
      selection: ['c', 'd'],
    })).toEqual(['c', 'd', 'a', 'b'])
  })

  it('ungroups every member of selected groups', () => {
    const sourceItems: TestItem[] = [
      { groupId: 'group-a', id: 'a', name: 'Alpha' },
      { groupId: 'group-a', id: 'b', locked: true, name: 'Beta' },
      { groupId: 'group-b', id: 'c', name: 'Gamma' },
      { id: 'd', name: 'Delta' },
    ]

    const result = ungroupCanvasSelectionItems({
      getItemGroupId: (item) => item.groupId,
      getItemId,
      isItemSelectable: isEditable,
      items: sourceItems,
      selection: ['a', 'c'],
      ungroupItem: ({ item }) => {
        const next = { ...item }

        delete next.groupId

        return next
      },
    })

    expect(result.items).toEqual([
      { id: 'a', name: 'Alpha' },
      { id: 'b', locked: true, name: 'Beta' },
      { id: 'c', name: 'Gamma' },
      { id: 'd', name: 'Delta' },
    ])
    expect(result.selection).toEqual(['a', 'b', 'c'])
  })

  it('returns the source items and empty selection when no selected group exists', () => {
    const result = ungroupCanvasSelectionItems({
      getItemGroupId: (item) => item.groupId,
      getItemId,
      items: [...items],
      selection: ['a', 'd'],
      ungroupItem: ({ item }) => item,
    })

    expect(result.items).toEqual(items)
    expect(result.selection).toEqual([])
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
