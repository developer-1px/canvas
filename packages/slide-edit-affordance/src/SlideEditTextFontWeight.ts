import {
  parseSlideEditJSONPasteTextValue,
  SLIDE_EDIT_TEXT_JSON_PASTE_TYPES,
} from './SlideEditTextJSONPaste'

export type SlideEditTextFontWeightSlideId = string
export type SlideEditTextFontWeightObjectId = string

export type SlideEditTextFontWeightValue =
  | 'bold'
  | 'regular'
  | 'semibold'

export type SlideEditTextFontWeightCSSValue =
  | 400
  | 600
  | 700

export type SlideEditTextFontWeightOption = {
  cssFontWeight: SlideEditTextFontWeightCSSValue
  id: SlideEditTextFontWeightValue
  label: string
}

export type SlideEditTextFontWeightFieldDescriptor = {
  commandId: 'update-text-font-weight'
  control: 'font-weight-segmented-control'
  id: 'fontWeight'
  jsonKeys: readonly string[]
  jsonMimeType: string
  options: readonly SlideEditTextFontWeightOption[]
  requiredAdapterSlot: 'command-effect'
}

export type SlideEditTextFontWeightDescriptor<
  TSlideId extends SlideEditTextFontWeightSlideId =
    SlideEditTextFontWeightSlideId,
  TObjectId extends SlideEditTextFontWeightObjectId =
    SlideEditTextFontWeightObjectId,
> = {
  field: SlideEditTextFontWeightFieldDescriptor
  objectId: TObjectId
  slideId: TSlideId
  surface: 'text-font-weight'
  value: SlideEditTextFontWeightValue
}

export type SlideEditTextFontWeightUpdateCommand<
  TSlideId extends SlideEditTextFontWeightSlideId =
    SlideEditTextFontWeightSlideId,
  TObjectId extends SlideEditTextFontWeightObjectId =
    SlideEditTextFontWeightObjectId,
> = {
  fieldId: 'fontWeight'
  id: 'update-text-font-weight'
  objectId: TObjectId
  slideId: TSlideId
  value: SlideEditTextFontWeightValue
}

export type SlideEditTextFontWeightHostCommandEffect<
  TSlideId extends SlideEditTextFontWeightSlideId =
    SlideEditTextFontWeightSlideId,
  TObjectId extends SlideEditTextFontWeightObjectId =
    SlideEditTextFontWeightObjectId,
> = {
  payload: SlideEditTextFontWeightUpdateCommand<TSlideId, TObjectId>
  selection: {
    objectIds: readonly TObjectId[]
    slideId: TSlideId
  }
  type: 'slide-command-effect'
}

export type SlideEditTextFontWeightDataTransfer = Pick<
  DataTransfer,
  'getData'
>

export type SlideEditTextFontWeightJSONPasteInput = {
  dataTransfer: SlideEditTextFontWeightDataTransfer | null
  jsonMimeType?: string
}

export type SlideEditTextFontWeightJSONPasteValueMode =
  | 'direct'
  | 'wrapped'

export type SlideEditTextFontWeightJSONPasteValueOptions = {
  mode?: SlideEditTextFontWeightJSONPasteValueMode
}

export const SLIDE_EDIT_TEXT_FONT_WEIGHT_DEFAULT = 'regular'

export const SLIDE_EDIT_TEXT_FONT_WEIGHT_VALUES = Object.freeze([
  'regular',
  'semibold',
  'bold',
] as const satisfies readonly SlideEditTextFontWeightValue[])

export const SLIDE_EDIT_TEXT_FONT_WEIGHT_OPTIONS = Object.freeze([
  {
    cssFontWeight: 400,
    id: 'regular',
    label: 'Regular',
  },
  {
    cssFontWeight: 600,
    id: 'semibold',
    label: 'Semibold',
  },
  {
    cssFontWeight: 700,
    id: 'bold',
    label: 'Bold',
  },
] as const satisfies readonly SlideEditTextFontWeightOption[])

export const SLIDE_EDIT_TEXT_FONT_WEIGHT_FIELD = Object.freeze({
  commandId: 'update-text-font-weight',
  control: 'font-weight-segmented-control',
  id: 'fontWeight',
  jsonKeys: ['textFontWeight', 'fontWeight', 'weight', 'bold', 'value'],
  jsonMimeType:
    'application/vnd.interactive-os.slide-edit.text-font-weight+json',
  options: SLIDE_EDIT_TEXT_FONT_WEIGHT_OPTIONS,
  requiredAdapterSlot: 'command-effect',
} as const satisfies SlideEditTextFontWeightFieldDescriptor)

export const SLIDE_EDIT_TEXT_FONT_WEIGHT_JSON_TYPES =
  SLIDE_EDIT_TEXT_JSON_PASTE_TYPES

export function createSlideEditTextFontWeightDescriptor<
  TSlideId extends SlideEditTextFontWeightSlideId,
  TObjectId extends SlideEditTextFontWeightObjectId,
>({
  field = SLIDE_EDIT_TEXT_FONT_WEIGHT_FIELD,
  objectId,
  slideId,
  value = SLIDE_EDIT_TEXT_FONT_WEIGHT_DEFAULT,
}: {
  field?: SlideEditTextFontWeightFieldDescriptor
  objectId: TObjectId
  slideId: TSlideId
  value?: unknown
}): SlideEditTextFontWeightDescriptor<TSlideId, TObjectId> {
  return {
    field,
    objectId,
    slideId,
    surface: 'text-font-weight',
    value: normalizeSlideEditTextFontWeight(value),
  }
}

export function getSlideEditTextFontWeightCommandEffect<
  TSlideId extends SlideEditTextFontWeightSlideId,
  TObjectId extends SlideEditTextFontWeightObjectId,
>(
  command: SlideEditTextFontWeightUpdateCommand<TSlideId, TObjectId>,
): SlideEditTextFontWeightHostCommandEffect<TSlideId, TObjectId> {
  return {
    payload: normalizeSlideEditTextFontWeightUpdateCommand(command),
    selection: {
      objectIds: [command.objectId],
      slideId: command.slideId,
    },
    type: 'slide-command-effect',
  }
}

export function normalizeSlideEditTextFontWeightUpdateCommand<
  TSlideId extends SlideEditTextFontWeightSlideId,
  TObjectId extends SlideEditTextFontWeightObjectId,
>(
  command: SlideEditTextFontWeightUpdateCommand<TSlideId, TObjectId>,
): SlideEditTextFontWeightUpdateCommand<TSlideId, TObjectId> {
  return {
    ...command,
    value: normalizeSlideEditTextFontWeight(command.value),
  }
}

export function getSlideEditTextFontWeightCSSValue(
  value: unknown,
): SlideEditTextFontWeightCSSValue {
  switch (normalizeSlideEditTextFontWeight(value)) {
    case 'bold':
      return 700
    case 'semibold':
      return 600
    case 'regular':
      return 400
  }
}

export function getSlideEditTextFontWeightJSONPasteValue({
  dataTransfer,
  jsonMimeType = SLIDE_EDIT_TEXT_FONT_WEIGHT_FIELD.jsonMimeType,
}: SlideEditTextFontWeightJSONPasteInput):
  SlideEditTextFontWeightValue | null {
  if (!dataTransfer) {
    return null
  }

  if (jsonMimeType) {
    const normalizedCustomValue =
      getSlideEditTextFontWeightJSONPasteValueFromText(
        dataTransfer.getData(jsonMimeType),
        { mode: 'direct' },
      )

    if (normalizedCustomValue !== null) {
      return normalizedCustomValue
    }
  }

  for (const type of SLIDE_EDIT_TEXT_FONT_WEIGHT_JSON_TYPES) {
    const explicitValue = getSlideEditTextFontWeightJSONPasteValueFromText(
      dataTransfer.getData(type),
      { mode: 'wrapped' },
    )

    if (explicitValue !== null) {
      return explicitValue
    }
  }

  return null
}

export function getSlideEditTextFontWeightJSONPasteValueFromText(
  text: string,
  options?: SlideEditTextFontWeightJSONPasteValueOptions,
): SlideEditTextFontWeightValue | null {
  return getSlideEditTextFontWeightJSONPasteValueFromValue(
    parseSlideEditTextFontWeightJSON(text),
    options,
  )
}

export function getSlideEditTextFontWeightJSONPasteValueFromValue(
  value: unknown,
  { mode = 'direct' }: SlideEditTextFontWeightJSONPasteValueOptions = {},
): SlideEditTextFontWeightValue | null {
  return mode === 'wrapped'
    ? getSlideEditTextFontWeightExplicitJSONValue(value)
    : normalizeSlideEditTextFontWeightJSONValue(value)
}

export function normalizeSlideEditTextFontWeight(
  value: unknown,
): SlideEditTextFontWeightValue {
  return normalizeSlideEditTextFontWeightJSONValue(value) ??
    SLIDE_EDIT_TEXT_FONT_WEIGHT_DEFAULT
}

function normalizeSlideEditTextFontWeightJSONValue(
  value: unknown,
): SlideEditTextFontWeightValue | null {
  if (isSlideEditTextFontWeightValue(value)) {
    return value
  }

  if (value === true) {
    return 'bold'
  }

  if (value === false) {
    return 'regular'
  }

  switch (value) {
    case 400:
    case '400':
      return 'regular'
    case 600:
    case '600':
      return 'semibold'
    case 700:
    case '700':
      return 'bold'
    default:
      return null
  }
}

function isSlideEditTextFontWeightValue(
  value: unknown,
): value is SlideEditTextFontWeightValue {
  return typeof value === 'string' &&
    SLIDE_EDIT_TEXT_FONT_WEIGHT_VALUES.includes(
      value as SlideEditTextFontWeightValue,
    )
}

function getSlideEditTextFontWeightExplicitJSONValue(
  value: unknown,
): SlideEditTextFontWeightValue | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  const record = value as Record<string, unknown>

  for (const key of SLIDE_EDIT_TEXT_FONT_WEIGHT_FIELD.jsonKeys) {
    if (Object.hasOwn(record, key)) {
      return normalizeSlideEditTextFontWeightJSONValue(record[key])
    }
  }

  return null
}

function parseSlideEditTextFontWeightJSON(value: string) {
  return parseSlideEditJSONPasteTextValue(value)
}
