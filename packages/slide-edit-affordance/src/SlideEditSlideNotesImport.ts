import {
  toSlideEditSlideMetadataHostCommandEffect,
  type SlideEditSlideMetadataHostCommandEffect,
  type SlideEditSlideMetadataSlideId,
} from './SlideEditSlideMetadataInspector'

export type SlideEditSlideNotesImportDataTransfer = Pick<
  DataTransfer,
  'getData'
>

export type SlideEditSlideNotesImportFormat =
  | 'json'
  | 'markdown'
  | 'plain-text'

export type SlideEditSlideNotesPasteValue = {
  format: SlideEditSlideNotesImportFormat
  importModel: typeof SLIDE_EDIT_SLIDE_NOTES_IMPORT_MODEL
  notes: string
  payloadLength: number
  sourceType: string
  wrapper?: string
}

export type SlideEditSlideNotesPasteInput = {
  dataTransfer: SlideEditSlideNotesImportDataTransfer | null
  jsonMimeType?: string
}

export type SlideEditSlideNotesPasteValueMode =
  | 'any-json'
  | 'direct-json'
  | 'marked-text'
  | 'wrapped-json'

export type SlideEditSlideNotesPasteValueOptions = {
  mode?: SlideEditSlideNotesPasteValueMode
  payloadLength?: number
  sourceType?: string
}

export type SlideEditSlideNotesPasteCommandEffectInput<
  TSlideId extends SlideEditSlideMetadataSlideId =
    SlideEditSlideMetadataSlideId,
> = {
  pasteValue: SlideEditSlideNotesPasteValue
  slideId: TSlideId
}

export const SLIDE_EDIT_SLIDE_NOTES_IMPORT_MODEL =
  'slide-edit-slide-notes-import'
export const SLIDE_EDIT_SLIDE_NOTES_JSON_IMPORT_FORMAT =
  'application-json-slide-edit-slide-notes'
export const SLIDE_EDIT_SLIDE_NOTES_MARKDOWN_IMPORT_FORMAT =
  'text-markdown-slide-edit-slide-notes'
export const SLIDE_EDIT_SLIDE_NOTES_PLAIN_TEXT_IMPORT_FORMAT =
  'text-plain-slide-edit-slide-notes'
export const SLIDE_EDIT_SLIDE_NOTES_JSON_MIME_TYPE =
  'application/vnd.interactive-os.slide-edit.slide-notes+json'
export const SLIDE_EDIT_SLIDE_NOTES_JSON_TYPES = Object.freeze([
  'application/json',
  'text/json',
] as const)
export const SLIDE_EDIT_SLIDE_NOTES_TEXT_TYPES = Object.freeze([
  'text/markdown',
  'text/plain',
] as const)
export const SLIDE_EDIT_SLIDE_NOTES_JSON_KEYS = Object.freeze([
  'notes',
  'speakerNotes',
  'speaker_notes',
  'slideNotes',
] as const)

export function getSlideEditSlideNotesPasteValue({
  dataTransfer,
  jsonMimeType = SLIDE_EDIT_SLIDE_NOTES_JSON_MIME_TYPE,
}: SlideEditSlideNotesPasteInput): SlideEditSlideNotesPasteValue | null {
  if (!dataTransfer) {
    return null
  }

  if (jsonMimeType) {
    const customText = dataTransfer.getData(jsonMimeType)

    if (customText.trim()) {
      const customPasteValue = getSlideEditSlideNotesPasteValueFromText(
        customText,
        {
          mode: 'any-json',
          payloadLength: customText.length,
          sourceType: jsonMimeType,
        },
      )

      if (customPasteValue !== null) {
        return customPasteValue
      }
    }
  }

  for (const type of SLIDE_EDIT_SLIDE_NOTES_JSON_TYPES) {
    const text = dataTransfer.getData(type)

    if (!text.trim()) {
      continue
    }

    const pasteValue = getSlideEditSlideNotesPasteValueFromText(text, {
      mode: 'any-json',
      payloadLength: text.length,
      sourceType: type,
    })

    if (pasteValue !== null) {
      return pasteValue
    }
  }

  for (const type of SLIDE_EDIT_SLIDE_NOTES_TEXT_TYPES) {
    const text = dataTransfer.getData(type)

    if (!text.trim()) {
      continue
    }

    const pasteValue = getSlideEditSlideNotesPasteValueFromText(text, {
      mode: 'marked-text',
      payloadLength: text.length,
      sourceType: type,
    })

    if (pasteValue !== null) {
      return pasteValue
    }
  }

  return null
}

export function getSlideEditSlideNotesPasteValueFromText(
  text: string,
  options?: SlideEditSlideNotesPasteValueOptions,
) {
  return getSlideEditSlideNotesPasteValueFromValue(
    parseSlideEditSlideNotesJSON(text),
    {
      ...options,
      payloadLength: options?.payloadLength ?? text.length,
      rawText: text,
    },
  )
}

export function getSlideEditSlideNotesPasteValueFromValue(
  value: unknown,
  {
    mode = 'direct-json',
    payloadLength = 0,
    rawText,
    sourceType = 'value',
  }: SlideEditSlideNotesPasteValueOptions & { rawText?: string } = {},
): SlideEditSlideNotesPasteValue | null {
  switch (mode) {
    case 'any-json':
      return getSlideEditSlideNotesDirectJSONPasteValue({
        payloadLength,
        sourceType,
        value,
      }) ?? getSlideEditSlideNotesWrappedJSONPasteValue({
        payloadLength,
        sourceType,
        value,
      }) ?? getSlideEditSlideNotesMarkedTextPasteValue({
        payloadLength,
        sourceType,
        text: rawText ?? '',
      })
    case 'direct-json':
      return getSlideEditSlideNotesDirectJSONPasteValue({
        payloadLength,
        sourceType,
        value,
      })
    case 'wrapped-json':
      return getSlideEditSlideNotesWrappedJSONPasteValue({
        payloadLength,
        sourceType,
        value,
      })
    case 'marked-text':
      return getSlideEditSlideNotesMarkedTextPasteValue({
        payloadLength,
        sourceType,
        text: rawText ?? String(value ?? ''),
      })
  }
}

export function toSlideEditSlideNotesPasteCommandEffect<
  TSlideId extends SlideEditSlideMetadataSlideId,
>({
  pasteValue,
  slideId,
}: SlideEditSlideNotesPasteCommandEffectInput<TSlideId>):
  SlideEditSlideMetadataHostCommandEffect<TSlideId> {
  return toSlideEditSlideMetadataHostCommandEffect({
    fieldId: 'notes',
    id: 'update-slide-notes',
    slideId,
    value: pasteValue.notes,
  })
}

function getSlideEditSlideNotesDirectJSONPasteValue({
  payloadLength,
  sourceType,
  value,
  wrapper,
}: {
  payloadLength: number
  sourceType: string
  value: unknown
  wrapper?: string
}): SlideEditSlideNotesPasteValue | null {
  const directNotes = normalizeSlideEditSlideNotesText(value)

  if (directNotes !== null) {
    return {
      format: 'json',
      importModel: SLIDE_EDIT_SLIDE_NOTES_IMPORT_MODEL,
      notes: directNotes,
      payloadLength,
      sourceType,
      ...(wrapper ? { wrapper } : {}),
    }
  }

  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  const record = value as Record<string, unknown>

  for (const key of SLIDE_EDIT_SLIDE_NOTES_JSON_KEYS) {
    if (Object.hasOwn(record, key)) {
      return getSlideEditSlideNotesDirectJSONPasteValue({
        payloadLength,
        sourceType,
        value: record[key],
        wrapper: wrapper ?? key,
      })
    }
  }

  if (record.slide && typeof record.slide === 'object' &&
    !Array.isArray(record.slide)) {
    const slideRecord = record.slide as Record<string, unknown>

    if (Object.hasOwn(slideRecord, 'notes')) {
      return getSlideEditSlideNotesDirectJSONPasteValue({
        payloadLength,
        sourceType,
        value: slideRecord.notes,
        wrapper: wrapper ?? 'slide.notes',
      })
    }
  }

  return null
}

function getSlideEditSlideNotesWrappedJSONPasteValue({
  payloadLength,
  sourceType,
  value,
}: {
  payloadLength: number
  sourceType: string
  value: unknown
}) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  return getSlideEditSlideNotesDirectJSONPasteValue({
    payloadLength,
    sourceType,
    value,
  })
}

function getSlideEditSlideNotesMarkedTextPasteValue({
  payloadLength,
  sourceType,
  text,
}: {
  payloadLength: number
  sourceType: string
  text: string
}): SlideEditSlideNotesPasteValue | null {
  const fencedJSON = getSlideEditSlideNotesFencedJSONText(text)

  if (fencedJSON !== null) {
    const fencedPasteValue = getSlideEditSlideNotesPasteValueFromText(
      fencedJSON,
      {
        mode: 'any-json',
        payloadLength,
        sourceType,
      },
    )

    if (fencedPasteValue !== null) {
      return fencedPasteValue
    }
  }

  const notes = getSlideEditSlideNotesMarkedText(text)

  if (notes === null) {
    return null
  }

  return {
    format: sourceType === 'text/markdown' ? 'markdown' : 'plain-text',
    importModel: SLIDE_EDIT_SLIDE_NOTES_IMPORT_MODEL,
    notes,
    payloadLength,
    sourceType,
  }
}

function getSlideEditSlideNotesFencedJSONText(text: string) {
  const match = /```(?:json)?\s*([\s\S]*?)```/i.exec(text)

  return match?.[1]?.trim() || null
}

function getSlideEditSlideNotesMarkedText(text: string) {
  const normalizedText = text.replace(/\r\n?/g, '\n').trim()

  if (!normalizedText) {
    return null
  }

  const prefixMatch = /^(?:speaker notes|presenter notes|notes)\s*[:=-]\s*([\s\S]+)$/i
    .exec(normalizedText)

  if (prefixMatch?.[1]) {
    return normalizeSlideEditSlideNotesText(prefixMatch[1])
  }

  const lines = normalizedText.split('\n')
  const headingIndex = lines.findIndex((line) =>
    /^\s{0,3}#{1,6}\s*(?:speaker notes|presenter notes|notes)\s*#*\s*$/i
      .test(line) ||
    /^\s*(?:speaker notes|presenter notes|notes)\s*$/i.test(line)
  )

  if (headingIndex < 0) {
    return null
  }

  const notesLines: string[] = []

  for (const line of lines.slice(headingIndex + 1)) {
    if (/^\s{0,3}#{1,6}\s+\S+/.test(line) && notesLines.length > 0) {
      break
    }

    notesLines.push(line)
  }

  return normalizeSlideEditSlideNotesText(notesLines.join('\n'))
}

function normalizeSlideEditSlideNotesText(value: unknown) {
  return typeof value === 'string' && value.trim()
    ? value.trim()
    : null
}

function parseSlideEditSlideNotesJSON(value: string) {
  const trimmedValue = value.trim()

  if (!trimmedValue) {
    return null
  }

  try {
    return JSON.parse(trimmedValue) as unknown
  } catch {
    return trimmedValue
  }
}
