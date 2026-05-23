import { describe, expect, it } from 'vitest'
import type { CanvasItem } from '../model'
import { createCanvasItemsChangePatch } from './CanvasDocumentChangePatch'

describe('CanvasDocumentChangePatch', () => {
  it('maps remove-selection changes to item removal patches', () => {
    expect(
      createCanvasItemsChangePatch(createItems(), {
        selection: ['rect-2'],
        type: 'remove-selection',
      }),
    ).toEqual([{ op: 'remove', path: '/1' }])
  })

  it('maps set-text changes to text patches', () => {
    expect(
      createCanvasItemsChangePatch(createItems(), {
        id: 'rect-1',
        text: 'Updated',
        type: 'set-text',
      }),
    ).toEqual([
      {
        op: 'replace',
        path: '/0/text',
        value: 'Updated',
      },
    ])
  })

  it('maps transform changes to changed item replacements and root additions', () => {
    const beforeItems = createItems()
    const added = createRectItem('rect-3', { x: 240 })
    const afterItems = [
      { ...beforeItems[0], x: 24 },
      beforeItems[1],
      added,
    ]

    expect(
      createCanvasItemsChangePatch(beforeItems, {
        afterItems,
        beforeItems,
        type: 'transform',
      }),
    ).toEqual([
      {
        op: 'replace',
        path: '/0',
        value: afterItems[0],
      },
      {
        op: 'add',
        path: '/-',
        value: added,
      },
    ])
  })
})

function createItems(): CanvasItem[] {
  return [
    createRectItem('rect-1', { text: 'Start' }),
    createRectItem('rect-2', { x: 120 }),
  ]
}

function createRectItem(
  id: string,
  overrides: Partial<Extract<CanvasItem, { type: 'rect' }>> = {},
): Extract<CanvasItem, { type: 'rect' }> {
  return {
    fill: '#ffffff',
    h: 60,
    id,
    stroke: '#111827',
    type: 'rect',
    w: 80,
    x: 0,
    y: 0,
    ...overrides,
  }
}
