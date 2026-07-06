import { describe, expect, it, vi } from 'vitest'

import {
  getSlideEditSlideNotesPasteValue,
  getSlideEditSlideNotesPasteValueFromText,
  getSlideEditSlideNotesPasteValueFromValue,
  SLIDE_EDIT_SLIDE_NOTES_IMPORT_MODEL,
  SLIDE_EDIT_SLIDE_NOTES_JSON_IMPORT_FORMAT,
  SLIDE_EDIT_SLIDE_NOTES_JSON_MIME_TYPE,
  toSlideEditSlideNotesPasteCommandEffect,
} from './SlideEditSlideNotesImport'
import {
  SLIDE_EDIT_SLIDE_NOTES_IMPORT_MODEL as SLIDE_EDIT_SLIDE_NOTES_IMPORT_MODEL_FROM_PACKAGE,
  toSlideEditSlideNotesPasteCommandEffect as toSlideEditSlideNotesPasteCommandEffectFromPackage,
} from './index'

describe('SlideEditSlideNotesImport', () => {
  it('exports slide notes import model, format, and MIME metadata', () => {
    expect(SLIDE_EDIT_SLIDE_NOTES_IMPORT_MODEL)
      .toBe('slide-edit-slide-notes-import')
    expect(SLIDE_EDIT_SLIDE_NOTES_JSON_IMPORT_FORMAT)
      .toBe('application-json-slide-edit-slide-notes')
    expect(SLIDE_EDIT_SLIDE_NOTES_JSON_MIME_TYPE)
      .toBe('application/vnd.interactive-os.slide-edit.slide-notes+json')
    expect(SLIDE_EDIT_SLIDE_NOTES_IMPORT_MODEL_FROM_PACKAGE)
      .toBe(SLIDE_EDIT_SLIDE_NOTES_IMPORT_MODEL)
  })

  it('reads custom MIME direct JSON strings and object wrappers', () => {
    const dataTransfer = {
      getData: vi.fn((type: string) =>
        type === SLIDE_EDIT_SLIDE_NOTES_JSON_MIME_TYPE
          ? JSON.stringify({ speakerNotes: 'Talk track' })
          : '',
      ),
    } as unknown as DataTransfer

    expect(getSlideEditSlideNotesPasteValue({
      dataTransfer,
    })).toMatchObject({
      format: 'json',
      notes: 'Talk track',
      sourceType: SLIDE_EDIT_SLIDE_NOTES_JSON_MIME_TYPE,
      wrapper: 'speakerNotes',
    })
    expect(getSlideEditSlideNotesPasteValueFromText(
      JSON.stringify('Direct note'),
      {
        mode: 'direct-json',
        sourceType: SLIDE_EDIT_SLIDE_NOTES_JSON_MIME_TYPE,
      },
    )).toMatchObject({
      notes: 'Direct note',
    })
  })

  it('reads direct and wrapped JSON notes keys', () => {
    expect(getSlideEditSlideNotesPasteValueFromValue(
      {
        slide: {
          notes: 'Nested notes',
        },
      },
      { mode: 'wrapped-json' },
    )).toMatchObject({
      notes: 'Nested notes',
      wrapper: 'slide.notes',
    })
    expect(getSlideEditSlideNotesPasteValueFromValue(
      {
        speaker_notes: 'Snake notes',
      },
      { mode: 'wrapped-json' },
    )).toMatchObject({
      notes: 'Snake notes',
      wrapper: 'speaker_notes',
    })
  })

  it('reads fenced JSON text and marked markdown notes', () => {
    expect(getSlideEditSlideNotesPasteValueFromText(
      '```json\n{"notes":"Fenced notes"}\n```',
      {
        mode: 'marked-text',
        sourceType: 'text/markdown',
      },
    )).toMatchObject({
      format: 'json',
      notes: 'Fenced notes',
    })
    expect(getSlideEditSlideNotesPasteValueFromText(
      '## Speaker notes\nMention the launch date.\n\n## Appendix\nIgnore this.',
      {
        mode: 'marked-text',
        sourceType: 'text/markdown',
      },
    )).toMatchObject({
      format: 'markdown',
      notes: 'Mention the launch date.',
    })
    expect(getSlideEditSlideNotesPasteValueFromText(
      'Presenter notes: Keep this short.',
      {
        mode: 'marked-text',
        sourceType: 'text/plain',
      },
    )).toMatchObject({
      format: 'plain-text',
      notes: 'Keep this short.',
    })
  })

  it('does not claim unmarked plain text or empty values as notes', () => {
    expect(getSlideEditSlideNotesPasteValueFromText(
      'This is ordinary body text.',
      {
        mode: 'marked-text',
        sourceType: 'text/plain',
      },
    )).toBeNull()
    expect(getSlideEditSlideNotesPasteValueFromValue(
      { notes: '   ' },
      { mode: 'wrapped-json' },
    )).toBeNull()
  })

  it('routes notes paste values to update-slide-notes command effects', () => {
    const pasteValue = getSlideEditSlideNotesPasteValueFromValue('Remember Q&A')

    expect(pasteValue && toSlideEditSlideNotesPasteCommandEffect({
      pasteValue,
      slideId: 'slide-a',
    })).toEqual({
      payload: {
        fieldId: 'notes',
        id: 'update-slide-notes',
        slideId: 'slide-a',
        value: 'Remember Q&A',
      },
      selection: {
        objectIds: [],
        slideId: 'slide-a',
      },
      type: 'slide-command-effect',
    })
    expect(toSlideEditSlideNotesPasteCommandEffectFromPackage)
      .toBe(toSlideEditSlideNotesPasteCommandEffect)
  })
})
