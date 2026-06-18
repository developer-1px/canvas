import { describe, expect, it, vi } from 'vitest'
import {
  getCanvasDataTransferText,
  readCanvasDataTransferJSONCandidate,
  readCanvasDataTransferTextCandidate,
  setCanvasDataTransferDropEffect,
  setCanvasDataTransferText,
  type CanvasTextDataTransfer,
} from './CanvasDataTransferText'

describe('CanvasDataTransferText', () => {
  it('writes text/plain drag payloads and effectAllowed', () => {
    const dataTransfer: CanvasTextDataTransfer = {
      effectAllowed: 'none',
      setData: vi.fn(),
    }

    expect(setCanvasDataTransferText({
      dataTransfer,
      effectAllowed: 'move',
      text: 'item-1',
    })).toBe(true)
    expect(dataTransfer.effectAllowed).toBe('move')
    expect(dataTransfer.setData).toHaveBeenCalledWith('text/plain', 'item-1')
  })

  it('reads text/plain drag payloads', () => {
    const getData = vi.fn((format: string) =>
      format === 'text/plain' ? 'item-1' : '')

    expect(getCanvasDataTransferText({
      dataTransfer: { getData },
    })).toBe('item-1')
    expect(getData).toHaveBeenCalledWith('text/plain')
  })

  it('reads the first non-empty text candidate in MIME priority order', () => {
    const getData = vi.fn((format: string) => {
      if (format === 'text/markdown') {
        return '   '
      }

      if (format === 'text/x-markdown') {
        return '# Legacy Markdown'
      }

      if (format === 'text/plain') {
        return '# Plain Markdown'
      }

      return ''
    })
    const legacyMarkdownCandidate = {
      mimeType: 'text/x-markdown',
      source: 'legacy-markdown',
    }

    const result = readCanvasDataTransferTextCandidate({
      candidates: [
        'text/markdown',
        legacyMarkdownCandidate,
        {
          mimeType: 'text/plain',
          source: 'plain-text',
        },
      ],
      dataTransfer: { getData },
    })

    expect(result).toEqual({
      candidate: legacyMarkdownCandidate,
      candidateIndex: 1,
      mimeType: 'text/x-markdown',
      rawText: '# Legacy Markdown',
      source: 'legacy-markdown',
      text: '# Legacy Markdown',
    })
    expect(Object.isFrozen(result)).toBe(true)
    expect(getData.mock.calls.map(([format]) => format)).toEqual([
      'text/markdown',
      'text/x-markdown',
    ])
  })

  it('can trim returned text while preserving the raw DataTransfer payload', () => {
    expect(readCanvasDataTransferTextCandidate({
      candidates: [
        {
          mimeType: 'text/plain',
          source: 'plain-text',
        },
      ],
      dataTransfer: {
        getData: (format) =>
          format === 'text/plain' ? '  Hello canvas  ' : '',
      },
      trimText: true,
    })).toEqual({
      candidate: {
        mimeType: 'text/plain',
        source: 'plain-text',
      },
      candidateIndex: 0,
      mimeType: 'text/plain',
      rawText: '  Hello canvas  ',
      source: 'plain-text',
      text: 'Hello canvas',
    })
  })

  it('returns null when text candidates are unavailable or blank', () => {
    expect(readCanvasDataTransferTextCandidate({
      candidates: ['text/markdown', 'text/plain'],
      dataTransfer: null,
    })).toBeNull()
    expect(readCanvasDataTransferTextCandidate({
      candidates: ['text/markdown', 'text/plain'],
      dataTransfer: {
        getData: () => '   ',
      },
    })).toBeNull()
  })

  it('sets dropEffect when supported', () => {
    const dataTransfer: CanvasTextDataTransfer = {
      dropEffect: 'none',
    }

    expect(setCanvasDataTransferDropEffect({
      dataTransfer,
      dropEffect: 'move',
    })).toBe(true)
    expect(dataTransfer.dropEffect).toBe('move')
  })

  it('returns fallback values when DataTransfer APIs are unavailable', () => {
    expect(setCanvasDataTransferText({
      dataTransfer: null,
      text: 'item-1',
    })).toBe(false)
    expect(getCanvasDataTransferText({
      dataTransfer: null,
    })).toBe('')
    expect(setCanvasDataTransferDropEffect({
      dataTransfer: null,
      dropEffect: 'move',
    })).toBe(false)
  })

  it('reads the first JSON candidate accepted by the host parser', () => {
    const getData = vi.fn((format: string) => {
      if (format === 'application/vnd.host.card+json') {
        return '{'
      }

      if (format === 'application/json') {
        return JSON.stringify({ kind: 'ignored-card', title: 'Draft' })
      }

      if (format === 'text/plain') {
        return JSON.stringify({ kind: 'host-card', title: 'Final' })
      }

      return ''
    })

    const result = readCanvasDataTransferJSONCandidate({
      candidates: [
        {
          mimeType: 'application/vnd.host.card+json',
          source: 'custom',
        },
        {
          mimeType: 'application/json',
          source: 'generic-json',
        },
        {
          mimeType: 'text/plain',
          source: 'plain-text',
        },
      ],
      dataTransfer: { getData },
      parseValue: ({ json, source }) => {
        if (
          typeof json !== 'object' ||
          json === null ||
          !('kind' in json) ||
          json.kind !== 'host-card' ||
          !('title' in json)
        ) {
          throw new Error('Invalid host card JSON')
        }

        return {
          source,
          title: String(json.title),
        }
      },
    })

    expect(result).toEqual({
      candidate: {
        mimeType: 'text/plain',
        source: 'plain-text',
      },
      candidateIndex: 2,
      mimeType: 'text/plain',
      rawText: JSON.stringify({ kind: 'host-card', title: 'Final' }),
      source: 'plain-text',
      value: {
        source: 'plain-text',
        title: 'Final',
      },
    })
    expect(Object.isFrozen(result)).toBe(true)
    expect(getData).toHaveBeenCalledTimes(3)
    expect(getData.mock.calls.map(([format]) => format)).toEqual([
      'application/vnd.host.card+json',
      'application/json',
      'text/plain',
    ])
  })

  it('returns parsed JSON when no host parser is provided', () => {
    expect(readCanvasDataTransferJSONCandidate({
      candidates: [{
        mimeType: 'application/json',
        source: 'generic-json',
      }],
      dataTransfer: {
        getData: (format) =>
          format === 'application/json' ? '{"ok":true}' : '',
      },
    })).toMatchObject({
      candidateIndex: 0,
      mimeType: 'application/json',
      source: 'generic-json',
      value: {
        ok: true,
      },
    })
  })

  it('returns null when JSON candidates are unavailable or invalid', () => {
    expect(readCanvasDataTransferJSONCandidate({
      candidates: [{
        mimeType: 'application/json',
      }],
      dataTransfer: null,
    })).toBeNull()
    expect(readCanvasDataTransferJSONCandidate({
      candidates: [
        { mimeType: 'application/json' },
        { mimeType: 'text/plain' },
      ],
      dataTransfer: {
        getData: () => '   ',
      },
    })).toBeNull()
    expect(readCanvasDataTransferJSONCandidate({
      candidates: [
        { mimeType: 'application/json' },
        { mimeType: 'text/plain' },
      ],
      dataTransfer: {
        getData: (format) =>
          format === 'application/json' ? '   ' : 'not-json',
      },
    })).toBeNull()
  })
})
