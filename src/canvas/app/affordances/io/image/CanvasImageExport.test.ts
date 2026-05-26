import { describe, expect, it, vi } from 'vitest'
import type { CanvasItem } from '../../../../entities'
import {
  createCanvasItemsImageExport,
  createCanvasSelectionImageExport,
  createCanvasSelectionImageExportCandidates,
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

const stampItem: CanvasItem = {
  h: 44,
  id: 'stamp-1',
  label: '+1',
  stamp: 'thumbs-up',
  type: 'stamp',
  w: 44,
  x: 20,
  y: 30,
}

const commentItem: CanvasItem = {
  body: 'Needs follow-up',
  h: 36,
  id: 'comment-1',
  type: 'comment',
  w: 36,
  x: 20,
  y: 30,
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

  it('keeps a data-rendered fallback behind the stage SVG snapshot', () => {
    const readModel = {
      getSelectedItems: vi.fn(() => [imageItem]),
      getSelectionBounds: vi.fn(() => ({ h: 80, w: 120, x: 10, y: 20 })),
    }
    const stageElement = {
      getSelectionSvgSnapshot: vi.fn(() => ({
        height: 128,
        svg: '<svg><foreignObject /></svg>',
        width: 168,
      })),
    }

    const candidates = createCanvasSelectionImageExportCandidates({
      itemReadModel: readModel,
      selection: ['image-1'],
      stageElement,
    })

    expect(candidates).toHaveLength(2)
    expect(candidates[0]?.svg).toBe('<svg><foreignObject /></svg>')
    expect(candidates[1]?.svg).toContain('<image')
    expect(candidates[1]?.svg).toContain('data:image/png;base64,aW1hZ2U=')
  })

  it('serializes selected stamp items in the data-rendered fallback', () => {
    const payload = createCanvasItemsImageExport({
      bounds: { h: 44, w: 44, x: 20, y: 30 },
      items: [stampItem],
    })

    expect(payload.svg).toContain('<text')
    expect(payload.svg).toContain('+1')
    expect(payload.svg).toContain('rx="22"')
  })

  it('serializes selected comment items in the data-rendered fallback', () => {
    const payload = createCanvasItemsImageExport({
      bounds: { h: 36, w: 36, x: 20, y: 30 },
      items: [commentItem],
    })

    expect(payload.svg).toContain('<path')
    expect(payload.svg).toContain('#2563eb')
    expect(payload.svg).toContain('rx="10"')
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
