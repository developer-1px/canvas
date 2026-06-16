import { describe, expect, it, vi } from 'vitest'
import {
  createCanvasImportedImageItem,
  getCanvasDataImageSourceFromDataTransfer,
  getCanvasSVGImageSourceFromDataTransfer,
} from './CanvasImageImport'

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

  it('reads SVG MIME clipboard markup as a sanitized image source', () => {
    const dataTransfer = createDataTransfer({
      'image/svg+xml': '<svg width="120" height="80" onload="alert(1)"><script>alert(1)</script><rect width="120" height="80"/></svg>',
    })
    const source = getCanvasSVGImageSourceFromDataTransfer(dataTransfer)
    const decoded = decodeURIComponent(source?.dataUrl.split(',')[1] ?? '')

    expect(source).toMatchObject({
      format: 'svg-mime',
      mimeType: 'image/svg+xml',
      name: 'clipboard.svg',
      naturalHeight: 80,
      naturalWidth: 120,
    })
    expect(decoded).toContain('<svg xmlns="http://www.w3.org/2000/svg"')
    expect(decoded).not.toContain('<script')
    expect(decoded).not.toContain('onload=')
  })

  it('reads inline HTML SVG and SVG data image clipboard sources', () => {
    expect(getCanvasSVGImageSourceFromDataTransfer(createDataTransfer({
      'text/html': '<section><svg viewBox="0 0 90 60"><circle cx="30" cy="30" r="20"/></svg></section>',
    }))).toMatchObject({
      format: 'svg-html-inline',
      mimeType: 'image/svg+xml',
      naturalHeight: 60,
      naturalWidth: 90,
    })

    expect(getCanvasSVGImageSourceFromDataTransfer(createDataTransfer({
      'text/html': `<img alt="Icon" src="data:image/svg+xml,${encodeURIComponent('<svg width="32" height="24"></svg>')}">`,
    }))).toMatchObject({
      format: 'svg-html-img',
      mimeType: 'image/svg+xml',
      name: 'Icon.svg',
      naturalHeight: 24,
      naturalWidth: 32,
    })
  })

  it('reads HTML and plain data URL images without claiming SVG images', () => {
    expect(getCanvasDataImageSourceFromDataTransfer(createDataTransfer({
      'text/html': '<figure><img alt="Copied Chart" src="data:image/png;base64,aW1hZ2U="></figure>',
    }))).toEqual({
      dataUrl: 'data:image/png;base64,aW1hZ2U=',
      format: 'data-url-html-img',
      mimeType: 'image/png',
      name: 'Copied Chart.png',
    })

    expect(getCanvasDataImageSourceFromDataTransfer(createDataTransfer({
      'text/plain': 'data:image/jpg;base64,aW1hZ2U=',
    }))).toEqual({
      dataUrl: 'data:image/jpg;base64,aW1hZ2U=',
      format: 'data-url-plain',
      mimeType: 'image/jpeg',
      name: 'clipboard.jpg',
    })

    expect(getCanvasDataImageSourceFromDataTransfer(createDataTransfer({
      'text/plain': `data:image/svg+xml,${encodeURIComponent('<svg></svg>')}`,
    }))).toBeNull()
  })

  it('ignores non-image clipboard HTML and text', () => {
    expect(getCanvasSVGImageSourceFromDataTransfer(createDataTransfer({
      'text/html': '<p>hello</p>',
      'text/plain': 'hello',
    }))).toBeNull()
    expect(getCanvasDataImageSourceFromDataTransfer(createDataTransfer({
      'text/html': '<img src="https://example.com/image.png">',
      'text/plain': 'data:text/plain,hello',
    }))).toBeNull()
  })
})

function createDataTransfer(
  values: Record<string, string>,
): DataTransfer {
  return {
    getData: vi.fn((type: string) => values[type] ?? ''),
  } as unknown as DataTransfer
}
