import { describe, expect, it, vi } from 'vitest'
import {
  downloadCanvasBlobFile,
  downloadCanvasTextFile,
  type CanvasFileDownloadAnchor,
} from './CanvasFileDownload'

describe('CanvasFileDownload', () => {
  it('downloads Blob payloads through a temporary object URL', () => {
    const anchor = createAnchor()
    const createObjectURL = vi.fn(() => 'blob:download')
    const revokeObjectURL = vi.fn()
    const setTimeout = vi.fn((callback: () => void) => {
      callback()
    })
    const blob = new Blob(['data'], { type: 'text/plain' })

    expect(downloadCanvasBlobFile({
      blob,
      document: { createElement: () => anchor },
      filename: 'export.txt',
      setTimeout,
      url: { createObjectURL, revokeObjectURL },
    })).toBe(true)
    expect(createObjectURL).toHaveBeenCalledWith(blob)
    expect(anchor.href).toBe('blob:download')
    expect(anchor.download).toBe('export.txt')
    expect(anchor.click).toHaveBeenCalledTimes(1)
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:download')
  })

  it('downloads text payloads by creating a typed Blob', () => {
    const anchor = createAnchor()
    const createObjectURL = vi.fn(() => 'blob:text')
    const revokeObjectURL = vi.fn()

    expect(downloadCanvasTextFile({
      content: '<svg />',
      document: { createElement: () => anchor },
      filename: 'selection.svg',
      setTimeout: null,
      type: 'image/svg+xml;charset=utf-8',
      url: { createObjectURL, revokeObjectURL },
    })).toBe(true)
    const blob = createObjectURL.mock.calls[0]?.[0] as Blob

    expect(blob.type).toBe('image/svg+xml;charset=utf-8')
    expect(anchor.download).toBe('selection.svg')
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:text')
  })

  it('returns false when browser download APIs are unavailable', () => {
    expect(downloadCanvasBlobFile({
      blob: new Blob(['data']),
      document: null,
      filename: 'export.txt',
      url: null,
    })).toBe(false)
  })
})

function createAnchor(): CanvasFileDownloadAnchor & {
  click: ReturnType<typeof vi.fn>
} {
  return {
    click: vi.fn(),
    download: '',
    href: '',
  }
}
