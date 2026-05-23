import { describe, expect, it } from 'vitest'
import type { CanvasItem } from '../model'
import {
  isCanvasGroupItem,
  isCanvasGroupItemStorageShape,
} from './CanvasGroupItem'

const rectItem: CanvasItem = {
  fill: '#ffffff',
  h: 60,
  id: 'rect-1',
  stroke: '#111827',
  type: 'rect',
  w: 80,
  x: 0,
  y: 0,
}

const groupItem: CanvasItem = {
  children: [rectItem],
  h: 60,
  id: 'group-1',
  type: 'group',
  w: 80,
  x: 0,
  y: 0,
}

describe('CanvasGroupItem', () => {
  it('recognizes group items', () => {
    expect(isCanvasGroupItem(groupItem)).toBe(true)
    expect(isCanvasGroupItem(rectItem)).toBe(false)
  })

  it('owns the recursive group storage shape', () => {
    expect(isCanvasGroupItemStorageShape(groupItem, isTestCanvasItem))
      .toBe(true)
    expect(isCanvasGroupItemStorageShape({
      ...groupItem,
      children: [{ ...rectItem, id: 1 }],
    }, isTestCanvasItem)).toBe(false)
    expect(isCanvasGroupItemStorageShape({
      ...groupItem,
      children: undefined,
    }, isTestCanvasItem)).toBe(false)
  })
})

function isTestCanvasItem(value: unknown): value is CanvasItem {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    typeof value.id === 'string'
  )
}
