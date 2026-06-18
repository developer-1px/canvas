import { describe, expect, it } from 'vitest'

import {
  createSlideEditLayoutPlaceholderDescriptor,
  createSlideEditThemeDescriptor,
  getSlideEditLayoutApplyCommandEffect,
  getSlideEditLayoutJSONPasteCommandEffects,
  getSlideEditLayoutJSONPasteValue,
  getSlideEditLayoutPlaceholderVisibilityCommandEffect,
  getSlideEditLayoutPlaceholderVisibilityDescriptor,
  getSlideEditResolvedLayoutPlaceholder,
  SLIDE_EDIT_LAYOUT_COMMANDS,
  SLIDE_EDIT_LAYOUT_JSON_MIME_TYPE,
  type SlideEditLayoutDescriptor,
  type SlideEditLayoutPlaceholderDescriptor,
  type SlideEditMasterDescriptor,
} from './SlideEditLayoutTheme'
import {
  getSlideEditLayoutPlaceholderVisibilityCommandEffect as getSlideEditLayoutPlaceholderVisibilityCommandEffectFromPackage,
  getSlideEditLayoutJSONPasteValue as getSlideEditLayoutJSONPasteValueFromPackage,
} from './index'

describe('SlideEditLayoutTheme', () => {
  const theme = createSlideEditThemeDescriptor({
    colorTokens: [
      {
        label: 'Canvas background',
        role: 'background',
        tokenId: 'color-background',
        value: '#ffffff',
      },
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
    ],
    defaultStyle: {
      colorTokenIds: {
        background: 'color-background',
        text: 'color-text',
      },
      fontTokenIds: {
        body: 'font-body',
      },
      spacingTokenIds: {
        margin: 'space-slide-margin',
      },
    },
    fontTokens: [
      {
        family: 'Inter',
        label: 'Body',
        role: 'body',
        size: 18,
        tokenId: 'font-body',
        weight: 500,
      },
      {
        family: 'Inter Display',
        label: 'Heading',
        role: 'heading',
        size: 42,
        tokenId: 'font-heading',
        weight: 700,
      },
    ],
    name: 'Default theme',
    spacingTokens: [
      {
        label: 'Slide margin',
        role: 'slide-margin',
        tokenId: 'space-slide-margin',
        value: 48,
      },
      {
        label: 'Object gap',
        role: 'object-gap',
        tokenId: 'space-object-gap',
        value: 24,
      },
    ],
    themeId: 'theme-a',
  })

  const master: SlideEditMasterDescriptor<
    'master-a',
    'theme-a',
    'layout-title-body',
    'color-background' | 'color-accent' | 'color-text',
    'font-body' | 'font-heading',
    'space-object-gap' | 'space-slide-margin'
  > = {
    defaultStyle: {
      colorTokenIds: {
        fill: 'color-background',
      },
    },
    layoutIds: ['layout-title-body'],
    masterId: 'master-a',
    name: 'Title master',
    themeId: 'theme-a',
  }

  const titlePlaceholder: SlideEditLayoutPlaceholderDescriptor<
    'title-slot',
    'color-background' | 'color-accent' | 'color-text',
    'font-body' | 'font-heading',
    'space-object-gap' | 'space-slide-margin'
  > = createSlideEditLayoutPlaceholderDescriptor({
    defaultBounds: {
      h: 96,
      w: 920,
      x: 80,
      y: 64,
    },
    defaultStyle: {
      colorTokenIds: {
        text: 'color-accent',
      },
      fontTokenIds: {
        heading: 'font-heading',
      },
    },
    placeholderId: 'title-slot',
    role: 'title',
    title: 'Title',
  })

  const layout: SlideEditLayoutDescriptor<
    'layout-title-body',
    'master-a',
    'body-slot' | 'title-slot',
    'color-background' | 'color-accent' | 'color-text',
    'font-body' | 'font-heading',
    'space-object-gap' | 'space-slide-margin'
  > = {
    defaultStyle: {
      spacingTokenIds: {
        gap: 'space-object-gap',
      },
    },
    layoutId: 'layout-title-body',
    masterId: 'master-a',
    name: 'Title and body',
    placeholders: [
      titlePlaceholder,
      createSlideEditLayoutPlaceholderDescriptor({
        defaultBounds: {
          h: 360,
          w: 920,
          x: 80,
          y: 192,
        },
        isLocked: true,
        isVisible: false,
        placeholderId: 'body-slot',
        role: 'body',
        title: 'Body',
      }),
    ],
  }

  it('describes theme color, font, and spacing tokens independently of a product model', () => {
    expect(theme.colorTokens.map((token) => token.role)).toEqual([
      'background',
      'accent',
      'text',
    ])
    expect(theme.fontTokens.map((token) => token.role)).toEqual([
      'body',
      'heading',
    ])
    expect(theme.spacingTokens.map((token) => token.role)).toEqual([
      'slide-margin',
      'object-gap',
    ])
  })

  it('resolves layout placeholder bounds and inherited style token references', () => {
    expect(getSlideEditResolvedLayoutPlaceholder({
      layout,
      master,
      placeholder: titlePlaceholder,
      theme,
    })).toEqual({
      bounds: {
        h: 96,
        w: 920,
        x: 80,
        y: 64,
      },
      inheritedStyle: {
        colorTokenIds: {
          background: 'color-background',
          fill: 'color-background',
          text: 'color-accent',
        },
        fontTokenIds: {
          body: 'font-body',
          heading: 'font-heading',
        },
        spacingTokenIds: {
          gap: 'space-object-gap',
          margin: 'space-slide-margin',
        },
      },
      isLocked: false,
      isVisible: true,
      layoutId: 'layout-title-body',
      masterId: 'master-a',
      placeholderId: 'title-slot',
      role: 'title',
      styleSourceIds: {
        layoutId: 'layout-title-body',
        masterId: 'master-a',
        placeholderId: 'title-slot',
        themeId: 'theme-a',
      },
      title: 'Title',
    })
  })

  it('projects layout placeholders into the shared placeholder visibility descriptor', () => {
    expect(getSlideEditLayoutPlaceholderVisibilityDescriptor({
      placeholder: layout.placeholders[1],
      slideId: 'slide-a',
    })).toEqual({
      bounds: {
        h: 360,
        w: 920,
        x: 80,
        y: 192,
      },
      isLocked: true,
      isVisible: false,
      placeholderId: 'body-slot',
      role: 'body',
      slideId: 'slide-a',
      title: 'Body',
    })
  })

  it('lets the host choose whether applying a layout preserves or maps existing objects', () => {
    expect(getSlideEditLayoutApplyCommandEffect({
      existingObjectPolicy: 'map-existing-objects-to-placeholders',
      layoutId: 'layout-title-body',
      objectMappings: [
        {
          boundsSource: 'layout-placeholder',
          objectId: 'object-title',
          placeholderId: 'title-slot',
        },
      ],
      selectedObjectIds: ['object-title'],
      slideId: 'slide-a',
    })).toEqual({
      payload: {
        existingObjectPolicy: 'map-existing-objects-to-placeholders',
        id: 'apply-layout',
        layoutId: 'layout-title-body',
        objectMappings: [
          {
            boundsSource: 'layout-placeholder',
            objectId: 'object-title',
            placeholderId: 'title-slot',
          },
        ],
      },
      selection: {
        objectIds: ['object-title'],
        slideId: 'slide-a',
      },
      type: 'slide-command-effect',
    })

    expect(getSlideEditLayoutApplyCommandEffect({
      existingObjectPolicy: 'preserve-existing-objects',
      layoutId: 'layout-title-body',
      slideId: 'slide-a',
    }).payload.objectMappings).toEqual([])
  })

  it('reads layout placeholder custom MIME JSON values first', () => {
    expect(getSlideEditLayoutJSONPasteValue({
      dataTransfer: createDataTransfer({
        [SLIDE_EDIT_LAYOUT_JSON_MIME_TYPE]: JSON.stringify({
          hiddenPlaceholderIds: [' body-slot '],
          layoutId: ' layout-title-body ',
          themeId: ' theme-a ',
          visiblePlaceholderIds: ['title-slot'],
        }),
        'application/json': '{"layoutId":"ignored-layout"}',
      }),
    })).toEqual({
      layoutId: 'layout-title-body',
      placeholderVisibility: [
        {
          isVisible: false,
          placeholderId: 'body-slot',
          sourceField: 'hiddenPlaceholderIds',
        },
        {
          isVisible: true,
          placeholderId: 'title-slot',
          sourceField: 'visiblePlaceholderIds',
        },
      ],
      surface: 'layout-placeholder',
      themeId: 'theme-a',
    })

    expect(getSlideEditLayoutJSONPasteValueFromPackage({
      dataTransfer: createDataTransfer({
        [SLIDE_EDIT_LAYOUT_JSON_MIME_TYPE]:
          '{"layoutId":"layout-title-body"}',
      }),
    })).toMatchObject({
      layoutId: 'layout-title-body',
      surface: 'layout-placeholder',
    })
  })

  it('reads wrapped placeholder visibility object and array payloads', () => {
    expect(getSlideEditLayoutJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/json': JSON.stringify({
          layoutPlaceholder: {
            placeholderVisibility: {
              'body-slot': false,
              'title-slot': true,
            },
          },
        }),
      }),
    })).toEqual({
      placeholderVisibility: [
        {
          isVisible: false,
          placeholderId: 'body-slot',
          sourceField: 'placeholderVisibility.body-slot',
        },
        {
          isVisible: true,
          placeholderId: 'title-slot',
          sourceField: 'placeholderVisibility.title-slot',
        },
      ],
      surface: 'layout-placeholder',
    })

    expect(getSlideEditLayoutJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/plain': JSON.stringify({
          placeholderLayout: {
            placeholderVisibility: [
              {
                isVisible: false,
                placeholderId: 'body-slot',
              },
              {
                id: 'title-slot',
                visible: true,
              },
            ],
          },
        }),
      }),
    })).toMatchObject({
      placeholderVisibility: [
        {
          isVisible: false,
          placeholderId: 'body-slot',
        },
        {
          isVisible: true,
          placeholderId: 'title-slot',
        },
      ],
    })
  })

  it('plans layout apply and filtered placeholder visibility command effects', () => {
    const pasteValue = getSlideEditLayoutJSONPasteValue({
      dataTransfer: createDataTransfer({
        'application/json': JSON.stringify({
          hiddenPlaceholderIds: ['body-slot', 'unknown-slot'],
          layoutId: 'layout-title-body',
          themeId: 'theme-a',
          visiblePlaceholderIds: ['title-slot'],
        }),
      }),
    })!

    expect(getSlideEditLayoutJSONPasteCommandEffects({
      existingObjectPolicy: 'map-existing-objects-to-placeholders',
      layouts: [layout],
      objectMappings: [
        {
          boundsSource: 'layout-placeholder',
          objectId: 'object-title',
          placeholderId: 'title-slot',
        },
      ],
      pasteValue,
      selectedObjectIds: ['object-title'],
      slideId: 'slide-a',
      themes: [theme],
    })).toEqual({
      applyLayoutEffect: {
        payload: {
          existingObjectPolicy: 'map-existing-objects-to-placeholders',
          id: 'apply-layout',
          layoutId: 'layout-title-body',
          objectMappings: [
            {
              boundsSource: 'layout-placeholder',
              objectId: 'object-title',
              placeholderId: 'title-slot',
            },
          ],
        },
        selection: {
          objectIds: ['object-title'],
          slideId: 'slide-a',
        },
        type: 'slide-command-effect',
      },
      placeholderVisibilityEffects: [
        {
          payload: {
            id: 'set-placeholder-visibility',
            isVisible: false,
            placeholderId: 'body-slot',
          },
          selection: {
            placeholderIds: ['body-slot'],
            slideId: 'slide-a',
          },
          type: 'slide-command-effect',
        },
        {
          payload: {
            id: 'set-placeholder-visibility',
            isVisible: true,
            placeholderId: 'title-slot',
          },
          selection: {
            placeholderIds: ['title-slot'],
            slideId: 'slide-a',
          },
          type: 'slide-command-effect',
        },
      ],
      themeId: 'theme-a',
    })
  })

  it('creates single placeholder visibility command effects', () => {
    const effect = getSlideEditLayoutPlaceholderVisibilityCommandEffect({
      isVisible: false,
      placeholderId: 'body-slot',
      slideId: 'slide-a',
    })

    expect(effect).toEqual({
      payload: {
        id: 'set-placeholder-visibility',
        isVisible: false,
        placeholderId: 'body-slot',
      },
      selection: {
        placeholderIds: ['body-slot'],
        slideId: 'slide-a',
      },
      type: 'slide-command-effect',
    })
    expect(getSlideEditLayoutPlaceholderVisibilityCommandEffectFromPackage({
      isVisible: true,
      placeholderId: 'title-slot',
      slideId: 'slide-a',
    })).toEqual({
      payload: {
        id: 'set-placeholder-visibility',
        isVisible: true,
        placeholderId: 'title-slot',
      },
      selection: {
        placeholderIds: ['title-slot'],
        slideId: 'slide-a',
      },
      type: 'slide-command-effect',
    })
    expect(getSlideEditLayoutJSONPasteCommandEffects({
      layouts: [layout],
      pasteValue: {
        placeholderVisibility: [{
          isVisible: false,
          placeholderId: 'body-slot',
          sourceField: 'hiddenPlaceholderIds',
        }],
        surface: 'layout-placeholder',
      },
      slideId: 'slide-a',
      themes: [theme],
    })?.placeholderVisibilityEffects).toEqual([effect])
  })

  it('filters unknown layout theme and placeholder ids from paste planning', () => {
    expect(getSlideEditLayoutJSONPasteCommandEffects({
      layouts: [layout],
      pasteValue: {
        layoutId: 'missing-layout',
        placeholderVisibility: [
          {
            isVisible: false,
            placeholderId: 'missing-slot',
            sourceField: 'hiddenPlaceholderIds',
          },
        ],
        surface: 'layout-placeholder',
        themeId: 'missing-theme',
      },
      slideId: 'slide-a',
      themes: [theme],
    })).toBeNull()

    expect(getSlideEditLayoutJSONPasteValue({
      dataTransfer: null,
    })).toBeNull()
    expect(getSlideEditLayoutJSONPasteValue({
      dataTransfer: createDataTransfer({
        'application/json': '{"notLayout":true}',
      }),
    })).toBeNull()
    expect(getSlideEditLayoutJSONPasteValue({
      dataTransfer: createDataTransfer({
        [SLIDE_EDIT_LAYOUT_JSON_MIME_TYPE]: 'not json',
      }),
    })).toBeNull()
  })

  it('defines layout command descriptors as host command effects', () => {
    expect(SLIDE_EDIT_LAYOUT_COMMANDS).toEqual([
      {
        id: 'apply-layout',
        requiredAdapterSlot: 'command-effect',
      },
      {
        id: 'set-placeholder-visibility',
        requiredAdapterSlot: 'command-effect',
      },
    ])
  })

  it('keeps public layout/theme runtime contracts format-neutral', () => {
    const blockedTerms = ['p' + 'ptx', 'google' + ' slides', 'fig' + 'slide']
    const contractStrings = JSON.stringify({
      commands: SLIDE_EDIT_LAYOUT_COMMANDS,
      layout,
      master,
      theme,
    }).toLowerCase()

    for (const blockedTerm of blockedTerms) {
      expect(contractStrings).not.toContain(blockedTerm)
    }
  })
})

function createDataTransfer(values: Record<string, string>) {
  return {
    getData: (type: string) => values[type] ?? '',
  }
}
