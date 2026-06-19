import { describe, expect, it } from 'vitest'

import {
  createSlideEditColorSwatchPaletteDescriptor,
  getSlideEditColorSwatchCommandEffect,
  getSlideEditColorSwatchId,
  getSlideEditColorSwatchJSONPasteValue,
  getSlideEditColorSwatchJSONPasteValueFromText,
  getSlideEditColorSwatchJSONPasteValueFromValue,
  getSlideEditColorSwatchPasteCommandEffects,
  getSlideEditColorWithAlphaCSS,
  normalizeSlideEditColorHex,
  normalizeSlideEditColorSwatchValue,
  SLIDE_EDIT_COLOR_SWATCH_CHANNELS,
  SLIDE_EDIT_COLOR_SWATCH_FIELD,
  SLIDE_EDIT_COLOR_SWATCH_JSON_MIME_TYPE,
} from './SlideEditColorSwatchPalette'
import {
  getSlideEditColorSwatchJSONPasteValue as getSlideEditColorSwatchJSONPasteValueFromPackage,
  getSlideEditColorSwatchJSONPasteValueFromText as getSlideEditColorSwatchJSONPasteValueFromTextFromPackage,
  getSlideEditColorSwatchJSONPasteValueFromValue as getSlideEditColorSwatchJSONPasteValueFromValueFromPackage,
  getSlideEditColorWithAlphaCSS as getSlideEditColorWithAlphaCSSFromPackage,
  normalizeSlideEditColorHex as normalizeSlideEditColorHexFromPackage,
} from './index'

describe('SlideEditColorSwatchPalette', () => {
  const themeColorTokens = [
    {
      label: 'Accent',
      role: 'accent',
      tokenId: 'color-accent',
      value: '#2563eb',
    },
    {
      label: 'Text',
      role: 'text',
      tokenId: 'color-text',
      value: '#111827',
    },
  ] as const

  it('creates theme token and recent color swatches for a channel', () => {
    expect(createSlideEditColorSwatchPaletteDescriptor({
      channel: {
        id: 'fill',
        label: 'Fill',
      },
      objectIds: ['object-a'],
      recentColors: ['#f8fafc', '#111827'],
      selectedTokenId: 'color-accent',
      selectedValue: '#2563eb',
      slideId: 'slide-a',
      themeColorTokens,
    })).toEqual({
      channel: {
        id: 'fill',
        label: 'Fill',
      },
      field: SLIDE_EDIT_COLOR_SWATCH_FIELD,
      objectIds: ['object-a'],
      sections: [
        {
          id: 'theme',
          label: 'Theme',
          swatches: [
            {
              id: 'theme:color-accent',
              label: 'Accent',
              role: 'accent',
              selected: true,
              source: 'theme',
              tokenId: 'color-accent',
              value: '#2563eb',
            },
            {
              id: 'theme:color-text',
              label: 'Text',
              role: 'text',
              selected: false,
              source: 'theme',
              tokenId: 'color-text',
              value: '#111827',
            },
          ],
        },
        {
          id: 'recent',
          label: 'Recent',
          swatches: [
            {
              id: 'recent:#f8fafc',
              label: '#f8fafc',
              selected: false,
              source: 'recent',
              value: '#f8fafc',
            },
            {
              id: 'recent:#111827',
              label: '#111827',
              selected: false,
              source: 'recent',
              value: '#111827',
            },
          ],
        },
      ],
      slideId: 'slide-a',
      state: {
        channelId: 'fill',
        disabledReason: undefined,
        isDisabled: false,
        isMixed: false,
        selectedSwatchId: 'theme:color-accent',
        value: '#2563eb',
      },
      surface: 'color-swatch-palette',
    })
  })

  it('documents built-in color channels and field identity', () => {
    expect(SLIDE_EDIT_COLOR_SWATCH_CHANNELS.map((channel) =>
      channel.id
    )).toEqual([
      'fill',
      'stroke',
      'text',
      'line-stroke',
    ])
    expect(SLIDE_EDIT_COLOR_SWATCH_FIELD).toEqual({
      commandId: 'apply-color-swatch',
      control: 'color-swatch-palette',
      id: 'colorSwatch',
      requiredAdapterSlot: 'command-effect',
    })
  })

  it('normalizes recent swatches and marks recent selections', () => {
    const descriptor = createSlideEditColorSwatchPaletteDescriptor({
      channel: {
        id: 'stroke',
        label: 'Stroke',
      },
      objectIds: ['object-a'],
      recentColors: [' #ffffff ', '#FFFFFF', '', '#000000'],
      selectedSwatchId: 'recent:#000000',
      slideId: 'slide-a',
      themeColorTokens: [],
    })

    expect(descriptor.sections[1].swatches).toEqual([
      {
        id: 'recent:#ffffff',
        label: '#ffffff',
        selected: false,
        source: 'recent',
        value: '#ffffff',
      },
      {
        id: 'recent:#000000',
        label: '#000000',
        selected: true,
        source: 'recent',
        value: '#000000',
      },
    ])
    expect(descriptor.state).toMatchObject({
      selectedSwatchId: 'recent:#000000',
      value: null,
    })
    expect(normalizeSlideEditColorSwatchValue('  #ABCDEF  ')).toBe('#ABCDEF')
  })

  it('normalizes hex colors for shared renderer comparisons', () => {
    expect(normalizeSlideEditColorHexFromPackage(' #ABC ')).toBe('#aabbcc')
    expect(normalizeSlideEditColorHex('#ABCDEF')).toBe('#abcdef')
    expect(normalizeSlideEditColorHex('currentColor')).toBeNull()
  })

  it('maps hex colors and alpha to CSS color values', () => {
    expect(getSlideEditColorWithAlphaCSSFromPackage({
      color: '#abc',
      opacity: 0.335,
    })).toBe('rgb(170 187 204 / 0.34)')
    expect(getSlideEditColorWithAlphaCSS({
      color: '#123456',
      opacity: 2,
    })).toBe('rgb(18 52 86 / 1)')
    expect(getSlideEditColorWithAlphaCSS({
      color: 'color-mix(in srgb, black 40%, transparent)',
      opacity: 0.5,
    })).toBe('color-mix(in srgb, black 40%, transparent)')
  })

  it('expresses mixed and disabled channel state', () => {
    expect(createSlideEditColorSwatchPaletteDescriptor({
      channel: {
        id: 'line-stroke',
        label: 'Line Stroke',
      },
      disabledReason: 'unsupported-channel',
      isDisabled: true,
      isMixed: true,
      objectIds: ['line-a', 'line-b'],
      recentColors: ['#2563eb'],
      selectedValue: '#2563eb',
      slideId: 'slide-a',
      themeColorTokens,
    })).toMatchObject({
      state: {
        channelId: 'line-stroke',
        disabledReason: 'unsupported-channel',
        isDisabled: true,
        isMixed: true,
        selectedSwatchId: undefined,
        value: null,
      },
    })
  })

  it('routes selected swatch application through host command effects', () => {
    expect(getSlideEditColorSwatchCommandEffect({
      channelId: 'text',
      id: 'apply-color-swatch',
      objectIds: ['object-a', 'object-b'],
      slideId: 'slide-a',
      swatch: {
        source: 'theme',
        swatchId: 'theme:color-text',
        tokenId: 'color-text',
        value: ' #111827 ',
      },
    })).toEqual({
      payload: {
        channelId: 'text',
        id: 'apply-color-swatch',
        objectIds: ['object-a', 'object-b'],
        slideId: 'slide-a',
        swatch: {
          source: 'theme',
          swatchId: 'theme:color-text',
          tokenId: 'color-text',
          value: '#111827',
        },
      },
      selection: {
        objectIds: ['object-a', 'object-b'],
        slideId: 'slide-a',
      },
      type: 'slide-command-effect',
    })
  })

  it('reads custom MIME direct color swatch JSON values first', () => {
    expect(getSlideEditColorSwatchJSONPasteValue({
      dataTransfer: createDataTransfer({
        [SLIDE_EDIT_COLOR_SWATCH_JSON_MIME_TYPE]: JSON.stringify({
          channel: 'text-color',
          source: 'theme',
          swatchId: 'theme:color-text',
          tokenId: 'color-text',
          value: ' #111827 ',
        }),
        'application/json':
          '{"colorSwatch":{"color":"#ffffff","channel":"fill"}}',
      }),
    })).toEqual({
      channelId: 'text',
      source: 'theme',
      swatchId: 'theme:color-text',
      tokenId: 'color-text',
      value: '#111827',
    })
    expect(getSlideEditColorSwatchJSONPasteValueFromPackage({
      dataTransfer: createDataTransfer({
        [SLIDE_EDIT_COLOR_SWATCH_JSON_MIME_TYPE]: '"#ABC"',
      }),
    })).toEqual({
      channelId: null,
      source: 'recent',
      swatchId: 'recent:#aabbcc',
      value: '#aabbcc',
    })
  })

  it('reads wrapped and explicit color swatch JSON candidates', () => {
    expect(getSlideEditColorSwatchJSONPasteValue({
      dataTransfer: createDataTransfer({
        'application/json':
          '{"colorSwatch":{"hex":"#ABC","channel":"shape-fill"}}',
      }),
    })).toEqual({
      channelId: 'fill',
      source: 'recent',
      swatchId: 'recent:#aabbcc',
      value: '#aabbcc',
    })
    expect(getSlideEditColorSwatchJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/json':
          '{"swatch":{"value":"#123456","source":"theme","tokenId":"color-accent"}}',
      }),
    })).toEqual({
      channelId: null,
      source: 'theme',
      swatchId: 'theme:color-accent',
      tokenId: 'color-accent',
      value: '#123456',
    })
    expect(getSlideEditColorSwatchJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/plain': '{"color":"#0f0","channel":"line"}',
      }),
    })).toEqual({
      channelId: 'line-stroke',
      source: 'recent',
      swatchId: 'recent:#00ff00',
      value: '#00ff00',
    })
  })

  it('reads color swatch JSON from text and parsed values', () => {
    expect(getSlideEditColorSwatchJSONPasteValueFromText('"#ABC"'))
      .toEqual({
        channelId: null,
        source: 'recent',
        swatchId: 'recent:#aabbcc',
        value: '#aabbcc',
      })
    expect(getSlideEditColorSwatchJSONPasteValueFromValue({
      color: '#fff',
    }, { mode: 'direct-with-channel' })).toBeNull()
    expect(getSlideEditColorSwatchJSONPasteValueFromValue({
      color: '#fff',
      channel: 'shape-stroke',
    }, { mode: 'direct-with-channel' })).toEqual({
      channelId: 'stroke',
      source: 'recent',
      swatchId: 'recent:#ffffff',
      value: '#ffffff',
    })
    expect(getSlideEditColorSwatchJSONPasteValueFromTextFromPackage(
      '{"colorSwatch":{"hex":"#ABC","channel":"shape-fill"}}',
      { mode: 'wrapped' },
    )).toEqual({
      channelId: 'fill',
      source: 'recent',
      swatchId: 'recent:#aabbcc',
      value: '#aabbcc',
    })
    expect(getSlideEditColorSwatchJSONPasteValueFromValueFromPackage({
      swatch: {
        source: 'theme',
        tokenId: 'color-accent',
        value: '#123456',
      },
    }, { mode: 'wrapped' })).toEqual({
      channelId: null,
      source: 'theme',
      swatchId: 'theme:color-accent',
      tokenId: 'color-accent',
      value: '#123456',
    })
  })

  it('converts color swatch paste values into host command effects', () => {
    const pasteValue = getSlideEditColorSwatchJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/json':
          '{"swatch":{"value":"#111827","source":"theme","tokenId":"color-text"}}',
      }),
    })
    const result = getSlideEditColorSwatchPasteCommandEffects({
      isChannelSupported: ({ target }) => target.objectId !== 'policy-a',
      pasteValue: pasteValue!,
      slideId: 'slide-a',
      targets: [
        {
          defaultChannelId: 'text',
          objectId: 'text-a',
          supportedChannelIds: ['text'],
        },
        {
          defaultChannelId: 'fill',
          objectId: 'shape-a',
          supportedChannelIds: ['fill', 'stroke'],
        },
        {
          defaultChannelId: 'fill',
          isLocked: true,
          objectId: 'locked-a',
        },
        {
          defaultChannelId: 'fill',
          isHidden: true,
          objectId: 'hidden-a',
        },
        {
          defaultChannelId: 'line-stroke',
          objectId: 'line-a',
          supportedChannelIds: ['stroke'],
        },
        {
          objectId: 'missing-a',
        },
        {
          defaultChannelId: 'fill',
          objectId: 'policy-a',
          supportedChannelIds: ['fill'],
        },
      ],
    })

    expect(result.effects).toEqual([
      {
        payload: {
          channelId: 'text',
          id: 'apply-color-swatch',
          objectIds: ['text-a'],
          slideId: 'slide-a',
          swatch: {
            source: 'theme',
            swatchId: 'theme:color-text',
            tokenId: 'color-text',
            value: '#111827',
          },
        },
        selection: {
          objectIds: ['text-a'],
          slideId: 'slide-a',
        },
        type: 'slide-command-effect',
      },
      {
        payload: {
          channelId: 'fill',
          id: 'apply-color-swatch',
          objectIds: ['shape-a'],
          slideId: 'slide-a',
          swatch: {
            source: 'theme',
            swatchId: 'theme:color-text',
            tokenId: 'color-text',
            value: '#111827',
          },
        },
        selection: {
          objectIds: ['shape-a'],
          slideId: 'slide-a',
        },
        type: 'slide-command-effect',
      },
    ])
    expect(result.appliedTargets).toEqual([
      {
        channelId: 'text',
        commandId: 'apply-color-swatch',
        effectType: 'slide-command-effect',
        objectId: 'text-a',
        source: 'theme',
        swatchId: 'theme:color-text',
        tokenId: 'color-text',
        value: '#111827',
      },
      {
        channelId: 'fill',
        commandId: 'apply-color-swatch',
        effectType: 'slide-command-effect',
        objectId: 'shape-a',
        source: 'theme',
        swatchId: 'theme:color-text',
        tokenId: 'color-text',
        value: '#111827',
      },
    ])
    expect(result.skippedTargets).toEqual([
      {
        objectId: 'locked-a',
        reason: 'locked-target',
      },
      {
        objectId: 'hidden-a',
        reason: 'hidden-target',
      },
      {
        channelId: 'line-stroke',
        objectId: 'line-a',
        reason: 'unsupported-channel',
      },
      {
        objectId: 'missing-a',
        reason: 'missing-channel',
      },
      {
        channelId: 'fill',
        objectId: 'policy-a',
        reason: 'unsupported-channel',
      },
    ])
  })

  it('uses explicit paste channels before target default channels', () => {
    const pasteValue = getSlideEditColorSwatchJSONPasteValue({
      dataTransfer: createDataTransfer({
        'application/json': '{"color":"#fff","channel":"shape-stroke"}',
      }),
    })

    expect(getSlideEditColorSwatchPasteCommandEffects({
      pasteValue: pasteValue!,
      slideId: 'slide-a',
      targets: [
        {
          defaultChannelId: 'fill',
          objectId: 'shape-a',
          supportedChannelIds: ['fill', 'stroke'],
        },
        {
          defaultChannelId: 'text',
          objectId: 'text-a',
          supportedChannelIds: ['text'],
        },
      ],
    })).toMatchObject({
      appliedTargets: [
        {
          channelId: 'stroke',
          objectId: 'shape-a',
          value: '#ffffff',
        },
      ],
      skippedTargets: [
        {
          channelId: 'stroke',
          objectId: 'text-a',
          reason: 'unsupported-channel',
        },
      ],
    })
  })

  it('ignores invalid, unrelated, and unsafe color swatch JSON candidates', () => {
    expect(getSlideEditColorSwatchJSONPasteValue({
      dataTransfer: null,
    })).toBeNull()
    expect(getSlideEditColorSwatchJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/plain': '#fff',
      }),
    })).toBeNull()
    expect(getSlideEditColorSwatchJSONPasteValue({
      dataTransfer: createDataTransfer({
        'application/json': '"#fff"',
      }),
    })).toBeNull()
    expect(getSlideEditColorSwatchJSONPasteValue({
      dataTransfer: createDataTransfer({
        'application/json': '{"color":"#fff"}',
      }),
    })).toBeNull()
    expect(getSlideEditColorSwatchJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/json': '{"color":"#fff","channel":"background"}',
      }),
    })).toBeNull()
    expect(getSlideEditColorSwatchJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/plain': '{"colorSwatch":{"color":18,"channel":"fill"}}',
      }),
    })).toBeNull()
    expect(getSlideEditColorSwatchJSONPasteValue({
      dataTransfer: createDataTransfer({
        [SLIDE_EDIT_COLOR_SWATCH_JSON_MIME_TYPE]: 'not json',
      }),
    })).toBeNull()
  })

  it('does not expose product model names or raw color input coupling', () => {
    const publicStrings = JSON.stringify({
      descriptor: createSlideEditColorSwatchPaletteDescriptor({
        channel: {
          id: 'fill',
          label: 'Fill',
        },
        objectIds: ['object-a'],
        recentColors: ['#ffffff'],
        slideId: 'slide-a',
        themeColorTokens,
      }),
      swatchId: getSlideEditColorSwatchId({
        source: 'theme',
        tokenId: 'color-accent',
        value: '#2563eb',
      }),
    }).toLowerCase()

    for (const blockedTerm of [
      'canvasitem',
      'engine-shape',
      'raw-color',
      'color-input',
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
    getData(type: string) {
      return values[type] ?? ''
    },
  }
}
