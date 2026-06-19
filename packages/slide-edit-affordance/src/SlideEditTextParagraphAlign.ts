import { SLIDE_EDIT_TEXT_JSON_PASTE_TYPES } from './SlideEditTextJSONPaste'

export type SlideEditTextParagraphAlignSlideId = string
export type SlideEditTextParagraphAlignObjectId = string

export type SlideEditTextParagraphAlignValue =
  | 'center'
  | 'left'
  | 'right'

export type SlideEditTextParagraphAlignCSSValue =
  | 'center'
  | 'left'
  | 'right'

export type SlideEditTextParagraphAlignOption = {
  cssTextAlign: SlideEditTextParagraphAlignCSSValue
  id: SlideEditTextParagraphAlignValue
  label: string
}

export type SlideEditTextParagraphAlignFieldDescriptor = {
  commandId: 'update-text-paragraph-align'
  control: 'paragraph-align-segmented-control'
  id: 'paragraphAlign'
  jsonKeys: readonly string[]
  jsonMimeType: string
  options: readonly SlideEditTextParagraphAlignOption[]
  requiredAdapterSlot: 'command-effect'
}

export type SlideEditTextParagraphAlignDescriptor<
  TSlideId extends SlideEditTextParagraphAlignSlideId =
    SlideEditTextParagraphAlignSlideId,
  TObjectId extends SlideEditTextParagraphAlignObjectId =
    SlideEditTextParagraphAlignObjectId,
> = {
  field: SlideEditTextParagraphAlignFieldDescriptor
  objectId: TObjectId
  slideId: TSlideId
  surface: 'text-paragraph-align'
  value: SlideEditTextParagraphAlignValue
}

export type SlideEditTextParagraphAlignUpdateCommand<
  TSlideId extends SlideEditTextParagraphAlignSlideId =
    SlideEditTextParagraphAlignSlideId,
  TObjectId extends SlideEditTextParagraphAlignObjectId =
    SlideEditTextParagraphAlignObjectId,
> = {
  fieldId: 'paragraphAlign'
  id: 'update-text-paragraph-align'
  objectId: TObjectId
  slideId: TSlideId
  value: SlideEditTextParagraphAlignValue
}

export type SlideEditTextParagraphAlignHostCommandEffect<
  TSlideId extends SlideEditTextParagraphAlignSlideId =
    SlideEditTextParagraphAlignSlideId,
  TObjectId extends SlideEditTextParagraphAlignObjectId =
    SlideEditTextParagraphAlignObjectId,
> = {
  payload: SlideEditTextParagraphAlignUpdateCommand<TSlideId, TObjectId>
  selection: {
    objectIds: readonly TObjectId[]
    slideId: TSlideId
  }
  type: 'slide-command-effect'
}

export type SlideEditTextParagraphAlignDataTransfer = Pick<
  DataTransfer,
  'getData'
>

export type SlideEditTextParagraphAlignJSONPasteInput = {
  dataTransfer: SlideEditTextParagraphAlignDataTransfer | null
  jsonMimeType?: string
}

export type SlideEditTextParagraphAlignJSONPasteValueMode =
  | 'direct'
  | 'wrapped'

export type SlideEditTextParagraphAlignJSONPasteValueOptions = {
  mode?: SlideEditTextParagraphAlignJSONPasteValueMode
}

export const SLIDE_EDIT_TEXT_PARAGRAPH_ALIGN_DEFAULT = 'left'

export const SLIDE_EDIT_TEXT_PARAGRAPH_ALIGN_VALUES = Object.freeze([
  'left',
  'center',
  'right',
] as const satisfies readonly SlideEditTextParagraphAlignValue[])

export const SLIDE_EDIT_TEXT_PARAGRAPH_ALIGN_OPTIONS = Object.freeze([
  {
    cssTextAlign: 'left',
    id: 'left',
    label: 'Left',
  },
  {
    cssTextAlign: 'center',
    id: 'center',
    label: 'Center',
  },
  {
    cssTextAlign: 'right',
    id: 'right',
    label: 'Right',
  },
] as const satisfies readonly SlideEditTextParagraphAlignOption[])

export const SLIDE_EDIT_TEXT_PARAGRAPH_ALIGN_FIELD = Object.freeze({
  commandId: 'update-text-paragraph-align',
  control: 'paragraph-align-segmented-control',
  id: 'paragraphAlign',
  jsonKeys: [
    'textParagraphAlign',
    'paragraphAlign',
    'textAlign',
    'align',
    'value',
  ],
  jsonMimeType:
    'application/vnd.interactive-os.slide-edit.text-paragraph-align+json',
  options: SLIDE_EDIT_TEXT_PARAGRAPH_ALIGN_OPTIONS,
  requiredAdapterSlot: 'command-effect',
} as const satisfies SlideEditTextParagraphAlignFieldDescriptor)

export function createSlideEditTextParagraphAlignDescriptor<
  TSlideId extends SlideEditTextParagraphAlignSlideId,
  TObjectId extends SlideEditTextParagraphAlignObjectId,
>({
  field = SLIDE_EDIT_TEXT_PARAGRAPH_ALIGN_FIELD,
  objectId,
  slideId,
  value = SLIDE_EDIT_TEXT_PARAGRAPH_ALIGN_DEFAULT,
}: {
  field?: SlideEditTextParagraphAlignFieldDescriptor
  objectId: TObjectId
  slideId: TSlideId
  value?: unknown
}): SlideEditTextParagraphAlignDescriptor<TSlideId, TObjectId> {
  return {
    field,
    objectId,
    slideId,
    surface: 'text-paragraph-align',
    value: normalizeSlideEditTextParagraphAlign(value),
  }
}

export function getSlideEditTextParagraphAlignCommandEffect<
  TSlideId extends SlideEditTextParagraphAlignSlideId,
  TObjectId extends SlideEditTextParagraphAlignObjectId,
>(
  command: SlideEditTextParagraphAlignUpdateCommand<TSlideId, TObjectId>,
): SlideEditTextParagraphAlignHostCommandEffect<TSlideId, TObjectId> {
  return {
    payload: normalizeSlideEditTextParagraphAlignUpdateCommand(command),
    selection: {
      objectIds: [command.objectId],
      slideId: command.slideId,
    },
    type: 'slide-command-effect',
  }
}

export function normalizeSlideEditTextParagraphAlignUpdateCommand<
  TSlideId extends SlideEditTextParagraphAlignSlideId,
  TObjectId extends SlideEditTextParagraphAlignObjectId,
>(
  command: SlideEditTextParagraphAlignUpdateCommand<TSlideId, TObjectId>,
): SlideEditTextParagraphAlignUpdateCommand<TSlideId, TObjectId> {
  return {
    ...command,
    value: normalizeSlideEditTextParagraphAlign(command.value),
  }
}

export function getSlideEditTextParagraphAlignCSSValue(
  value: unknown,
): SlideEditTextParagraphAlignCSSValue {
  return normalizeSlideEditTextParagraphAlign(value)
}

export function getSlideEditTextParagraphAlignJSONPasteValue({
  dataTransfer,
  jsonMimeType = SLIDE_EDIT_TEXT_PARAGRAPH_ALIGN_FIELD.jsonMimeType,
}: SlideEditTextParagraphAlignJSONPasteInput):
  SlideEditTextParagraphAlignValue | null {
  if (!dataTransfer) {
    return null
  }

  if (jsonMimeType) {
    const normalizedCustomValue =
      getSlideEditTextParagraphAlignJSONPasteValueFromText(
        dataTransfer.getData(jsonMimeType),
        { mode: 'direct' },
      )

    if (normalizedCustomValue !== null) {
      return normalizedCustomValue
    }
  }

  for (const type of SLIDE_EDIT_TEXT_JSON_PASTE_TYPES) {
    const explicitValue =
      getSlideEditTextParagraphAlignJSONPasteValueFromText(
        dataTransfer.getData(type),
        { mode: 'wrapped' },
      )

    if (explicitValue !== null) {
      return explicitValue
    }
  }

  return null
}

export function getSlideEditTextParagraphAlignJSONPasteValueFromText(
  text: string,
  options?: SlideEditTextParagraphAlignJSONPasteValueOptions,
): SlideEditTextParagraphAlignValue | null {
  return getSlideEditTextParagraphAlignJSONPasteValueFromValue(
    parseSlideEditTextParagraphAlignJSON(text),
    options,
  )
}

export function getSlideEditTextParagraphAlignJSONPasteValueFromValue(
  value: unknown,
  { mode = 'direct' }: SlideEditTextParagraphAlignJSONPasteValueOptions = {},
): SlideEditTextParagraphAlignValue | null {
  return mode === 'wrapped'
    ? getSlideEditTextParagraphAlignExplicitJSONValue(value)
    : normalizeSlideEditTextParagraphAlignJSONValue(value)
}

export function normalizeSlideEditTextParagraphAlign(
  value: unknown,
): SlideEditTextParagraphAlignValue {
  return normalizeSlideEditTextParagraphAlignJSONValue(value) ??
    SLIDE_EDIT_TEXT_PARAGRAPH_ALIGN_DEFAULT
}

function normalizeSlideEditTextParagraphAlignJSONValue(
  value: unknown,
): SlideEditTextParagraphAlignValue | null {
  return isSlideEditTextParagraphAlignValue(value) ? value : null
}

function isSlideEditTextParagraphAlignValue(
  value: unknown,
): value is SlideEditTextParagraphAlignValue {
  return typeof value === 'string' &&
    SLIDE_EDIT_TEXT_PARAGRAPH_ALIGN_VALUES.includes(
      value as SlideEditTextParagraphAlignValue,
    )
}

function getSlideEditTextParagraphAlignExplicitJSONValue(
  value: unknown,
): SlideEditTextParagraphAlignValue | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  const record = value as Record<string, unknown>

  for (const key of SLIDE_EDIT_TEXT_PARAGRAPH_ALIGN_FIELD.jsonKeys) {
    if (Object.hasOwn(record, key)) {
      return normalizeSlideEditTextParagraphAlignJSONValue(record[key])
    }
  }

  return null
}

function parseSlideEditTextParagraphAlignJSON(value: string) {
  if (!value.trim()) {
    return null
  }

  try {
    return JSON.parse(value) as unknown
  } catch {
    return null
  }
}
