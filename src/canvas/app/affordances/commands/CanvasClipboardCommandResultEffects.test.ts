import { describe, expect, it } from 'vitest'
import type { CanvasItem } from '../../../entities'
import {
  createCanvasClipboardCloneResultEffect,
  createCanvasClipboardCopySelectionEffect,
  createCanvasClipboardCutCopyOnlyResultEffect,
  createCanvasClipboardCutSelectionResultEffect,
  createCanvasClipboardDuplicateResultEffect,
  createCanvasClipboardPasteResultEffect,
} from './CanvasClipboardCommandResultEffects'

const rect1 = createRectItem('rect-1')
const rect2 = createRectItem('rect-2')

describe('CanvasClipboardCommandResultEffects', () => {
  it('maps copy selection to copy-selection effects', () => {
    expect(createCanvasClipboardCopySelectionEffect()).toEqual({
      kind: 'copy-selection',
    })
  })

  it('maps clone results to clone-result effects', () => {
    expect(createCanvasClipboardCloneResultEffect({
      clonedItems: [rect1],
    })).toEqual({
      clonedItems: [rect1],
      kind: 'clone-result',
    })
  })

  it('maps duplicate results to transform-items effects', () => {
    expect(createCanvasClipboardDuplicateResultEffect({
      beforeItems: [],
      result: {
        clones: [rect1, rect2],
        items: [rect1, rect2],
        selection: ['rect-1', 'rect-2'],
      },
    })).toEqual({
      afterItems: [rect1, rect2],
      afterSelection: ['rect-1', 'rect-2'],
      beforeItems: [],
      clonedItems: [rect1, rect2],
      kind: 'transform-items',
    })
  })

  it('maps paste results to add-items effects with next paste state', () => {
    expect(createCanvasClipboardPasteResultEffect({
      items: [rect1, rect2],
      pasteIndex: 2,
    })).toEqual({
      afterSelection: ['rect-1', 'rect-2'],
      items: [rect1, rect2],
      kind: 'add-items',
      nextPasteIndex: 3,
      updateClipboardItems: [rect1, rect2],
    })
  })

  it('maps cut deletion results to cut-selection effects', () => {
    expect(createCanvasClipboardCutSelectionResultEffect({
      copyBeforeDelete: true,
      deletion: {
        clearEditingIds: ['rect-1'],
        selection: ['rect-2'],
      },
    })).toEqual({
      clearEditingIds: ['rect-1'],
      copyBeforeDelete: true,
      deletionSelection: ['rect-2'],
      kind: 'cut-selection',
    })
  })

  it('maps cut copy-only results to cut-copy-only effects', () => {
    expect(createCanvasClipboardCutCopyOnlyResultEffect({
      copyBeforeDelete: false,
    })).toEqual({
      copyBeforeDelete: false,
      kind: 'cut-copy-only',
    })
  })
})

function createRectItem(id: string): Extract<CanvasItem, { type: 'rect' }> {
  return {
    fill: '#ffffff',
    h: 60,
    id,
    stroke: '#111827',
    type: 'rect',
    w: 80,
    x: 0,
    y: 0,
  }
}
