import { describe, expect, it } from 'vitest'

import {
  createSlideEditObjectImageCropDescriptor,
  getSlideEditObjectImageCropCommandEffect,
  getSlideEditObjectImageCropJSONPasteValue,
  getSlideEditObjectImageCropJSONPasteValueFromText,
  getSlideEditObjectImageCropJSONPasteValueFromValue,
  getSlideEditObjectImageCropMetadata,
  getSlideEditObjectImageCropPositionCSS,
  normalizeSlideEditObjectImageCrop,
  normalizeSlideEditObjectImageCropCommand,
  normalizeSlideEditObjectImageCropFit,
  normalizeSlideEditObjectImageCropUpdateCommand,
  normalizeSlideEditObjectImageCropValue,
  SLIDE_EDIT_OBJECT_IMAGE_CROP_DATA_ATTRIBUTE,
  SLIDE_EDIT_OBJECT_IMAGE_CROP_DEFAULT,
  SLIDE_EDIT_OBJECT_IMAGE_CROP_DEFAULT_FIT,
  SLIDE_EDIT_OBJECT_IMAGE_CROP_FIELDS,
  SLIDE_EDIT_OBJECT_IMAGE_CROP_FIT_OPTIONS,
  SLIDE_EDIT_OBJECT_IMAGE_CROP_LIMITS,
  toSlideEditObjectImageCropAttributeValue,
} from './SlideEditObjectImageCrop'
import {
  getSlideEditObjectImageCropJSONPasteValue as getSlideEditObjectImageCropJSONPasteValueFromPackage,
  getSlideEditObjectImageCropJSONPasteValueFromText as getSlideEditObjectImageCropJSONPasteValueFromTextFromPackage,
  getSlideEditObjectImageCropJSONPasteValueFromValue as getSlideEditObjectImageCropJSONPasteValueFromValueFromPackage,
} from './index'

describe('SlideEditObjectImageCrop', () => {
  it('creates a supported image crop descriptor with fill centered by default', () => {
    expect(createSlideEditObjectImageCropDescriptor({
      objectId: 'object-a',
      slideId: 'slide-a',
    })).toEqual({
      crop: {
        x: 50,
        y: 50,
      },
      fields: SLIDE_EDIT_OBJECT_IMAGE_CROP_FIELDS,
      fit: 'cover',
      isSupported: true,
      limits: SLIDE_EDIT_OBJECT_IMAGE_CROP_LIMITS,
      metadata: {
        attribute: SLIDE_EDIT_OBJECT_IMAGE_CROP_DATA_ATTRIBUTE,
        attributeValue: 'cover:50,50',
        crop: SLIDE_EDIT_OBJECT_IMAGE_CROP_DEFAULT,
        defaultCrop: SLIDE_EDIT_OBJECT_IMAGE_CROP_DEFAULT,
        defaultFit: SLIDE_EDIT_OBJECT_IMAGE_CROP_DEFAULT_FIT,
        fit: 'cover',
        isSupported: true,
        unsupportedReason: undefined,
      },
      objectId: 'object-a',
      slideId: 'slide-a',
      surface: 'object-image-crop',
      unsupportedReason: undefined,
    })
  })

  it('documents fit and crop position field contracts', () => {
    expect(SLIDE_EDIT_OBJECT_IMAGE_CROP_FIELDS.fit).toMatchObject({
      commandId: 'update-object-image-crop',
      control: 'image-fit-select',
      id: 'fit',
      options: SLIDE_EDIT_OBJECT_IMAGE_CROP_FIT_OPTIONS,
      requiredAdapterSlot: 'command-effect',
    })
    expect(SLIDE_EDIT_OBJECT_IMAGE_CROP_FIELDS.reset).toMatchObject({
      commandId: 'reset-object-image-crop',
      control: 'image-crop-reset-button',
      id: 'reset',
      requiredAdapterSlot: 'command-effect',
    })
    expect(SLIDE_EDIT_OBJECT_IMAGE_CROP_FIELDS.x).toMatchObject({
      commandId: 'update-object-image-crop',
      control: 'crop-position-input',
      id: 'x',
      max: 100,
      min: 0,
      requiredAdapterSlot: 'command-effect',
      step: 1,
      unit: 'percent',
    })
    expect(SLIDE_EDIT_OBJECT_IMAGE_CROP_LIMITS).toEqual({
      max: 100,
      min: 0,
    })
    expect(getSlideEditObjectImageCropMetadata({
      crop: {
        x: 25,
        y: 70,
      },
      fit: 'contain',
    })).toEqual({
      attribute: 'data-slide-object-image-crop',
      attributeValue: 'contain:25,70',
      crop: {
        x: 25,
        y: 70,
      },
      defaultCrop: {
        x: 50,
        y: 50,
      },
      defaultFit: 'cover',
      fit: 'contain',
      isSupported: true,
      unsupportedReason: undefined,
    })
  })

  it('expresses unsupported state for non-image or mixed selections', () => {
    expect(createSlideEditObjectImageCropDescriptor({
      crop: {
        x: 20,
        y: 80,
      },
      fit: 'contain',
      isSupported: false,
      objectId: 'object-a',
      slideId: 'slide-a',
    })).toMatchObject({
      crop: {
        x: 20,
        y: 80,
      },
      fit: 'contain',
      isSupported: false,
      metadata: {
        attributeValue: 'unsupported',
        isSupported: false,
        unsupportedReason: 'unsupported-object',
      },
      unsupportedReason: 'unsupported-object',
    })
    expect(getSlideEditObjectImageCropMetadata({
      crop: {
        x: 40,
        y: 60,
      },
      isSupported: false,
      unsupportedReason: 'mixed-selection',
    })).toMatchObject({
      attribute: 'data-slide-object-image-crop',
      attributeValue: 'unsupported',
      isSupported: false,
      unsupportedReason: 'mixed-selection',
    })
  })

  it('normalizes crop position and fit values', () => {
    expect(normalizeSlideEditObjectImageCropValue(Number.NaN)).toBe(50)
    expect(normalizeSlideEditObjectImageCropValue(null)).toBe(50)
    expect(normalizeSlideEditObjectImageCropValue(-5)).toBe(0)
    expect(normalizeSlideEditObjectImageCropValue(12.345)).toBe(12.35)
    expect(normalizeSlideEditObjectImageCropValue(105)).toBe(100)
    expect(normalizeSlideEditObjectImageCrop({
      x: -10,
      y: 120,
    })).toEqual({
      x: 0,
      y: 100,
    })
    expect(normalizeSlideEditObjectImageCropFit('contain')).toBe('contain')
    expect(normalizeSlideEditObjectImageCropFit('stretch')).toBe('cover')
    expect(toSlideEditObjectImageCropAttributeValue({
      crop: {
        x: 25.555,
        y: 70.222,
      },
      fit: 'contain',
    })).toBe('contain:25.56,70.22')
  })

  it('formats normalized crop position for CSS rendering', () => {
    expect(getSlideEditObjectImageCropPositionCSS({
      x: 25.555,
      y: 70.222,
    })).toBe('25.56% 70.22%')
    expect(getSlideEditObjectImageCropPositionCSS({
      x: -10,
      y: Number.NaN,
    })).toBe('0% 50%')
  })

  it('reads custom MIME direct image crop JSON paste values first', () => {
    expect(getSlideEditObjectImageCropJSONPasteValue({
      dataTransfer: createDataTransfer({
        [SLIDE_EDIT_OBJECT_IMAGE_CROP_JSON_MIME_TYPE]: JSON.stringify({
          crop: {
            x: 120,
            y: -5,
          },
          fit: 'contain',
        }),
        'application/json': JSON.stringify({
          imageCrop: {
            x: 10,
          },
        }),
      }),
    })).toEqual({
      crop: {
        x: 100,
        y: 0,
      },
      fields: ['fit', 'x', 'y'],
      fit: 'contain',
      format: 'json',
      payloadLength: expect.any(Number),
      sourceFields: {
        fit: 'fit',
        x: 'crop.x',
        y: 'crop.y',
      },
      sourceType: SLIDE_EDIT_OBJECT_IMAGE_CROP_JSON_MIME_TYPE,
      surface: 'object-image-crop',
    })
  })

  it('reads wrapped image crop values from generic JSON candidates', () => {
    expect(getSlideEditObjectImageCropJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/plain': JSON.stringify({
          imageCrop: {
            fit: 'stretch',
            x: '25.555',
            y: 70,
          },
        }),
      }),
    })).toEqual({
      crop: {
        x: 25.56,
        y: 70,
      },
      fields: ['fit', 'x', 'y'],
      fit: 'cover',
      format: 'json',
      payloadLength: expect.any(Number),
      sourceFields: {
        fit: 'fit',
        wrapper: 'imageCrop',
        x: 'x',
        y: 'y',
      },
      sourceType: 'text/plain',
      surface: 'object-image-crop',
      wrapper: 'imageCrop',
    })

    expect(getSlideEditObjectImageCropJSONPasteValue({
      dataTransfer: createDataTransfer({
        'application/json': JSON.stringify({
          objectImageCrop: {
            crop: {
              x: 5,
            },
          },
        }),
      }),
    })).toMatchObject({
      crop: {
        x: 5,
      },
      fields: ['x'],
      sourceType: 'application/json',
      wrapper: 'objectImageCrop',
    })
    expect(getSlideEditObjectImageCropJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/json': JSON.stringify({
          crop: {
            y: 88,
          },
        }),
      }),
    })).toMatchObject({
      crop: {
        y: 88,
      },
      fields: ['y'],
      sourceType: 'text/json',
      wrapper: 'crop',
    })

    expect(getSlideEditObjectImageCropJSONPasteValueFromPackage({
      dataTransfer: createDataTransfer({
        [SLIDE_EDIT_OBJECT_IMAGE_CROP_JSON_MIME_TYPE]:
          '{"fit":"contain"}',
      }),
    })).toMatchObject({
      fields: ['fit'],
      fit: 'contain',
    })
  })

  it('reads image crop JSON paste values from text and parsed values', () => {
    const wrappedText = JSON.stringify({
      objectImageCrop: {
        crop: {
          x: 20,
        },
        fit: 'contain',
        y: 75,
      },
    })

    expect(getSlideEditObjectImageCropJSONPasteValueFromText(wrappedText, {
      mode: 'wrapped',
      sourceType: 'application/json',
    })).toEqual({
      crop: {
        x: 20,
        y: 75,
      },
      fields: ['fit', 'x', 'y'],
      fit: 'contain',
      format: 'json',
      payloadLength: wrappedText.length,
      sourceFields: {
        fit: 'fit',
        wrapper: 'objectImageCrop',
        x: 'crop.x',
        y: 'y',
      },
      sourceType: 'application/json',
      surface: 'object-image-crop',
      wrapper: 'objectImageCrop',
    })

    expect(getSlideEditObjectImageCropJSONPasteValueFromValue({
      crop: {
        x: 42,
      },
    }, {
      sourceType: SLIDE_EDIT_OBJECT_IMAGE_CROP_JSON_MIME_TYPE,
    })).toMatchObject({
      crop: {
        x: 42,
      },
      fields: ['x'],
      payloadLength: 0,
      sourceFields: {
        x: 'crop.x',
      },
      sourceType: SLIDE_EDIT_OBJECT_IMAGE_CROP_JSON_MIME_TYPE,
    })

    expect(getSlideEditObjectImageCropJSONPasteValueFromTextFromPackage(
      JSON.stringify({
        crop: {
          y: 10,
        },
      }),
      { mode: 'wrapped' },
    )).toMatchObject({
      crop: {
        y: 10,
      },
      wrapper: 'crop',
    })
    expect(getSlideEditObjectImageCropJSONPasteValueFromValueFromPackage({
      fit: 'contain',
    })).toMatchObject({
      fields: ['fit'],
      fit: 'contain',
    })
  })

  it('routes selected image crop and fit updates through host command effects', () => {
    expect(getSlideEditObjectImageCropCommandEffect({
      fieldId: 'fit',
      id: 'update-object-image-crop',
      objectId: 'object-a',
      slideId: 'slide-a',
      value: 'contain',
    })).toEqual({
      payload: {
        fieldId: 'fit',
        id: 'update-object-image-crop',
        objectId: 'object-a',
        slideId: 'slide-a',
        value: 'contain',
      },
      selection: {
        objectIds: ['object-a'],
        slideId: 'slide-a',
      },
      type: 'slide-command-effect',
    })

    const cropUpdateEffect = getSlideEditObjectImageCropCommandEffect({
      fieldId: 'x',
      id: 'update-object-image-crop',
      objectId: 'object-a',
      slideId: 'slide-a',
      value: 125,
    })

    expect(cropUpdateEffect.payload.id).toBe('update-object-image-crop')
    if (cropUpdateEffect.payload.id === 'update-object-image-crop') {
      expect(cropUpdateEffect.payload.value).toBe(100)
    }

    expect(normalizeSlideEditObjectImageCropUpdateCommand({
      fieldId: 'fit',
      id: 'update-object-image-crop',
      objectId: 'object-a',
      slideId: 'slide-a',
      value: 12,
    }).value).toBe('cover')
  })

  it('routes image crop reset through host command effects', () => {
    expect(getSlideEditObjectImageCropCommandEffect({
      id: 'reset-object-image-crop',
      objectId: 'object-a',
      slideId: 'slide-a',
    })).toEqual({
      payload: {
        crop: {
          x: 50,
          y: 50,
        },
        fit: 'cover',
        id: 'reset-object-image-crop',
        objectId: 'object-a',
        slideId: 'slide-a',
      },
      selection: {
        objectIds: ['object-a'],
        slideId: 'slide-a',
      },
      type: 'slide-command-effect',
    })

    expect(normalizeSlideEditObjectImageCropCommand({
      crop: {
        x: -10,
        y: 120,
      },
      fit: 'contain',
      id: 'reset-object-image-crop',
      objectId: 'object-a',
      slideId: 'slide-a',
    })).toMatchObject({
      crop: {
        x: 0,
        y: 100,
      },
      fit: 'contain',
    })
  })

  it('does not expose host renderer names or product terms', () => {
    const publicStrings = JSON.stringify({
      descriptor: createSlideEditObjectImageCropDescriptor({
        crop: {
          x: 10,
          y: 90,
        },
        objectId: 'object-a',
        slideId: 'slide-a',
      }),
      fields: SLIDE_EDIT_OBJECT_IMAGE_CROP_FIELDS,
    }).toLowerCase()

    for (const blockedTerm of [
      'background-position',
      'canvasitem',
      'engine-image',
      'p' + 'pt',
      'p' + 'ptx',
      'power' + 'point',
      'fig' + 'slide',
      'slide-store',
      'document-model',
      'svg',
    ]) {
      expect(publicStrings).not.toContain(blockedTerm)
    }
  })
})
