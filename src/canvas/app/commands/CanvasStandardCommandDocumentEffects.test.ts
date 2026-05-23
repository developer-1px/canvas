import { describe, expect, it, vi } from 'vitest'
import type { EditingText } from '../../entities'
import {
  applyCanvasStandardHistoryEffect,
  applyCanvasStandardItemsChangeEffect,
  applyCanvasStandardSelectionEffect,
  createCanvasStandardGroupSelectionEffect,
  createCanvasStandardRemoveSelectionEffect,
  createCanvasStandardReplaceChangedEffect,
  type CanvasEditingUpdate,
  type CanvasStandardCommandDocumentEffectContext,
} from './CanvasStandardCommandDocumentEffects'

describe('CanvasStandardCommandDocumentEffects', () => {
  it('creates standard item change effect descriptors', () => {
    expect(
      createCanvasStandardReplaceChangedEffect({
        afterSelection: ['rect-1'],
        fallbackSelection: ['rect-1'],
        items: [],
      }),
    ).toEqual({
      afterSelection: ['rect-1'],
      change: { type: 'replace-changed', items: [] },
      fallbackSelection: ['rect-1'],
      kind: 'items-change',
    })
    expect(
      createCanvasStandardRemoveSelectionEffect({
        afterSelection: [],
        clearEditingIds: ['rect-1'],
        selection: ['rect-1'],
      }),
    ).toEqual({
      afterSelection: [],
      change: { type: 'remove-selection', selection: ['rect-1'] },
      clearEditingIds: ['rect-1'],
      fallbackSelection: [],
      kind: 'items-change',
    })
    expect(
      createCanvasStandardGroupSelectionEffect({
        afterSelection: ['group-1'],
        groupId: 'group-1',
        selection: ['rect-1'],
      }),
    ).toEqual({
      afterSelection: ['group-1'],
      change: {
        groupId: 'group-1',
        selection: ['rect-1'],
        type: 'group-selection',
      },
      fallbackSelection: ['group-1'],
      kind: 'items-change',
    })
  })

  it('commits item changes with selection history', () => {
    const context = createContext()

    const applied = applyCanvasStandardItemsChangeEffect({
      afterSelection: ['rect-2'],
      change: { type: 'replace-changed', items: [] },
      context,
    })

    expect(applied).toBe(true)
    expect(context.commitItemsChange).toHaveBeenCalledWith(
      { type: 'replace-changed', items: [] },
      {
        before: ['rect-1'],
        after: ['rect-2'],
      },
    )
    expect(context.commitSelection).not.toHaveBeenCalled()
  })

  it('falls back to selection commit and clears matching editing', () => {
    let editing: EditingText | null = { id: 'rect-1', value: 'Label' }
    const context = createContext({
      commitItemsChange: vi.fn(() => false),
      setEditing: vi.fn((update: CanvasEditingUpdate) => {
        editing = typeof update === 'function' ? update(editing) : update
      }),
    })

    applyCanvasStandardItemsChangeEffect({
      afterSelection: [],
      change: { type: 'remove-selection', selection: ['rect-1'] },
      clearEditingIds: ['rect-1'],
      context,
      fallbackSelection: [],
    })

    expect(context.commitSelection).toHaveBeenCalledWith([])
    expect(editing).toBeNull()
  })

  it('restores history selection and clears editing', () => {
    const context = createContext({
      undo: vi.fn(() => ['rect-2']),
    })

    applyCanvasStandardHistoryEffect({
      context,
      direction: 'undo',
    })

    expect(context.undo).toHaveBeenCalledTimes(1)
    expect(context.setEditing).toHaveBeenCalledWith(null)
    expect(context.setSelection).toHaveBeenCalledWith(['rect-2'])
  })

  it('commits selection effects', () => {
    const context = createContext()

    applyCanvasStandardSelectionEffect({
      context,
      selection: ['rect-1', 'rect-2'],
    })

    expect(context.commitSelection).toHaveBeenCalledWith([
      'rect-1',
      'rect-2',
    ])
  })
})

function createContext(
  overrides: Partial<CanvasStandardCommandDocumentEffectContext> = {},
): CanvasStandardCommandDocumentEffectContext {
  return {
    commitItemsChange: vi.fn(() => true),
    commitSelection: vi.fn(() => true),
    redo: vi.fn(() => undefined),
    selection: ['rect-1'],
    setEditing: vi.fn(),
    setSelection: vi.fn(),
    undo: vi.fn(() => undefined),
    ...overrides,
  }
}
