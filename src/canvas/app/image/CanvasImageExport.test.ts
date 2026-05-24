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
