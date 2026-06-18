import { describe, expect, it, vi } from 'vitest'
import {
  getCanvasDataTransferText,
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
})
