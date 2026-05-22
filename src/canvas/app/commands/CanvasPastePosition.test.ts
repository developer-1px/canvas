import { describe, expect, test } from 'vitest'
import type { CanvasItem } from '../../host/model/CanvasModel'
import { getCanvasPasteOffset } from './CanvasPastePosition'

const item: CanvasItem = {
  id: 'a',
  type: 'rect',
  x: 10,
  y: 20,
  w: 40,
  h: 20,
  fill: '#fff',
  stroke: '#000',
}

describe('getCanvasPasteOffset', () => {
  test('centers first paste in the viewport', () => {
    expect(
      getCanvasPasteOffset({
        clipboard: [item],
        pasteIndex: 0,
        viewportCenter: { x: 100, y: 100 },
      }),
    ).toEqual({ x: 70, y: 70 })
  })

  test('offsets repeated paste from the last pasted items', () => {
    expect(
      getCanvasPasteOffset({
        clipboard: [item],
        pasteIndex: 1,
        viewportCenter: { x: 100, y: 100 },
      }),
    ).toEqual({ x: 28, y: 28 })
  })
})
