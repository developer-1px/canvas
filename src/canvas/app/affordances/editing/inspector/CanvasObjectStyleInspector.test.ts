import { describe, expect, it, vi } from 'vitest'
import type { CanvasItem } from '../../../../entities'
import { getCanvasObjectStyleControls } from './CanvasObjectStyleInspector'

describe('CanvasObjectStyleInspector', () => {
  it('creates fill and stroke swatches for selected stylable items', () => {
    const controls = getCanvasObjectStyleControls({
      commitItemsChange: vi.fn(),
      disabled: false,
      selectedItems: [createRectItem()],
      selection: ['rect-1'],
    })

    expect(controls.map((control) => control.id)).toEqual(['fill', 'stroke'])
    expect(
      controls.find((control) => control.id === 'fill')?.swatches
        .find((swatch) => swatch.color === '#FFFFFF')?.selected,
    ).toBe(true)
    expect(
      controls.find((control) => control.id === 'stroke')?.swatches
        .find((swatch) => swatch.color === '#1E1E1E')?.selected,
    ).toBe(true)
  })

  it('commits fill changes through the replace-changed document contract', () => {
    const commitItemsChange = vi.fn()
    const controls = getCanvasObjectStyleControls({
      commitItemsChange,
      disabled: false,
      items: [createRectItem(), createArrowItem()],
      selectedItems: [createRectItem(), createArrowItem()],
      selection: ['rect-1', 'arrow-1'],
    })

    controls.find((control) => control.id === 'fill')?.onSelect('#C2E5FF')

    expect(commitItemsChange).toHaveBeenCalledWith(
      {
        type: 'replace-changed',
        items: [
          {
            ...createRectItem(),
            fill: '#C2E5FF',
          },
          createArrowItem(),
        ],
      },
      {
        before: ['rect-1', 'arrow-1'],
        after: ['rect-1', 'arrow-1'],
      },
    )
  })

  it('commits stroke changes for connectors and drawing items', () => {
    const commitItemsChange = vi.fn()
    const controls = getCanvasObjectStyleControls({
      commitItemsChange,
      disabled: false,
      items: [createRectItem(), createArrowItem()],
      selectedItems: [createArrowItem()],
      selection: ['arrow-1'],
    })

    expect(controls.map((control) => control.id)).toEqual(['stroke'])

    controls[0]?.onSelect('#9747FF')

    expect(commitItemsChange).toHaveBeenCalledWith(
      {
        type: 'replace-changed',
        items: [
          createRectItem(),
          {
            ...createArrowItem(),
            stroke: '#9747FF',
          },
        ],
      },
      {
        before: ['arrow-1'],
        after: ['arrow-1'],
      },
    )
  })

  it('omits controls for unsupported items and blocks disabled commits', () => {
    const commitItemsChange = vi.fn()
    const unsupported = getCanvasObjectStyleControls({
      commitItemsChange,
      disabled: false,
      selectedItems: [createTextItem()],
      selection: ['text-1'],
    })
    const disabled = getCanvasObjectStyleControls({
      commitItemsChange,
      disabled: true,
      selectedItems: [createRectItem()],
      selection: ['rect-1'],
    })

    disabled[0]?.onSelect('#C2E5FF')

    expect(unsupported).toEqual([])
    expect(commitItemsChange).not.toHaveBeenCalled()
  })
})

function createRectItem(
  overrides: Partial<Extract<CanvasItem, { type: 'rect' }>> = {},
): Extract<CanvasItem, { type: 'rect' }> {
  return {
    fill: '#FFFFFF',
    h: 40,
    id: 'rect-1',
    stroke: '#1E1E1E',
    type: 'rect',
    w: 80,
    x: 10,
    y: 20,
    ...overrides,
  }
}

function createArrowItem(
  overrides: Partial<Extract<CanvasItem, { type: 'arrow' }>> = {},
): Extract<CanvasItem, { type: 'arrow' }> {
  return {
    end: { x: 140, y: 40 },
    h: 24,
    id: 'arrow-1',
    start: { x: 40, y: 40 },
    stroke: '#1E1E1E',
    strokeWidth: 3,
    type: 'arrow',
    w: 124,
    x: 28,
    y: 28,
    ...overrides,
  }
}

function createTextItem(): CanvasItem {
  return {
    h: 40,
    id: 'text-1',
    text: 'Text',
    type: 'text',
    w: 120,
    x: 0,
    y: 0,
  }
}
