import { describe, expect, it, vi } from 'vitest'
import type {
  Bounds,
  CanvasItem,
} from '../../../../entities'
import { getCanvasObjectInspectorModel } from './CanvasObjectInspectorModel'

describe('CanvasObjectInspectorModel', () => {
  it('derives labels and disabled state from the current selection', () => {
    expect(createModel({ selectedItems: [], selection: [] }).label).toBeNull()
    expect(createModel({
      selectedItems: [createRectItem()],
      selection: ['rect-1'],
    }).label).toBe('Shape')
    expect(createModel({
      selectedItems: [createComponentItem()],
      selection: ['component-1'],
    }).label).toBe('Card')
    expect(createModel({
      selectedItems: [createCustomItem()],
      selection: ['risk-1'],
    }).label).toBe('Risk')

    const multiSelection = createModel({
      selectedItems: [
        createRectItem(),
        { ...createComponentItem(), locked: true },
      ],
      selection: ['rect-1', 'component-1'],
    })

    expect(multiSelection.label).toBe('2 selected')
    expect(multiSelection.disabled).toBe(true)
  })

  it('builds external inspector panel context from the object inspector model', () => {
    const model = createModel({
      bounds: { x: 1, y: 2, w: 30, h: 40 },
      inspectorPanels: [
        {
          id: 'meta',
          render: ({ bounds, customFocus, disabled, label, selection }) =>
            `${label}:${disabled}:${selection.join(',')}:${bounds?.w}:${
              customFocus?.targetId ?? 'none'
            }`,
        },
      ],
      customFocus: {
        itemId: 'component-1',
        ownerId: 'component',
        targetId: 'field:title',
      },
      selectedItems: [createComponentItem()],
      selection: ['component-1'],
    })

    expect(model.customPanels).toEqual([
      {
        content: 'Card:false:component-1:30:field:title',
        id: 'meta',
      },
    ])
  })

  it('commits selection bounds changes through the document change contract', () => {
    const commitItemsChange = vi.fn()
    const bounds = { x: 1, y: 2, w: 30, h: 40 }
    const nextBounds = { x: 4, y: 5, w: 60, h: 70 }
    const model = createModel({
      bounds,
      commitItemsChange,
      selectedItems: [createRectItem()],
      selection: ['rect-1'],
    })

    model.onChangeBounds(nextBounds)

    expect(commitItemsChange).toHaveBeenCalledWith(
      {
        type: 'resize-selection',
        from: bounds,
        selection: ['rect-1'],
        to: nextBounds,
      },
      {
        before: ['rect-1'],
        after: ['rect-1'],
      },
    )
  })

  it('builds selected object style controls through the inspector model', () => {
    const commitItemsChange = vi.fn()
    const model = createModel({
      commitItemsChange,
      selectedItems: [createRectItem()],
      selection: ['rect-1'],
    })

    expect(model.styleControls.map((control) => control.id)).toEqual([
      'fill',
      'stroke',
    ])

    model.styleControls
      .find((control) => control.id === 'fill')
      ?.onSelect('#C2E5FF')

    expect(commitItemsChange).toHaveBeenCalledWith(
      {
        type: 'replace-changed',
        items: [
          {
            ...createRectItem(),
            fill: '#C2E5FF',
          },
        ],
      },
      {
        before: ['rect-1'],
        after: ['rect-1'],
      },
    )
  })

  it('ignores bounds changes when there is no committed selection bounds', () => {
    const emptySelectionCommit = vi.fn()
    const missingBoundsCommit = vi.fn()

    createModel({
      bounds: { x: 1, y: 2, w: 30, h: 40 },
      commitItemsChange: emptySelectionCommit,
      selection: [],
    }).onChangeBounds({ x: 4, y: 5, w: 60, h: 70 })
    createModel({
      bounds: null,
      commitItemsChange: missingBoundsCommit,
      selectedItems: [createRectItem()],
      selection: ['rect-1'],
    }).onChangeBounds({ x: 4, y: 5, w: 60, h: 70 })

    expect(emptySelectionCommit).not.toHaveBeenCalled()
    expect(missingBoundsCommit).not.toHaveBeenCalled()
  })
})

function createModel({
  bounds = null,
  commitItemsChange = vi.fn(),
  customFocus = null,
  inspectorPanels = [],
  selectedItems = [],
  selection = [],
}: {
  bounds?: Bounds | null
  commitItemsChange?: Parameters<
    typeof getCanvasObjectInspectorModel
  >[0]['commitItemsChange']
  customFocus?: Parameters<
    typeof getCanvasObjectInspectorModel
  >[0]['customFocus']
  inspectorPanels?: Parameters<
    typeof getCanvasObjectInspectorModel
  >[0]['inspectorPanels']
  selectedItems?: CanvasItem[]
  selection?: string[]
}) {
  return getCanvasObjectInspectorModel({
    bounds,
    commitItemsChange,
    customFocus,
    inspectorPanels,
    selectedItems,
    selection,
  })
}

function createRectItem(): CanvasItem {
  return {
    fill: '#ffffff',
    h: 40,
    id: 'rect-1',
    stroke: '#111111',
    type: 'rect',
    w: 80,
    x: 10,
    y: 20,
  }
}

function createComponentItem(): CanvasItem {
  return {
    accent: '#2563eb',
    component: 'card',
    fill: '#ffffff',
    h: 90,
    id: 'component-1',
    stroke: '#111111',
    title: 'Card',
    type: 'component',
    w: 140,
    x: 10,
    y: 20,
  }
}

function createCustomItem(): CanvasItem {
  return {
    data: { severity: 'High' },
    h: 92,
    id: 'risk-1',
    kind: 'risk',
    presentation: 'risk-node',
    title: 'Risk',
    type: 'custom',
    w: 180,
    x: 10,
    y: 20,
  }
}
