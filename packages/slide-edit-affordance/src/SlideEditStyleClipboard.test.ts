import { describe, expect, it } from 'vitest'

import {
  createSlideEditStyleClipboardDescriptor,
  createSlideEditStyleClipboardPasteCommandEffect,
  getSlideEditStyleClipboardCategoryDescriptors,
  getSlideEditStyleClipboardCategoryIds,
  getSlideEditStyleClipboardCopyCommandEffect,
  getSlideEditStyleClipboardKeyboardIntent,
  getSlideEditStyleClipboardPasteAvailability,
  SLIDE_EDIT_STYLE_CLIPBOARD_BUILT_IN_CATEGORIES,
} from './SlideEditStyleClipboard'

type TestCategoryId =
  | 'object-effect'
  | 'shape-fill'
  | 'shape-stroke'
  | 'text-style'

type TestStyle = {
  token: string
}

function createClipboard() {
  return createSlideEditStyleClipboardDescriptor<
    string,
    string,
    'shape',
    TestCategoryId,
    TestStyle
  >({
    categories: [
      {
        id: 'shape-fill',
        label: 'Shape Fill',
      },
      {
        id: 'shape-stroke',
        label: 'Shape Stroke',
      },
      {
        id: 'text-style',
        label: 'Text Style',
      },
      {
        id: 'shape-fill',
        label: 'Duplicate Shape Fill',
      },
    ],
    source: {
      kind: 'shape',
      objectId: 'source-card',
      slideId: 'slide-a',
    },
    styles: [
      {
        categoryId: 'shape-fill',
        value: {
          token: 'accent',
        },
      },
      {
        categoryId: 'object-effect',
        value: {
          token: 'shadow',
        },
      },
    ],
  })
}

describe('SlideEditStyleClipboard', () => {
  it('creates a source style clipboard with source kind and category list', () => {
    const clipboard = createClipboard()

    expect(clipboard).toEqual({
      categories: [
        {
          id: 'shape-fill',
          label: 'Shape Fill',
        },
        {
          id: 'shape-stroke',
          label: 'Shape Stroke',
        },
        {
          id: 'text-style',
          label: 'Text Style',
        },
      ],
      source: {
        kind: 'shape',
        objectId: 'source-card',
        slideId: 'slide-a',
      },
      styles: [
        {
          categoryId: 'shape-fill',
          value: {
            token: 'accent',
          },
        },
      ],
      type: 'slide-style-clipboard',
    })
    expect(getSlideEditStyleClipboardCategoryIds(clipboard)).toEqual([
      'shape-fill',
      'shape-stroke',
      'text-style',
    ])
  })

  it('documents built-in style categories without closing the category set', () => {
    expect(SLIDE_EDIT_STYLE_CLIPBOARD_BUILT_IN_CATEGORIES.map((category) =>
      category.id
    )).toEqual([
      'shape-fill',
      'shape-stroke',
      'line-style',
      'text-style',
      'object-effect',
    ])
  })

  it('selects built-in category descriptors from category ids in registry order', () => {
    expect(getSlideEditStyleClipboardCategoryDescriptors({
      categoryIds: ['text-style', 'shape-fill', 'text-style'],
    })).toEqual([
      {
        id: 'shape-fill',
        label: 'Shape Fill',
      },
      {
        id: 'text-style',
        label: 'Text Style',
      },
    ])
  })

  it('selects custom category descriptors and ignores unknown ids', () => {
    expect(getSlideEditStyleClipboardCategoryDescriptors({
      categoryIds: ['custom-fill', 'unknown', 'custom-fill'],
      registry: [
        {
          id: 'custom-fill',
          label: 'Custom Fill',
        },
        {
          id: 'custom-stroke',
          label: 'Custom Stroke',
        },
        {
          id: 'custom-fill',
          label: 'Duplicate Custom Fill',
        },
      ],
    })).toEqual([
      {
        id: 'custom-fill',
        label: 'Custom Fill',
      },
    ])
  })

  it('routes copy formatting intent through a host command effect', () => {
    expect(getSlideEditStyleClipboardCopyCommandEffect(createClipboard()))
      .toMatchObject({
        payload: {
          id: 'copy-object-formatting',
          clipboard: {
            source: {
              objectId: 'source-card',
              slideId: 'slide-a',
            },
          },
        },
        selection: {
          objectIds: ['source-card'],
          slideId: 'slide-a',
        },
        type: 'slide-command-effect',
      })
  })

  it('maps style clipboard keyboard shortcuts to formatting intents', () => {
    expect(getSlideEditStyleClipboardKeyboardIntent({
      event: { shiftKey: true },
      key: 'C',
      mod: true,
    })).toEqual({
      commandId: 'copy-object-formatting',
      kind: 'copy-formatting',
      preventDefault: true,
      shortcut: 'Shift+Cmd/Ctrl+C',
    })

    expect(getSlideEditStyleClipboardKeyboardIntent({
      event: { shiftKey: true },
      key: 'v',
      mod: true,
    })).toEqual({
      commandId: 'paste-object-formatting',
      kind: 'paste-formatting',
      preventDefault: true,
      shortcut: 'Shift+Cmd/Ctrl+V',
    })

    expect(getSlideEditStyleClipboardKeyboardIntent({
      event: { shiftKey: false },
      key: 'c',
      mod: true,
    })).toBeNull()
    expect(getSlideEditStyleClipboardKeyboardIntent({
      event: { shiftKey: true },
      key: 'c',
      mod: false,
    })).toBeNull()
    expect(getSlideEditStyleClipboardKeyboardIntent({
      event: { shiftKey: true },
      key: 'x',
      mod: true,
    })).toBeNull()
  })

  it('describes per-target paste formatting applicability', () => {
    const availability = getSlideEditStyleClipboardPasteAvailability({
      clipboard: createClipboard(),
      targets: [
        {
          objectId: 'target-shape',
          supportedCategoryIds: ['shape-fill', 'shape-stroke'],
        },
        {
          objectId: 'target-text',
          supportedCategoryIds: ['text-style'],
        },
        {
          objectId: 'target-line',
          supportedCategoryIds: [],
        },
      ],
    })

    expect(availability).toEqual({
      canPaste: true,
      disabledReason: undefined,
      source: {
        kind: 'shape',
        objectId: 'source-card',
        slideId: 'slide-a',
      },
      targetObjectIds: ['target-shape', 'target-text', 'target-line'],
      targets: [
        {
          applicableCategoryIds: ['shape-fill', 'shape-stroke'],
          disabledReason: undefined,
          ignoredCategoryIds: ['text-style'],
          isSupported: true,
          objectId: 'target-shape',
        },
        {
          applicableCategoryIds: ['text-style'],
          disabledReason: undefined,
          ignoredCategoryIds: ['shape-fill', 'shape-stroke'],
          isSupported: true,
          objectId: 'target-text',
        },
        {
          applicableCategoryIds: [],
          disabledReason: 'no-compatible-categories',
          ignoredCategoryIds: ['shape-fill', 'shape-stroke', 'text-style'],
          isSupported: false,
          objectId: 'target-line',
        },
      ],
    })
  })

  it('creates paste formatting effects with category-level partial apply', () => {
    expect(createSlideEditStyleClipboardPasteCommandEffect({
      clipboard: createClipboard(),
      targetSlideId: 'slide-b',
      targets: [
        {
          objectId: 'target-shape',
          supportedCategoryIds: ['shape-fill'],
        },
        {
          objectId: 'target-text',
          supportedCategoryIds: ['text-style'],
        },
      ],
    })).toMatchObject({
      payload: {
        categoryApplications: [
          {
            appliedCategoryIds: ['shape-fill'],
            ignoredCategoryIds: ['shape-stroke', 'text-style'],
            objectId: 'target-shape',
          },
          {
            appliedCategoryIds: ['text-style'],
            ignoredCategoryIds: ['shape-fill', 'shape-stroke'],
            objectId: 'target-text',
          },
        ],
        id: 'paste-object-formatting',
        targetObjectIds: ['target-shape', 'target-text'],
        targetSlideId: 'slide-b',
      },
      selection: {
        objectIds: ['target-shape', 'target-text'],
        slideId: 'slide-b',
      },
      type: 'slide-command-effect',
    })
  })

  it('returns null when paste formatting has no compatible target', () => {
    expect(createSlideEditStyleClipboardPasteCommandEffect({
      clipboard: createClipboard(),
      targetSlideId: 'slide-b',
      targets: [
        {
          objectId: 'target-line',
          supportedCategoryIds: ['object-effect'],
        },
      ],
    })).toBeNull()
    expect(createSlideEditStyleClipboardPasteCommandEffect({
      clipboard: createSlideEditStyleClipboardDescriptor({
        categories: [],
        source: {
          kind: 'shape',
          objectId: 'source-card',
          slideId: 'slide-a',
        },
      }),
      targetSlideId: 'slide-b',
      targets: [
        {
          objectId: 'target-shape',
          supportedCategoryIds: ['shape-fill'],
        },
      ],
    })).toBeNull()
  })

  it('does not reuse content clipboard or product model terms', () => {
    const publicStrings = JSON.stringify({
      clipboard: createClipboard(),
      effect: createSlideEditStyleClipboardPasteCommandEffect({
        clipboard: createClipboard(),
        targetSlideId: 'slide-b',
        targets: [
          {
            objectId: 'target-shape',
            supportedCategoryIds: ['shape-fill'],
          },
        ],
      }),
    }).toLowerCase()

    for (const blockedTerm of [
      'canvasitem',
      'engine-shape',
      'paste-slide-objects',
      'slide-object-clipboard',
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
