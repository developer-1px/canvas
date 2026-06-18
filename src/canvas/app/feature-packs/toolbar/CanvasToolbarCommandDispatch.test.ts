import { describe, expect, it, vi } from 'vitest'
import {
  runCanvasToolbarCommandAction,
} from './CanvasToolbarCommandDispatch'
import type { CanvasToolbarCommandHandlers } from './CanvasToolbarCommandContracts'

describe('CanvasToolbarCommandDispatch', () => {
  it('routes payload command actions to the matching handler', () => {
    const handlers = createHandlers()

    runCanvasToolbarCommandAction({
      action: { kind: 'align', mode: 'alignLeft' },
      handlers,
    })
    runCanvasToolbarCommandAction({
      action: { kind: 'distribute', mode: 'distributeHorizontal' },
      handlers,
    })
    runCanvasToolbarCommandAction({
      action: { kind: 'reorder', mode: 'bringToFront' },
      handlers,
    })

    expect(handlers.onAlign).toHaveBeenCalledWith('alignLeft')
    expect(handlers.onDistribute).toHaveBeenCalledWith(
      'distributeHorizontal',
    )
    expect(handlers.onReorder).toHaveBeenCalledWith('bringToFront')
  })

  it('routes simple command actions to the matching handler', () => {
    const handlers = createHandlers()

    for (const action of [
      { kind: 'delete' },
      { kind: 'duplicate' },
      { kind: 'group' },
      { kind: 'lock' },
      { kind: 'redo' },
      { kind: 'undo' },
      { kind: 'ungroup' },
      { kind: 'unlock-all' },
    ] as const) {
      runCanvasToolbarCommandAction({ action, handlers })
    }

    expect(handlers.onDelete).toHaveBeenCalledTimes(1)
    expect(handlers.onDuplicate).toHaveBeenCalledTimes(1)
    expect(handlers.onGroup).toHaveBeenCalledTimes(1)
    expect(handlers.onLock).toHaveBeenCalledTimes(1)
    expect(handlers.onRedo).toHaveBeenCalledTimes(1)
    expect(handlers.onUndo).toHaveBeenCalledTimes(1)
    expect(handlers.onUngroup).toHaveBeenCalledTimes(1)
    expect(handlers.onUnlockAll).toHaveBeenCalledTimes(1)
  })
})

function createHandlers(): CanvasToolbarCommandHandlers {
  return {
    onAlign: vi.fn(),
    onDelete: vi.fn(),
    onDistribute: vi.fn(),
    onDuplicate: vi.fn(),
    onGroup: vi.fn(),
    onLock: vi.fn(),
    onRedo: vi.fn(),
    onReorder: vi.fn(),
    onUndo: vi.fn(),
    onUngroup: vi.fn(),
    onUnlockAll: vi.fn(),
  }
}
