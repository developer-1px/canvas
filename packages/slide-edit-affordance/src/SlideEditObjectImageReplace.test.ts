import { describe, expect, it } from 'vitest'

import {
  createSlideEditObjectImageReplaceDescriptor,
  getSlideEditObjectImageReplaceCommandEffect,
  getSlideEditObjectImageReplaceMetadata,
  normalizeSlideEditObjectImageReplaceCommand,
  normalizeSlideEditObjectImageReplaceSource,
  SLIDE_EDIT_OBJECT_IMAGE_REPLACE_DATA_ATTRIBUTE,
  SLIDE_EDIT_OBJECT_IMAGE_REPLACE_FIELD,
} from './SlideEditObjectImageReplace'

describe('SlideEditObjectImageReplace', () => {
  it('creates a supported image replace descriptor', () => {
    expect(createSlideEditObjectImageReplaceDescriptor({
      objectId: 'object-a',
      slideId: 'slide-a',
      sourceName: '  hero.png  ',
    })).toEqual({
      field: SLIDE_EDIT_OBJECT_IMAGE_REPLACE_FIELD,
      isSupported: true,
      metadata: {
        attribute: SLIDE_EDIT_OBJECT_IMAGE_REPLACE_DATA_ATTRIBUTE,
        attributeValue: 'ready',
        isSupported: true,
        unsupportedReason: undefined,
      },
      objectId: 'object-a',
      slideId: 'slide-a',
      sourceName: 'hero.png',
      surface: 'object-image-replace',
      unsupportedReason: undefined,
    })
  })

  it('documents the source field contract', () => {
    expect(SLIDE_EDIT_OBJECT_IMAGE_REPLACE_FIELD).toEqual({
      accept: 'image/*',
      commandId: 'replace-object-image',
      control: 'image-source-file-input',
      id: 'source',
      requiredAdapterSlot: 'command-effect',
    })
    expect(getSlideEditObjectImageReplaceMetadata()).toEqual({
      attribute: 'data-slide-object-image-replace',
      attributeValue: 'ready',
      isSupported: true,
      unsupportedReason: undefined,
    })
  })

  it('expresses unsupported state for non-image mixed or locked selections', () => {
    expect(createSlideEditObjectImageReplaceDescriptor({
      isSupported: false,
      objectId: 'object-a',
      slideId: 'slide-a',
      unsupportedReason: 'locked-object',
    })).toMatchObject({
      isSupported: false,
      metadata: {
        attributeValue: 'unsupported',
        isSupported: false,
        unsupportedReason: 'locked-object',
      },
      unsupportedReason: 'locked-object',
    })
    expect(getSlideEditObjectImageReplaceMetadata({
      isSupported: false,
      unsupportedReason: 'mixed-selection',
    })).toMatchObject({
      attribute: 'data-slide-object-image-replace',
      attributeValue: 'unsupported',
      isSupported: false,
      unsupportedReason: 'mixed-selection',
    })
  })

  it('normalizes source metadata for host command payloads', () => {
    expect(normalizeSlideEditObjectImageReplaceSource({
      altText: '  New image  ',
      mimeType: '',
      name: '  replacement.svg  ',
      naturalHeight: 90.4,
      naturalWidth: -20,
      src: '  data:image/svg+xml;base64,PHN2Zy8+  ',
    })).toEqual({
      altText: 'New image',
      mimeType: 'image/svg+xml',
      name: 'replacement.svg',
      naturalHeight: 90,
      naturalWidth: undefined,
      src: 'data:image/svg+xml;base64,PHN2Zy8+',
    })
  })

  it('routes selected image replacement through host command effects', () => {
    expect(getSlideEditObjectImageReplaceCommandEffect({
      id: 'replace-object-image',
      objectId: 'object-a',
      slideId: 'slide-a',
      source: {
        mimeType: 'IMAGE/PNG',
        name: '  replacement.png  ',
        naturalHeight: 120,
        naturalWidth: 220,
        src: ' data:image/png;base64,aW1hZ2U= ',
      },
    })).toEqual({
      payload: {
        id: 'replace-object-image',
        objectId: 'object-a',
        slideId: 'slide-a',
        source: {
          altText: undefined,
          mimeType: 'image/png',
          name: 'replacement.png',
          naturalHeight: 120,
          naturalWidth: 220,
          src: 'data:image/png;base64,aW1hZ2U=',
        },
      },
      selection: {
        objectIds: ['object-a'],
        slideId: 'slide-a',
      },
      type: 'slide-command-effect',
    })

    expect(normalizeSlideEditObjectImageReplaceCommand({
      id: 'replace-object-image',
      objectId: 'object-a',
      slideId: 'slide-a',
      source: {
        mimeType: 'text/plain',
        src: 'data:text/plain;base64,Zm9v',
      },
    }).source.mimeType).toBe('image/unknown')
  })

  it('does not expose host renderer names or product terms', () => {
    const publicStrings = JSON.stringify({
      descriptor: createSlideEditObjectImageReplaceDescriptor({
        objectId: 'object-a',
        slideId: 'slide-a',
      }),
      field: SLIDE_EDIT_OBJECT_IMAGE_REPLACE_FIELD,
    }).toLowerCase()

    for (const blockedTerm of [
      'background-image',
      'canvasitem',
      'engine-image',
      'p' + 'pt',
      'p' + 'ptx',
      'power' + 'point',
      'fig' + 'slide',
      'slide-store',
      'document-model',
      'svg-element',
    ]) {
      expect(publicStrings).not.toContain(blockedTerm)
    }
  })
})
