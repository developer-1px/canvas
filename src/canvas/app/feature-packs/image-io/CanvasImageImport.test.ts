import { describe, expect, it, vi } from 'vitest'
import {
  CANVAS_IMAGE_IMPORT_MODEL,
  createCanvasImportedImageItem,
  getCanvasImportedImageSize,
  getCanvasDataImageSourceFromDataTransfer,
  getCanvasHTMLDataImageSourcesFromDataTransfer,
  getCanvasSVGImageSourceFromDataTransfer,
  routeCanvasImagePasteReplace,
} from './CanvasImageImport'

describe('CanvasImageImport', () => {
  it('exposes a stable model metadata value', () => {
    expect(CANVAS_IMAGE_IMPORT_MODEL).toBe('canvas-image-import')
  })

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

  it('exposes imported image display size calculation with custom bounds', () => {
    expect(getCanvasImportedImageSize({
      naturalHeight: 1200,
      naturalWidth: 1600,
    })).toEqual({
      h: 360,
      w: 480,
    })

    expect(getCanvasImportedImageSize({}, {
      fallbackSize: { h: 100, w: 140 },
    })).toEqual({
      h: 100,
      w: 140,
    })

    expect(getCanvasImportedImageSize({
      naturalHeight: 120,
      naturalWidth: 160,
    }, {
      maxSize: { h: 90, w: 90 },
    })).toEqual({
      h: 68,
      w: 90,
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

  it('collects multiple HTML data image sources in document order', () => {
    const svgDataUrl = `data:image/svg+xml,${
      encodeURIComponent(
        '<svg width="16" height="12" onload="alert(1)"><script>alert(1)</script><rect width="16" height="12"/></svg>',
      )
    }`
    const sources = getCanvasHTMLDataImageSourcesFromDataTransfer(
      createDataTransfer({
        'text/html': [
          '<section>',
          '<img alt="Copied Chart" src="data:image/png;base64,aW1hZ2Ux">',
          `<img title="Icon" src="${svgDataUrl}">`,
          '<img alt="Duplicate" src="data:image/png;base64,aW1hZ2Ux">',
          '<img src="data:text/plain,hello">',
          '<img src="https://example.com/image.png">',
          '<img title="Photo.jpeg" src="data:image/jpg;base64,aW1hZ2Uy">',
          '</section>',
        ].join(''),
      }),
    )
    const decodedSvg = decodeURIComponent(sources[1]?.dataUrl.split(',')[1] ?? '')

    expect(sources).toMatchObject([
      {
        dataUrl: 'data:image/png;base64,aW1hZ2Ux',
        format: 'data-url-html-img',
        mimeType: 'image/png',
        name: 'Copied Chart.png',
      },
      {
        format: 'svg-html-img',
        mimeType: 'image/svg+xml',
        name: 'Icon.svg',
        naturalHeight: 12,
        naturalWidth: 16,
      },
      {
        dataUrl: 'data:image/jpg;base64,aW1hZ2Uy',
        format: 'data-url-html-img',
        mimeType: 'image/jpeg',
        name: 'Photo.jpg',
      },
    ])
    expect(sources).toHaveLength(3)
    expect(decodedSvg).not.toContain('<script')
    expect(decodedSvg).not.toContain('onload=')
  })

  it('returns one HTML data image source for a single image fixture', () => {
    expect(getCanvasHTMLDataImageSourcesFromDataTransfer(createDataTransfer({
      'text/html': '<figure><img alt="One" src="data:image/webp;base64,aW1hZ2U="></figure>',
    }))).toEqual([{
      dataUrl: 'data:image/webp;base64,aW1hZ2U=',
      format: 'data-url-html-img',
      mimeType: 'image/webp',
      name: 'One.webp',
    }])
  })

  it('ignores HTML data URLs that are not image sources', () => {
    expect(getCanvasHTMLDataImageSourcesFromDataTransfer(createDataTransfer({
      'text/html': [
        '<img src="data:text/plain,hello">',
        '<img src="https://example.com/image.png">',
      ].join(''),
    }))).toEqual([])
  })

  it('routes a single pasted image source to a host replace target', () => {
    const source = {
      dataUrl: 'data:image/png;base64,aW1hZ2U=',
      format: 'file' as const,
      mimeType: 'image/png',
      name: 'screen.png',
      naturalHeight: 720,
      naturalWidth: 1040,
    }
    const getTarget = vi.fn(() => ({
      id: 'image-1',
      selection: ['image-1'],
    }))
    const route = routeCanvasImagePasteReplace({
      getTarget,
      selection: ['image-1'],
      sources: [source],
    })

    expect(route).toEqual({
      intent: {
        kind: 'image-replace',
        source,
        target: {
          id: 'image-1',
          selection: ['image-1'],
        },
      },
      kind: 'image-replace',
      source,
      status: 'routed',
    })
    expect(Object.isFrozen(route)).toBe(true)
    expect(getTarget).toHaveBeenCalledWith({
      selection: ['image-1'],
      source,
    })
  })

  it('routes SVG MIME and HTML data image sources with metadata', () => {
    const getTarget = vi.fn(({ selection }) => ({
      id: selection[0] ?? 'image-1',
      selection,
    }))
    const svgRoute = routeCanvasImagePasteReplace({
      getTarget,
      selection: ['image-1'],
      sources: [{
        dataUrl: 'data:image/svg+xml;charset=utf-8,%3Csvg%3E%3C%2Fsvg%3E',
        format: 'svg-mime',
        mimeType: 'image/svg+xml',
        name: 'clipboard.svg',
        naturalHeight: 80,
        naturalWidth: 120,
      }],
    })
    const dataRoute = routeCanvasImagePasteReplace({
      getTarget,
      selection: ['image-2'],
      sources: [{
        dataUrl: 'data:image/png;base64,aW1hZ2U=',
        format: 'data-url-html-img',
        mimeType: 'image/png',
        name: 'Copied Chart.png',
      }],
    })

    expect(svgRoute).toMatchObject({
      intent: {
        source: {
          format: 'svg-mime',
          mimeType: 'image/svg+xml',
          name: 'clipboard.svg',
          naturalHeight: 80,
          naturalWidth: 120,
        },
        target: {
          id: 'image-1',
          selection: ['image-1'],
        },
      },
      kind: 'image-replace',
      status: 'routed',
    })
    expect(dataRoute).toMatchObject({
      intent: {
        source: {
          format: 'data-url-html-img',
          mimeType: 'image/png',
          name: 'Copied Chart.png',
        },
        target: {
          id: 'image-2',
          selection: ['image-2'],
        },
      },
      kind: 'image-replace',
      status: 'routed',
    })
  })

  it('falls back to image insertion when no replace target is available', () => {
    const source = {
      dataUrl: 'data:image/png;base64,aW1hZ2U=',
      mimeType: 'image/png',
    }
    const route = routeCanvasImagePasteReplace({
      getTarget: () => null,
      selection: [],
      sources: [source],
    })

    expect(route).toEqual({
      kind: 'image-insert',
      reason: 'no-target',
      sources: [source],
      status: 'fallback',
    })
    expect(Object.isFrozen(route)).toBe(true)
    expect(Object.isFrozen(route.sources)).toBe(true)
  })

  it('keeps disabled, empty, and batch paste sources on insert fallback', () => {
    const source = {
      dataUrl: 'data:image/png;base64,aW1hZ2U=',
      mimeType: 'image/png',
    }
    const nextSource = {
      dataUrl: 'data:image/jpeg;base64,aW1hZ2U=',
      mimeType: 'image/jpeg',
    }
    const getTarget = vi.fn(() => ({
      id: 'image-1',
      selection: ['image-1'],
    }))

    expect(routeCanvasImagePasteReplace({
      disabled: true,
      getTarget,
      selection: ['image-1'],
      sources: [source],
    })).toEqual({
      kind: 'image-insert',
      reason: 'disabled',
      sources: [source],
      status: 'fallback',
    })
    expect(routeCanvasImagePasteReplace({
      getTarget,
      selection: ['image-1'],
      sources: [],
    })).toEqual({
      kind: 'image-insert',
      reason: 'no-source',
      sources: [],
      status: 'fallback',
    })
    expect(routeCanvasImagePasteReplace({
      getTarget,
      selection: ['image-1'],
      sources: [source, nextSource],
    })).toEqual({
      kind: 'image-insert',
      reason: 'batch',
      sources: [source, nextSource],
      status: 'fallback',
    })
    expect(getTarget).not.toHaveBeenCalled()
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
