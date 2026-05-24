import { describe, expect, it } from 'vitest'
import {
  createCanvasImageItem,
  isCanvasImageItemStorageShape,
  isCanvasImageMimeType,
} from './CanvasImageItem'

const imageSrc = 'data:image/png;base64,aW1hZ2U='

describe('CanvasImageItem', () => {
  it('creates the persisted image item shape', () => {
    expect(createCanvasImageItem({
      h: 80,
      id: 'image-1',
      mimeType: 'image/png',
      name: 'screen.png',
      naturalHeight: 160,
      naturalWidth: 240,
      src: imageSrc,
      w: 120,
      x: 10,
      y: 20,
    })).toEqual({
      h: 80,
      id: 'image-1',
      mimeType: 'image/png',
      name: 'screen.png',
      naturalHeight: 160,
      naturalWidth: 240,
      src: imageSrc,
      type: 'image',
      w: 120,
      x: 10,
      y: 20,
    })
  })

  it('accepts only image data URLs with positive bounds', () => {
    expect(isCanvasImageItemStorageShape({
      h: 80,
      id: 'image-1',
      mimeType: 'image/png',
      src: imageSrc,
      type: 'image',
      w: 120,
      x: 10,
      y: 20,
    })).toBe(true)
    expect(isCanvasImageItemStorageShape({
      h: 80,
      id: 'image-1',
      mimeType: 'text/plain',
      src: 'data:text/plain;base64,aW1hZ2U=',
      type: 'image',
      w: 120,
      x: 10,
      y: 20,
    })).toBe(false)
    expect(isCanvasImageItemStorageShape({
      h: 0,
      id: 'image-1',
      mimeType: 'image/png',
      src: imageSrc,
      type: 'image',
      w: 120,
      x: 10,
      y: 20,
    })).toBe(false)
  })

  it('recognizes image mime types', () => {
    expect(isCanvasImageMimeType('image/png')).toBe(true)
    expect(isCanvasImageMimeType('image/svg+xml')).toBe(true)
    expect(isCanvasImageMimeType('application/octet-stream')).toBe(false)
  })
})
