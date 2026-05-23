import { describe, expect, test } from 'vitest'
import type { CanvasItem } from '../model'
import {
  createCanvasDocumentPatchTreeDiff,
  getCanvasDocumentPatchEntries,
  getCanvasDocumentPatchRemovalEntries,
} from './CanvasDocumentPatchTreeDiff'

describe('CanvasDocumentPatchTreeDiff', () => {
  test('keeps changed descendant entries behind the topmost changed parent', () => {
    const beforeItems = [groupItem('group', [rectItem('child')])]
    const afterItems = [
      groupItem('group', [{
        ...rectItem('child'),
        x: 24,
      }]),
    ]
    const diff = createCanvasDocumentPatchTreeDiff({
      afterItems,
      beforeItems,
    })

    expect(diff.changedTopmostEntries.map((entry) => entry.item.id)).toEqual([
      'group',
    ])
  })

  test('returns topmost removal entries in descending path order', () => {
    const items = [
      groupItem('group', [
        rectItem('child-a'),
        groupItem('nested', [rectItem('child-b')]),
      ]),
      rectItem('sibling'),
    ]
    const entries = getCanvasDocumentPatchEntries(items)
      .filter((entry) =>
        ['group', 'child-a', 'nested', 'child-b', 'sibling']
          .includes(entry.item.id),
      )

    expect(
      getCanvasDocumentPatchRemovalEntries(entries)
        .map((entry) => entry.item.id),
    ).toEqual(['sibling', 'group'])
  })
})

function rectItem(id: string): CanvasItem {
  return {
    fill: '#ffffff',
    h: 40,
    id,
    stroke: '#111111',
    type: 'rect',
    w: 40,
    x: 0,
    y: 0,
  }
}

function groupItem(id: string, children: CanvasItem[]): CanvasItem {
  return {
    children,
    h: 40,
    id,
    type: 'group',
    w: 40,
    x: 0,
    y: 0,
  }
}
