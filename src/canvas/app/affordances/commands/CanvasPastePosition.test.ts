import { describe, expect, test } from 'vitest'
import type { CanvasItem } from '../../../entities'
import {
  CANVAS_PASTE_POSITION_MODEL,
  createCanvasPastePositionKey,
  getCanvasPasteOffset,
  getCanvasPasteOffsetForBounds,
  getCanvasPastePositionSession,
} from './CanvasPastePosition'

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
  test('exports the paste position model contract', () => {
    expect(CANVAS_PASTE_POSITION_MODEL).toBe('canvas-paste-position')
  })

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

  test('centers first paste from clipboard bounds without CanvasItem shape', () => {
    expect(
      getCanvasPasteOffsetForBounds({
        clipboardBounds: { h: 20, w: 40, x: 10, y: 20 },
        pasteIndex: 0,
        viewportCenter: { x: 100, y: 100 },
      }),
    ).toEqual({ x: 70, y: 70 })
  })

  test('uses insert offset when bounds are missing', () => {
    expect(
      getCanvasPasteOffsetForBounds({
        clipboardBounds: null,
        pasteIndex: 0,
        viewportCenter: { x: 100, y: 100 },
      }),
    ).toEqual({ x: 28, y: 28 })
  })

  test('continues paste index for the same paste position key', () => {
    const key = createCanvasPastePositionKey({
      segments: [
        'copy',
        'slide:1',
        'slide:2',
        ['a,b', 'c'],
        ['object:1', ''],
      ],
    })

    expect(key).toBe('["copy","slide:1","slide:2",["a,b","c"],["object:1",""]]')
    expect(
      getCanvasPastePositionSession({
        key,
        memory: { key, pasteIndex: 2 },
      }),
    ).toEqual({
      key,
      nextMemory: { key, pasteIndex: 3 },
      pasteIndex: 2,
    })
  })

  test('keeps paste position key segments collision-resistant', () => {
    expect(createCanvasPastePositionKey({
      segments: ['copy:a', 'slide-1'],
    })).not.toBe(createCanvasPastePositionKey({
      segments: ['copy', 'a:slide-1'],
    }))
    expect(createCanvasPastePositionKey({
      segments: ['copy', ['a,b', 'c']],
    })).not.toBe(createCanvasPastePositionKey({
      segments: ['copy', ['a', 'b,c']],
    }))
  })

  test('starts paste index at zero for a new paste position key', () => {
    expect(
      getCanvasPastePositionSession({
        key: 'copy:b:slide-2',
        memory: { key: 'copy:a:slide-1', pasteIndex: 2 },
      }),
    ).toEqual({
      key: 'copy:b:slide-2',
      nextMemory: { key: 'copy:b:slide-2', pasteIndex: 1 },
      pasteIndex: 0,
    })
  })

  test('starts paste index at zero when paste memory is missing', () => {
    expect(
      getCanvasPastePositionSession({
        key: 'copy:a:slide-1',
        memory: null,
      }),
    ).toEqual({
      key: 'copy:a:slide-1',
      nextMemory: { key: 'copy:a:slide-1', pasteIndex: 1 },
      pasteIndex: 0,
    })
  })
})
