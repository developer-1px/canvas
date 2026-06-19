import { describe, expect, it } from 'vitest'

import {
  getSlideEditTextBodyJSONPasteValue,
  getSlideEditTextBodyJSONPasteValueFromText,
  getSlideEditTextBodyJSONPasteValueFromValue,
  getSlideEditTextBodyPasteCommandEffect,
  SLIDE_EDIT_TEXT_BODY_JSON_MIME_TYPE,
} from './SlideEditTextBody'
import {
  getSlideEditTextBodyJSONPasteValue as getSlideEditTextBodyJSONPasteValueFromPackage,
  getSlideEditTextBodyJSONPasteValueFromText as getSlideEditTextBodyJSONPasteValueFromTextFromPackage,
  getSlideEditTextBodyJSONPasteValueFromValue as getSlideEditTextBodyJSONPasteValueFromValueFromPackage,
} from './index'

describe('SlideEditTextBody', () => {
  it('reads custom MIME direct text body JSON values first', () => {
    expect(getSlideEditTextBodyJSONPasteValue({
      dataTransfer: createDataTransfer({
        [SLIDE_EDIT_TEXT_BODY_JSON_MIME_TYPE]: JSON.stringify({
          paragraphs: [
            {
              runs: [
                {
                  text: 'Hello ',
                },
                {
                  text: 'world',
                },
              ],
            },
            ' Second paragraph ',
          ],
        }),
        'application/json':
          '{"textBody":{"text":"Ignored generic wrapper"}}',
      }),
    })).toMatchObject({
      body: {
        paragraphs: [
          {
            runs: [
              {
                text: 'Hello',
              },
              {
                text: 'world',
              },
            ],
            text: 'Helloworld',
          },
          {
            runs: [
              {
                text: 'Second paragraph',
              },
            ],
            text: 'Second paragraph',
          },
        ],
      },
      format: 'json',
      paragraphCount: 2,
      payloadLength: expect.any(Number),
      runCount: 3,
      sourceType: SLIDE_EDIT_TEXT_BODY_JSON_MIME_TYPE,
      surface: 'text-body',
    })

    expect(getSlideEditTextBodyJSONPasteValueFromPackage({
      dataTransfer: createDataTransfer({
        [SLIDE_EDIT_TEXT_BODY_JSON_MIME_TYPE]:
          '{"text":"Package export"}',
      }),
    })).toMatchObject({
      body: {
        paragraphs: [
          {
            text: 'Package export',
          },
        ],
      },
    })
  })

  it('reads wrapped text body payloads from general JSON candidates', () => {
    expect(getSlideEditTextBodyJSONPasteValue({
      dataTransfer: createDataTransfer({
        'application/json': JSON.stringify({
          textBody: {
            plainText: 'Title\nBody',
          },
        }),
      }),
    })).toMatchObject({
      body: {
        paragraphs: [
          {
            text: 'Title',
          },
          {
            text: 'Body',
          },
        ],
      },
      paragraphCount: 2,
      runCount: 2,
      wrapper: 'textBody',
    })

    expect(getSlideEditTextBodyJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/json': JSON.stringify({
          content: {
            text: 'Long text',
          },
        }),
      }),
      storagePolicy: {
        maxParagraphs: 1,
        maxRunsPerParagraph: 1,
        maxTextLength: 4,
      },
    })).toMatchObject({
      body: {
        paragraphs: [
          {
            text: 'Long',
          },
        ],
      },
      wrapper: 'content',
    })
  })

  it('reads text body JSON from text and parsed values', () => {
    const directText = '{"text":"Hello"}'

    expect(getSlideEditTextBodyJSONPasteValueFromText(
      directText,
      { sourceType: 'custom/test' },
    )).toEqual({
      body: {
        paragraphs: [
          {
            runs: [
              {
                text: 'Hello',
              },
            ],
            text: 'Hello',
          },
        ],
      },
      format: 'json',
      paragraphCount: 1,
      payloadLength: directText.length,
      rawBody: {
        text: 'Hello',
      },
      rawPayload: {
        text: 'Hello',
      },
      runCount: 1,
      sourceType: 'custom/test',
      surface: 'text-body',
    })
    expect(getSlideEditTextBodyJSONPasteValueFromValue({
      textBody: {
        plainText: 'Title\nBody',
      },
    }, { mode: 'wrapped', sourceType: 'application/json' })).toMatchObject({
      body: {
        paragraphs: [
          {
            text: 'Title',
          },
          {
            text: 'Body',
          },
        ],
      },
      rawBody: {
        plainText: 'Title\nBody',
      },
      rawPayload: {
        textBody: {
          plainText: 'Title\nBody',
        },
      },
      sourceType: 'application/json',
      wrapper: 'textBody',
    })
    expect(getSlideEditTextBodyJSONPasteValueFromTextFromPackage(
      JSON.stringify({
        content: {
          text: 'Long text',
        },
      }),
      {
        mode: 'wrapped',
        storagePolicy: {
          maxParagraphs: 1,
          maxRunsPerParagraph: 1,
          maxTextLength: 4,
        },
      },
    )).toMatchObject({
      body: {
        paragraphs: [
          {
            text: 'Long',
          },
        ],
      },
      wrapper: 'content',
    })
    expect(getSlideEditTextBodyJSONPasteValueFromValueFromPackage({
      paragraphs: [
        {
          runs: ['Package', ' export'],
        },
      ],
    })).toMatchObject({
      body: {
        paragraphs: [
          {
            runs: [
              {
                text: 'Package',
              },
              {
                text: 'export',
              },
            ],
            text: 'Packageexport',
          },
        ],
      },
      payloadLength: 0,
      sourceType: 'value',
    })
    expect(getSlideEditTextBodyJSONPasteValueFromText(
      '{"paragraphs":["Direct generic text"]}',
      { mode: 'wrapped' },
    )).toBeNull()
  })

  it('passes rich raw paragraph and run fields to host normalizers', () => {
    const richTextBody = {
      paragraphs: [
        {
          align: 'center',
          runs: [
            {
              bold: true,
              color: '#0f172a',
              fontSize: 24,
              link: 'https://example.com',
              text: 'Hello',
            },
            {
              italic: true,
              text: 'World',
            },
          ],
          spacingAfter: 12,
        },
        {
          bullet: 'numbered',
          runs: [
            {
              text: 'Second',
              underline: true,
            },
          ],
        },
      ],
    }
    const rawPayload = {
      textBody: richTextBody,
    }
    const pasteValue = getSlideEditTextBodyJSONPasteValue({
      dataTransfer: createDataTransfer({
        'application/json': JSON.stringify(rawPayload),
      }),
    })!

    expect(pasteValue).toMatchObject({
      body: {
        paragraphs: [
          {
            runs: [
              { text: 'Hello' },
              { text: 'World' },
            ],
            text: 'HelloWorld',
          },
          {
            runs: [
              { text: 'Second' },
            ],
            text: 'Second',
          },
        ],
      },
      paragraphCount: 2,
      rawBody: richTextBody,
      rawPayload,
      runCount: 3,
      wrapper: 'textBody',
    })

    type HostRichTextBody = {
      paragraphs: unknown[]
      plainText: string
    }

    expect(getSlideEditTextBodyPasteCommandEffect<
      'slide-a',
      'text-a',
      HostRichTextBody
    >({
      normalizeBody: ({ body, rawBody }) => {
        const rawRecord = rawBody as { paragraphs?: unknown }

        return Array.isArray(rawRecord.paragraphs)
          ? {
              paragraphs: rawRecord.paragraphs,
              plainText: body.paragraphs
                .map((paragraph) => paragraph.text)
                .join('\n'),
            }
          : null
      },
      pasteValue,
      slideId: 'slide-a',
      target: {
        isTextEditable: true,
        objectId: 'text-a',
      },
    })?.payload.body).toEqual({
      paragraphs: richTextBody.paragraphs,
      plainText: 'HelloWorld\nSecond',
    })
  })

  it('converts text body paste values to replace command effects', () => {
    const pasteValue = getSlideEditTextBodyJSONPasteValue({
      dataTransfer: createDataTransfer({
        'application/json': JSON.stringify({
          plainText: 'Hello',
        }),
      }),
    })!

    expect(getSlideEditTextBodyPasteCommandEffect({
      normalizeBody: ({ body }) => ({
        text: body.paragraphs.map((paragraph) => paragraph.text).join('\n'),
      }),
      pasteValue,
      slideId: 'slide-a',
      target: {
        isTextEditable: true,
        objectId: 'text-a',
      },
    })).toEqual({
      metadata: {
        format: 'json',
        paragraphCount: 1,
        payloadLength: expect.any(Number),
        runCount: 1,
        targetIds: ['text-a'],
      },
      payload: {
        body: {
          text: 'Hello',
        },
        id: 'replace-text-body',
        objectId: 'text-a',
      },
      selection: {
        objectIds: ['text-a'],
        slideId: 'slide-a',
      },
      type: 'slide-command-effect',
    })
  })

  it('ignores unavailable text body paste routes', () => {
    const pasteValue = getSlideEditTextBodyJSONPasteValue({
      dataTransfer: createDataTransfer({
        [SLIDE_EDIT_TEXT_BODY_JSON_MIME_TYPE]:
          '{"text":"Hello"}',
      }),
    })!

    expect(getSlideEditTextBodyPasteCommandEffect({
      pasteValue,
      target: null,
    })).toBeNull()
    expect(getSlideEditTextBodyPasteCommandEffect({
      pasteValue,
      target: {
        isTextEditable: false,
        objectId: 'shape-a',
      },
    })).toBeNull()
    expect(getSlideEditTextBodyPasteCommandEffect({
      pasteValue,
      target: {
        isLocked: true,
        isTextEditable: true,
        objectId: 'text-a',
      },
    })).toBeNull()
    expect(getSlideEditTextBodyPasteCommandEffect({
      normalizeBody: () => null,
      pasteValue,
      target: {
        isTextEditable: true,
        objectId: 'text-a',
      },
    })).toBeNull()
    expect(getSlideEditTextBodyJSONPasteValue({
      dataTransfer: null,
    })).toBeNull()
    expect(getSlideEditTextBodyJSONPasteValue({
      dataTransfer: createDataTransfer({
        'application/json': '{"paragraphs":["Direct generic text"]}',
      }),
    })).toBeNull()
    expect(getSlideEditTextBodyJSONPasteValue({
      dataTransfer: createDataTransfer({
        [SLIDE_EDIT_TEXT_BODY_JSON_MIME_TYPE]: 'not json',
      }),
    })).toBeNull()
  })
})

function createDataTransfer(values: Record<string, string>) {
  return {
    getData: (type: string) => values[type] ?? '',
  }
}
