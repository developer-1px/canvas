import { describe, expect, it, vi } from 'vitest'
import { createCanvasImportedImageItem } from './CanvasImageImport'

describe('CanvasImageImport', () => {
  it('creates a centered image item from imported source metadata', () => {
    const item = createCanvasImportedImageItem({
      center: { x: 100, y: 200 },
      createId: vi.fn(() => 'image-1'),
      source: {
        dataUrl: 'data:image/png;base64,aW1hZ2U=',
        mimeType: 'image/png',
        name: 'screen.png',
        naturalHeight: 720,
        naturalWidth: 1040,
      },
    })

    expect(item).toMatchObject({
      h: 360,
      id: 'image-1',
      mimeType: 'image/png',
      name: 'screen.png',
      naturalHeight: 720,
      naturalWidth: 1040,
      type: 'image',
      w: 520,
      x: -160,
      y: 20,
    })
  })

  it('uses a stable fallback size when natural dimensions are unavailable', () => {
    expect(createCanvasImportedImageItem({
      center: { x: 200, y: 200 },
      createId: () => 'image-1',
      source: {
        dataUrl: 'data:image/png;base64,aW1hZ2U=',
        mimeType: 'image/png',
      },
    })).toMatchObject({
      h: 220,
      w: 320,
      x: 40,
      y: 90,
    })
  })
})
