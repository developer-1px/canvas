import { describe, expect, it } from 'vitest'

import { createSlideEditRailDescriptor } from './SlideEditRailInteractions'
import {
  createSlideEditSlideMetadataInspectorDescriptor,
  getSlideEditInspectorSurface,
  getSlideEditSlideNotesPasteValue,
  getSlideEditSlideNotesPasteValueFromText,
  getSlideEditSlideNotesPasteValueFromValue,
  getSlideEditSlideMetadataFieldDescriptors,
  SLIDE_EDIT_SLIDE_NOTES_IMPORT_MODEL,
  SLIDE_EDIT_SLIDE_NOTES_JSON_IMPORT_FORMAT,
  SLIDE_EDIT_SLIDE_NOTES_JSON_MIME_TYPE,
  SLIDE_EDIT_SLIDE_NOTES_MARKDOWN_IMPORT_FORMAT,
  SLIDE_EDIT_SLIDE_NOTES_TEXT_IMPORT_FORMAT,
  SLIDE_EDIT_INSPECTOR_DISPLAY_PRIORITY,
  SLIDE_EDIT_SLIDE_METADATA_FIELDS,
  toSlideEditSlideNotesPasteCommandEffect,
  toSlideEditSlideMetadataHostCommandEffect,
  type SlideEditSlideMetadataReadModel,
} from './SlideEditSlideMetadataInspector'
import {
  getSlideEditSlideNotesPasteValue as getSlideEditSlideNotesPasteValueFromPackage,
  SLIDE_EDIT_SLIDE_NOTES_IMPORT_MODEL as SLIDE_EDIT_SLIDE_NOTES_IMPORT_MODEL_FROM_PACKAGE,
} from './index'

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

  it('reads custom MIME slide notes JSON values before generic formats', () => {
    const dataTransfer = createDataTransfer({
      [SLIDE_EDIT_SLIDE_NOTES_JSON_MIME_TYPE]:
        JSON.stringify('Presenter cue from custom MIME.'),
      'application/json': JSON.stringify({
        notes: 'Generic note should not win.',
      }),
    })

    expect(getSlideEditSlideNotesPasteValue({ dataTransfer })).toEqual({
      format: SLIDE_EDIT_SLIDE_NOTES_JSON_IMPORT_FORMAT,
      model: SLIDE_EDIT_SLIDE_NOTES_IMPORT_MODEL,
      notes: 'Presenter cue from custom MIME.',
      sourceType: SLIDE_EDIT_SLIDE_NOTES_JSON_MIME_TYPE,
      textLength: 33,
    })
    expect(getSlideEditSlideNotesPasteValueFromPackage({ dataTransfer }))
      .toMatchObject({
        model: SLIDE_EDIT_SLIDE_NOTES_IMPORT_MODEL_FROM_PACKAGE,
        notes: 'Presenter cue from custom MIME.',
      })
  })

  it('reads wrapped slide notes from JSON and fenced JSON text', () => {
    expect(getSlideEditSlideNotesPasteValueFromValue({
      slideNotes: {
        speakerNotes: 'Review assumptions before chart.',
      },
    })).toMatchObject({
      format: SLIDE_EDIT_SLIDE_NOTES_JSON_IMPORT_FORMAT,
      notes: 'Review assumptions before chart.',
      sourceType: SLIDE_EDIT_SLIDE_NOTES_JSON_MIME_TYPE,
    })

    expect(getSlideEditSlideNotesPasteValueFromText(
      '```json\n{"slide":{"notes":"Close with next steps."}}\n```',
    )).toMatchObject({
      notes: 'Close with next steps.',
    })
  })

  it('reads marked speaker notes from markdown and plain text only with markers', () => {
    expect(getSlideEditSlideNotesPasteValueFromText(
      '# Speaker notes\nStart with the customer problem.\n\nKeep it short.',
      {
        format: SLIDE_EDIT_SLIDE_NOTES_MARKDOWN_IMPORT_FORMAT,
        sourceType: 'text/markdown',
      },
    )).toEqual({
      format: SLIDE_EDIT_SLIDE_NOTES_MARKDOWN_IMPORT_FORMAT,
      model: SLIDE_EDIT_SLIDE_NOTES_IMPORT_MODEL,
      notes: 'Start with the customer problem.\n\nKeep it short.',
      sourceType: 'text/markdown',
      textLength: 64,
    })

    expect(getSlideEditSlideNotesPasteValueFromText(
      'Presenter notes: Rehearse the timing.',
      {
        format: SLIDE_EDIT_SLIDE_NOTES_TEXT_IMPORT_FORMAT,
        sourceType: 'text/plain',
      },
    )).toMatchObject({
      notes: 'Rehearse the timing.',
    })
    expect(getSlideEditSlideNotesPasteValueFromText(
      'This is regular slide body text.',
      {
        format: SLIDE_EDIT_SLIDE_NOTES_TEXT_IMPORT_FORMAT,
        sourceType: 'text/plain',
      },
    )).toBeNull()
  })

  it('routes slide notes paste values through update-slide-notes command effects', () => {
    const pasteValue = getSlideEditSlideNotesPasteValueFromValue({
      notes: 'Add contrast callout.',
    })

    expect(pasteValue).not.toBeNull()
    expect(toSlideEditSlideNotesPasteCommandEffect({
      pasteValue: pasteValue ?? {
        format: SLIDE_EDIT_SLIDE_NOTES_JSON_IMPORT_FORMAT,
        model: SLIDE_EDIT_SLIDE_NOTES_IMPORT_MODEL,
        notes: '',
        sourceType: SLIDE_EDIT_SLIDE_NOTES_JSON_MIME_TYPE,
        textLength: 0,
      },
      slideId: 'slide-b',
    })).toEqual({
      payload: {
        fieldId: 'notes',
        id: 'update-slide-notes',
        slideId: 'slide-b',
        value: 'Add contrast callout.',
      },
      selection: {
        objectIds: [],
        slideId: 'slide-b',
      },
      type: 'slide-command-effect',
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

function createDataTransfer(
  data: Record<string, string>,
): Pick<DataTransfer, 'getData'> {
  return {
    getData: (type) => data[type] ?? '',
  }
}
