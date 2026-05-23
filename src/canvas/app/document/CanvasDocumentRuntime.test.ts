import {
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import type { CanvasItem } from '../../entities'
import type {
  CanvasDocumentController,
  CanvasDocumentHistoryAvailability,
} from '../../host'
import {
  applyCanvasDocumentHistoryResult,
  commitCanvasDocumentItemsChange,
  commitCanvasDocumentSelection,
  readCanvasCommittedDocumentState,
  redoCanvasDocumentHistory,
  replaceCanvasDocumentLiveItems,
  replaceCanvasDocumentText,
  restoreCanvasDocumentSelection,
  undoCanvasDocumentHistory,
} from './CanvasDocumentRuntime'

describe('CanvasDocumentRuntime', () => {
  it('replaces live items through the Host document controller', () => {
    const currentItems = [createRectItem('rect-1')]
    const nextItems = [createRectItem('rect-2')]
    const document = createDocument({
      replaceItems: vi.fn(() => nextItems),
    })

    expect(replaceCanvasDocumentLiveItems({
      action: (items) => [...items, createRectItem('rect-2')],
      currentItems,
      document,
    })).toBe(nextItems)
    expect(document.replaceItems).toHaveBeenCalledWith(
      currentItems,
      [currentItems[0], nextItems[0]],
    )
  })

  it('returns committed document state only after item changes commit', () => {
    const currentItems = [createRectItem('rect-1')]
    const committedItems = [createRectItem('rect-2')]
    const selection = {
      before: ['rect-1'],
      after: ['rect-2'],
    }
    const document = createDocument({
      commitItemsChange: vi.fn(() => true),
      readHistoryAvailability: vi.fn(() => ({ canRedo: false, canUndo: true })),
      readItems: vi.fn(() => committedItems),
    })

    expect(commitCanvasDocumentItemsChange({
      change: { type: 'add', items: committedItems },
      currentItems,
      document,
      selection,
    })).toEqual({
      historyAvailability: { canRedo: false, canUndo: true },
      items: committedItems,
    })
    expect(document.commitItemsChange).toHaveBeenCalledWith(
      { type: 'add', items: committedItems },
      currentItems,
      selection,
    )

    const failedDocument = createDocument({
      commitItemsChange: vi.fn(() => false),
    })

    expect(commitCanvasDocumentItemsChange({
      change: { type: 'remove-selection', selection: ['rect-1'] },
      currentItems,
      document: failedDocument,
    })).toBeNull()
    expect(failedDocument.readItems).not.toHaveBeenCalled()
    expect(failedDocument.readHistoryAvailability).not.toHaveBeenCalled()
  })

  it('resolves selection actions against current document selection', () => {
    const currentItems = [createRectItem('rect-1')]
    const document = createDocument({
      readSelection: vi.fn(() => ['rect-1']),
    })

    restoreCanvasDocumentSelection({
      action: (current) => [...current, 'rect-2'],
      currentItems,
      document,
    })

    expect(document.restoreSelection).toHaveBeenCalledWith(
      ['rect-1', 'rect-2'],
      currentItems,
    )
  })

  it('returns history availability only when selection commits', () => {
    const historyAvailability = { canRedo: true, canUndo: true }
    const document = createDocument({
      commitSelection: vi.fn(() => true),
      readHistoryAvailability: vi.fn(() => historyAvailability),
      readSelection: vi.fn(() => ['rect-1']),
    })

    expect(commitCanvasDocumentSelection({
      action: ['rect-2'],
      document,
    })).toBe(historyAvailability)
    expect(document.commitSelection).toHaveBeenCalledWith(['rect-2'])

    const failedDocument = createDocument({
      commitSelection: vi.fn(() => false),
    })

    expect(commitCanvasDocumentSelection({
      action: ['rect-2'],
      document: failedDocument,
    })).toBeNull()
    expect(failedDocument.readHistoryAvailability).not.toHaveBeenCalled()
  })

  it('uses current selection for replace text and returns committed state', () => {
    const committedItems = [createRectItem('rect-2')]
    const document = createDocument({
      readItems: vi.fn(() => committedItems),
      readSelection: vi.fn(() => ['rect-1']),
      replaceText: vi.fn(() => true),
    })

    expect(replaceCanvasDocumentText({
      document,
      options: { caseSensitive: true },
      replacement: 'world',
      searchText: 'hello',
    })).toEqual({
      historyAvailability: { canRedo: false, canUndo: false },
      items: committedItems,
    })
    expect(document.replaceText).toHaveBeenCalledWith(
      'hello',
      'world',
      ['rect-1'],
      { caseSensitive: true },
    )
  })

  it('normalizes history results into committed state', () => {
    const result = {
      items: [createRectItem('rect-2')],
      selection: ['rect-2'],
    }
    const document = createDocument({
      readHistoryAvailability: vi.fn(() => ({ canRedo: true, canUndo: false })),
    })

    expect(applyCanvasDocumentHistoryResult(result, document)).toEqual({
      historyAvailability: { canRedo: true, canUndo: false },
      items: result.items,
      selection: ['rect-2'],
    })
    expect(applyCanvasDocumentHistoryResult(null, document)).toBeNull()
  })

  it('runs undo and redo through normalized history results', () => {
    const currentItems = [createRectItem('rect-1')]
    const undoResult = {
      items: [createRectItem('rect-2')],
      selection: ['rect-2'],
    }
    const redoResult = {
      items: [createRectItem('rect-3')],
      selection: ['rect-3'],
    }
    const document = createDocument({
      redo: vi.fn(() => redoResult),
      undo: vi.fn(() => undoResult),
    })

    expect(undoCanvasDocumentHistory({
      currentItems,
      document,
    })?.selection).toEqual(['rect-2'])
    expect(redoCanvasDocumentHistory({
      currentItems,
      document,
    })?.selection).toEqual(['rect-3'])
    expect(document.undo).toHaveBeenCalledWith(currentItems)
    expect(document.redo).toHaveBeenCalledWith(currentItems)
  })

  it('reads committed state as items plus history availability', () => {
    const items = [createRectItem('rect-1')]
    const historyAvailability = { canRedo: false, canUndo: true }
    const document = createDocument({
      readHistoryAvailability: vi.fn(() => historyAvailability),
      readItems: vi.fn(() => items),
    })

    expect(readCanvasCommittedDocumentState(document)).toEqual({
      historyAvailability,
      items,
    })
  })
})

function createDocument(
  overrides: Partial<CanvasDocumentController> = {},
): CanvasDocumentController {
  return {
    commitItemsChange: vi.fn(() => true),
    commitSelection: vi.fn(() => true),
    copySelectionToClipboard: vi.fn(() => true),
    findText: vi.fn(() => []),
    readClipboardItems: vi.fn(() => []),
    readHistoryAvailability: vi.fn<() => CanvasDocumentHistoryAvailability>(
      () => ({ canRedo: false, canUndo: false }),
    ),
    readItems: vi.fn(() => []),
    readSelection: vi.fn(() => []),
    redo: vi.fn(() => null),
    replaceItems: vi.fn((currentItems) => currentItems),
    replaceText: vi.fn(() => true),
    restoreSelection: vi.fn(),
    subscribeSelection: vi.fn(),
    undo: vi.fn(() => null),
    writeClipboardItems: vi.fn(() => true),
    ...overrides,
  }
}

function createRectItem(id: string): CanvasItem {
  return {
    fill: '#ffffff',
    h: 40,
    id,
    stroke: '#111111',
    type: 'rect',
    w: 80,
    x: 10,
    y: 20,
  }
}
