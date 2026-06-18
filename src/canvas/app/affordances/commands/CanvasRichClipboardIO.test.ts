import { describe, expect, it } from 'vitest'

import {
  createCanvasRichClipboardHTML,
  getCanvasRichClipboardJSONFromHTML,
  parseCanvasRichClipboardPayload,
  readCanvasRichClipboardFromDataTransfer,
  stringifyCanvasRichClipboardPayload,
  writeCanvasRichClipboardPayload,
  type CanvasRichClipboardDataTransfer,
  type CanvasRichClipboardItemConstructor,
} from './CanvasRichClipboardIO'

const jsonMimeType = 'application/vnd.example.selection+json'
const scriptAttribute = 'data-example-rich-clipboard-json'

describe('CanvasRichClipboardIO', () => {
  it('creates HTML fallback with escaped JSON script payload', () => {
    const html = createCanvasRichClipboardHTML({
      fallbackHTML: '<svg></svg>',
      json: '{"text":"</script><p>break</p>"}',
      rootAttribute: 'data-example-rich-clipboard',
      scriptAttribute,
    })

    expect(html).toContain('data-example-rich-clipboard="true"')
    expect(html).toContain('data-example-rich-clipboard-json')
    expect(html).toContain('\\u003c/script>')
    expect(html).not.toContain('</script><p>break</p>')
  })

  it('extracts script JSON from HTML without requiring DOMParser', () => {
    const json = stringifyCanvasRichClipboardPayload({
      kind: 'example.selection',
      payload: { id: 'rect-1' },
      version: 1,
    })
    const html = createCanvasRichClipboardHTML({
      fallbackHTML: null,
      json,
      scriptAttribute,
    })

    expect(getCanvasRichClipboardJSONFromHTML(html, {
      scriptAttribute,
    })).toBe(json)
  })

  it('parses JSON through the host payload validator', () => {
    expect(parseCanvasRichClipboardPayload(
      '{"kind":"example.selection","payload":{"id":"rect-1"}}',
      parseExamplePayload,
    )).toEqual({
      id: 'rect-1',
    })
    expect(parseCanvasRichClipboardPayload(
      '{"kind":"example.selection","payload":{"id":12}}',
      parseExamplePayload,
    )).toBeNull()
  })

  it('reads DataTransfer payloads by custom, plain, then HTML priority', () => {
    const htmlPayload = stringifyCanvasRichClipboardPayload({
      kind: 'example.selection',
      payload: { id: 'html' },
    })
    const html = createCanvasRichClipboardHTML({
      json: htmlPayload,
      scriptAttribute,
    })

    expect(readCanvasRichClipboardFromDataTransfer({
      dataTransfer: createDataTransfer({
        [jsonMimeType]: stringifyCanvasRichClipboardPayload({
          kind: 'example.selection',
          payload: { id: 'custom' },
        }),
        'text/html': html,
        'text/plain': stringifyCanvasRichClipboardPayload({
          kind: 'example.selection',
          payload: { id: 'plain' },
        }),
      }),
      jsonMimeType,
      parsePayload: parseExamplePayload,
      scriptAttribute,
    })).toEqual({
      format: 'custom-json',
      payload: { id: 'custom' },
    })

    expect(readCanvasRichClipboardFromDataTransfer({
      dataTransfer: createDataTransfer({
        'text/html': html,
        'text/plain': stringifyCanvasRichClipboardPayload({
          kind: 'example.selection',
          payload: { id: 'plain' },
        }),
      }),
      jsonMimeType,
      parsePayload: parseExamplePayload,
      scriptAttribute,
    })).toEqual({
      format: 'text-plain',
      payload: { id: 'plain' },
    })

    expect(readCanvasRichClipboardFromDataTransfer({
      dataTransfer: createDataTransfer({ 'text/html': html }),
      jsonMimeType,
      parsePayload: parseExamplePayload,
      scriptAttribute,
    })).toEqual({
      format: 'text-html',
      payload: { id: 'html' },
    })
  })

  it('writes ClipboardItem payloads and falls back to writeText', async () => {
    const writes: Array<Record<string, Blob>> = []
    const textWrites: string[] = []
    class TestClipboardItem {
      readonly items: Record<string, Blob>

      constructor(items: Record<string, Blob>) {
        this.items = items
        writes.push(items)
      }
    }
    const testClipboardItem =
      TestClipboardItem as unknown as CanvasRichClipboardItemConstructor

    expect(await writeCanvasRichClipboardPayload({
      clipboard: {
        write: async () => undefined,
        writeText: async (value) => {
          textWrites.push(value)
        },
      },
      clipboardItem: testClipboardItem,
      extraItems: {
        ' text/tab-separated-values ': 'A\tB\n1\t2',
        'text/csv': new Blob(['A,B\n1,2'], { type: 'text/csv' }),
        'text/plain': 'ignored plain text override',
      },
      html: '<section></section>',
      json: '{"ok":true}',
      jsonMimeType,
      plainText: 'fallback text',
      selectionSvg: '<svg></svg>',
    })).toBe('clipboard-item')
    expect(Object.keys(writes[0] ?? {}).sort()).toEqual([
      'application/vnd.example.selection+json',
      'image/svg+xml',
      'text/csv',
      'text/html',
      'text/plain',
      'text/tab-separated-values',
    ])
    expect(await writes[0]['text/tab-separated-values'].text())
      .toBe('A\tB\n1\t2')
    expect(await writes[0]['text/csv'].text()).toBe('A,B\n1,2')
    expect(await writes[0]['text/plain'].text()).toBe('fallback text')
    expect(textWrites).toEqual([])

    expect(await writeCanvasRichClipboardPayload({
      clipboard: {
        write: async () => {
          throw new Error('blocked')
        },
        writeText: async (value) => {
          textWrites.push(value)
        },
      },
      clipboardItem: testClipboardItem,
      html: '<section></section>',
      json: '{"fallback":true}',
      jsonMimeType,
    })).toBe('write-text')
    expect(textWrites).toEqual(['{"fallback":true}'])
  })
})

function createDataTransfer(
  values: Record<string, string>,
): CanvasRichClipboardDataTransfer {
  return {
    getData: (type) => values[type] ?? '',
  }
}

function parseExamplePayload(value: unknown) {
  if (!value || typeof value !== 'object' || !('payload' in value)) {
    return null
  }

  const payload = value.payload

  if (!payload || typeof payload !== 'object' || !('id' in payload)) {
    return null
  }

  return typeof payload.id === 'string' ? { id: payload.id } : null
}
