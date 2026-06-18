import { describe, expect, it } from 'vitest'

import {
  createSlideEditObjectHyperlinkDescriptor,
  getSlideEditObjectHyperlinkCommandEffect,
  getSlideEditObjectHyperlinkJSONPasteValue,
  getSlideEditObjectHyperlinkMetadata,
  getSlideEditObjectHyperlinkPasteCommands,
  getSlideEditObjectHyperlinkValidation,
  normalizeSlideEditObjectHyperlink,
  normalizeSlideEditObjectHyperlinkFieldValue,
  normalizeSlideEditObjectHyperlinkStorageUrl,
  shouldEmitSlideEditObjectHyperlinkMetadata,
  SLIDE_EDIT_OBJECT_HYPERLINK_ALLOWED_SCHEMES,
  SLIDE_EDIT_OBJECT_HYPERLINK_DATA_ATTRIBUTE,
  SLIDE_EDIT_OBJECT_HYPERLINK_DEFAULT,
  SLIDE_EDIT_OBJECT_HYPERLINK_FIELDS,
  SLIDE_EDIT_OBJECT_HYPERLINK_JSON_MIME_TYPE,
  SLIDE_EDIT_OBJECT_HYPERLINK_TARGET_OPTIONS,
  toSlideEditObjectHyperlinkAttributeValue,
} from './SlideEditObjectHyperlink'
import {
  getSlideEditObjectHyperlinkJSONPasteValue as getSlideEditObjectHyperlinkJSONPasteValueFromPackage,
  normalizeSlideEditObjectHyperlinkStorageUrl as normalizeSlideEditObjectHyperlinkStorageUrlFromPackage,
  type SlideEditObjectHyperlinkUrlStoragePolicy,
} from './index'

describe('SlideEditObjectHyperlink', () => {
  it('creates a disabled object hyperlink descriptor by default', () => {
    expect(createSlideEditObjectHyperlinkDescriptor({
      objectId: 'object-a',
      slideId: 'slide-a',
    })).toEqual({
      fields: SLIDE_EDIT_OBJECT_HYPERLINK_FIELDS,
      hyperlink: SLIDE_EDIT_OBJECT_HYPERLINK_DEFAULT,
      metadata: {
        attribute: SLIDE_EDIT_OBJECT_HYPERLINK_DATA_ATTRIBUTE,
        attributeValue: 'none',
        defaultValue: 'none',
        hyperlink: SLIDE_EDIT_OBJECT_HYPERLINK_DEFAULT,
        isEnabled: false,
        validation: {
          isAllowed: false,
          reason: 'empty-url',
        },
      },
      objectId: 'object-a',
      slideId: 'slide-a',
      surface: 'object-hyperlink',
    })
  })

  it('defines product-neutral hyperlink fields for selected objects', () => {
    expect(SLIDE_EDIT_OBJECT_HYPERLINK_FIELDS.map((field) => field.id))
      .toEqual([
        'url',
        'target',
        'title',
      ])
    expect(SLIDE_EDIT_OBJECT_HYPERLINK_TARGET_OPTIONS.map((option) =>
      option.id
    )).toEqual([
      'same-context',
      'new-context',
    ])
    expect(SLIDE_EDIT_OBJECT_HYPERLINK_ALLOWED_SCHEMES).toEqual([
      'https',
      'http',
      'mailto',
    ])
  })

  it('serializes enabled hyperlink metadata for shared runtime surfaces', () => {
    const attributeValue = toSlideEditObjectHyperlinkAttributeValue({
      target: 'new-context',
      title: 'Open reference',
      url: ' https://example.com/reference ',
    })

    expect(JSON.parse(attributeValue)).toEqual({
      target: 'new-context',
      title: 'Open reference',
      url: 'https://example.com/reference',
    })
    expect(getSlideEditObjectHyperlinkMetadata({
      hyperlink: {
        target: 'new-context',
        title: 'Open reference',
        url: 'https://example.com/reference',
      },
    })).toMatchObject({
      attribute: 'data-slide-object-hyperlink',
      isEnabled: true,
      validation: {
        isAllowed: true,
      },
    })
  })

  it('leaves unsupported URL schemes disabled for host policy', () => {
    expect(getSlideEditObjectHyperlinkValidation({
      url: 'ftp://example.com/file',
    })).toEqual({
      isAllowed: false,
      reason: 'unsupported-scheme',
    })
    expect(shouldEmitSlideEditObjectHyperlinkMetadata({
      hyperlink: {
        url: 'ftp://example.com/file',
      },
    })).toBe(false)
    expect(shouldEmitSlideEditObjectHyperlinkMetadata({
      allowedSchemes: ['ftp'],
      hyperlink: {
        url: 'ftp://example.com/file',
      },
    })).toBe(true)
  })

  it('normalizes hyperlink field values before host application', () => {
    expect(normalizeSlideEditObjectHyperlink({
      target: 'new-context',
      title: '  Reference ',
      url: ' https://example.com ',
    })).toEqual({
      target: 'new-context',
      title: 'Reference',
      url: 'https://example.com',
    })
    expect(normalizeSlideEditObjectHyperlinkFieldValue('url', '  '))
      .toBeNull()
    expect(normalizeSlideEditObjectHyperlinkFieldValue(
      'target',
      'new-context',
    )).toBe('new-context')
    expect(normalizeSlideEditObjectHyperlinkFieldValue('target', 'popup'))
      .toBe('same-context')
  })

  it('normalizes host storage URLs with configurable policy', () => {
    const storagePolicy = {
      blockedSchemes: ['javascript', 'data', 'vbscript'],
      maxLength: 12,
    } satisfies SlideEditObjectHyperlinkUrlStoragePolicy

    expect(normalizeSlideEditObjectHyperlinkStorageUrlFromPackage(
      '  example.com/reference  ',
      storagePolicy,
    )).toBe('example.com/')
    expect(normalizeSlideEditObjectHyperlinkStorageUrl(
      'javascript:alert(1)',
      {
        blockedSchemes: ['javascript', 'data', 'vbscript'],
      },
    )).toBeNull()
    expect(normalizeSlideEditObjectHyperlinkStorageUrl(
      'https://example.com/\u0007bad',
    )).toBeNull()
    expect(normalizeSlideEditObjectHyperlinkStorageUrl(
      'ftp://example.com/file',
      {
        blockedSchemes: ['javascript', 'data', 'vbscript'],
      },
    )).toBe('ftp://example.com/file')
  })

  it('routes URL updates and removal through host command effects', () => {
    expect(getSlideEditObjectHyperlinkCommandEffect({
      fieldId: 'url',
      id: 'update-object-hyperlink',
      objectId: 'object-a',
      slideId: 'slide-a',
      value: ' https://example.com ',
    })).toEqual({
      payload: {
        fieldId: 'url',
        id: 'update-object-hyperlink',
        objectId: 'object-a',
        slideId: 'slide-a',
        value: 'https://example.com',
      },
      selection: {
        objectIds: ['object-a'],
        slideId: 'slide-a',
      },
      type: 'slide-command-effect',
    })

    expect(getSlideEditObjectHyperlinkCommandEffect({
      id: 'remove-object-hyperlink',
      objectId: 'object-a',
      slideId: 'slide-a',
    })).toEqual({
      payload: {
        id: 'remove-object-hyperlink',
        objectId: 'object-a',
        slideId: 'slide-a',
      },
      selection: {
        objectIds: ['object-a'],
        slideId: 'slide-a',
      },
      type: 'slide-command-effect',
    })
  })

  it('reads custom MIME direct object hyperlink JSON values first', () => {
    expect(getSlideEditObjectHyperlinkJSONPasteValue({
      dataTransfer: createDataTransfer({
        [SLIDE_EDIT_OBJECT_HYPERLINK_JSON_MIME_TYPE]:
          '" https://example.com/reference "',
        'application/json': '{"link":false}',
      }),
      storagePolicy: {
        maxLength: 19,
      },
    })).toEqual({
      fields: [
        {
          fieldId: 'url',
          value: 'https://example.com',
        },
      ],
      hyperlink: {
        target: 'same-context',
        title: '',
        url: 'https://example.com',
      },
      kind: 'set-hyperlink',
      surface: 'object-hyperlink',
    })
    expect(getSlideEditObjectHyperlinkJSONPasteValueFromPackage({
      dataTransfer: createDataTransfer({
        [SLIDE_EDIT_OBJECT_HYPERLINK_JSON_MIME_TYPE]: JSON.stringify({
          href: 'mailto:hello@example.com',
          target: 'new-context',
          title: ' Contact ',
        }),
      }),
    })).toEqual({
      fields: [
        {
          fieldId: 'url',
          value: 'mailto:hello@example.com',
        },
        {
          fieldId: 'target',
          value: 'new-context',
        },
        {
          fieldId: 'title',
          value: 'Contact',
        },
      ],
      hyperlink: {
        target: 'new-context',
        title: 'Contact',
        url: 'mailto:hello@example.com',
      },
      kind: 'set-hyperlink',
      surface: 'object-hyperlink',
    })
  })

  it('reads explicit object hyperlink wrappers from general JSON candidates', () => {
    expect(getSlideEditObjectHyperlinkJSONPasteValue({
      dataTransfer: createDataTransfer({
        'application/json':
          '{"objectHyperlink":{"url":"https://example.com/docs"}}',
      }),
    })).toMatchObject({
      fields: [
        {
          fieldId: 'url',
          value: 'https://example.com/docs',
        },
      ],
      kind: 'set-hyperlink',
    })
    expect(getSlideEditObjectHyperlinkJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/json': '{"hyperlink":{"href":"http://example.com"}}',
      }),
    })).toMatchObject({
      hyperlink: {
        url: 'http://example.com',
      },
      kind: 'set-hyperlink',
    })
    expect(getSlideEditObjectHyperlinkJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/plain': '{"link":false}',
      }),
    })).toEqual({
      hyperlink: SLIDE_EDIT_OBJECT_HYPERLINK_DEFAULT,
      kind: 'remove-hyperlink',
      surface: 'object-hyperlink',
    })
  })

  it('converts object hyperlink paste values into host commands', () => {
    const pasteValue = getSlideEditObjectHyperlinkJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/plain': JSON.stringify({
          link: {
            target: 'new-context',
            title: 'Docs',
            url: 'https://example.com/docs',
          },
        }),
      }),
    })

    expect(getSlideEditObjectHyperlinkPasteCommands({
      objectId: 'object-a',
      pasteValue: pasteValue!,
      slideId: 'slide-a',
    })).toEqual([
      {
        fieldId: 'url',
        id: 'update-object-hyperlink',
        objectId: 'object-a',
        slideId: 'slide-a',
        value: 'https://example.com/docs',
      },
      {
        fieldId: 'target',
        id: 'update-object-hyperlink',
        objectId: 'object-a',
        slideId: 'slide-a',
        value: 'new-context',
      },
      {
        fieldId: 'title',
        id: 'update-object-hyperlink',
        objectId: 'object-a',
        slideId: 'slide-a',
        value: 'Docs',
      },
    ])
    expect(getSlideEditObjectHyperlinkCommandEffect(
      getSlideEditObjectHyperlinkPasteCommands({
        objectId: 'object-a',
        pasteValue: pasteValue!,
        slideId: 'slide-a',
      })[0],
    ).type).toBe('slide-command-effect')

    const removePasteValue = getSlideEditObjectHyperlinkJSONPasteValue({
      dataTransfer: createDataTransfer({
        [SLIDE_EDIT_OBJECT_HYPERLINK_JSON_MIME_TYPE]: 'null',
      }),
    })

    expect(getSlideEditObjectHyperlinkPasteCommands({
      objectId: 'object-a',
      pasteValue: removePasteValue!,
      slideId: 'slide-a',
    })).toEqual([
      {
        id: 'remove-object-hyperlink',
        objectId: 'object-a',
        slideId: 'slide-a',
      },
    ])
    expect(getSlideEditObjectHyperlinkCommandEffect(
      getSlideEditObjectHyperlinkPasteCommands({
        objectId: 'object-a',
        pasteValue: removePasteValue!,
        slideId: 'slide-a',
      })[0],
    ).payload.id).toBe('remove-object-hyperlink')
  })

  it('ignores invalid, unrelated, and direct generic hyperlink JSON', () => {
    expect(getSlideEditObjectHyperlinkJSONPasteValue({
      dataTransfer: null,
    })).toBeNull()
    expect(getSlideEditObjectHyperlinkJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/plain': '"https://example.com"',
      }),
    })).toBeNull()
    expect(getSlideEditObjectHyperlinkJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/plain': '{"url":"https://example.com"}',
      }),
    })).toBeNull()
    expect(getSlideEditObjectHyperlinkJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/plain': '{"unrelated":false}',
      }),
    })).toBeNull()
    expect(getSlideEditObjectHyperlinkJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/plain': '{"linkPreview":{"url":"https://example.com"}}',
      }),
    })).toBeNull()
    expect(getSlideEditObjectHyperlinkJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/plain': '{"link":"example.com"}',
      }),
    })).toBeNull()
    expect(getSlideEditObjectHyperlinkJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/plain': '{"link":"javascript:alert(1)"}',
      }),
    })).toBeNull()
    expect(getSlideEditObjectHyperlinkJSONPasteValue({
      dataTransfer: createDataTransfer({
        [SLIDE_EDIT_OBJECT_HYPERLINK_JSON_MIME_TYPE]:
          '"https://example.com/\\u0007bad"',
      }),
    })).toBeNull()
    expect(getSlideEditObjectHyperlinkJSONPasteValue({
      dataTransfer: createDataTransfer({
        [SLIDE_EDIT_OBJECT_HYPERLINK_JSON_MIME_TYPE]: 'not json',
      }),
    })).toBeNull()
  })

  it('separates object action metadata from link preview import strings', () => {
    const publicStrings = JSON.stringify({
      descriptor: createSlideEditObjectHyperlinkDescriptor({
        hyperlink: {
          url: 'https://example.com',
        },
        objectId: 'object-a',
        slideId: 'slide-a',
      }),
      fields: SLIDE_EDIT_OBJECT_HYPERLINK_FIELDS,
    }).toLowerCase()

    for (const blockedTerm of [
      'link-preview',
      'import',
      'p' + 'pt',
      'p' + 'ptx',
      'power' + 'point',
      'fig' + 'slide',
      'slide-store',
      'document-model',
    ]) {
      expect(publicStrings).not.toContain(blockedTerm)
    }
  })
})

function createDataTransfer(values: Record<string, string>) {
  return {
    getData: (type: string) => values[type] ?? '',
  }
}
