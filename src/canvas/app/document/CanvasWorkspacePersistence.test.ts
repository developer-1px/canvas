import { describe, expect, test } from 'vitest'
import type { CanvasItem } from '../../entities'
import { INITIAL_ITEMS } from '../../host'
import {
  CANVAS_WORKSPACE_STORAGE_KEY,
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

  removeItem(key: string) {
    this.values.delete(key)
  }
}

describe('CanvasWorkspacePersistence', () => {
  test('removes invalid stored workspace snapshots after read', () => {
    const storage = new MemoryStorage()

    storage.setItem(CANVAS_WORKSPACE_STORAGE_KEY, '{')

    expect(readStoredCanvasWorkspace(storage)).toBeNull()
    expect(storage.getItem(CANVAS_WORKSPACE_STORAGE_KEY)).toBeNull()
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

  test('removes stored custom items that fail current validators', () => {
    const customItem: CanvasItem = {
      data: { severity: 'high' },
      h: 96,
      id: 'custom-risk-1',
      kind: 'risk',
      presentation: 'risk-node',
      title: 'Risk',
      type: 'custom',
      w: 180,
      x: 80,
      y: 120,
    }
    const storage = new MemoryStorage()

    storage.setItem(
      CANVAS_WORKSPACE_STORAGE_KEY,
      JSON.stringify({
        items: [customItem],
        selection: [customItem.id],
        version: 1,
        viewport: { scale: 1, x: 0, y: 0 },
      }),
    )

    expect(
      readStoredCanvasWorkspace(storage, {
        customItemValidators: {
          risk: (item) => item.data.severity === 'low',
        },
      }),
    ).toBeNull()
    expect(storage.getItem(CANVAS_WORKSPACE_STORAGE_KEY)).toBeNull()
  })

  test('removes stored drawing items that fail the built-in item contract', () => {
    const storage = new MemoryStorage()

    storage.setItem(
      CANVAS_WORKSPACE_STORAGE_KEY,
      JSON.stringify({
        items: [
          {
            h: 24,
            id: 'marker-1',
            opacity: 0,
            points: [
              { x: 10, y: 20 },
              { x: 30, y: 40 },
            ],
            stroke: '#475569',
            strokeWidth: 4,
            type: 'marker',
            w: 24,
            x: 8,
            y: 18,
          },
        ],
        selection: ['marker-1'],
        version: 1,
        viewport: { scale: 1, x: 0, y: 0 },
      }),
    )

    expect(readStoredCanvasWorkspace(storage)).toBeNull()
    expect(storage.getItem(CANVAS_WORKSPACE_STORAGE_KEY)).toBeNull()
  })
})
