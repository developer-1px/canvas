export type SlideEditObjectOpacitySlideId = string
export type SlideEditObjectOpacityObjectId = string

export type SlideEditObjectOpacityValue = number

export type SlideEditObjectOpacityFieldDescriptor = {
  commandId: 'update-object-opacity'
  control: 'opacity-slider'
  id: 'opacity'
  max: number
  min: number
  requiredAdapterSlot: 'command-effect'
  step: number
  unit: 'ratio'
}

export type SlideEditObjectOpacityMetadata = {
  attribute: typeof SLIDE_EDIT_OBJECT_OPACITY_DATA_ATTRIBUTE
  attributeValue: string
  defaultValue: typeof SLIDE_EDIT_OBJECT_OPACITY_DEFAULT
  value: SlideEditObjectOpacityValue
}

export type SlideEditObjectOpacityDescriptor<
  TSlideId extends SlideEditObjectOpacitySlideId =
    SlideEditObjectOpacitySlideId,
  TObjectId extends SlideEditObjectOpacityObjectId =
    SlideEditObjectOpacityObjectId,
> = {
  field: SlideEditObjectOpacityFieldDescriptor
  metadata: SlideEditObjectOpacityMetadata
  objectId: TObjectId
  slideId: TSlideId
  surface: 'object-opacity'
  value: SlideEditObjectOpacityValue
}

export type SlideEditObjectOpacityUpdateCommand<
  TSlideId extends SlideEditObjectOpacitySlideId =
    SlideEditObjectOpacitySlideId,
  TObjectId extends SlideEditObjectOpacityObjectId =
    SlideEditObjectOpacityObjectId,
> = {
  fieldId: 'opacity'
  id: 'update-object-opacity'
  objectId: TObjectId
  slideId: TSlideId
  value: SlideEditObjectOpacityValue
}

export type SlideEditObjectOpacityHostCommandEffect<
  TSlideId extends SlideEditObjectOpacitySlideId =
    SlideEditObjectOpacitySlideId,
  TObjectId extends SlideEditObjectOpacityObjectId =
    SlideEditObjectOpacityObjectId,
> = {
  payload: SlideEditObjectOpacityUpdateCommand<TSlideId, TObjectId>
  selection: {
    objectIds: readonly TObjectId[]
    slideId: TSlideId
  }
  type: 'slide-command-effect'
}

export type SlideEditObjectOpacityDataTransfer = Pick<
  DataTransfer,
  'getData'
>

export type SlideEditObjectOpacityNumericLimits = {
  max: number
  min: number
}

export type SlideEditObjectOpacityJSONPasteValue = {
  value: SlideEditObjectOpacityValue
}

export type SlideEditObjectOpacityJSONPasteInput = {
  dataTransfer: SlideEditObjectOpacityDataTransfer | null
  jsonMimeType?: string
}

export type SlideEditObjectOpacityJSONPasteValueMode =
  | 'direct'
  | 'wrapped'

export type SlideEditObjectOpacityJSONPasteValueOptions = {
  mode?: SlideEditObjectOpacityJSONPasteValueMode
}

export type SlideEditObjectOpacityPasteCommandInput<
  TSlideId extends SlideEditObjectOpacitySlideId =
    SlideEditObjectOpacitySlideId,
  TObjectId extends SlideEditObjectOpacityObjectId =
    SlideEditObjectOpacityObjectId,
> = {
  objectId: TObjectId
  pasteValue: SlideEditObjectOpacityJSONPasteValue
  slideId: TSlideId
}

export const SLIDE_EDIT_OBJECT_OPACITY_DATA_ATTRIBUTE =
  'data-slide-object-opacity'

export const SLIDE_EDIT_OBJECT_OPACITY_DEFAULT = 1

export const SLIDE_EDIT_OBJECT_OPACITY_LIMITS = Object.freeze({
  max: 1,
  min: 0,
} as const satisfies SlideEditObjectOpacityNumericLimits)

export const SLIDE_EDIT_OBJECT_OPACITY_FIELD = Object.freeze({
  commandId: 'update-object-opacity',
  control: 'opacity-slider',
  id: 'opacity',
  max: SLIDE_EDIT_OBJECT_OPACITY_LIMITS.max,
  min: SLIDE_EDIT_OBJECT_OPACITY_LIMITS.min,
  requiredAdapterSlot: 'command-effect',
  step: 0.01,
  unit: 'ratio',
} as const satisfies SlideEditObjectOpacityFieldDescriptor)

export const SLIDE_EDIT_OBJECT_OPACITY_IMPORT_MODEL =
  'slide-edit-object-opacity-import' as const
export const SLIDE_EDIT_OBJECT_OPACITY_JSON_IMPORT_FORMAT =
  'application-json-slide-edit-object-opacity' as const
export const SLIDE_EDIT_OBJECT_OPACITY_JSON_MIME_TYPE =
  'application/vnd.interactive-os.slide-edit.object-opacity+json'

export const SLIDE_EDIT_OBJECT_OPACITY_JSON_TYPES = Object.freeze([
  'application/json',
  'text/json',
  'text/plain',
] as const)

export const SLIDE_EDIT_OBJECT_OPACITY_JSON_WRAPPER_KEYS = Object.freeze([
  'objectOpacity',
  'objectOpacityValue',
] as const)

const SLIDE_EDIT_OBJECT_OPACITY_DIRECT_JSON_KEYS = Object.freeze([
  'opacity',
  'value',
] as const)

export function createSlideEditObjectOpacityDescriptor<
  TSlideId extends SlideEditObjectOpacitySlideId,
  TObjectId extends SlideEditObjectOpacityObjectId,
>({
  field = SLIDE_EDIT_OBJECT_OPACITY_FIELD,
  objectId,
  slideId,
  value = SLIDE_EDIT_OBJECT_OPACITY_DEFAULT,
}: {
  field?: SlideEditObjectOpacityFieldDescriptor
  objectId: TObjectId
  slideId: TSlideId
  value?: number | null
}): SlideEditObjectOpacityDescriptor<TSlideId, TObjectId> {
  const normalizedValue = normalizeSlideEditObjectOpacity(value)

  return {
    field,
    metadata: getSlideEditObjectOpacityMetadata(normalizedValue),
    objectId,
    slideId,
    surface: 'object-opacity',
    value: normalizedValue,
  }
}

export function getSlideEditObjectOpacityCommandEffect<
  TSlideId extends SlideEditObjectOpacitySlideId,
  TObjectId extends SlideEditObjectOpacityObjectId,
>(
  command: SlideEditObjectOpacityUpdateCommand<TSlideId, TObjectId>,
): SlideEditObjectOpacityHostCommandEffect<TSlideId, TObjectId> {
  return {
    payload: normalizeSlideEditObjectOpacityUpdateCommand(command),
    selection: {
      objectIds: [command.objectId],
      slideId: command.slideId,
    },
    type: 'slide-command-effect',
  }
}

export function getSlideEditObjectOpacityJSONPasteValue({
  dataTransfer,
  jsonMimeType = SLIDE_EDIT_OBJECT_OPACITY_JSON_MIME_TYPE,
}: SlideEditObjectOpacityJSONPasteInput):
  SlideEditObjectOpacityJSONPasteValue | null {
  if (!dataTransfer) {
    return null
  }

  if (jsonMimeType) {
    const customPasteValue =
      getSlideEditObjectOpacityJSONPasteValueFromText(
        dataTransfer.getData(jsonMimeType),
      )

    if (customPasteValue !== null) {
      return customPasteValue
    }
  }

  for (const type of SLIDE_EDIT_OBJECT_OPACITY_JSON_TYPES) {
    const text = dataTransfer.getData(type)

    if (!text.trim()) {
      continue
    }

    const pasteValue =
      getSlideEditObjectOpacityJSONPasteValueFromText(
        text,
        { mode: 'wrapped' },
      )

    if (pasteValue !== null) {
      return pasteValue
    }
  }

  return null
}

export function getSlideEditObjectOpacityJSONPasteValueFromText(
  text: string,
  options?: SlideEditObjectOpacityJSONPasteValueOptions,
): SlideEditObjectOpacityJSONPasteValue | null {
  return getSlideEditObjectOpacityJSONPasteValueFromValue(
    parseSlideEditObjectOpacityJSON(text),
    options,
  )
}

export function getSlideEditObjectOpacityJSONPasteValueFromValue(
  value: unknown,
  {
    mode = 'direct',
  }: SlideEditObjectOpacityJSONPasteValueOptions = {},
): SlideEditObjectOpacityJSONPasteValue | null {
  return mode === 'wrapped'
    ? getSlideEditObjectOpacityWrappedJSONPasteValue(value)
    : getSlideEditObjectOpacityDirectJSONPasteValue(value)
}

export function getSlideEditObjectOpacityPasteCommand<
  TSlideId extends SlideEditObjectOpacitySlideId,
  TObjectId extends SlideEditObjectOpacityObjectId,
>({
  objectId,
  pasteValue,
  slideId,
}: SlideEditObjectOpacityPasteCommandInput<TSlideId, TObjectId>):
  SlideEditObjectOpacityUpdateCommand<TSlideId, TObjectId> {
  return {
    fieldId: 'opacity',
    id: 'update-object-opacity',
    objectId,
    slideId,
    value: pasteValue.value,
  }
}

export function normalizeSlideEditObjectOpacityUpdateCommand<
  TSlideId extends SlideEditObjectOpacitySlideId,
  TObjectId extends SlideEditObjectOpacityObjectId,
>(
  command: SlideEditObjectOpacityUpdateCommand<TSlideId, TObjectId>,
): SlideEditObjectOpacityUpdateCommand<TSlideId, TObjectId> {
  return {
    ...command,
    value: normalizeSlideEditObjectOpacity(command.value),
  }
}

export function getSlideEditObjectOpacityMetadata(
  value: number | null | undefined,
): SlideEditObjectOpacityMetadata {
  const normalizedValue = normalizeSlideEditObjectOpacity(value)

  return {
    attribute: SLIDE_EDIT_OBJECT_OPACITY_DATA_ATTRIBUTE,
    attributeValue: toSlideEditObjectOpacityAttributeValue(normalizedValue),
    defaultValue: SLIDE_EDIT_OBJECT_OPACITY_DEFAULT,
    value: normalizedValue,
  }
}

export function normalizeSlideEditObjectOpacity(
  value: number | null | undefined,
): SlideEditObjectOpacityValue {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return SLIDE_EDIT_OBJECT_OPACITY_DEFAULT
  }

  const rounded = Math.round(value * 100) / 100

  return Math.min(
    SLIDE_EDIT_OBJECT_OPACITY_LIMITS.max,
    Math.max(SLIDE_EDIT_OBJECT_OPACITY_LIMITS.min, rounded),
  )
}

export function toSlideEditObjectOpacityAttributeValue(
  value: number | null | undefined,
) {
  return String(normalizeSlideEditObjectOpacity(value))
}

function getSlideEditObjectOpacityDirectJSONPasteValue(
  value: unknown,
): SlideEditObjectOpacityJSONPasteValue | null {
  const normalizedValue = normalizeSlideEditObjectOpacityJSONValue(value)

  if (normalizedValue !== null) {
    return {
      value: normalizedValue,
    }
  }

  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  const record = value as Record<string, unknown>

  for (const key of SLIDE_EDIT_OBJECT_OPACITY_DIRECT_JSON_KEYS) {
    if (Object.hasOwn(record, key)) {
      return getSlideEditObjectOpacityDirectJSONPasteValue(record[key])
    }
  }

  return null
}

function getSlideEditObjectOpacityWrappedJSONPasteValue(
  value: unknown,
): SlideEditObjectOpacityJSONPasteValue | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  const record = value as Record<string, unknown>

  for (const key of SLIDE_EDIT_OBJECT_OPACITY_JSON_WRAPPER_KEYS) {
    if (Object.hasOwn(record, key)) {
      return getSlideEditObjectOpacityDirectJSONPasteValue(record[key])
    }
  }

  return null
}

function normalizeSlideEditObjectOpacityJSONValue(value: unknown) {
  const numericValue = getSlideEditObjectOpacityNumber(value)

  return numericValue === null
    ? null
    : normalizeSlideEditObjectOpacity(numericValue)
}

function getSlideEditObjectOpacityNumber(value: unknown) {
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

function parseSlideEditObjectOpacityJSON(value: string) {
  if (!value.trim()) {
    return null
  }

  try {
    return JSON.parse(value) as unknown
  } catch {
    return null
  }
}
