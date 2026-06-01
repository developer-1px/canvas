import { describe, expect, test } from 'vitest'
import type { CanvasItem } from '../model'
import { createCanvasItemScene } from '../adapters/CanvasItemSceneAdapter'
import {
  lockCanvasSelection,
  unlockAllCanvasItems,
} from './CanvasItemLockOperations'

function rect(id: string): CanvasItem {
  return {
    id,
    type: 'rect',
    x: 0,
    y: 0,
    w: 40,
    h: 40,
    fill: '#fff',
    stroke: '#000',
  }
}

describe('CanvasItemLockOperations', () => {
  test('locks selected items and clears them from selection', () => {
    const result = lockCanvasSelection([rect('a'), rect('b')], ['a', 'b'])

    expect(result.items.map((item) => item.locked)).toEqual([true, true])
    expect(result.selection).toEqual([])
  })

  test('unlocks items recursively', () => {
    const result = unlockAllCanvasItems([
      { ...rect('a'), locked: true },
      {
        ...rect('group'),
        type: 'group',
        locked: true,
        children: [{ ...rect('child'), locked: true }],
      },
    ])

    expect(JSON.stringify(result)).not.toContain('locked')
  })

  test('excludes locked items from scene hit entries', () => {
    const scene = createCanvasItemScene([
      { ...rect('a'), locked: true },
      rect('b'),
    ])

    expect(scene.entries.map((entry) => entry.id)).toEqual(['b'])
  })

  test('excludes hidden items from scene hit entries', () => {
    const scene = createCanvasItemScene([
      { ...rect('a'), hidden: true },
      {
        ...rect('group'),
        type: 'group',
        children: [
          rect('child'),
        ],
        hidden: true,
      },
      rect('b'),
    ])

    expect(scene.entries.map((entry) => entry.id)).toEqual(['b'])
  })
})
