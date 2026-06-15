import { describe, expect, it } from 'vitest'

import {
  createSlideEditRailDescriptor,
  getSlideEditRailKeyboardCommandEffect,
  getSlideEditRailPointerCommandEffect,
  SLIDE_EDIT_RAIL_COMMANDS,
} from './SlideEditRailInteractions'

describe('SlideEditRailInteractions', () => {
  const slideOrder = ['slide-a', 'slide-b', 'slide-c'] as const

  it('describes active slide, slide order, and thumbnail hit targets', () => {
    const descriptor = createSlideEditRailDescriptor({
      activeSlideId: 'slide-b',
      hitTargetPadding: 6,
      slideOrder,
      getThumbnailBounds: (_slideId, index) => ({
        h: 72,
        w: 128,
        x: 16,
        y: 20 + index * 88,
      }),
    })

    expect(descriptor.activeSlideId).toBe('slide-b')
    expect(descriptor.slideOrder).toEqual(slideOrder)
    expect(descriptor.thumbnails[1]).toEqual({
      bounds: {
        h: 72,
        w: 128,
        x: 16,
        y: 108,
      },
      hitTarget: {
        h: 84,
        w: 140,
        x: 10,
        y: 102,
      },
      index: 1,
      isActive: true,
      slideId: 'slide-b',
    })
  })

  it('defines rail command descriptors without slide model fields', () => {
    expect(SLIDE_EDIT_RAIL_COMMANDS.map((command) => command.id)).toEqual([
      'add-slide',
      'duplicate-slide',
      'delete-slide',
      'reorder-slide',
      'select-active-slide',
    ])
    expect(SLIDE_EDIT_RAIL_COMMANDS.every(
      (command) => command.requiredAdapterSlot === 'command-effect',
    )).toBe(true)
  })

  it('converts keyboard intents to host command effects', () => {
    expect(getSlideEditRailKeyboardCommandEffect({
      activeSlideId: 'slide-b',
      direction: 'next',
      slideOrder,
      type: 'select-relative',
    })).toEqual({
      payload: {
        id: 'select-active-slide',
        slideId: 'slide-c',
      },
      selection: {
        objectIds: [],
        slideId: 'slide-c',
      },
      type: 'slide-command-effect',
    })
    expect(getSlideEditRailKeyboardCommandEffect({
      activeSlideId: 'slide-a',
      direction: 'next',
      slideOrder,
      type: 'move-active',
    })).toEqual({
      payload: {
        fromIndex: 0,
        id: 'reorder-slide',
        slideId: 'slide-a',
        toIndex: 1,
      },
      selection: {
        objectIds: [],
        slideId: 'slide-a',
      },
      type: 'slide-command-effect',
    })
    expect(getSlideEditRailKeyboardCommandEffect({
      activeSlideId: 'slide-a',
      type: 'delete-active',
    })).toEqual({
      payload: {
        id: 'delete-slide',
        slideId: 'slide-a',
      },
      selection: {
        objectIds: [],
        slideId: 'slide-a',
      },
      type: 'slide-command-effect',
    })
  })

  it('converts pointer intents to host command effects', () => {
    expect(getSlideEditRailPointerCommandEffect({
      slideId: 'slide-b',
      type: 'thumbnail-press',
    })).toEqual({
      payload: {
        id: 'select-active-slide',
        slideId: 'slide-b',
      },
      selection: {
        objectIds: [],
        slideId: 'slide-b',
      },
      type: 'slide-command-effect',
    })
    expect(getSlideEditRailPointerCommandEffect({
      slideId: 'slide-c',
      slideOrder,
      toIndex: 0,
      type: 'thumbnail-drop',
    })).toEqual({
      payload: {
        fromIndex: 2,
        id: 'reorder-slide',
        slideId: 'slide-c',
        toIndex: 0,
      },
      selection: {
        objectIds: [],
        slideId: 'slide-c',
      },
      type: 'slide-command-effect',
    })
    expect(getSlideEditRailPointerCommandEffect({
      afterSlideId: 'slide-b',
      type: 'add-button-press',
    })).toEqual({
      payload: {
        afterSlideId: 'slide-b',
        id: 'add-slide',
      },
      selection: undefined,
      type: 'slide-command-effect',
    })
  })

  it('keeps interaction contracts product-neutral and separate from object z-order', () => {
    const contractStrings = JSON.stringify({
      commands: SLIDE_EDIT_RAIL_COMMANDS,
      descriptor: createSlideEditRailDescriptor({
        activeSlideId: 'slide-a',
        getThumbnailBounds: () => ({ h: 72, w: 128, x: 0, y: 0 }),
        slideOrder,
      }),
    }).toLowerCase()

    expect(contractStrings).not.toContain('z-order')
    expect(contractStrings).not.toContain('layer')
    expect(contractStrings).not.toContain('object-model')
  })
})
