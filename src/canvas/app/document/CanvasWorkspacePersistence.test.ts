import { describe, expect, test } from 'vitest'
import { MAX_SCALE } from '../../engine/primitives/CanvasPrimitives'
import { INITIAL_ITEMS } from '../../host'
import type { CanvasItem } from '../../host/model'
import {
  CANVAS_WORKSPACE_STORAGE_KEY,
  createCanvasWorkspaceSnapshot,
  getCanvasItemIdSeed,
  parseCanvasWorkspaceSnapshot,
  readStoredCanvasWorkspace,
  writeStoredCanvasWorkspace,
} from './CanvasWorkspacePersistence'

class MemoryStorage {
  private readonly values = new Map<string, string>()

  getItem(key: string) {
    return this.values.get(key) ?? null
  }

  setItem(key: string, value: string) {
    this.values.set(key, value)
  }
}

describe('CanvasWorkspacePersistence', () => {
  test('parses saved items, viewport, and valid selection ids', () => {
    const item = INITIAL_ITEMS[0]
    const snapshot = parseCanvasWorkspaceSnapshot(
      JSON.stringify({
        items: [item],
        selection: [item.id, 'missing'],
        version: 1,
        viewport: { scale: 99, x: 12, y: 24 },
      }),
    )

    expect(snapshot).toEqual({
      items: [item],
      selection: [item.id],
      version: 1,
      viewport: { scale: MAX_SCALE, x: 12, y: 24 },
    })
  })

  test('ignores invalid stored values', () => {
    expect(parseCanvasWorkspaceSnapshot('{')).toBeNull()
    expect(
      parseCanvasWorkspaceSnapshot(
        JSON.stringify({
          items: [],
          selection: [],
          version: 2,
          viewport: { scale: 1, x: 0, y: 0 },
        }),
      ),
    ).toBeNull()
  })

  test('writes and reads the workspace snapshot', () => {
    const storage = new MemoryStorage()
    const item = INITIAL_ITEMS[0]

    writeStoredCanvasWorkspace(
      {
        items: [item],
        selection: [item.id],
        viewport: { scale: 1.25, x: -40, y: 80 },
      },
      storage,
    )

    expect(storage.getItem(CANVAS_WORKSPACE_STORAGE_KEY)).not.toBeNull()
    expect(readStoredCanvasWorkspace(storage)).toEqual({
      items: [item],
      selection: [item.id],
      version: 1,
      viewport: { scale: 1.25, x: -40, y: 80 },
    })
  })

  test('derives the next id seed from nested numeric suffixes', () => {
    const group: CanvasItem = {
      children: [
        {
          fill: '#fff',
          h: 24,
          id: 'rect-42',
          stroke: '#000',
          type: 'rect',
          w: 24,
          x: 0,
          y: 0,
        },
      ],
      h: 24,
      id: 'group-41',
      type: 'group',
      w: 24,
      x: 0,
      y: 0,
    }

    expect(getCanvasItemIdSeed([...INITIAL_ITEMS, group])).toBe(42)
    expect(getCanvasItemIdSeed(INITIAL_ITEMS)).toBe(INITIAL_ITEMS.length)
  })

  test('creates a snapshot with only existing selection ids', () => {
    const item = INITIAL_ITEMS[0]

    expect(
      createCanvasWorkspaceSnapshot({
        items: [item],
        selection: [item.id, 'missing'],
        viewport: { scale: 1, x: 0, y: 0 },
      }),
    ).toEqual({
      items: [item],
      selection: [item.id],
      version: 1,
      viewport: { scale: 1, x: 0, y: 0 },
    })
  })
})
