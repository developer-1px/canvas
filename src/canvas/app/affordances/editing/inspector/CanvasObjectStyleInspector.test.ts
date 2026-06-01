import { describe, expect, it, vi } from 'vitest'
import type { CanvasItem } from '../../../../entities'
import {
  getCanvasObjectStyleControls,
  type CanvasObjectStyleNumberControl,
  type CanvasObjectStyleSegmentedControl,
  type CanvasObjectStyleSwatchControl,
} from './CanvasObjectStyleInspector'

describe('CanvasObjectStyleInspector', () => {
  it('creates stable style controls for selected stylable items', () => {
    const controls = getCanvasObjectStyleControls({
      commitItemsChange: vi.fn(),
      disabled: false,
      selectedItems: [createRectItem()],
      selection: ['rect-1'],
    })

    expect(controls.map((control) => control.id)).toEqual([
      'fill',
      'stroke',
      'opacity',
      'strokeWidth',
      'fontSize',
      'textAlign',
    ])
    expect(getSwatchControl(controls, 'fill').mixed).toBe(false)
    expect(
      getSwatchControl(controls, 'fill').swatches
        .find((swatch) => swatch.color === '#FFFFFF')?.selected,
    ).toBe(true)
    expect(getNumberControl(controls, 'strokeWidth').value).toBe(1.25)
    expect(getSegmentedControl(controls, 'textAlign').value).toBe('center')
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

    getSwatchControl(controls, 'fill').onSelect('#C2E5FF')

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

    expect(controls.map((control) => control.id)).toEqual([
      'stroke',
      'opacity',
      'strokeWidth',
      'fontSize',
      'textAlign',
      'arrowRouting',
      'arrowhead',
    ])

    getSwatchControl(controls, 'stroke').onSelect('#9747FF')

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

  it('commits numeric style changes only to supported selected items', () => {
    const commitItemsChange = vi.fn()
    const marker = createMarkerItem()
    const controls = getCanvasObjectStyleControls({
      commitItemsChange,
      disabled: false,
      items: [createRectItem(), marker, createTextItem()],
      selectedItems: [createRectItem(), marker, createTextItem()],
      selection: ['rect-1', 'marker-1', 'text-1'],
    })

    getNumberControl(controls, 'strokeWidth').onChange(6)
    getNumberControl(controls, 'opacity').onChange(0.4)

    expect(commitItemsChange).toHaveBeenNthCalledWith(
      1,
      {
        type: 'replace-changed',
        items: [
          {
            ...createRectItem(),
            strokeWidth: 6,
          },
          {
            ...marker,
            strokeWidth: 6,
          },
          createTextItem(),
        ],
      },
      {
        before: ['rect-1', 'marker-1', 'text-1'],
        after: ['rect-1', 'marker-1', 'text-1'],
      },
    )
    expect(commitItemsChange).toHaveBeenNthCalledWith(
      2,
      {
        type: 'replace-changed',
        items: [
          {
            ...createRectItem(),
            opacity: 0.4,
          },
          {
            ...marker,
            opacity: 0.4,
          },
          {
            ...createTextItem(),
            opacity: 0.4,
          },
        ],
      },
      {
        before: ['rect-1', 'marker-1', 'text-1'],
        after: ['rect-1', 'marker-1', 'text-1'],
      },
    )
  })

  it('commits text style and arrow line controls', () => {
    const commitItemsChange = vi.fn()
    const controls = getCanvasObjectStyleControls({
      commitItemsChange,
      disabled: false,
      items: [createArrowItem()],
      selectedItems: [createArrowItem()],
      selection: ['arrow-1'],
    })

    getNumberControl(controls, 'fontSize').onChange(14)
    getSegmentedControl(controls, 'textAlign').onSelect('left')
    getSegmentedControl(controls, 'arrowRouting').onSelect('elbow')
    getSegmentedControl(controls, 'arrowhead').onSelect('none')

    expect(commitItemsChange).toHaveBeenNthCalledWith(
      1,
      {
        type: 'replace-changed',
        items: [{
          ...createArrowItem(),
          fontSize: 14,
        }],
      },
      {
        before: ['arrow-1'],
        after: ['arrow-1'],
      },
    )
    expect(commitItemsChange).toHaveBeenNthCalledWith(
      2,
      {
        type: 'replace-changed',
        items: [{
          ...createArrowItem(),
          textAlign: 'left',
        }],
      },
      {
        before: ['arrow-1'],
        after: ['arrow-1'],
      },
    )
    expect(commitItemsChange).toHaveBeenNthCalledWith(
      3,
      {
        type: 'replace-changed',
        items: [{
          ...createArrowItem(),
          routing: 'elbow',
        }],
      },
      {
        before: ['arrow-1'],
        after: ['arrow-1'],
      },
    )
    expect(commitItemsChange).toHaveBeenNthCalledWith(
      4,
      {
        type: 'replace-changed',
        items: [{
          ...createArrowItem(),
          arrowhead: 'none',
        }],
      },
      {
        before: ['arrow-1'],
        after: ['arrow-1'],
      },
    )
  })

  it('shows mixed values and blocks disabled or unsupported commits', () => {
    const commitItemsChange = vi.fn()
    const unsupported = getCanvasObjectStyleControls({
      commitItemsChange,
      disabled: false,
      selectedItems: [createImageItem()],
      selection: ['image-1'],
    })
    const mixed = getCanvasObjectStyleControls({
      commitItemsChange,
      disabled: false,
      selectedItems: [
        createRectItem({ strokeWidth: 2 }),
        createRectItem({ id: 'rect-2', strokeWidth: 4 }),
      ],
      selection: ['rect-1', 'rect-2'],
    })
    const disabled = getCanvasObjectStyleControls({
      commitItemsChange,
      disabled: true,
      selectedItems: [createRectItem()],
      selection: ['rect-1'],
    })

    getSwatchControl(disabled, 'fill').onSelect('#C2E5FF')

    expect(unsupported).toEqual([])
    expect(getNumberControl(mixed, 'strokeWidth')).toMatchObject({
      mixed: true,
      value: null,
    })
    expect(commitItemsChange).not.toHaveBeenCalled()
  })

  it('omits all controls when the feature toggle is disabled', () => {
    expect(getCanvasObjectStyleControls({
      commitItemsChange: vi.fn(),
      disabled: false,
      enabled: false,
      selectedItems: [createRectItem()],
      selection: ['rect-1'],
    })).toEqual([])
  })
})

function getSwatchControl(
  controls: ReturnType<typeof getCanvasObjectStyleControls>,
  id: string,
) {
  return controls.find((control) =>
    control.kind === 'swatches' && control.id === id,
  ) as CanvasObjectStyleSwatchControl
}

function getNumberControl(
  controls: ReturnType<typeof getCanvasObjectStyleControls>,
  id: string,
) {
  return controls.find((control) =>
    control.kind === 'number' && control.id === id,
  ) as CanvasObjectStyleNumberControl
}

function getSegmentedControl(
  controls: ReturnType<typeof getCanvasObjectStyleControls>,
  id: string,
) {
  return controls.find((control) =>
    control.kind === 'segmented' && control.id === id,
  ) as CanvasObjectStyleSegmentedControl
}

function createRectItem(
  overrides: Partial<Extract<CanvasItem, { type: 'rect' }>> = {},
): Extract<CanvasItem, { type: 'rect' }> {
  return {
    fill: '#FFFFFF',
    h: 40,
    id: 'rect-1',
    stroke: '#1E1E1E',
    text: 'Shape',
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
    text: 'Flow',
    type: 'arrow',
    w: 124,
    x: 28,
    y: 28,
    ...overrides,
  }
}

function createMarkerItem(): Extract<CanvasItem, { type: 'marker' }> {
  return {
    h: 20,
    id: 'marker-1',
    opacity: 1,
    points: [
      { x: 0, y: 0 },
      { x: 10, y: 10 },
    ],
    stroke: '#1E1E1E',
    strokeWidth: 3,
    type: 'marker',
    w: 20,
    x: 0,
    y: 0,
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

function createImageItem(): CanvasItem {
  return {
    alt: 'Image',
    h: 40,
    id: 'image-1',
    mimeType: 'image/png',
    name: 'image.png',
    naturalHeight: 40,
    naturalWidth: 40,
    src: 'data:image/png;base64,',
    type: 'image',
    w: 40,
    x: 0,
    y: 0,
  }
}
