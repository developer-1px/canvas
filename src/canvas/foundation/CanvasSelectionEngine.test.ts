import { describe, expect, test } from 'vitest'
import { createCanvasSceneAdapter } from './CanvasSceneAdapter'
import {
  CANVAS_MARQUEE_SELECTION_MODEL,
  getCanvasItemPointerSelection,
  getCanvasMarqueeSelection,
} from './CanvasSelectionEngine'

const scene = createCanvasSceneAdapter([
  {
    id: 'group',
    bounds: { x: 0, y: 0, w: 120, h: 80 },
    isGroup: true,
    parentId: null,
    path: [0],
  },
  {
    id: 'child',
    bounds: { x: 10, y: 10, w: 40, h: 30 },
    isGroup: false,
    parentId: 'group',
    path: [0, 0],
  },
  {
    id: 'sibling',
    bounds: { x: 160, y: 0, w: 40, h: 30 },
    isGroup: false,
    parentId: null,
    path: [1],
  },
])

describe('CanvasSelectionEngine pointer policy', () => {
  test('exposes a stable marquee selection model metadata value', () => {
    expect(CANVAS_MARQUEE_SELECTION_MODEL).toBe('canvas-marquee-selection')
  })

  test('selects the parent group when clicking an unselected child', () => {
    expect(
      getCanvasItemPointerSelection({
        additive: false,
        itemId: 'child',
        scene,
        selection: [],
      }).nextSelection,
    ).toEqual(['group'])
  })

  test('keeps the selected group when clicking inside it', () => {
    expect(
      getCanvasItemPointerSelection({
        additive: false,
        itemId: 'child',
        scene,
        selection: ['group'],
      }).nextSelection,
    ).toEqual(['group'])
  })

  test('shift-clicking a child inside a selected group selects the child', () => {
    expect(
      getCanvasItemPointerSelection({
        additive: true,
        itemId: 'child',
        scene,
        selection: ['group'],
      }).nextSelection,
    ).toEqual(['child'])
  })

  test('shift-clicking a selected child removes it from selection', () => {
    expect(
      getCanvasItemPointerSelection({
        additive: true,
        itemId: 'child',
        scene,
        selection: ['child', 'sibling'],
      }).nextSelection,
    ).toEqual(['sibling'])
  })

  test('shift-clicking a parent group replaces selected children with the group', () => {
    expect(
      getCanvasItemPointerSelection({
        additive: true,
        itemId: 'group',
        scene,
        selection: ['child', 'sibling'],
      }).nextSelection,
    ).toEqual(['sibling', 'group'])
  })

  test('marquee selects a group through child hits', () => {
    expect(
      getCanvasMarqueeSelection({
        additive: false,
        baseSelection: [],
        bounds: { x: 5, y: 5, w: 12, h: 12 },
        scene,
      }),
    ).toEqual(['group'])
  })

  test('additive marquee prunes selected children when the parent group is hit', () => {
    expect(
      getCanvasMarqueeSelection({
        additive: true,
        baseSelection: ['child', 'sibling'],
        bounds: { x: 5, y: 5, w: 12, h: 12 },
        scene,
      }),
    ).toEqual(['sibling', 'group'])
  })
})
