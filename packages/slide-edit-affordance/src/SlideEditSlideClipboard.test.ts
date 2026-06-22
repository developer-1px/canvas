import { describe, expect, it } from 'vitest'

import {
  createCanvasRichClipboardHTML,
  readCanvasRichClipboardFromDataTransfer,
  stringifyCanvasRichClipboardPayload,
  type CanvasRichClipboardDataTransfer,
} from '@interactive-os/canvas/app'
import { SLIDE_EDIT_RAIL_COMMANDS } from './SlideEditRailInteractions'
import {
  createSlideEditSlideClipboardPasteCommandEffect,
  createSlideEditSlideClipboardPastePlan,
  createSlideEditSlideClipboardPayload,
  mapSlideEditSlideClipboardPasteSlides,
  parseSlideEditSlideClipboardPayload,
  resolveSlideEditSlideClipboardPastePlacement,
  SLIDE_EDIT_SLIDE_CLIPBOARD_HTML_SCRIPT_ATTRIBUTE,
  SLIDE_EDIT_SLIDE_CLIPBOARD_MIME_TYPE,
  type SlideEditSlideClipboardRemapPolicy,
} from './SlideEditSlideClipboard'

type HostObject = {
  id: string
  kind: 'image' | 'shape'
}

type HostSlide = {
  id: string
  objects: readonly HostObject[]
  title: string
}

describe('SlideEditSlideClipboard', () => {
  const slides: HostSlide[] = [
    {
      id: 'slide-a',
      objects: [
        { id: 'title', kind: 'shape' },
        { id: 'logo', kind: 'image' },
      ],
      title: 'Intro',
    },
    {
      id: 'slide-b',
      objects: [
        { id: 'chart', kind: 'image' },
      ],
      title: 'Metrics',
    },
  ]
  const remapPolicy: SlideEditSlideClipboardRemapPolicy<
    string,
    string,
    HostSlide
  > = {
    createObjectId: ({
      sourceObjectId,
      targetSlideId,
    }) => `${targetSlideId}-${sourceObjectId}`,
    createSlideId: (sourceSlideId) => `${sourceSlideId}-copy`,
    getObjectIds: (slide) => slide.objects.map((object) => object.id),
  }

  it('creates generic slide clipboard descriptors with debug metadata', () => {
    expect(createSlideEditSlideClipboardPayload({
      activeSlideId: 'slide-b',
      getObjectCount: (slide) => slide.objects.length,
      getSlideId: (slide) => slide.id,
      getTitle: (slide) => slide.title,
      selectedSlideIds: ['slide-b', 'missing', 'slide-a'],
      slides,
    })).toEqual({
      activeSlideId: 'slide-b',
      debug: {
        objectCount: 3,
        slideCount: 2,
        sourceSlideId: 'slide-b',
      },
      metadata: [
        {
          index: 0,
          objectCount: 2,
          slideId: 'slide-a',
          title: 'Intro',
        },
        {
          index: 1,
          objectCount: 1,
          slideId: 'slide-b',
          title: 'Metrics',
        },
      ],
      operation: 'copy',
      selectedSlideIds: ['slide-b', 'slide-a'],
      slides,
      sourceSlideId: 'slide-b',
      type: 'slide-clipboard',
      version: 1,
    })
  })

  it('resolves active and focused rail paste placement after a target slide', () => {
    const slideOrder = ['slide-a', 'slide-b', 'slide-c']

    expect(resolveSlideEditSlideClipboardPastePlacement({
      slideOrder,
      target: {
        activeSlideId: 'slide-b',
        kind: 'active-slide',
      },
    })).toEqual({
      afterSlideId: 'slide-b',
      insertIndex: 2,
      reason: 'after-target',
    })
    expect(resolveSlideEditSlideClipboardPastePlacement({
      slideOrder,
      target: {
        focusedSlideId: 'slide-a',
        kind: 'focused-rail-slide',
      },
    })).toEqual({
      afterSlideId: 'slide-a',
      insertIndex: 1,
      reason: 'after-target',
    })
    expect(resolveSlideEditSlideClipboardPastePlacement({
      slideOrder,
      target: {
        activeSlideId: 'missing',
        kind: 'active-slide',
      },
    })).toEqual({
      afterSlideId: 'slide-c',
      insertIndex: 3,
      reason: 'append',
    })
    expect(resolveSlideEditSlideClipboardPastePlacement({
      slideOrder: [],
      target: {
        slideId: null,
        kind: 'after-slide',
      },
    })).toEqual({
      afterSlideId: null,
      insertIndex: 0,
      reason: 'empty-deck',
    })
  })

  it('creates paste plans with host-provided slide and object id remap', () => {
    const payload = createSlideEditSlideClipboardPayload({
      getObjectCount: (slide) => slide.objects.length,
      getSlideId: (slide) => slide.id,
      slides,
    })
    const placement = resolveSlideEditSlideClipboardPastePlacement({
      slideOrder: ['slide-x', 'slide-y'],
      target: {
        kind: 'after-slide',
        slideId: 'slide-x',
      },
    })

    expect(payload).not.toBeNull()
    if (!payload) {
      throw new Error('Expected payload')
    }

    expect(createSlideEditSlideClipboardPastePlan({
      payload,
      placement,
      remapPolicy,
    })).toEqual({
      afterSlideId: 'slide-x',
      insertIndex: 1,
      mappings: [
        {
          objectMappings: [
            {
              sourceObjectId: 'title',
              targetObjectId: 'slide-a-copy-title',
            },
            {
              sourceObjectId: 'logo',
              targetObjectId: 'slide-a-copy-logo',
            },
          ],
          sourceSlideId: 'slide-a',
          targetSlideId: 'slide-a-copy',
        },
        {
          objectMappings: [
            {
              sourceObjectId: 'chart',
              targetObjectId: 'slide-b-copy-chart',
            },
          ],
          sourceSlideId: 'slide-b',
          targetSlideId: 'slide-b-copy',
        },
      ],
      operation: 'copy',
      sourceSlideId: 'slide-a',
      targetSlideIds: ['slide-a-copy', 'slide-b-copy'],
    })
  })

  it('maps paste plan slide mappings back to host slide transforms', () => {
    const payload = createSlideEditSlideClipboardPayload({
      getSlideId: (slide) => slide.id,
      slides,
    })
    const placement = resolveSlideEditSlideClipboardPastePlacement({
      slideOrder: ['slide-x'],
      target: {
        activeSlideId: 'slide-x',
        kind: 'active-slide',
      },
    })

    expect(payload).not.toBeNull()
    if (!payload) {
      throw new Error('Expected payload')
    }

    const pastePlan = createSlideEditSlideClipboardPastePlan({
      payload,
      placement,
      remapPolicy,
    })

    expect(pastePlan).not.toBeNull()
    if (!pastePlan) {
      throw new Error('Expected paste plan')
    }

    expect(mapSlideEditSlideClipboardPasteSlides({
      pastePlan,
      payload,
      transform: ({ mapping, source }) => ({
        id: mapping.targetSlideId,
        objectIds: mapping.objectMappings.map((item) => item.targetObjectId),
        title: `${source.title} Copy`,
      }),
    })).toEqual([
      {
        id: 'slide-a-copy',
        objectIds: ['slide-a-copy-title', 'slide-a-copy-logo'],
        title: 'Intro Copy',
      },
      {
        id: 'slide-b-copy',
        objectIds: ['slide-b-copy-chart'],
        title: 'Metrics Copy',
      },
    ])
  })

  it('converts paste plans to command effects with first pasted slide active', () => {
    const payload = createSlideEditSlideClipboardPayload({
      getSlideId: (slide) => slide.id,
      slides,
    })
    const placement = {
      afterSlideId: 'slide-a',
      insertIndex: 1,
      reason: 'after-target' as const,
    }

    expect(payload).not.toBeNull()
    if (!payload) {
      throw new Error('Expected payload')
    }

    expect(createSlideEditSlideClipboardPasteCommandEffect({
      payload,
      placement,
      remapPolicy,
    })).toMatchObject({
      payload: {
        id: 'paste-slides',
        pastePlan: {
          insertIndex: 1,
          targetSlideIds: ['slide-a-copy', 'slide-b-copy'],
        },
      },
      selection: {
        objectIds: [],
        slideId: 'slide-a-copy',
      },
      type: 'slide-command-effect',
    })
  })

  it('guards empty and invalid slide clipboard payloads', () => {
    expect(createSlideEditSlideClipboardPayload({
      getSlideId: (slide: HostSlide) => slide.id,
      slides: [],
    })).toBeNull()
    expect(parseSlideEditSlideClipboardPayload({
      selectedSlideIds: [],
      slides: [],
      type: 'slide-clipboard',
      version: 1,
    })).toBeNull()
  })

  it('round-trips through canvas rich clipboard JSON and HTML script metadata', () => {
    const payload = createSlideEditSlideClipboardPayload({
      getObjectCount: (slide) => slide.objects.length,
      getSlideId: (slide) => slide.id,
      slides,
    })

    expect(payload).not.toBeNull()
    if (!payload) {
      throw new Error('Expected payload')
    }

    const json = stringifyCanvasRichClipboardPayload(payload)
    const html = createCanvasRichClipboardHTML({
      fallbackHTML: '<p>Slides</p>',
      json,
      scriptAttribute: SLIDE_EDIT_SLIDE_CLIPBOARD_HTML_SCRIPT_ATTRIBUTE,
    })

    expect(readCanvasRichClipboardFromDataTransfer({
      dataTransfer: createDataTransfer({
        'text/html': html,
      }),
      jsonMimeType: SLIDE_EDIT_SLIDE_CLIPBOARD_MIME_TYPE,
      parsePayload: parseSlideEditSlideClipboardPayload,
      scriptAttribute: SLIDE_EDIT_SLIDE_CLIPBOARD_HTML_SCRIPT_ATTRIBUTE,
    })).toMatchObject({
      format: 'text-html',
      payload: {
        debug: {
          objectCount: 3,
          slideCount: 2,
        },
        sourceSlideId: 'slide-a',
        type: 'slide-clipboard',
      },
    })
  })

  it('stays independent from existing rail command descriptors', () => {
    expect(SLIDE_EDIT_RAIL_COMMANDS.map((command) => command.id))
      .not.toContain('paste-slides')

    const payload = createSlideEditSlideClipboardPayload({
      getSlideId: (slide) => slide.id,
      slides,
    })

    expect(payload?.type).toBe('slide-clipboard')
  })
})

function createDataTransfer(
  values: Record<string, string>,
): CanvasRichClipboardDataTransfer {
  return {
    getData: (type: string) => values[type] ?? '',
  }
}
