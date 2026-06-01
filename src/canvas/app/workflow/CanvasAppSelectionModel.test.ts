import { describe, expect, it, vi } from 'vitest'
import type { CanvasItem } from '../../entities'
import type { CanvasAppItemReadModel } from './CanvasAppItemReadModelContracts'
import { getCanvasAppSelectionModel } from './CanvasAppSelectionModel'

describe('CanvasAppSelectionModel', () => {
  it('starts text editing for one editable selected item', () => {
    const setEditing = vi.fn()
    const model = createSelectionModel({
      selection: ['text-1'],
      setEditing,
    })

    expect(model.onEditText()).toBe(true)
    expect(setEditing).toHaveBeenCalledWith({
      id: 'text-1',
      value: 'Label',
    })
  })

  it('replaces selected items against the full canvas item tree', () => {
    const commitItemsChange = vi.fn(() => true)
    const model = createSelectionModel({
      commitItemsChange,
      selection: ['rect-1'],
    })

    expect(model.onReplaceSelectedItems((item) =>
      item.id === 'rect-1' && item.type === 'shape'
        ? {
            ...item,
            fill: '#C2E5FF',
          }
        : item,
    )).toBe(true)
    expect(commitItemsChange).toHaveBeenCalledWith({
      type: 'replace-changed',
      items: [
        {
          ...createShapeItem(),
          fill: '#C2E5FF',
        },
        createTextItem(),
      ],
    }, {
      after: ['rect-1'],
      before: ['rect-1'],
    })
  })

  it('creates a section frame around the selected items', () => {
    const commitItemsChange = vi.fn(() => true)
    const model = createSelectionModel({
      commitItemsChange,
      createId: vi.fn(() => 'section-1'),
      selection: ['rect-1', 'text-1'],
    })

    expect(model.onSectionSelectedItems()).toBe(true)
    expect(commitItemsChange).toHaveBeenCalledWith({
      type: 'transform',
      beforeItems: [
        createShapeItem(),
        createTextItem(),
      ],
      afterItems: [
        expect.objectContaining({
          component: 'section',
          id: 'section-1',
          title: 'Section',
          type: 'component',
        }),
        createShapeItem(),
        createTextItem(),
      ],
    }, {
      after: ['section-1'],
      before: ['rect-1', 'text-1'],
    })
  })

  it('flips the selected items and commits the mirrored tree', () => {
    const commitItemsChange = vi.fn(() => true)
    const model = createSelectionModel({
      commitItemsChange,
      selection: ['rect-1', 'text-1'],
    })

    expect(model.canFlip).toBe(true)
    expect(model.onFlipSelectedItems('horizontal')).toBe(true)
    expect(commitItemsChange).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'replace-changed' }),
      { after: ['rect-1', 'text-1'], before: ['rect-1', 'text-1'] },
    )
  })

  it('widens the selection to same-type items through commitSelection', () => {
    const commitSelection = vi.fn(() => true)
    const model = createSelectionModel({
      commitSelection,
      items: [
        createShapeItem(),
        createShapeItem({ id: 'rect-2' }),
        createTextItem(),
      ],
      selection: ['rect-1'],
    })

    expect(model.canSelectSame).toBe(true)
    expect(model.onSelectSameType()).toBe(true)
    expect(commitSelection).toHaveBeenCalledWith(['rect-1', 'rect-2'])
  })

  it('adds a selected independent stamp near the selected object', () => {
    const commitItemsChange = vi.fn(() => true)
    const model = createSelectionModel({
      commitItemsChange,
      createId: vi.fn(() => 'stamp-1'),
      selection: ['rect-1'],
    })

    expect(model.canStamp).toBe(true)
    expect(model.onInsertStampNearSelection({
      label: '+1',
      stamp: 'thumbs-up',
    })).toBe(true)
    expect(commitItemsChange).toHaveBeenCalledWith({
      type: 'add',
      items: [{
        h: 44,
        id: 'stamp-1',
        label: '+1',
        stamp: 'thumbs-up',
        type: 'stamp',
        w: 44,
        x: 58,
        y: -22,
      }],
    }, {
      after: ['stamp-1'],
      before: ['rect-1'],
    })
  })

  it('keeps stamp insertion off selected stamp items', () => {
    const commitItemsChange = vi.fn(() => true)
    const model = createSelectionModel({
      commitItemsChange,
      items: [createStampItem()],
      selection: ['stamp-1'],
    })

    expect(model.canStamp).toBe(false)
    expect(model.onInsertStampNearSelection({
      label: '+1',
      stamp: 'thumbs-up',
    })).toBe(false)
    expect(commitItemsChange).not.toHaveBeenCalled()
  })

  it('counts active voting stamps after successful insertion', () => {
    const commitItemsChange = vi.fn(() => true)
    const onVoteCast = vi.fn(() => true)
    const model = createSelectionModel({
      commitItemsChange,
      createId: vi.fn(() => 'stamp-1'),
      selection: ['rect-1'],
      votingSession: {
        active: true,
        canCastVote: true,
        votesCast: 0,
        votesPerParticipant: 1,
        onVoteCast,
      },
    })

    expect(model.canStamp).toBe(true)
    expect(model.onInsertStampNearSelection({
      label: '+1',
      stamp: 'thumbs-up',
    })).toBe(true)
    expect(commitItemsChange).toHaveBeenCalledTimes(1)
    expect(onVoteCast).toHaveBeenCalledTimes(1)
  })

  it('blocks active voting stamps after the quota is spent', () => {
    const commitItemsChange = vi.fn(() => true)
    const onVoteCast = vi.fn(() => true)
    const model = createSelectionModel({
      commitItemsChange,
      selection: ['rect-1'],
      votingSession: {
        active: true,
        canCastVote: false,
        votesCast: 1,
        votesPerParticipant: 1,
        onVoteCast,
      },
    })

    expect(model.canStamp).toBe(false)
    expect(model.onInsertStampNearSelection({
      label: '+1',
      stamp: 'thumbs-up',
    })).toBe(false)
    expect(commitItemsChange).not.toHaveBeenCalled()
    expect(onVoteCast).not.toHaveBeenCalled()
  })

  it('removes selected sections and selects their contained items', () => {
    const commitItemsChange = vi.fn(() => true)
    const section = createSectionItem()
    const model = createSelectionModel({
      commitItemsChange,
      items: [section, createShapeItem(), createTextItem()],
      selection: ['section-1'],
    })

    expect(model.onUnsectionSelectedItems()).toBe(true)
    expect(commitItemsChange).toHaveBeenCalledWith({
      type: 'remove-selection',
      selection: ['section-1'],
    }, {
      after: ['rect-1', 'text-1'],
      before: ['section-1'],
    })
  })

  it('hides and shows selected section contents without hiding the section frame', () => {
    const commitItemsChange = vi.fn(() => true)
    const section = createSectionItem()
    const model = createSelectionModel({
      commitItemsChange,
      items: [section, createShapeItem(), createTextItem()],
      selection: ['section-1'],
    })

    expect(model.sectionContentsHidden).toBe(false)
    expect(model.onSetSelectedSectionsHidden(true)).toBe(true)
    expect(commitItemsChange).toHaveBeenCalledWith({
      type: 'replace-changed',
      items: [
        section,
        {
          ...createShapeItem(),
          hidden: true,
        },
        {
          ...createTextItem(),
          hidden: true,
        },
      ],
    }, {
      after: ['section-1'],
      before: ['section-1'],
    })

    const hiddenModel = createSelectionModel({
      items: [
        section,
        {
          ...createShapeItem(),
          hidden: true,
        },
        {
          ...createTextItem(),
          hidden: true,
        },
      ],
      selection: ['section-1'],
    })

    expect(hiddenModel.sectionContentsHidden).toBe(true)
  })

  it('locks selected sections and their current contents', () => {
    const commitItemsChange = vi.fn(() => true)
    const section = createSectionItem()
    const model = createSelectionModel({
      commitItemsChange,
      items: [section, createShapeItem(), createTextItem()],
      selection: ['section-1'],
    })

    expect(model.selectedSectionsLocked).toBe(false)
    expect(model.onSetSelectedSectionsLocked(true)).toBe(true)
    expect(commitItemsChange).toHaveBeenCalledWith({
      type: 'replace-changed',
      items: [
        {
          ...section,
          locked: true,
        },
        {
          ...createShapeItem(),
          locked: true,
        },
        {
          ...createTextItem(),
          locked: true,
        },
      ],
    }, {
      after: ['section-1'],
      before: ['section-1'],
    })

    const lockedModel = createSelectionModel({
      items: [
        {
          ...section,
          locked: true,
        },
        {
          ...createShapeItem(),
          locked: true,
        },
        {
          ...createTextItem(),
          locked: true,
        },
      ],
      selection: ['section-1'],
    })

    expect(lockedModel.selectedSectionsLocked).toBe(true)
  })

  it('tidies three selected layout items', () => {
    const commitItemsChange = vi.fn(() => true)
    const model = createSelectionModel({
      commitItemsChange,
      items: [
        createShapeItem({ id: 'rect-1', x: 120, y: 40 }),
        createShapeItem({ id: 'rect-2', x: 10, y: 20 }),
        createTextItem({ id: 'text-1', x: 90, y: 120 }),
      ],
      selection: ['rect-1', 'rect-2', 'text-1'],
    })

    expect(model.canTidy).toBe(true)
    expect(model.onTidySelectedItems()).toBe(true)
    expect(commitItemsChange).toHaveBeenCalledWith({
      type: 'replace-changed',
      items: [
        createShapeItem({ id: 'rect-1', x: 154, y: 20 }),
        createShapeItem({ id: 'rect-2', x: 10, y: 20 }),
        createTextItem({ id: 'text-1', x: 10, y: 84 }),
      ],
    }, {
      after: ['rect-1', 'rect-2', 'text-1'],
      before: ['rect-1', 'rect-2', 'text-1'],
    })
  })

  it('reports possible layer order changes for the current selection', () => {
    const firstModel = createSelectionModel({
      items: [
        createShapeItem({ id: 'rect-1' }),
        createTextItem({ id: 'text-1' }),
      ],
      selection: ['rect-1'],
    })
    const lastModel = createSelectionModel({
      items: [
        createShapeItem({ id: 'rect-1' }),
        createTextItem({ id: 'text-1' }),
      ],
      selection: ['text-1'],
    })

    expect(firstModel.canReorder).toEqual({
      bringForward: true,
      bringToFront: true,
      sendBackward: false,
      sendToBack: false,
    })
    expect(lastModel.canReorder).toEqual({
      bringForward: false,
      bringToFront: false,
      sendBackward: true,
      sendToBack: true,
    })
  })
})

function createSelectionModel({
  commitItemsChange = vi.fn(() => true),
  commitSelection = vi.fn(() => true),
  createId = vi.fn((prefix: string) => `${prefix}-1`),
  items = [createShapeItem(), createTextItem()],
  selection = ['rect-1'],
  setEditing = vi.fn(),
  votingSession,
}: {
  commitItemsChange?: ReturnType<typeof vi.fn>
  commitSelection?: ReturnType<typeof vi.fn>
  createId?: (prefix: string) => string
  items?: CanvasItem[]
  selection?: string[]
  setEditing?: ReturnType<typeof vi.fn>
  votingSession?: Parameters<typeof getCanvasAppSelectionModel>[0]['votingSession']
} = {}) {
  return getCanvasAppSelectionModel({
    anchor: { placement: 'above', x: 10, y: 20 },
    bounds: { h: 40, w: 80, x: 0, y: 0 },
    commitItemsChange,
    commitSelection,
    createId,
    disabled: false,
    itemReadModel: createItemReadModel(items),
    items,
    label: 'Shape',
    selection,
    setEditing,
    votingSession,
  })
}

function createItemReadModel(items: CanvasItem[]): CanvasAppItemReadModel {
  return {
    findEditableTextItem: (id) => {
      const item = items.find((candidate) => candidate.id === id)

      return item?.type === 'text' ? item : null
    },
    findItem: (id) => items.find((item) => item.id === id),
    getAllIds: () => items.map((item) => item.id),
    getAllItems: () => items,
    getItemBounds: (item) => item,
    getSelectedItems: (ids) =>
      ids
        .map((id) => items.find((item) => item.id === id))
        .filter((item): item is CanvasItem => item !== undefined),
    getSelection: (ids) => ids,
    getSelectionBounds: () => ({ h: 40, w: 80, x: 10, y: 20 }),
  }
}

function createShapeItem(
  overrides: Partial<Extract<CanvasItem, { type: 'shape' }>> = {},
): Extract<CanvasItem, { type: 'shape' }> {
  return {
    fill: '#FFFFFF',
    h: 40,
    id: 'rect-1',
    shapeType: 'rect',
    stroke: '#111111',
    text: 'Rect',
    type: 'shape',
    w: 80,
    x: 10,
    y: 20,
    ...overrides,
  }
}

function createTextItem(
  overrides: Partial<Extract<CanvasItem, { type: 'text' }>> = {},
): Extract<CanvasItem, { type: 'text' }> {
  return {
    h: 40,
    id: 'text-1',
    text: 'Label',
    type: 'text',
    w: 120,
    x: 140,
    y: 20,
    ...overrides,
  }
}

function createSectionItem(): Extract<CanvasItem, { type: 'component' }> {
  return {
    accent: '#64748b',
    body: '',
    component: 'section',
    fill: 'rgba(241, 245, 249, 0.18)',
    h: 120,
    id: 'section-1',
    stroke: '#94a3b8',
    title: 'Section',
    type: 'component',
    w: 300,
    x: 0,
    y: 0,
  }
}

function createStampItem(
  overrides: Partial<Extract<CanvasItem, { type: 'stamp' }>> = {},
): Extract<CanvasItem, { type: 'stamp' }> {
  return {
    h: 44,
    id: 'stamp-1',
    label: '+1',
    stamp: 'thumbs-up',
    type: 'stamp',
    w: 44,
    x: 68,
    y: -2,
    ...overrides,
  }
}
