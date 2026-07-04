// @vitest-environment node
/// <reference types="node" />

import {
  readFileSync,
  readdirSync,
} from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import {
  assertCanvasAffordanceConfig,
  createCanvasAffordanceConfig,
  createCanvasSceneAdapter,
  getCanvasCommandAvailability,
  getCanvasCommandSelectionState,
  getCanvasMarqueeSelection,
  getCanvasPointerGesture,
  getCanvasWheelViewport,
  moveCanvasSelection,
  resizeCanvasSelection,
} from '../engine'

const HEADLESS_LAYER_DIRS = [
  'src/canvas/entities',
  'src/canvas/core',
  'src/canvas/foundation',
  'src/canvas/engine',
] as const

const REACT_IMPORT_PATTERN =
  /from\s+['"]react(?:-dom)?(?:\/|['"])/

describe('Canvas engine headless contract', () => {
  it('keeps entities, core, foundation, and engine free of React imports', () => {
    const violations = HEADLESS_LAYER_DIRS.flatMap((directory) =>
      listTypeScriptFiles(directory).flatMap((file) =>
        REACT_IMPORT_PATTERN.test(file.source) ? [file.path] : [],
      ),
    )

    expect(violations).toEqual([])
  })

  it('runs affordance grammar through the engine facade in node', () => {
    const config = createCanvasAffordanceConfig({})

    expect(() => assertCanvasAffordanceConfig(config)).not.toThrow()

    const scene = createCanvasSceneAdapter([
      {
        bounds: { h: 80, w: 120, x: 0, y: 0 },
        id: 'group',
        isGroup: true,
        parentId: null,
        path: [0],
      },
      {
        bounds: { h: 30, w: 40, x: 10, y: 10 },
        id: 'child',
        isGroup: false,
        parentId: 'group',
        path: [0, 0],
      },
      {
        bounds: { h: 30, w: 40, x: 160, y: 0 },
        id: 'sibling',
        isGroup: false,
        parentId: null,
        path: [1],
      },
    ])

    expect(scene.getBounds(['child'])).toEqual({ h: 30, w: 40, x: 10, y: 10 })
    expect(getCanvasMarqueeSelection({
      additive: false,
      baseSelection: [],
      bounds: { h: 12, w: 12, x: 5, y: 5 },
      scene,
    })).toEqual(['group'])

    const transformAdapter = {
      resizeSelection: ({ items, selection, to }: {
        items: Array<{ h: number; id: string; w: number; x: number; y: number }>
        selection: string[]
        to: { h: number; w: number; x: number; y: number }
      }) =>
        items.map((item) =>
          selection.includes(item.id) ? { ...item, ...to } : item,
        ),
      translateSelection: ({ dx, dy, items, selection }: {
        dx: number
        dy: number
        items: Array<{ h: number; id: string; w: number; x: number; y: number }>
        selection: string[]
      }) =>
        items.map((item) =>
          selection.includes(item.id)
            ? { ...item, x: item.x + dx, y: item.y + dy }
            : item,
        ),
    }

    expect(moveCanvasSelection({
      adapter: transformAdapter,
      dx: 5,
      dy: -3,
      items: [{ h: 10, id: 'selected', w: 20, x: 1, y: 2 }],
      selection: ['selected'],
    })).toEqual([{ h: 10, id: 'selected', w: 20, x: 6, y: -1 }])
    expect(resizeCanvasSelection({
      adapter: transformAdapter,
      bounds: { h: 20, w: 40, x: 10, y: 10 },
      handle: 'se',
      items: [{ h: 20, id: 'selected', w: 40, x: 10, y: 10 }],
      point: { x: 70, y: 50 },
      selection: ['selected'],
    })).toEqual([{ h: 40, id: 'selected', w: 60, x: 10, y: 10 }])

    expect(getCanvasCommandSelectionState({
      selection: ['a', 'b', 'c'],
    })).toEqual({
      canAlign: true,
      canDistribute: true,
      canGroup: true,
      hasSelection: true,
    })
    expect(getCanvasCommandAvailability({
      canRedo: false,
      canUndo: true,
      config,
      hasSelectedGroup: true,
      selection: ['a', 'b', 'c'],
    })).toMatchObject({
      distributeHorizontal: true,
      group: true,
      redo: false,
      undo: true,
      ungroup: true,
    })

    expect(getCanvasPointerGesture({
      config,
      input: {
        altKey: false,
        button: 0,
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
      },
      spaceDown: false,
      tool: 'select',
    })).toBe('marquee')
    expect(getCanvasWheelViewport({
      config,
      input: {
        ctrlKey: false,
        deltaMode: 0,
        deltaX: 10,
        deltaY: 20,
        metaKey: false,
        shiftKey: false,
      },
      point: { x: 100, y: 100 },
      viewport: { scale: 1, x: 0, y: 0 },
    })).toEqual({ scale: 1, x: -10, y: -20 })
  })
})

function listTypeScriptFiles(directory: string): Array<{
  path: string
  source: string
}> {
  return readdirSync(join(process.cwd(), directory), { withFileTypes: true })
    .flatMap((entry) => {
      const path = `${directory}/${entry.name}`

      if (entry.isDirectory()) {
        return listTypeScriptFiles(path)
      }

      if (!entry.isFile() || !/\.(ts|tsx)$/.test(entry.name)) {
        return []
      }

      return [{
        path,
        source: readFileSync(join(process.cwd(), path), 'utf8'),
      }]
    })
}
