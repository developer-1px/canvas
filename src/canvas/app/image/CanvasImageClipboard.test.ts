import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import {
  readCanvasClipboardImageSource,
  writeCanvasImageBlobToClipboard,
} from './CanvasImageClipboard'

describe('CanvasImageClipboard', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('reads the first image item from the system clipboard as an import source', async () => {
    installImageReadBrowserFakes()
    vi.stubGlobal('navigator', {
      clipboard: {
        read: vi.fn(async () => [{
          getType: vi.fn(async () => new Blob(['image'], { type: 'image/png' })),
          types: ['text/plain', 'image/png'],
        }]),
      },
    })

    await expect(readCanvasClipboardImageSource()).resolves.toMatchObject({
      dataUrl: 'data:image/png;base64,aW1hZ2U=',
      mimeType: 'image/png',
      naturalHeight: 8,
      naturalWidth: 12,
    })
  })

  it('returns null when clipboard image access is unavailable or denied', async () => {
    vi.stubGlobal('navigator', {
      clipboard: {
        read: vi.fn(async () => {
          throw new Error('permission denied')
        }),
      },
    })

    await expect(readCanvasClipboardImageSource()).resolves.toBeNull()

    vi.stubGlobal('navigator', {
      clipboard: {
        read: vi.fn(async () => [{
          getType: vi.fn(),
          types: ['text/plain'],
        }]),
      },
    })

    await expect(readCanvasClipboardImageSource()).resolves.toBeNull()
  })

  it('writes PNG blobs to the system clipboard as image clipboard items', async () => {
    const clipboardWrite = vi.fn(async () => undefined)
    const ClipboardItemFake = createClipboardItemFake()
    const blob = new Blob(['image'], { type: 'image/png' })

    vi.stubGlobal('ClipboardItem', ClipboardItemFake)
    vi.stubGlobal('navigator', {
      clipboard: {
        write: clipboardWrite,
      },
    })

    await expect(writeCanvasImageBlobToClipboard(blob)).resolves.toBe(true)
    expect(ClipboardItemFake.created).toEqual([{ 'image/png': blob }])
    expect(clipboardWrite).toHaveBeenCalledWith([
      expect.any(ClipboardItemFake),
    ])
  })

  it('contains clipboard write failures', async () => {
    vi.stubGlobal('ClipboardItem', createClipboardItemFake())
    vi.stubGlobal('navigator', {
      clipboard: {
        write: vi.fn(async () => {
          throw new Error('permission denied')
        }),
      },
    })

    await expect(
      writeCanvasImageBlobToClipboard(new Blob(['image'], { type: 'image/png' })),
    ).resolves.toBe(false)
  })
})

function installImageReadBrowserFakes() {
  vi.stubGlobal('FileReader', class FileReaderFake {
    error: Error | null = null
    result: string | null = null
    private readonly listeners = new Map<string, Array<() => void>>()

    addEventListener(type: string, listener: () => void) {
      this.listeners.set(type, [
        ...(this.listeners.get(type) ?? []),
        listener,
      ])
    }

    readAsDataURL(blob: Blob) {
      this.result = `data:${blob.type};base64,aW1hZ2U=`

      for (const listener of this.listeners.get('load') ?? []) {
        listener()
      }
    }
  })
  vi.stubGlobal('Image', class ImageFake {
    naturalHeight = 8
    naturalWidth = 12
    src = ''

    async decode() {
      return undefined
    }
  })
}

function createClipboardItemFake() {
  return class ClipboardItemFake {
    static created: Array<Record<string, Blob>> = []

    constructor(data: Record<string, Blob>) {
      ClipboardItemFake.created.push(data)
    }
  }
}
