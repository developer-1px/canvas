import {
  type Mock,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import {
  cloneCanvasClipboardItems,
  copyCanvasClipboardSelection,
  cutCanvasClipboardSelection,
  duplicateCanvasClipboardSelection,
  pasteCanvasClipboardSelection,
} from './CanvasClipboardCommandHandlers'
import type { RunCanvasClipboardCommand } from './CanvasClipboardCommandHandlers'

describe('CanvasClipboardCommandHandlers', () => {
  it('maps clone and duplicate handlers to clipboard command descriptors', () => {
    const runClipboardCommand: Mock<RunCanvasClipboardCommand> = vi.fn(() => [])

    cloneCanvasClipboardItems({
      ids: ['item-1'],
      offset: { x: 4, y: 5 },
      runClipboardCommand,
    })
    duplicateCanvasClipboardSelection({
      offset: { x: 8, y: 8 },
      runClipboardCommand,
      selection: ['selected-1'],
    })
    duplicateCanvasClipboardSelection({
      runClipboardCommand,
      selection: ['selected-1'],
      sourceIds: ['item-2'],
    })

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

  it('maps copy paste and cut handlers with the supplied paste index', () => {
    const runClipboardCommand: Mock<RunCanvasClipboardCommand> = vi.fn(() => [])

    copyCanvasClipboardSelection({
      pasteIndex: 2,
      runClipboardCommand,
    })
    pasteCanvasClipboardSelection({
      pasteIndex: 4,
      runClipboardCommand,
    })
    cutCanvasClipboardSelection({
      pasteIndex: 6,
      runClipboardCommand,
    })

    expect(runClipboardCommand.mock.calls.map(([command]) => command)).toEqual([
      { kind: 'copy', pasteIndex: 2 },
      { kind: 'paste', pasteIndex: 4 },
      { kind: 'cut', pasteIndex: 6 },
    ])
  })
})
