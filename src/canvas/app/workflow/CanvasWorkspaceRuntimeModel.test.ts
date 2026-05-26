import {
  describe,
  expect,
  it,
} from 'vitest'
import { INITIAL_VIEWPORT } from '../../core'
import type { CanvasItem } from '../../entities'
import type { CanvasWorkspaceSnapshot } from '../workspace/document/CanvasWorkspaceSnapshot'
import {
  createCanvasWorkspaceIdGenerator,
  getCanvasWorkspaceInitialState,
  getCanvasWorkspaceRuntimeModel,
} from './CanvasWorkspaceRuntimeModel'

describe('CanvasWorkspaceRuntimeModel', () => {
  it('uses stored workspace state before demo defaults', () => {
    const initialItems = [createRectItem('rect-1')]
    const storedItems = [createRectItem('rect-5')]
    const storedWorkspace: CanvasWorkspaceSnapshot = {
      items: storedItems,
      selection: ['rect-5'],
      version: 1,
      viewport: { scale: 2, x: 10, y: 20 },
    }

    expect(getCanvasWorkspaceInitialState({
      initialItems,
      initialSelection: ['rect-1'],
      storedWorkspace,
    })).toEqual({
      items: storedItems,
      selection: ['rect-5'],
      viewport: { scale: 2, x: 10, y: 20 },
    })
  })

  it('falls back to supplied items, supplied selection, and initial viewport', () => {
    const initialItems = [createRectItem('rect-1')]
    const initialSelection = ['rect-1']
    const initialState = getCanvasWorkspaceInitialState({
      initialItems,
      initialSelection,
      storedWorkspace: null,
    })

    expect(initialState).toEqual({
      items: initialItems,
      selection: ['rect-1'],
      viewport: INITIAL_VIEWPORT,
    })
    expect(initialState.selection).not.toBe(initialSelection)
  })

  it('sanitizes supplied initial selection against supplied items', () => {
    const initialItems = [createRectItem('rect-1')]

    expect(getCanvasWorkspaceInitialState({
      initialItems,
      initialSelection: ['missing', 'rect-1'],
      storedWorkspace: null,
    }).selection).toEqual(['rect-1'])
  })

  it('creates ids from the max current item id seed', () => {
    const createId = createCanvasWorkspaceIdGenerator([
      createRectItem('rect-2'),
      createRectItem('rect-7'),
    ])

    expect(createId('rect')).toBe('rect-8')
    expect(createId('text')).toBe('text-9')
  })

  it('derives selected set, read model, scene, and selected bounds together', () => {
    const items = [
      createRectItem('rect-1', { h: 40, w: 80, x: 10, y: 20 }),
      createRectItem('rect-2', { h: 30, w: 60, x: 120, y: 80 }),
    ]
    const runtime = getCanvasWorkspaceRuntimeModel({
      items,
      selection: ['rect-1'],
    })

    expect(runtime.selected).toEqual(new Set(['rect-1']))
    expect(runtime.itemReadModel.findItem('rect-1')).toBe(items[0])
    expect(runtime.scene.getBounds(['rect-1'])).toEqual({
      h: 40,
      w: 80,
      x: 10,
      y: 20,
    })
    expect(runtime.selectedBounds).toEqual({
      h: 40,
      w: 80,
      x: 10,
      y: 20,
    })
  })
})

function createRectItem(
  id: string,
  bounds: Pick<CanvasItem, 'h' | 'w' | 'x' | 'y'> = {
    h: 40,
    w: 80,
    x: 10,
    y: 20,
  },
): CanvasItem {
  return {
    fill: '#ffffff',
    id,
    stroke: '#111111',
    type: 'rect',
    ...bounds,
  }
}
