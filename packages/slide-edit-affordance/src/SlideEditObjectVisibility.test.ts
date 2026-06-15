import { describe, expect, it } from 'vitest'

import {
  createSlideEditPlaceholderDescriptor,
  getSlideEditObjectVisibilityCommandAvailability,
  getSlideEditObjectVisibilityCommandEffect,
  getSlideEditObjectVisibilityState,
  type SlideEditObjectVisibilityDescriptor,
} from './SlideEditObjectVisibility'

describe('SlideEditObjectVisibility', () => {
  const objects: SlideEditObjectVisibilityDescriptor<'slide-a'>[] = [
    {
      isHidden: false,
      isLocked: false,
      isSelectable: true,
      objectId: 'title',
      placeholderId: 'title-slot',
      slideId: 'slide-a',
    },
    {
      isHidden: true,
      isLocked: false,
      isSelectable: false,
      objectId: 'logo',
      slideId: 'slide-a',
    },
    {
      isHidden: false,
      isLocked: true,
      isSelectable: false,
      objectId: 'footer',
      slideId: 'slide-a',
    },
  ]

  it('describes placeholder role, title, bounds, lock, and visibility state', () => {
    expect(createSlideEditPlaceholderDescriptor({
      bounds: { h: 96, w: 420, x: 80, y: 60 },
      isLocked: true,
      isVisible: false,
      placeholderId: 'title-slot',
      role: 'title',
      slideId: 'slide-a',
      title: 'Title placeholder',
    })).toEqual({
      bounds: { h: 96, w: 420, x: 80, y: 60 },
      isLocked: true,
      isVisible: false,
      placeholderId: 'title-slot',
      role: 'title',
      slideId: 'slide-a',
      title: 'Title placeholder',
    })
  })

  it('keeps visibility and selection availability as separate state', () => {
    expect(getSlideEditObjectVisibilityState({
      isHidden: true,
      isLocked: false,
      selectionPolicy: 'visible-only',
    })).toEqual({
      isHidden: true,
      isLocked: false,
      isSelectable: false,
      isVisible: false,
      selectionBlockReason: 'hidden',
    })

    expect(getSlideEditObjectVisibilityState({
      isHidden: true,
      isLocked: false,
      selectionPolicy: 'allow-hidden-selection',
    })).toEqual({
      isHidden: true,
      isLocked: false,
      isSelectable: true,
      isVisible: false,
      selectionBlockReason: undefined,
    })
  })

  it('defines hide and show command availability from selected object state', () => {
    expect(getSlideEditObjectVisibilityCommandAvailability({
      commandId: 'hide-objects',
      objects,
      selectedObjectIds: ['title', 'logo'],
    })).toEqual({
      commandId: 'hide-objects',
      isAvailable: true,
      targetObjectIds: ['title'],
    })

    expect(getSlideEditObjectVisibilityCommandAvailability({
      commandId: 'show-objects',
      objects,
      selectedObjectIds: ['title', 'logo'],
    })).toEqual({
      commandId: 'show-objects',
      isAvailable: true,
      targetObjectIds: ['logo'],
    })

    expect(getSlideEditObjectVisibilityCommandAvailability({
      commandId: 'hide-objects',
      objects,
      selectedObjectIds: ['footer'],
    })).toEqual({
      commandId: 'hide-objects',
      isAvailable: false,
      targetObjectIds: [],
      unavailableReason: 'locked-selection',
    })
  })

  it('converts hide and show commands to host command effects', () => {
    expect(getSlideEditObjectVisibilityCommandEffect({
      commandId: 'hide-objects',
      objects,
      selectedObjectIds: ['title', 'logo'],
      slideId: 'slide-a',
    })).toEqual({
      payload: {
        id: 'hide-objects',
        objectIds: ['title'],
      },
      selection: {
        objectIds: ['title', 'logo'],
        slideId: 'slide-a',
      },
      type: 'slide-command-effect',
    })

    expect(getSlideEditObjectVisibilityCommandEffect({
      commandId: 'show-objects',
      objects,
      selectedObjectIds: ['title'],
      slideId: 'slide-a',
    })).toBeNull()
  })

  it('keeps placeholder and visibility contracts product-neutral', () => {
    const blockedTerms = ['p' + 'pt', 'power' + 'point', 'fig' + 'slide']
    const contractStrings = JSON.stringify({
      objects,
      placeholder: createSlideEditPlaceholderDescriptor({
        bounds: { h: 96, w: 420, x: 80, y: 60 },
        placeholderId: 'body-slot',
        role: 'body',
        slideId: 'slide-a',
        title: 'Body placeholder',
      }),
    }).toLowerCase()

    for (const blockedTerm of blockedTerms) {
      expect(contractStrings).not.toContain(blockedTerm)
    }
  })
})
