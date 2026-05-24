import { describe, expect, it, vi } from 'vitest'
import type { CanvasItem } from '../../entities'
import {
  createCanvasItemsImageExport,
  createCanvasSelectionImageExport,
} from './CanvasImageExport'

const imageItem: CanvasItem = {
  h: 80,
  id: 'image-1',
  mimeType: 'image/png',
  src: 'data:image/png;base64,aW1hZ2U=',
  type: 'image',
  w: 120,
  x: 10,
  y: 20,
}

describe('CanvasImageExport', () => {
  it('serializes selected image items into a downloadable SVG payload', () => {
    const payload = createCanvasItemsImageExport({
      bounds: { h: 80, w: 120, x: 10, y: 20 },
      items: [imageItem],
    })

    expect(payload.filename).toBe('canvas-selection.png')
    expect(payload.width).toBe(168)
    expect(payload.height).toBe(128)
    expect(payload.svg).toContain('<svg')
    expect(payload.svg).toContain('<image')
    expect(payload.svg).toContain('data:image/png;base64,aW1hZ2U=')
  })

  it('uses the read model selection contract as its export surface', () => {
    const readModel = {
      getSelectedItems: vi.fn(() => [imageItem]),
      getSelectionBounds: vi.fn(() => ({ h: 80, w: 120, x: 10, y: 20 })),
    }

    const payload = createCanvasSelectionImageExport({
      itemReadModel: readModel,
      selection: ['image-1'],
    })

    expect(readModel.getSelectionBounds).toHaveBeenCalledWith(['image-1'])
    expect(readModel.getSelectedItems).toHaveBeenCalledWith(['image-1'])
    expect(payload?.svg).toContain('image-1')
  })

  it('prefers the current stage SVG snapshot when it is available', () => {
    const readModel = {
      getSelectedItems: vi.fn(() => [imageItem]),
      getSelectionBounds: vi.fn(() => ({ h: 80, w: 120, x: 10, y: 20 })),
    }
    const stageElement = {
      getSelectionSvgSnapshot: vi.fn(() => ({
        height: 128,
        svg: '<svg><g data-canvas-item-id="image-1"></g></svg>',
        width: 168,
      })),
    }

    const payload = createCanvasSelectionImageExport({
      itemReadModel: readModel,
      selection: ['image-1'],
      stageElement,
    })

    expect(stageElement.getSelectionSvgSnapshot).toHaveBeenCalledWith({
      bounds: { h: 80, w: 120, x: 10, y: 20 },
      ids: ['image-1'],
    })
    expect(readModel.getSelectedItems).not.toHaveBeenCalled()
    expect(payload).toEqual({
      filename: 'canvas-selection.png',
      height: 128,
      svg: '<svg><g data-canvas-item-id="image-1"></g></svg>',
      width: 168,
    })
  })

  it('does not export without a concrete selection', () => {
    expect(createCanvasSelectionImageExport({
      itemReadModel: {
        getSelectedItems: vi.fn(() => []),
        getSelectionBounds: vi.fn(() => null),
      },
      selection: [],
    })).toBeNull()
  })
})
