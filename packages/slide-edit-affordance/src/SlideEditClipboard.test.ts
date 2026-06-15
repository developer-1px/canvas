import { describe, expect, it } from 'vitest'

import {
  createSlideEditClipboardAdapterExample,
  createSlideEditClipboardPasteCommandEffect,
  createSlideEditClipboardPastePlan,
  createSlideEditClipboardPayload,
  getSlideEditClipboardPasteAnchor,
  type SlideEditClipboardRemapPolicy,
} from './SlideEditClipboard'

type HostObject = {
  kind: 'image' | 'shape'
  name: string
}

describe('SlideEditClipboard', () => {
  const objects: HostObject[] = [
    { kind: 'shape', name: 'Card' },
    { kind: 'image', name: 'Logo' },
  ]
  const remapPolicy: SlideEditClipboardRemapPolicy<
    string,
    string,
    string
  > = {
    createGroupId: (sourceGroupId) => `slide-b-${sourceGroupId}`,
    createObjectId: (sourceObjectId) => `slide-b-${sourceObjectId}`,
    createPlaceholderId: (sourcePlaceholderId) => (
      sourcePlaceholderId === 'logo-slot' ? 'target-logo-slot' : null
    ),
  }

  it('creates copy and cut payloads with source slide and optional metadata', () => {
    expect(createSlideEditClipboardPayload({
      metadata: [
        {
          groupId: 'group-a',
          objectId: 'card',
        },
        {
          objectId: 'logo',
          placeholderId: 'logo-slot',
        },
      ],
      objects,
      selectedObjectIds: ['card', 'logo'],
      sourceSlideId: 'slide-a',
    })).toEqual({
      metadata: [
        {
          groupId: 'group-a',
          objectId: 'card',
        },
        {
          objectId: 'logo',
          placeholderId: 'logo-slot',
        },
      ],
      objects,
      operation: 'copy',
      selectedObjectIds: ['card', 'logo'],
      sourceSlideId: 'slide-a',
      type: 'slide-object-clipboard',
    })

    expect(createSlideEditClipboardPayload({
      objects,
      operation: 'cut',
      selectedObjectIds: ['card'],
      sourceSlideId: 'slide-a',
    })).toMatchObject({
      operation: 'cut',
      sourceSlideId: 'slide-a',
    })
  })

  it('calculates paste anchors from active slide, pointer, viewport, and frame offset targets', () => {
    const slideFrame = { h: 720, w: 1280, x: 100, y: 40 }

    expect(getSlideEditClipboardPasteAnchor({
      slideFrame,
      target: {
        kind: 'active-slide',
        slideId: 'slide-b',
      },
    })).toEqual({ x: 100, y: 40 })
    expect(getSlideEditClipboardPasteAnchor({
      slideFrame,
      target: {
        kind: 'pointer-position',
        pointerPosition: { x: 320, y: 180 },
        slideId: 'slide-b',
      },
    })).toEqual({ x: 320, y: 180 })
    expect(getSlideEditClipboardPasteAnchor({
      slideFrame,
      target: {
        kind: 'viewport-center',
        slideId: 'slide-b',
        viewportCenter: { x: 640, y: 360 },
      },
    })).toEqual({ x: 640, y: 360 })
    expect(getSlideEditClipboardPasteAnchor({
      slideFrame,
      target: {
        kind: 'slide-frame-offset',
        offset: { x: 24, y: 32 },
        slideId: 'slide-b',
      },
    })).toEqual({ x: 124, y: 72 })
  })

  it('creates paste plans with object, group, and placeholder remap mappings', () => {
    const payload = createSlideEditClipboardPayload({
      metadata: [
        {
          groupId: 'group-a',
          objectId: 'card',
        },
        {
          groupId: 'group-a',
          objectId: 'logo',
          placeholderId: 'logo-slot',
        },
      ],
      objects,
      selectedObjectIds: ['card', 'logo'],
      sourceSlideId: 'slide-a',
    })

    expect(createSlideEditClipboardPastePlan({
      payload,
      remapPolicy,
      slideFrame: { h: 720, w: 1280, x: 100, y: 40 },
      target: {
        kind: 'slide-frame-offset',
        offset: { x: 24, y: 32 },
        slideId: 'slide-b',
      },
    })).toEqual({
      anchor: { x: 124, y: 72 },
      mappings: [
        {
          sourceGroupId: 'group-a',
          sourceObjectId: 'card',
          sourcePlaceholderId: null,
          targetGroupId: 'slide-b-group-a',
          targetObjectId: 'slide-b-card',
          targetPlaceholderId: null,
        },
        {
          sourceGroupId: 'group-a',
          sourceObjectId: 'logo',
          sourcePlaceholderId: 'logo-slot',
          targetGroupId: 'slide-b-group-a',
          targetObjectId: 'slide-b-logo',
          targetPlaceholderId: 'target-logo-slot',
        },
      ],
      operation: 'copy',
      sourceSlideId: 'slide-a',
      targetSlideId: 'slide-b',
    })
  })

  it('converts paste plans to host command effects with target selection', () => {
    const payload = createSlideEditClipboardPayload({
      objects,
      selectedObjectIds: ['card', 'logo'],
      sourceSlideId: 'slide-a',
    })

    expect(createSlideEditClipboardPasteCommandEffect({
      payload,
      remapPolicy,
      slideFrame: { h: 720, w: 1280, x: 100, y: 40 },
      target: {
        kind: 'viewport-center',
        slideId: 'slide-b',
        viewportCenter: { x: 640, y: 360 },
      },
    })).toMatchObject({
      payload: {
        id: 'paste-slide-objects',
        pastePlan: {
          anchor: { x: 640, y: 360 },
          sourceSlideId: 'slide-a',
          targetSlideId: 'slide-b',
        },
      },
      selection: {
        objectIds: ['slide-b-card', 'slide-b-logo'],
        slideId: 'slide-b',
      },
      type: 'slide-command-effect',
    })

    expect(createSlideEditClipboardPasteCommandEffect({
      payload: createSlideEditClipboardPayload({
        objects: [],
        selectedObjectIds: [],
        sourceSlideId: 'slide-a',
      }),
      remapPolicy,
      slideFrame: { h: 720, w: 1280, x: 100, y: 40 },
      target: {
        kind: 'active-slide',
        slideId: 'slide-b',
      },
    })).toBeNull()
  })

  it('provides a product-neutral minimal adapter example', () => {
    const adapter = createSlideEditClipboardAdapterExample<
      string,
      string,
      HostObject,
      string,
      string
    >({
      remapPolicy,
    })
    const payload = adapter.copySelection({
      objects,
      selectedObjectIds: ['card'],
      sourceSlideId: 'slide-a',
    })

    expect(adapter.pasteIntoTarget({
      payload,
      slideFrame: { h: 720, w: 1280, x: 100, y: 40 },
      target: {
        kind: 'active-slide',
        slideId: 'slide-b',
      },
    })).toMatchObject({
      selection: {
        objectIds: ['slide-b-card'],
        slideId: 'slide-b',
      },
    })

    const publicStrings = JSON.stringify({
      effect: adapter.pasteIntoTarget({
        payload,
        slideFrame: { h: 720, w: 1280, x: 100, y: 40 },
        target: {
          kind: 'active-slide',
          slideId: 'slide-b',
        },
      }),
    }).toLowerCase()

    const blockedTerms = ['p' + 'pt', 'power' + 'point', 'fig' + 'slide']

    for (const blockedTerm of blockedTerms) {
      expect(publicStrings).not.toContain(blockedTerm)
    }
  })
})
