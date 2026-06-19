import type {
  SlideEditRailDescriptor,
  SlideEditRailSlideId,
} from './SlideEditRailInteractions'

export type SlideEditSlideMetadataSlideId = SlideEditRailSlideId
export type SlideEditSlideOrientation = 'landscape' | 'portrait'

export type SlideEditSlideBackgroundDescriptor =
  | {
    kind: 'none'
  }
  | {
    color: string
    kind: 'solid-color'
    tokenId?: string
  }
  | {
    assetId: string
    fitting: 'contain' | 'cover' | 'stretch' | 'tile'
    kind: 'image'
  }

export type SlideEditSlideSizeDescriptor = {
  h: number
  w: number
}

export type SlideEditSlideMetadataReadModel<
  TSlideId extends SlideEditSlideMetadataSlideId = SlideEditSlideMetadataSlideId,
> = {
  background: SlideEditSlideBackgroundDescriptor
  name: string
  notes: string
  orientation?: SlideEditSlideOrientation
  size?: SlideEditSlideSizeDescriptor
  slideId: TSlideId
}

export type SlideEditSlideMetadataFieldId =
  | 'background'
  | 'name'
  | 'notes'
  | 'orientation'
  | 'size'

export type SlideEditSlideMetadataOptionalFieldId = Extract<
  SlideEditSlideMetadataFieldId,
  'orientation' | 'size'
>

export type SlideEditSlideMetadataCommandId =
  | 'update-slide-background'
  | 'update-slide-name'
  | 'update-slide-notes'
  | 'update-slide-orientation'
  | 'update-slide-size'

export type SlideEditSlideMetadataFieldControl =
  | 'background-control'
  | 'multiline-text'
  | 'orientation-control'
  | 'size-control'
  | 'text'

export type SlideEditSlideMetadataFieldDescriptor = {
  commandId: SlideEditSlideMetadataCommandId
  control: SlideEditSlideMetadataFieldControl
  id: SlideEditSlideMetadataFieldId
  isEditable: boolean
  isOptional: boolean
  requiredAdapterSlot: 'command-effect'
}

export const SLIDE_EDIT_SLIDE_METADATA_FIELDS = Object.freeze([
  {
    commandId: 'update-slide-name',
    control: 'text',
    id: 'name',
    isEditable: true,
    isOptional: false,
    requiredAdapterSlot: 'command-effect',
  },
  {
    commandId: 'update-slide-background',
    control: 'background-control',
    id: 'background',
    isEditable: true,
    isOptional: false,
    requiredAdapterSlot: 'command-effect',
  },
  {
    commandId: 'update-slide-notes',
    control: 'multiline-text',
    id: 'notes',
    isEditable: true,
    isOptional: false,
    requiredAdapterSlot: 'command-effect',
  },
  {
    commandId: 'update-slide-size',
    control: 'size-control',
    id: 'size',
    isEditable: true,
    isOptional: true,
    requiredAdapterSlot: 'command-effect',
  },
  {
    commandId: 'update-slide-orientation',
    control: 'orientation-control',
    id: 'orientation',
    isEditable: true,
    isOptional: true,
    requiredAdapterSlot: 'command-effect',
  },
] as const satisfies readonly SlideEditSlideMetadataFieldDescriptor[])

export type SlideEditInspectorSurfaceId =
  | 'none'
  | 'object-selection-inspector'
  | 'slide-metadata-inspector'

export type SlideEditInspectorDisplayPriority = {
  rank: number
  surface: Exclude<SlideEditInspectorSurfaceId, 'none'>
  when: 'active-slide-without-object-selection' | 'selected-object-ids-present'
}

export const SLIDE_EDIT_INSPECTOR_DISPLAY_PRIORITY = Object.freeze([
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
] as const satisfies readonly SlideEditInspectorDisplayPriority[])

export type SlideEditSlideMetadataInspectorDescriptor<
  TSlideId extends SlideEditSlideMetadataSlideId = SlideEditSlideMetadataSlideId,
> = {
  activeSlide: {
    index: number | null
    slideCount: number
    slideId: TSlideId
  }
  fields: readonly SlideEditSlideMetadataFieldDescriptor[]
  metadata: SlideEditSlideMetadataReadModel<TSlideId>
  surface: 'slide-metadata-inspector'
}

export type SlideEditSlideMetadataUpdateCommand<
  TSlideId extends SlideEditSlideMetadataSlideId = SlideEditSlideMetadataSlideId,
> =
  | {
    fieldId: 'background'
    id: 'update-slide-background'
    slideId: TSlideId
    value: SlideEditSlideBackgroundDescriptor
  }
  | {
    fieldId: 'name'
    id: 'update-slide-name'
    slideId: TSlideId
    value: string
  }
  | {
    fieldId: 'notes'
    id: 'update-slide-notes'
    slideId: TSlideId
    value: string
  }
  | {
    fieldId: 'orientation'
    id: 'update-slide-orientation'
    slideId: TSlideId
    value: SlideEditSlideOrientation
  }
  | {
    fieldId: 'size'
    id: 'update-slide-size'
    slideId: TSlideId
    value: SlideEditSlideSizeDescriptor
  }

export type SlideEditSlideMetadataHostCommandEffect<
  TSlideId extends SlideEditSlideMetadataSlideId = SlideEditSlideMetadataSlideId,
> = {
  payload: SlideEditSlideMetadataUpdateCommand<TSlideId>
  selection: {
    objectIds: readonly never[]
    slideId: TSlideId
  }
  type: 'slide-command-effect'
}

export type SlideEditSlideNotesDataTransfer = Pick<DataTransfer, 'getData'>

export type SlideEditSlideNotesImportFormat =
  | typeof SLIDE_EDIT_SLIDE_NOTES_JSON_IMPORT_FORMAT
  | typeof SLIDE_EDIT_SLIDE_NOTES_MARKDOWN_IMPORT_FORMAT
  | typeof SLIDE_EDIT_SLIDE_NOTES_TEXT_IMPORT_FORMAT

export type SlideEditSlideNotesPasteValue = {
  format: SlideEditSlideNotesImportFormat
  model: typeof SLIDE_EDIT_SLIDE_NOTES_IMPORT_MODEL
  notes: string
  sourceType: string
  textLength: number
}

export type SlideEditSlideNotesPasteInput = {
  dataTransfer: SlideEditSlideNotesDataTransfer | null
}

export type SlideEditSlideNotesPasteValueOptions = {
  format?: SlideEditSlideNotesImportFormat
  sourceType?: string
}

export type SlideEditSlideNotesPasteCommandEffectInput<
  TSlideId extends SlideEditSlideMetadataSlideId,
> = {
  pasteValue: SlideEditSlideNotesPasteValue
  slideId: TSlideId
}

export const SLIDE_EDIT_SLIDE_NOTES_IMPORT_MODEL =
  'slide-edit-slide-notes-import' as const
export const SLIDE_EDIT_SLIDE_NOTES_JSON_IMPORT_FORMAT =
  'application-json-slide-edit-slide-notes' as const
export const SLIDE_EDIT_SLIDE_NOTES_MARKDOWN_IMPORT_FORMAT =
  'text-markdown-slide-edit-slide-notes' as const
export const SLIDE_EDIT_SLIDE_NOTES_TEXT_IMPORT_FORMAT =
  'text-plain-slide-edit-slide-notes' as const
export const SLIDE_EDIT_SLIDE_NOTES_JSON_MIME_TYPE =
  'application/vnd.interactive-os.slide-edit.slide-notes+json' as const

export function createSlideEditSlideMetadataInspectorDescriptor<
  TSlideId extends SlideEditSlideMetadataSlideId,
>({
  includeOptionalFields = ['size', 'orientation'],
  rail,
  readSlideMetadata,
}: {
  includeOptionalFields?: readonly SlideEditSlideMetadataOptionalFieldId[]
  rail: Pick<SlideEditRailDescriptor<TSlideId>, 'activeSlideId' | 'slideOrder'>
  readSlideMetadata: (
    slideId: TSlideId,
  ) => SlideEditSlideMetadataReadModel<TSlideId> | null
}): SlideEditSlideMetadataInspectorDescriptor<TSlideId> | null {
  if (!rail.activeSlideId) {
    return null
  }

  const metadata = readSlideMetadata(rail.activeSlideId)

  if (!metadata) {
    return null
  }

  const activeSlideIndex = rail.slideOrder.indexOf(rail.activeSlideId)

  return {
    activeSlide: {
      index: activeSlideIndex >= 0 ? activeSlideIndex : null,
      slideCount: rail.slideOrder.length,
      slideId: rail.activeSlideId,
    },
    fields: getSlideEditSlideMetadataFieldDescriptors({
      includeOptionalFields,
    }),
    metadata,
    surface: 'slide-metadata-inspector',
  }
}

export function getSlideEditSlideMetadataFieldDescriptors({
  includeOptionalFields = ['size', 'orientation'],
}: {
  includeOptionalFields?: readonly SlideEditSlideMetadataOptionalFieldId[]
} = {}): readonly SlideEditSlideMetadataFieldDescriptor[] {
  return SLIDE_EDIT_SLIDE_METADATA_FIELDS.filter((field) =>
    !field.isOptional
    || includeOptionalFields.includes(
      field.id as SlideEditSlideMetadataOptionalFieldId,
    )
  )
}

export function getSlideEditInspectorSurface({
  activeSlideId,
  selectedObjectIds,
}: {
  activeSlideId: SlideEditSlideMetadataSlideId | null
  selectedObjectIds: readonly string[]
}): SlideEditInspectorSurfaceId {
  if (selectedObjectIds.length > 0) {
    return 'object-selection-inspector'
  }

  return activeSlideId ? 'slide-metadata-inspector' : 'none'
}

export function toSlideEditSlideMetadataHostCommandEffect<
  TSlideId extends SlideEditSlideMetadataSlideId,
>(
  command: SlideEditSlideMetadataUpdateCommand<TSlideId>,
): SlideEditSlideMetadataHostCommandEffect<TSlideId> {
  return {
    payload: command,
    selection: {
      objectIds: [],
      slideId: command.slideId,
    },
    type: 'slide-command-effect',
  }
}

export function getSlideEditSlideNotesPasteValue({
  dataTransfer,
}: SlideEditSlideNotesPasteInput): SlideEditSlideNotesPasteValue | null {
  if (!dataTransfer) {
    return null
  }

  const candidates: readonly {
    format: SlideEditSlideNotesImportFormat
    mimeType: string
  }[] = [
    {
      format: SLIDE_EDIT_SLIDE_NOTES_JSON_IMPORT_FORMAT,
      mimeType: SLIDE_EDIT_SLIDE_NOTES_JSON_MIME_TYPE,
    },
    {
      format: SLIDE_EDIT_SLIDE_NOTES_JSON_IMPORT_FORMAT,
      mimeType: 'application/json',
    },
    {
      format: SLIDE_EDIT_SLIDE_NOTES_JSON_IMPORT_FORMAT,
      mimeType: 'text/json',
    },
    {
      format: SLIDE_EDIT_SLIDE_NOTES_MARKDOWN_IMPORT_FORMAT,
      mimeType: 'text/markdown',
    },
    {
      format: SLIDE_EDIT_SLIDE_NOTES_TEXT_IMPORT_FORMAT,
      mimeType: 'text/plain',
    },
  ]

  for (const candidate of candidates) {
    const text = dataTransfer.getData(candidate.mimeType)
    const pasteValue = getSlideEditSlideNotesPasteValueFromText(text, {
      format: candidate.format,
      sourceType: candidate.mimeType,
    })

    if (pasteValue) {
      return pasteValue
    }
  }

  return null
}

export function getSlideEditSlideNotesPasteValueFromText(
  text: string,
  options: SlideEditSlideNotesPasteValueOptions = {},
): SlideEditSlideNotesPasteValue | null {
  const format = options.format ?? SLIDE_EDIT_SLIDE_NOTES_JSON_IMPORT_FORMAT
  const sourceType = options.sourceType ?? getSlideEditSlideNotesDefaultSourceType(format)
  const normalized = normalizeSlideEditSlideNotesLineEndings(text).trim()

  if (!normalized) {
    return null
  }

  if (format === SLIDE_EDIT_SLIDE_NOTES_JSON_IMPORT_FORMAT) {
    return getSlideEditSlideNotesPasteValueFromValue(
      parseSlideEditSlideNotesJSONText(normalized),
      {
        format,
        sourceType,
      },
      normalized.length,
    )
  }

  const notes = getSlideEditSlideNotesFromMarkedText(normalized)

  return notes
    ? {
        format,
        model: SLIDE_EDIT_SLIDE_NOTES_IMPORT_MODEL,
        notes,
        sourceType,
        textLength: normalized.length,
      }
    : null
}

export function getSlideEditSlideNotesPasteValueFromValue(
  value: unknown,
  options: SlideEditSlideNotesPasteValueOptions = {},
  textLength = JSON.stringify(value)?.length ?? 0,
): SlideEditSlideNotesPasteValue | null {
  const format = options.format ?? SLIDE_EDIT_SLIDE_NOTES_JSON_IMPORT_FORMAT
  const sourceType = options.sourceType ?? getSlideEditSlideNotesDefaultSourceType(format)
  const notes = getSlideEditSlideNotesFromJSONValue(value)

  return notes
    ? {
        format,
        model: SLIDE_EDIT_SLIDE_NOTES_IMPORT_MODEL,
        notes,
        sourceType,
        textLength,
      }
    : null
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

function getSlideEditSlideNotesDefaultSourceType(
  format: SlideEditSlideNotesImportFormat,
) {
  if (format === SLIDE_EDIT_SLIDE_NOTES_MARKDOWN_IMPORT_FORMAT) {
    return 'text/markdown'
  }

  if (format === SLIDE_EDIT_SLIDE_NOTES_TEXT_IMPORT_FORMAT) {
    return 'text/plain'
  }

  return SLIDE_EDIT_SLIDE_NOTES_JSON_MIME_TYPE
}

function getSlideEditSlideNotesFromJSONValue(value: unknown): string | null {
  if (typeof value === 'string') {
    return normalizeSlideEditSlideNotesText(value)
  }

  if (!isSlideEditSlideNotesRecord(value)) {
    return null
  }

  const directValue =
    value.notes ??
    value.speakerNotes ??
    value.speaker_notes ??
    value.presenterNotes

  if (typeof directValue === 'string') {
    return normalizeSlideEditSlideNotesText(directValue)
  }

  for (const key of ['slideNotes', 'speakerNotes', 'presenterNotes', 'slide']) {
    const wrappedValue = value[key]

    if (!isSlideEditSlideNotesRecord(wrappedValue)) {
      continue
    }

    const notes = getSlideEditSlideNotesFromJSONValue(wrappedValue)

    if (notes) {
      return notes
    }
  }

  return null
}

function getSlideEditSlideNotesFromMarkedText(text: string) {
  const lines = text.split('\n')
  const firstContentIndex = lines.findIndex((line) => line.trim())

  if (firstContentIndex < 0) {
    return null
  }

  const firstLine = lines[firstContentIndex]?.trim() ?? ''
  const headingMatch = firstLine.match(
    /^#{1,6}\s*(?:speaker\s+notes?|presenter\s+notes?|notes?)\s*#*$/i,
  )
  const prefixMatch = firstLine.match(
    /^(?:speaker\s+notes?|presenter\s+notes?|notes?)\s*:\s*(.*)$/i,
  )

  if (!headingMatch && !prefixMatch) {
    return null
  }

  const noteLines = [
    ...(prefixMatch?.[1]?.trim() ? [prefixMatch[1].trim()] : []),
    ...lines.slice(firstContentIndex + 1),
  ]

  return normalizeSlideEditSlideNotesText(noteLines.join('\n'))
}

function normalizeSlideEditSlideNotesText(text: string): string | null {
  const normalized = normalizeSlideEditSlideNotesLineEndings(text)
    .split('\n')
    .map((line) => line.trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  return normalized || null
}

function normalizeSlideEditSlideNotesLineEndings(text: string) {
  return text.replace(/\r\n?/g, '\n')
}

function parseSlideEditSlideNotesJSONText(text: string): unknown {
  const jsonText = getSlideEditSlideNotesJSONText(text)

  if (!jsonText) {
    return null
  }

  try {
    return JSON.parse(jsonText)
  } catch {
    return null
  }
}

function getSlideEditSlideNotesJSONText(text: string) {
  if (text.startsWith('{') || text.startsWith('[') || text.startsWith('"')) {
    return text
  }

  const fenced = text.match(/^```(?:json|slide|slide-json)?\s*\n([\s\S]*?)\n```$/i) ??
    text.match(/```(?:json|slide|slide-json)?\s*\n([\s\S]*?)\n```/i)

  return fenced?.[1]?.trim() ?? null
}

function isSlideEditSlideNotesRecord(
  value: unknown,
): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
