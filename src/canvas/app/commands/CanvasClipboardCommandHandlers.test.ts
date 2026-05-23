import {
  type Mock,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import { getCanvasClipboardCommandHandlers } from './CanvasClipboardCommandHandlers'
import type { RunCanvasClipboardCommand } from './CanvasClipboardCommandHandlers'

describe('CanvasClipboardCommandHandlers', () => {
  it('maps clone and duplicate handlers to clipboard command descriptors', () => {
    const runClipboardCommand: Mock<RunCanvasClipboardCommand> = vi.fn(() => [])
    const handlers = getCanvasClipboardCommandHandlers({
      getPasteIndex: vi.fn(() => 3),
      runClipboardCommand,
      selection: ['selected-1'],
    })

    handlers.cloneItems(['item-1'], { x: 4, y: 5 })
    handlers.duplicateSelection(undefined, { x: 8, y: 8 })
    handlers.duplicateSelection(['item-2'])

    expect(runClipboardCommand.mock.calls.map(([command]) => command)).toEqual([
      { ids: ['item-1'], kind: 'clone', offset: { x: 4, y: 5 } },
      {
        kind: 'duplicate',
        offset: { x: 8, y: 8 },
        sourceIds: ['selected-1'],
      },
      {
        kind: 'duplicate',
        offset: undefined,
        sourceIds: ['item-2'],
      },
    ])
  })

  it('maps copy paste and cut handlers with the current paste index', () => {
    let pasteIndex = 2
    const runClipboardCommand: Mock<RunCanvasClipboardCommand> = vi.fn(() => [])
    const handlers = getCanvasClipboardCommandHandlers({
      getPasteIndex: () => pasteIndex,
      runClipboardCommand,
      selection: ['selected-1'],
    })

    handlers.copySelection()
    pasteIndex = 4
    handlers.pasteSelection()
    pasteIndex = 6
    handlers.cutSelection()

    expect(runClipboardCommand.mock.calls.map(([command]) => command)).toEqual([
      { kind: 'copy', pasteIndex: 2 },
      { kind: 'paste', pasteIndex: 4 },
      { kind: 'cut', pasteIndex: 6 },
    ])
  })
})
