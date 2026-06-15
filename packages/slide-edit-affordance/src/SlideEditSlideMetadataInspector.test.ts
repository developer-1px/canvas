import { describe, expect, it } from 'vitest'

import { createSlideEditRailDescriptor } from './SlideEditRailInteractions'
import {
  createSlideEditSlideMetadataInspectorDescriptor,
  getSlideEditInspectorSurface,
  getSlideEditSlideMetadataFieldDescriptors,
  SLIDE_EDIT_INSPECTOR_DISPLAY_PRIORITY,
  SLIDE_EDIT_SLIDE_METADATA_FIELDS,
  toSlideEditSlideMetadataHostCommandEffect,
  type SlideEditSlideMetadataReadModel,
} from './SlideEditSlideMetadataInspector'

describe('SlideEditSlideMetadataInspector', () => {
  type SlideId = 'slide-a' | 'slide-b' | 'slide-c'

  const rail = createSlideEditRailDescriptor({
    activeSlideId: 'slide-b',
    getThumbnailBounds: (_slideId, index) => ({
      h: 72,
      w: 128,
      x: 0,
      y: index * 88,
    }),
    slideOrder: ['slide-a', 'slide-b', 'slide-c'],
  })

  const metadata: SlideEditSlideMetadataReadModel<SlideId> = {
    background: {
      color: '#f8fafc',
      kind: 'solid-color',
      tokenId: 'canvas-background',
    },
    name: 'Intro',
    notes: 'Keep this slide short.',
    orientation: 'landscape',
    size: {
      h: 720,
      w: 1280,
    },
    slideId: 'slide-b',
  }

  it('describes active slide metadata using the rail active slide read model', () => {
    const descriptor = createSlideEditSlideMetadataInspectorDescriptor({
      rail,
      readSlideMetadata: (slideId) => slideId === 'slide-b' ? metadata : null,
    })

    expect(descriptor).toEqual({
      activeSlide: {
        index: 1,
        slideCount: 3,
        slideId: 'slide-b',
      },
      fields: SLIDE_EDIT_SLIDE_METADATA_FIELDS,
      metadata,
      surface: 'slide-metadata-inspector',
    })
  })

  it('keeps size and orientation as optional field descriptors', () => {
    expect(getSlideEditSlideMetadataFieldDescriptors().map((field) =>
      field.id
    )).toEqual([
      'name',
      'background',
      'notes',
      'size',
      'orientation',
    ])

    expect(getSlideEditSlideMetadataFieldDescriptors({
      includeOptionalFields: ['orientation'],
    }).map((field) => field.id)).toEqual([
      'name',
      'background',
      'notes',
      'orientation',
    ])
  })

  it('prioritizes object selection inspector before slide metadata inspector', () => {
    expect(SLIDE_EDIT_INSPECTOR_DISPLAY_PRIORITY).toEqual([
      {
        rank: 0,
        surface: 'object-selection-inspector',
        when: 'selected-object-ids-present',
      },
      {
        rank: 1,
        surface: 'slide-metadata-inspector',
        when: 'active-slide-without-object-selection',
      },
    ])
    expect(getSlideEditInspectorSurface({
      activeSlideId: 'slide-b',
      selectedObjectIds: ['object-1'],
    })).toBe('object-selection-inspector')
    expect(getSlideEditInspectorSurface({
      activeSlideId: 'slide-b',
      selectedObjectIds: [],
    })).toBe('slide-metadata-inspector')
    expect(getSlideEditInspectorSurface({
      activeSlideId: null,
      selectedObjectIds: [],
    })).toBe('none')
  })

  it('routes field updates through host command effects', () => {
    expect(toSlideEditSlideMetadataHostCommandEffect({
      fieldId: 'name',
      id: 'update-slide-name',
      slideId: 'slide-b',
      value: 'Retitled',
    })).toEqual({
      payload: {
        fieldId: 'name',
        id: 'update-slide-name',
        slideId: 'slide-b',
        value: 'Retitled',
      },
      selection: {
        objectIds: [],
        slideId: 'slide-b',
      },
      type: 'slide-command-effect',
    })

    expect(toSlideEditSlideMetadataHostCommandEffect({
      fieldId: 'background',
      id: 'update-slide-background',
      slideId: 'slide-b',
      value: {
        assetId: 'image-1',
        fitting: 'cover',
        kind: 'image',
      },
    }).payload.value).toEqual({
      assetId: 'image-1',
      fitting: 'cover',
      kind: 'image',
    })
  })

  it('does not expose product names or host storage names in runtime strings', () => {
    const publicStrings = JSON.stringify({
      descriptor: createSlideEditSlideMetadataInspectorDescriptor({
        rail,
        readSlideMetadata: () => metadata,
      }),
      fields: SLIDE_EDIT_SLIDE_METADATA_FIELDS,
      priority: SLIDE_EDIT_INSPECTOR_DISPLAY_PRIORITY,
    }).toLowerCase()

    for (const blockedTerm of [
      'p' + 'pt',
      'power' + 'point',
      'fig' + 'slide',
      'slide-store',
      'document-model',
    ]) {
      expect(publicStrings).not.toContain(blockedTerm)
    }
  })
})
