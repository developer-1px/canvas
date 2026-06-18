export type SlideEditTextFontSizeSlideId = string
export type SlideEditTextFontSizeObjectId = string
export type SlideEditTextFontSizeValue = number

export type SlideEditTextFontSizeNumericLimits = {
  defaultValue: number
  max: number
  min: number
  precision: number
  step: number
  unit: 'px'
}

export type SlideEditTextFontSizeFieldDescriptor = {
  commandId: 'update-text-font-size'
  control: 'font-size-stepper'
  id: 'fontSize'
  jsonKeys: readonly string[]
  jsonMimeType: string
  max: number
  min: number
  requiredAdapterSlot: 'command-effect'
  step: number
  unit: 'px'
}

export type SlideEditTextFontSizeMetadata = {
  attribute: typeof SLIDE_EDIT_TEXT_FONT_SIZE_DATA_ATTRIBUTE
  defaultValue: typeof SLIDE_EDIT_TEXT_FONT_SIZE_DEFAULT
  value: SlideEditTextFontSizeValue
}

export type SlideEditTextFontSizeDescriptor<
  TSlideId extends SlideEditTextFontSizeSlideId =
    SlideEditTextFontSizeSlideId,
  TObjectId extends SlideEditTextFontSizeObjectId =
    SlideEditTextFontSizeObjectId,
> = {
  field: SlideEditTextFontSizeFieldDescriptor
  metadata: SlideEditTextFontSizeMetadata
  objectId: TObjectId
  slideId: TSlideId
  surface: 'text-font-size'
  value: SlideEditTextFontSizeValue
}

export type SlideEditTextFontSizeUpdateCommand<
  TSlideId extends SlideEditTextFontSizeSlideId =
    SlideEditTextFontSizeSlideId,
  TObjectId extends SlideEditTextFontSizeObjectId =
    SlideEditTextFontSizeObjectId,
> = {
  fieldId: 'fontSize'
  id: 'update-text-font-size'
  objectId: TObjectId
  slideId: TSlideId
  value: SlideEditTextFontSizeValue
}

export type SlideEditTextFontSizeHostCommandEffect<
  TSlideId extends SlideEditTextFontSizeSlideId =
    SlideEditTextFontSizeSlideId,
  TObjectId extends SlideEditTextFontSizeObjectId =
    SlideEditTextFontSizeObjectId,
> = {
  payload: SlideEditTextFontSizeUpdateCommand<TSlideId, TObjectId>
  selection: {
    objectIds: readonly TObjectId[]
    slideId: TSlideId
  }
  type: 'slide-command-effect'
}

export type SlideEditTextFontSizeDataTransfer = Pick<
  DataTransfer,
  'getData'
>

export type SlideEditTextFontSizeJSONPasteInput = {
  dataTransfer: SlideEditTextFontSizeDataTransfer | null
  jsonMimeType?: string
}

export const SLIDE_EDIT_TEXT_FONT_SIZE_DEFAULT = 16

export const SLIDE_EDIT_TEXT_FONT_SIZE_DATA_ATTRIBUTE =
  'data-slide-text-font-size'

export const SLIDE_EDIT_TEXT_FONT_SIZE_LIMITS = Object.freeze({
  defaultValue: SLIDE_EDIT_TEXT_FONT_SIZE_DEFAULT,
  max: 400,
  min: 1,
  precision: 2,
  step: 0.5,
  unit: 'px',
} as const satisfies SlideEditTextFontSizeNumericLimits)

export const SLIDE_EDIT_TEXT_FONT_SIZE_FIELD = Object.freeze({
  commandId: 'update-text-font-size',
  control: 'font-size-stepper',
  id: 'fontSize',
  jsonKeys: ['textFontSize', 'fontSize', 'size', 'value'],
  jsonMimeType:
    'application/vnd.interactive-os.slide-edit.text-font-size+json',
  max: SLIDE_EDIT_TEXT_FONT_SIZE_LIMITS.max,
  min: SLIDE_EDIT_TEXT_FONT_SIZE_LIMITS.min,
  requiredAdapterSlot: 'command-effect',
  step: SLIDE_EDIT_TEXT_FONT_SIZE_LIMITS.step,
  unit: 'px',
} as const satisfies SlideEditTextFontSizeFieldDescriptor)

export function createSlideEditTextFontSizeDescriptor<
  TSlideId extends SlideEditTextFontSizeSlideId,
  TObjectId extends SlideEditTextFontSizeObjectId,
>({
  field = SLIDE_EDIT_TEXT_FONT_SIZE_FIELD,
  objectId,
  slideId,
  value = SLIDE_EDIT_TEXT_FONT_SIZE_DEFAULT,
}: {
  field?: SlideEditTextFontSizeFieldDescriptor
  objectId: TObjectId
  slideId: TSlideId
  value?: unknown
}): SlideEditTextFontSizeDescriptor<TSlideId, TObjectId> {
  const normalizedValue = normalizeSlideEditTextFontSize(value)

  return {
    field,
    metadata: getSlideEditTextFontSizeMetadata(normalizedValue),
    objectId,
    slideId,
    surface: 'text-font-size',
    value: normalizedValue,
  }
}

export function getSlideEditTextFontSizeCommandEffect<
  TSlideId extends SlideEditTextFontSizeSlideId,
  TObjectId extends SlideEditTextFontSizeObjectId,
>(
  command: SlideEditTextFontSizeUpdateCommand<TSlideId, TObjectId>,
): SlideEditTextFontSizeHostCommandEffect<TSlideId, TObjectId> {
  return {
    payload: normalizeSlideEditTextFontSizeUpdateCommand(command),
    selection: {
      objectIds: [command.objectId],
      slideId: command.slideId,
    },
    type: 'slide-command-effect',
  }
}

export function normalizeSlideEditTextFontSizeUpdateCommand<
  TSlideId extends SlideEditTextFontSizeSlideId,
  TObjectId extends SlideEditTextFontSizeObjectId,
>(
  command: SlideEditTextFontSizeUpdateCommand<TSlideId, TObjectId>,
): SlideEditTextFontSizeUpdateCommand<TSlideId, TObjectId> {
  return {
    ...command,
    value: normalizeSlideEditTextFontSize(command.value),
  }
}

export function getSlideEditTextFontSizeCSSValue(value: unknown) {
  return `${normalizeSlideEditTextFontSize(value)}px`
}

export function getSlideEditTextFontSizeMetadata(
  value: unknown,
): SlideEditTextFontSizeMetadata {
  return {
    attribute: SLIDE_EDIT_TEXT_FONT_SIZE_DATA_ATTRIBUTE,
    defaultValue: SLIDE_EDIT_TEXT_FONT_SIZE_DEFAULT,
    value: normalizeSlideEditTextFontSize(value),
  }
}

export function toSlideEditTextFontSizeAttributeValue(value: unknown) {
  return String(normalizeSlideEditTextFontSize(value))
}

export function getSlideEditTextFontSizeJSONPasteValue({
  dataTransfer,
  jsonMimeType = SLIDE_EDIT_TEXT_FONT_SIZE_FIELD.jsonMimeType,
}: SlideEditTextFontSizeJSONPasteInput): SlideEditTextFontSizeValue | null {
  if (!dataTransfer) {
    return null
  }

  if (jsonMimeType) {
    const customValue = parseSlideEditTextFontSizeJSON(
      dataTransfer.getData(jsonMimeType),
    )
    const normalizedCustomValue =
      normalizeSlideEditTextFontSizeJSONValue(customValue)

    if (normalizedCustomValue !== null) {
      return normalizedCustomValue
    }
  }

  for (const type of ['application/json', 'text/plain']) {
    const value = parseSlideEditTextFontSizeJSON(dataTransfer.getData(type))
    const explicitValue = getSlideEditTextFontSizeExplicitJSONValue(value)

    if (explicitValue !== null) {
      return explicitValue
    }
  }

  return null
}

export function normalizeSlideEditTextFontSize(
  value: unknown,
): SlideEditTextFontSizeValue {
  return normalizeSlideEditTextFontSizeJSONValue(value) ??
    SLIDE_EDIT_TEXT_FONT_SIZE_DEFAULT
}

function normalizeSlideEditTextFontSizeJSONValue(
  value: unknown,
): SlideEditTextFontSizeValue | null {
  const numericValue = getSlideEditTextFontSizeNumber(value)

  if (numericValue === null) {
    return null
  }

  const factor = 10 ** SLIDE_EDIT_TEXT_FONT_SIZE_LIMITS.precision
  const rounded = Math.round(numericValue * factor) / factor

  return Math.min(
    SLIDE_EDIT_TEXT_FONT_SIZE_LIMITS.max,
    Math.max(SLIDE_EDIT_TEXT_FONT_SIZE_LIMITS.min, rounded),
  )
}

function getSlideEditTextFontSizeNumber(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value !== 'string') {
    return null
  }

  const trimmedValue = value.trim()

  if (!trimmedValue) {
    return null
  }

  const numericValue = Number(trimmedValue)

  return Number.isFinite(numericValue) ? numericValue : null
}

function getSlideEditTextFontSizeExplicitJSONValue(
  value: unknown,
): SlideEditTextFontSizeValue | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  const record = value as Record<string, unknown>

  for (const key of SLIDE_EDIT_TEXT_FONT_SIZE_FIELD.jsonKeys) {
    if (Object.hasOwn(record, key)) {
      return normalizeSlideEditTextFontSizeJSONValue(record[key])
    }
  }

  return null
}

function parseSlideEditTextFontSizeJSON(value: string) {
  if (!value.trim()) {
    return null
  }

  try {
    return JSON.parse(value) as unknown
  } catch {
    return null
  }
}
