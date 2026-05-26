import { describe, expect, it, vi } from 'vitest'
import type { CanvasItem, EditingText } from '../../../../entities'
import type {
  CommitCanvasItemsChange,
  CommitCanvasSelection,
} from '../../../workflow/CanvasWorkflowContract'
import {
  cancelCanvasPointerTransformInteraction,
  commitCanvasPointerTransformInteraction,
  type CanvasPointerTransformInteraction,
} from './CanvasPointerTransformInteraction'

describe('CanvasPointerTransformInteraction', () => {
  it('commits move interactions with the original selection history', () => {
    const beforeItem = createRectItem('rect-1')
    const afterItem = createRectItem('rect-1', { x: 40, y: 30 })
    const commitItemsChange = vi.fn<CommitCanvasItemsChange>(() => true)

    commitCanvasPointerTransformInteraction({
      commitItemsChange,
      commitSelection: () => true,
      interaction: createMoveInteraction({
        currentItems: [afterItem],
        historyItems: [beforeItem],
        historySelection: ['previous-selection'],
      }),
      setEditing: () => undefined,
      setTool: () => undefined,
    })

    expect(commitItemsChange).toHaveBeenCalledWith(
      {
        afterItems: [afterItem],
        beforeItems: [beforeItem],
        type: 'transform',
      },
      { after: ['rect-1'], before: ['previous-selection'] },
    )
  })

  it('commits resize interactions with selected ids as history selection', () => {
    const beforeItem = createRectItem('rect-1')
    const afterItem = createRectItem('rect-1', { h: 90, w: 100 })
    const commitItemsChange = vi.fn<CommitCanvasItemsChange>(() => true)

    commitCanvasPointerTransformInteraction({
      commitItemsChange,
      commitSelection: () => true,
      interaction: createResizeInteraction({
        currentItems: [afterItem],
        historyItems: [beforeItem],
      }),
      setEditing: () => undefined,
      setTool: () => undefined,
    })

    expect(commitItemsChange).toHaveBeenCalledWith(
      {
        afterItems: [afterItem],
        beforeItems: [beforeItem],
        type: 'transform',
      },
      { after: ['rect-1'], before: ['rect-1'] },
    )
  })

  it('commits arrow endpoint edits with the arrow id as selection history', () => {
    const beforeItem = createRectItem('arrow-1')
    const afterItem = createRectItem('arrow-1', { x: 40 })
    const commitItemsChange = vi.fn<CommitCanvasItemsChange>(() => true)

    commitCanvasPointerTransformInteraction({
      commitItemsChange,
      commitSelection: () => true,
      interaction: createArrowEndpointInteraction({
        currentItems: [afterItem],
        historyItems: [beforeItem],
      }),
      setEditing: () => undefined,
      setTool: () => undefined,
    })

    expect(commitItemsChange).toHaveBeenCalledWith(
      {
        afterItems: [afterItem],
        beforeItems: [beforeItem],
        type: 'transform',
      },
      { after: ['arrow-1'], before: ['arrow-1'] },
    )
  })


  it('enters text editing after a non-moved move click', () => {
    const commitSelection = vi.fn<CommitCanvasSelection>(() => true)
    const edit: EditingText = { id: 'rect-1', value: 'Title' }
    const setEditing = vi.fn()
    const setTool = vi.fn()

    commitCanvasPointerTransformInteraction({
      commitItemsChange: () => true,
      commitSelection,
      interaction: createMoveInteraction({
        edit,
        moved: false,
      }),
      setEditing,
      setTool,
    })

    expect(commitSelection).toHaveBeenCalledWith(['rect-1'])
    expect(setEditing).toHaveBeenCalledWith(edit)
    expect(setTool).toHaveBeenCalledWith('select')
  })

  it('restores history items on cancel', () => {
    const historyItem = createRectItem('rect-1')
    const setLiveItems = vi.fn()

    cancelCanvasPointerTransformInteraction({
      interaction: createResizeInteraction({
        historyItems: [historyItem],
      }),
      setLiveItems,
    })

    expect(setLiveItems).toHaveBeenCalledWith([historyItem])
  })
})

function createMoveInteraction(
  overrides: Partial<Extract<CanvasPointerTransformInteraction, { kind: 'move' }>> = {},
): Extract<CanvasPointerTransformInteraction, { kind: 'move' }> {
  const item = createRectItem('rect-1')

  return {
    bounds: { h: 60, w: 80, x: 0, y: 0 },
    currentItems: [item],
    historyItems: [item],
    historySelection: ['rect-1'],
    ids: ['rect-1'],
    kind: 'move',
    moved: true,
    pointerId: 1,
    startItems: [item],
    startScreen: { x: 0, y: 0 },
    startWorld: { x: 0, y: 0 },
    ...overrides,
  }
}

function createResizeInteraction(
  overrides: Partial<Extract<CanvasPointerTransformInteraction, { kind: 'resize' }>> = {},
): Extract<CanvasPointerTransformInteraction, { kind: 'resize' }> {
  const item = createRectItem('rect-1')

  return {
    bounds: { h: 60, w: 80, x: 0, y: 0 },
    currentItems: [item],
    handle: 'se',
    historyItems: [item],
    ids: ['rect-1'],
    kind: 'resize',
    moved: true,
    pointerId: 1,
    startItems: [item],
    startScreen: { x: 0, y: 0 },
    startWorld: { x: 80, y: 60 },
    ...overrides,
  }
}

function createArrowEndpointInteraction(
  overrides: Partial<
    Extract<CanvasPointerTransformInteraction, { kind: 'arrow-endpoint' }>
  > = {},
): Extract<CanvasPointerTransformInteraction, { kind: 'arrow-endpoint' }> {
  const item = createRectItem('arrow-1')

  return {
    arrowId: 'arrow-1',
    currentItems: [item],
    currentWorld: { x: 0, y: 0 },
    endpoint: 'end',
    historyItems: [item],
    kind: 'arrow-endpoint',
    moved: true,
    pointerId: 1,
    startItems: [item],
    startScreen: { x: 0, y: 0 },
    startWorld: { x: 0, y: 0 },
    ...overrides,
  }
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
