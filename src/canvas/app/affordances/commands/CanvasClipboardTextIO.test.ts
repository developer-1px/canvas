import { describe, expect, it, vi } from 'vitest'
import { writeCanvasClipboardText } from './CanvasClipboardTextIO'

describe('CanvasClipboardTextIO', () => {
  it('writes plain text with the browser clipboard text API', async () => {
    const writeText = vi.fn<() => Promise<void>>(() => Promise.resolve())

    await expect(writeCanvasClipboardText({
      clipboard: { writeText },
      text: '<html></html>',
    })).resolves.toBe('write-text')
    expect(writeText).toHaveBeenCalledWith('<html></html>')
  })

  it('returns unavailable when the clipboard text API is missing', async () => {
    await expect(writeCanvasClipboardText({
      clipboard: null,
      text: 'copy',
    })).resolves.toBe('unavailable')
    await expect(writeCanvasClipboardText({
      clipboard: {},
      text: 'copy',
    })).resolves.toBe('unavailable')
  })

  it('returns write-failed when the clipboard write rejects', async () => {
    const writeText = vi.fn<() => Promise<void>>(() =>
      Promise.reject(new Error('denied')))

    await expect(writeCanvasClipboardText({
      clipboard: { writeText },
      text: 'copy',
    })).resolves.toBe('write-failed')
  })
})
