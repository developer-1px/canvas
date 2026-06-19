import { SLIDE_EDIT_TEXT_JSON_PASTE_TYPES } from './SlideEditTextJSONPaste'

export type SlideEditTextVerticalAlignmentSlideId = string
export type SlideEditTextVerticalAlignmentObjectId = string

export type SlideEditTextVerticalAlignmentValue =
  | 'bottom'
  | 'middle'
  | 'top'

export type SlideEditTextVerticalAlignmentOption = {
  id: SlideEditTextVerticalAlignmentValue
  label: string
}

export type SlideEditTextVerticalAlignmentFlexAlignItems =
  | 'center'
  | 'flex-end'
  | 'flex-start'

export type SlideEditTextVerticalAlignmentFieldDescriptor = {
  commandId: 'update-text-vertical-alignment'
  control: 'vertical-alignment-segmented-control'
  id: 'verticalAlignment'
  options: readonly SlideEditTextVerticalAlignmentOption[]
  requiredAdapterSlot: 'command-effect'
}

export type SlideEditTextVerticalAlignmentMetadata = {
  attribute: typeof SLIDE_EDIT_TEXT_VERTICAL_ALIGNMENT_DATA_ATTRIBUTE
  defaultValue: typeof SLIDE_EDIT_TEXT_VERTICAL_ALIGNMENT_DEFAULT
  value: SlideEditTextVerticalAlignmentValue
}

export type SlideEditTextVerticalAlignmentDescriptor<
  TSlideId extends SlideEditTextVerticalAlignmentSlideId =
    SlideEditTextVerticalAlignmentSlideId,
  TObjectId extends SlideEditTextVerticalAlignmentObjectId =
    SlideEditTextVerticalAlignmentObjectId,
> = {
  field: SlideEditTextVerticalAlignmentFieldDescriptor
  metadata: SlideEditTextVerticalAlignmentMetadata
  objectId: TObjectId
  slideId: TSlideId
  surface: 'text-vertical-alignment'
  value: SlideEditTextVerticalAlignmentValue
}

export type SlideEditTextVerticalAlignmentUpdateCommand<
  TSlideId extends SlideEditTextVerticalAlignmentSlideId =
    SlideEditTextVerticalAlignmentSlideId,
  TObjectId extends SlideEditTextVerticalAlignmentObjectId =
    SlideEditTextVerticalAlignmentObjectId,
> = {
  fieldId: 'verticalAlignment'
  id: 'update-text-vertical-alignment'
  objectId: TObjectId
  slideId: TSlideId
  value: SlideEditTextVerticalAlignmentValue
}

export type SlideEditTextVerticalAlignmentHostCommandEffect<
  TSlideId extends SlideEditTextVerticalAlignmentSlideId =
    SlideEditTextVerticalAlignmentSlideId,
  TObjectId extends SlideEditTextVerticalAlignmentObjectId =
    SlideEditTextVerticalAlignmentObjectId,
> = {
  payload: SlideEditTextVerticalAlignmentUpdateCommand<TSlideId, TObjectId>
  selection: {
    objectIds: readonly TObjectId[]
    slideId: TSlideId
  }
  type: 'slide-command-effect'
}

export type SlideEditTextVerticalAlignmentDataTransfer = Pick<
  DataTransfer,
  'getData'
>

export type SlideEditTextVerticalAlignmentJSONPasteValue = {
  surface: 'text-vertical-alignment'
  value: SlideEditTextVerticalAlignmentValue
}

export type SlideEditTextVerticalAlignmentJSONPasteInput = {
  dataTransfer: SlideEditTextVerticalAlignmentDataTransfer | null
  jsonMimeType?: string
}

export type SlideEditTextVerticalAlignmentJSONPasteValueMode =
  | 'direct'
  | 'wrapped'

export type SlideEditTextVerticalAlignmentJSONPasteValueOptions = {
  mode?: SlideEditTextVerticalAlignmentJSONPasteValueMode
}

export type SlideEditTextVerticalAlignmentPasteCommandsInput<
  TSlideId extends SlideEditTextVerticalAlignmentSlideId =
    SlideEditTextVerticalAlignmentSlideId,
  TObjectId extends SlideEditTextVerticalAlignmentObjectId =
    SlideEditTextVerticalAlignmentObjectId,
> = {
  objectIds: readonly TObjectId[]
  pasteValue: SlideEditTextVerticalAlignmentJSONPasteValue
  slideId: TSlideId
}

export const SLIDE_EDIT_TEXT_VERTICAL_ALIGNMENT_DEFAULT = 'top'

export const SLIDE_EDIT_TEXT_VERTICAL_ALIGNMENT_DATA_ATTRIBUTE =
  'data-slide-text-vertical-align'

export const SLIDE_EDIT_TEXT_VERTICAL_ALIGNMENT_OPTIONS = Object.freeze([
  {
    id: 'top',
    label: 'Top',
  },
  {
    id: 'middle',
    label: 'Middle',
  },
  {
    id: 'bottom',
    label: 'Bottom',
  },
] as const satisfies readonly SlideEditTextVerticalAlignmentOption[])

export const SLIDE_EDIT_TEXT_VERTICAL_ALIGNMENT_FIELD = Object.freeze({
  commandId: 'update-text-vertical-alignment',
  control: 'vertical-alignment-segmented-control',
  id: 'verticalAlignment',
  options: SLIDE_EDIT_TEXT_VERTICAL_ALIGNMENT_OPTIONS,
  requiredAdapterSlot: 'command-effect',
} as const satisfies SlideEditTextVerticalAlignmentFieldDescriptor)

export const SLIDE_EDIT_TEXT_VERTICAL_ALIGNMENT_JSON_MIME_TYPE =
  'application/vnd.interactive-os.slide-edit.text-vertical-alignment+json'

export const SLIDE_EDIT_TEXT_VERTICAL_ALIGNMENT_JSON_TYPES =
  SLIDE_EDIT_TEXT_JSON_PASTE_TYPES

export const SLIDE_EDIT_TEXT_VERTICAL_ALIGNMENT_JSON_KEYS = Object.freeze([
  'textVerticalAlign',
  'textVerticalAlignment',
  'verticalAlign',
  'verticalAlignment',
  'alignItems',
] as const)

const SLIDE_EDIT_TEXT_VERTICAL_ALIGNMENT_DIRECT_JSON_KEYS = Object.freeze([
  ...SLIDE_EDIT_TEXT_VERTICAL_ALIGNMENT_JSON_KEYS,
  'value',
] as const)

export function createSlideEditTextVerticalAlignmentDescriptor<
  TSlideId extends SlideEditTextVerticalAlignmentSlideId,
  TObjectId extends SlideEditTextVerticalAlignmentObjectId,
>({
  field = SLIDE_EDIT_TEXT_VERTICAL_ALIGNMENT_FIELD,
  objectId,
  slideId,
  value = SLIDE_EDIT_TEXT_VERTICAL_ALIGNMENT_DEFAULT,
}: {
  field?: SlideEditTextVerticalAlignmentFieldDescriptor
  objectId: TObjectId
  slideId: TSlideId
  value?: string | null
}): SlideEditTextVerticalAlignmentDescriptor<TSlideId, TObjectId> {
  const normalizedValue = normalizeSlideEditTextVerticalAlignment(value)

  return {
    field,
    metadata: getSlideEditTextVerticalAlignmentMetadata(normalizedValue),
    objectId,
    slideId,
    surface: 'text-vertical-alignment',
    value: normalizedValue,
  }
}

export function getSlideEditTextVerticalAlignmentCommandEffect<
  TSlideId extends SlideEditTextVerticalAlignmentSlideId,
  TObjectId extends SlideEditTextVerticalAlignmentObjectId,
>(
  command: SlideEditTextVerticalAlignmentUpdateCommand<TSlideId, TObjectId>,
): SlideEditTextVerticalAlignmentHostCommandEffect<TSlideId, TObjectId> {
  return {
    payload: normalizeSlideEditTextVerticalAlignmentUpdateCommand(command),
    selection: {
      objectIds: [command.objectId],
      slideId: command.slideId,
    },
    type: 'slide-command-effect',
  }
}

export function getSlideEditTextVerticalAlignmentJSONPasteValue({
  dataTransfer,
  jsonMimeType = SLIDE_EDIT_TEXT_VERTICAL_ALIGNMENT_JSON_MIME_TYPE,
}: SlideEditTextVerticalAlignmentJSONPasteInput):
  SlideEditTextVerticalAlignmentJSONPasteValue | null {
  if (!dataTransfer) {
    return null
  }

  if (jsonMimeType) {
    const customText = dataTransfer.getData(jsonMimeType)

    if (customText.trim()) {
      const customPasteValue =
        getSlideEditTextVerticalAlignmentJSONPasteValueFromText(
          customText,
          { mode: 'direct' },
        )

      if (customPasteValue !== null) {
        return customPasteValue
      }
    }
  }

  for (const type of SLIDE_EDIT_TEXT_VERTICAL_ALIGNMENT_JSON_TYPES) {
    const text = dataTransfer.getData(type)

    if (!text.trim()) {
      continue
    }

    const pasteValue =
      getSlideEditTextVerticalAlignmentJSONPasteValueFromText(
        text,
        { mode: 'wrapped' },
      )

    if (pasteValue !== null) {
      return pasteValue
    }
  }

  return null
}

export function getSlideEditTextVerticalAlignmentJSONPasteValueFromText(
  text: string,
  options?: SlideEditTextVerticalAlignmentJSONPasteValueOptions,
): SlideEditTextVerticalAlignmentJSONPasteValue | null {
  return getSlideEditTextVerticalAlignmentJSONPasteValueFromValue(
    parseSlideEditTextVerticalAlignmentJSON(text),
    options,
  )
}

export function getSlideEditTextVerticalAlignmentJSONPasteValueFromValue(
  value: unknown,
  {
    mode = 'direct',
  }: SlideEditTextVerticalAlignmentJSONPasteValueOptions = {},
): SlideEditTextVerticalAlignmentJSONPasteValue | null {
  return mode === 'wrapped'
    ? getSlideEditTextVerticalAlignmentExplicitJSONPasteValue(value)
    : getSlideEditTextVerticalAlignmentDirectPasteValue(value)
}

export function getSlideEditTextVerticalAlignmentPasteCommands<
  TSlideId extends SlideEditTextVerticalAlignmentSlideId,
  TObjectId extends SlideEditTextVerticalAlignmentObjectId,
>({
  objectIds,
  pasteValue,
  slideId,
}: SlideEditTextVerticalAlignmentPasteCommandsInput<TSlideId, TObjectId>):
  readonly SlideEditTextVerticalAlignmentUpdateCommand<TSlideId, TObjectId>[] {
  return objectIds.map((objectId) => ({
    fieldId: 'verticalAlignment',
    id: 'update-text-vertical-alignment',
    objectId,
    slideId,
    value: pasteValue.value,
  }))
}

export function normalizeSlideEditTextVerticalAlignmentUpdateCommand<
  TSlideId extends SlideEditTextVerticalAlignmentSlideId,
  TObjectId extends SlideEditTextVerticalAlignmentObjectId,
>(
  command: SlideEditTextVerticalAlignmentUpdateCommand<TSlideId, TObjectId>,
): SlideEditTextVerticalAlignmentUpdateCommand<TSlideId, TObjectId> {
  return {
    ...command,
    value: normalizeSlideEditTextVerticalAlignment(command.value),
  }
}

export function getSlideEditTextVerticalAlignmentMetadata(
  value: string | null | undefined,
): SlideEditTextVerticalAlignmentMetadata {
  return {
    attribute: SLIDE_EDIT_TEXT_VERTICAL_ALIGNMENT_DATA_ATTRIBUTE,
    defaultValue: SLIDE_EDIT_TEXT_VERTICAL_ALIGNMENT_DEFAULT,
    value: normalizeSlideEditTextVerticalAlignment(value),
  }
}

export function normalizeSlideEditTextVerticalAlignment(
  value: string | null | undefined,
): SlideEditTextVerticalAlignmentValue {
  return isSlideEditTextVerticalAlignmentValue(value)
    ? value
    : SLIDE_EDIT_TEXT_VERTICAL_ALIGNMENT_DEFAULT
}

export function getSlideEditTextVerticalAlignmentFlexAlignItems(
  value: string | null | undefined,
): SlideEditTextVerticalAlignmentFlexAlignItems {
  switch (normalizeSlideEditTextVerticalAlignment(value)) {
    case 'bottom':
      return 'flex-end'
    case 'middle':
      return 'center'
    case 'top':
      return 'flex-start'
  }
}

export function isSlideEditTextVerticalAlignmentValue(
  value: string | null | undefined,
): value is SlideEditTextVerticalAlignmentValue {
  return value === 'top' || value === 'middle' || value === 'bottom'
}

function getSlideEditTextVerticalAlignmentDirectPasteValue(
  value: unknown,
): SlideEditTextVerticalAlignmentJSONPasteValue | null {
  const normalizedValue = normalizeSlideEditTextVerticalAlignmentJSONValue(
    value,
  )

  if (normalizedValue !== null) {
    return {
      surface: 'text-vertical-alignment',
      value: normalizedValue,
    }
  }

  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  const record = value as Record<string, unknown>

  for (const key of SLIDE_EDIT_TEXT_VERTICAL_ALIGNMENT_DIRECT_JSON_KEYS) {
    if (!Object.hasOwn(record, key)) {
      continue
    }

    const pasteValue = getSlideEditTextVerticalAlignmentDirectPasteValue(
      record[key],
    )

    if (pasteValue !== null) {
      return pasteValue
    }
  }

  return null
}

function getSlideEditTextVerticalAlignmentExplicitJSONPasteValue(
  value: unknown,
): SlideEditTextVerticalAlignmentJSONPasteValue | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  const record = value as Record<string, unknown>

  for (const key of SLIDE_EDIT_TEXT_VERTICAL_ALIGNMENT_JSON_KEYS) {
    if (!Object.hasOwn(record, key)) {
      continue
    }

    const normalizedValue = normalizeSlideEditTextVerticalAlignmentJSONValue(
      record[key],
    )

    if (normalizedValue !== null) {
      return {
        surface: 'text-vertical-alignment',
        value: normalizedValue,
      }
    }
  }

  return null
}

function normalizeSlideEditTextVerticalAlignmentJSONValue(value: unknown):
  SlideEditTextVerticalAlignmentValue | null {
  if (typeof value !== 'string') {
    return null
  }

  switch (value.trim().toLowerCase()) {
    case 'flex-start':
    case 'start':
    case 'top':
      return 'top'
    case 'center':
    case 'middle':
      return 'middle'
    case 'bottom':
    case 'end':
    case 'flex-end':
      return 'bottom'
    default:
      return null
  }
}

function parseSlideEditTextVerticalAlignmentJSON(value: string) {
  if (!value.trim()) {
    return null
  }

  try {
    return JSON.parse(value) as unknown
  } catch {
    return null
  }
}
