import { describe, expect, it } from 'vitest'

import {
  createSlideEditColorSwatchPaletteDescriptor,
  getSlideEditColorSwatchCommandEffect,
  getSlideEditColorSwatchId,
  getSlideEditColorWithAlphaCSS,
  normalizeSlideEditColorHex,
  normalizeSlideEditColorSwatchValue,
  SLIDE_EDIT_COLOR_SWATCH_CHANNELS,
  SLIDE_EDIT_COLOR_SWATCH_FIELD,
} from './SlideEditColorSwatchPalette'

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
    expect(normalizeSlideEditColorHex(' #ABC ')).toBe('#aabbcc')
    expect(normalizeSlideEditColorHex('#ABCDEF')).toBe('#abcdef')
    expect(normalizeSlideEditColorHex('currentColor')).toBeNull()
  })

  it('maps hex colors and alpha to CSS color values', () => {
    expect(getSlideEditColorWithAlphaCSS({
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
