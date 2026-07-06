import { describe, expect, it } from 'vitest'

import {
  createSlideEditObjectImageReplaceDescriptor,
  getSlideEditObjectImageReplaceCommandEffect,
  getSlideEditObjectImageReplaceJSONPasteValue,
  getSlideEditObjectImageReplaceJSONPasteValueFromText,
  getSlideEditObjectImageReplaceJSONPasteValueFromValue,
  getSlideEditObjectImageReplaceMetadata,
  getSlideEditObjectImageReplacePasteCommandEffect,
  normalizeSlideEditObjectImageReplaceCommand,
  normalizeSlideEditObjectImageReplaceSource,
  SLIDE_EDIT_OBJECT_IMAGE_REPLACE_DATA_ATTRIBUTE,
  SLIDE_EDIT_OBJECT_IMAGE_REPLACE_FIELD,
  SLIDE_EDIT_OBJECT_IMAGE_REPLACE_JSON_MIME_TYPE,
} from './SlideEditObjectImageReplace'
import {
  getSlideEditObjectImageReplaceJSONPasteValue as getSlideEditObjectImageReplaceJSONPasteValueFromPackage,
  getSlideEditObjectImageReplaceJSONPasteValueFromText as getSlideEditObjectImageReplaceJSONPasteValueFromTextFromPackage,
  getSlideEditObjectImageReplaceJSONPasteValueFromValue as getSlideEditObjectImageReplaceJSONPasteValueFromValueFromPackage,
} from './index'

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

  it('reads custom MIME direct image source JSON values first', () => {
    expect(getSlideEditObjectImageReplaceJSONPasteValue({
      dataTransfer: createDataTransfer({
        [SLIDE_EDIT_OBJECT_IMAGE_REPLACE_JSON_MIME_TYPE]: JSON.stringify({
          alt: '  Hero  ',
          dataUrl: ' data:image/png;base64,aW1hZ2U= ',
          fileName: ' hero.png ',
          naturalSize: {
            height: 120.4,
            width: 220.5,
          },
          type: 'IMAGE/PNG',
        }),
        'application/json':
          '{"imageSource":{"src":"data:image/jpeg;base64,Zm9v"}}',
      }),
    })).toEqual({
      source: {
        altText: 'Hero',
        mimeType: 'image/png',
        name: 'hero.png',
        naturalHeight: 120,
        naturalWidth: 221,
        src: 'data:image/png;base64,aW1hZ2U=',
      },
      sourceFields: {
        altText: 'alt',
        mimeType: 'type',
        name: 'fileName',
        naturalHeight: 'naturalSize.height',
        naturalWidth: 'naturalSize.width',
        src: 'dataUrl',
      },
      surface: 'object-image-replace',
    })
    expect(getSlideEditObjectImageReplaceJSONPasteValueFromPackage({
      dataTransfer: createDataTransfer({
        [SLIDE_EDIT_OBJECT_IMAGE_REPLACE_JSON_MIME_TYPE]:
          '{"src":"data:image/svg+xml;base64,PHN2Zy8+"}',
      }),
    })).toMatchObject({
      source: {
        mimeType: 'image/svg+xml',
        src: 'data:image/svg+xml;base64,PHN2Zy8+',
      },
    })
  })

  it('reads wrapped application/json image source payloads', () => {
    expect(getSlideEditObjectImageReplaceJSONPasteValue({
      dataTransfer: createDataTransfer({
        'application/json': JSON.stringify({
          imageSource: {
            altText: 'Remote',
            mimeType: 'image/png',
            name: 'remote.png',
            naturalHeight: 200,
            naturalWidth: 300,
            url: 'https://example.com/remote.png',
          },
        }),
      }),
    })).toEqual({
      source: {
        altText: 'Remote',
        mimeType: 'image/png',
        name: 'remote.png',
        naturalHeight: 200,
        naturalWidth: 300,
        src: 'https://example.com/remote.png',
      },
      sourceFields: {
        altText: 'altText',
        mimeType: 'mimeType',
        name: 'name',
        naturalHeight: 'naturalHeight',
        naturalWidth: 'naturalWidth',
        src: 'url',
        wrapper: 'imageSource',
      },
      surface: 'object-image-replace',
    })
  })

  it('reads image source JSON paste values from text and parsed values', () => {
    const wrappedText = JSON.stringify({
      imageSource: {
        altText: 'Remote',
        mimeType: 'image/png',
        naturalSize: {
          height: 120,
          width: 240,
        },
        url: 'https://example.com/remote.png',
      },
    })

    expect(getSlideEditObjectImageReplaceJSONPasteValueFromText(
      wrappedText,
      { mode: 'wrapped' },
    )).toEqual({
      source: {
        altText: 'Remote',
        mimeType: 'image/png',
        naturalHeight: 120,
        naturalWidth: 240,
        src: 'https://example.com/remote.png',
      },
      sourceFields: {
        altText: 'altText',
        mimeType: 'mimeType',
        naturalHeight: 'naturalSize.height',
        naturalWidth: 'naturalSize.width',
        src: 'url',
        wrapper: 'imageSource',
      },
      surface: 'object-image-replace',
    })

    expect(getSlideEditObjectImageReplaceJSONPasteValueFromValue({
      dataUrl: 'data:image/png;base64,aW1hZ2U=',
    })).toMatchObject({
      source: {
        mimeType: 'image/png',
        src: 'data:image/png;base64,aW1hZ2U=',
      },
      sourceFields: {
        src: 'dataUrl',
      },
    })

    expect(getSlideEditObjectImageReplaceJSONPasteValueFromTextFromPackage(
      '{"src":"data:image/svg+xml;base64,PHN2Zy8+"}',
    )).toMatchObject({
      source: {
        mimeType: 'image/svg+xml',
        src: 'data:image/svg+xml;base64,PHN2Zy8+',
      },
    })
    expect(getSlideEditObjectImageReplaceJSONPasteValueFromValueFromPackage({
      replacementImage: {
        url: 'https://example.com/replacement.png',
      },
    }, {
      mode: 'wrapped',
    })).toMatchObject({
      source: {
        mimeType: 'image/unknown',
        src: 'https://example.com/replacement.png',
      },
      sourceFields: {
        src: 'url',
        wrapper: 'replacementImage',
      },
    })
  })

  it('converts a valid image source paste into a replace command effect', () => {
    const pasteValue = getSlideEditObjectImageReplaceJSONPasteValue({
      dataTransfer: createDataTransfer({
        'application/json': JSON.stringify({
          imageReplace: {
            src: 'data:image/png;base64,aW1hZ2U=',
          },
        }),
      }),
    })

    expect(getSlideEditObjectImageReplacePasteCommandEffect({
      pasteValue: pasteValue!,
      slideId: 'slide-a',
      targets: [
        {
          objectId: 'image-a',
        },
      ],
    })).toEqual({
      appliedTarget: {
        commandId: 'replace-object-image',
        effectType: 'slide-command-effect',
        objectId: 'image-a',
        sourceFields: {
          src: 'src',
          wrapper: 'imageReplace',
        },
      },
      effect: {
        payload: {
          id: 'replace-object-image',
          objectId: 'image-a',
          slideId: 'slide-a',
          source: {
            altText: undefined,
            mimeType: 'image/png',
            name: undefined,
            naturalHeight: undefined,
            naturalWidth: undefined,
            src: 'data:image/png;base64,aW1hZ2U=',
          },
        },
        selection: {
          objectIds: ['image-a'],
          slideId: 'slide-a',
        },
        type: 'slide-command-effect',
      },
      pasteValue: pasteValue,
      status: 'available',
    })
  })

  it('reports image source paste unavailable reasons', () => {
    const pasteValue = getSlideEditObjectImageReplaceJSONPasteValue({
      dataTransfer: createDataTransfer({
        [SLIDE_EDIT_OBJECT_IMAGE_REPLACE_JSON_MIME_TYPE]:
          '{"src":"data:image/png;base64,aW1hZ2U="}',
      }),
    })!

    expect(getSlideEditObjectImageReplacePasteCommandEffect({
      pasteValue,
      slideId: 'slide-a',
      targets: [
        {
          objectId: 'image-a',
        },
        {
          objectId: 'image-b',
        },
      ],
    })).toMatchObject({
      reason: 'mixed-selection',
      status: 'unavailable',
    })
    expect(getSlideEditObjectImageReplacePasteCommandEffect({
      pasteValue,
      slideId: 'slide-a',
      targets: [
        {
          isLocked: true,
          objectId: 'image-a',
        },
      ],
    })).toMatchObject({
      reason: 'locked-object',
      status: 'unavailable',
    })
    expect(getSlideEditObjectImageReplacePasteCommandEffect({
      pasteValue,
      slideId: 'slide-a',
      targets: [
        {
          isHidden: true,
          objectId: 'image-a',
        },
      ],
    })).toMatchObject({
      reason: 'hidden-object',
      status: 'unavailable',
    })
    expect(getSlideEditObjectImageReplacePasteCommandEffect({
      pasteValue,
      slideId: 'slide-a',
      targets: [
        {
          isSupported: false,
          objectId: 'shape-a',
        },
      ],
    })).toMatchObject({
      reason: 'unsupported-object',
      status: 'unavailable',
    })
  })

  it('ignores invalid and direct generic image source JSON payloads', () => {
    expect(getSlideEditObjectImageReplaceJSONPasteValue({
      dataTransfer: null,
    })).toBeNull()
    expect(getSlideEditObjectImageReplaceJSONPasteValue({
      dataTransfer: createDataTransfer({
        'application/json': '{"src":"data:image/png;base64,aW1hZ2U="}',
      }),
    })).toBeNull()
    expect(getSlideEditObjectImageReplaceJSONPasteValue({
      dataTransfer: createDataTransfer({
        'application/json': '{"imageSource":{"alt":"missing source"}}',
      }),
    })).toBeNull()
    expect(getSlideEditObjectImageReplaceJSONPasteValue({
      dataTransfer: createDataTransfer({
        [SLIDE_EDIT_OBJECT_IMAGE_REPLACE_JSON_MIME_TYPE]: 'not json',
      }),
    })).toBeNull()
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

function createDataTransfer(values: Record<string, string>) {
  return {
    getData(type: string) {
      return values[type] ?? ''
    },
  }
}
