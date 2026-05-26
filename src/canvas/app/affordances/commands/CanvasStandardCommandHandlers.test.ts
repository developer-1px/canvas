import {
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import { getCanvasStandardCommandHandlers } from './CanvasStandardCommandHandlers'

describe('CanvasStandardCommandHandlers', () => {
  it('maps toolbar and keyboard handlers to standard command descriptors', () => {
    const runStandardCommand = vi.fn()
    const handlers = getCanvasStandardCommandHandlers(runStandardCommand)

    handlers.alignSelection('alignLeft')
    handlers.deleteSelection()
    handlers.distributeSelection('distributeVertical')
    handlers.groupSelection()
    handlers.lockSelection()
    handlers.moveSelection(4, -2)
    handlers.redoHistory()
    handlers.reorderSelection('bringToFront')
    handlers.selectAll()
    handlers.undoHistory()
    handlers.ungroupSelection()
    handlers.unlockAll()

    expect(runStandardCommand.mock.calls.map(([command]) => command)).toEqual([
      { kind: 'align', mode: 'alignLeft' },
      { kind: 'delete' },
      { kind: 'distribute', mode: 'distributeVertical' },
      { kind: 'group' },
      { kind: 'lock' },
      { dx: 4, dy: -2, kind: 'nudge' },
      { kind: 'redo' },
      { kind: 'reorder', mode: 'bringToFront' },
      { kind: 'select-all' },
      { kind: 'undo' },
      { kind: 'ungroup' },
      { kind: 'unlock-all' },
    ])
  })
})
