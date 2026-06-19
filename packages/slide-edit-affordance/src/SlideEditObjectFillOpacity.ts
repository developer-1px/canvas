export type SlideEditObjectFillOpacitySlideId = string
export type SlideEditObjectFillOpacityObjectId = string

export type SlideEditObjectFillOpacityValue = number

export type SlideEditObjectFillOpacityUnsupportedReason =
  | 'mixed-selection'
  | 'no-fill'

export type SlideEditObjectFillOpacityNumericLimits = {
  max: number
  min: number
}

export type SlideEditObjectFillOpacityFieldDescriptor = {
  commandId: 'update-object-fill-opacity'
  control: 'fill-opacity-slider'
  id: 'fillOpacity'
  max: number
  min: number
  requiredAdapterSlot: 'command-effect'
  step: number
  unit: 'ratio'
}

export type SlideEditObjectFillOpacityMetadata = {
  attribute: typeof SLIDE_EDIT_OBJECT_FILL_OPACITY_DATA_ATTRIBUTE
  attributeValue: string
  defaultValue: typeof SLIDE_EDIT_OBJECT_FILL_OPACITY_DEFAULT
  isSupported: boolean
  unsupportedReason?: SlideEditObjectFillOpacityUnsupportedReason
  value: SlideEditObjectFillOpacityValue
}

export type SlideEditObjectFillOpacityDescriptor<
  TSlideId extends SlideEditObjectFillOpacitySlideId =
    SlideEditObjectFillOpacitySlideId,
  TObjectId extends SlideEditObjectFillOpacityObjectId =
    SlideEditObjectFillOpacityObjectId,
> = {
  field: SlideEditObjectFillOpacityFieldDescriptor
  isSupported: boolean
  limits: SlideEditObjectFillOpacityNumericLimits
  metadata: SlideEditObjectFillOpacityMetadata
  objectId: TObjectId
  slideId: TSlideId
  surface: 'object-fill-opacity'
  unsupportedReason?: SlideEditObjectFillOpacityUnsupportedReason
  value: SlideEditObjectFillOpacityValue
}

export type SlideEditObjectFillOpacityUpdateCommand<
  TSlideId extends SlideEditObjectFillOpacitySlideId =
    SlideEditObjectFillOpacitySlideId,
  TObjectId extends SlideEditObjectFillOpacityObjectId =
    SlideEditObjectFillOpacityObjectId,
> = {
  fieldId: 'fillOpacity'
  id: 'update-object-fill-opacity'
  objectId: TObjectId
  slideId: TSlideId
  value: SlideEditObjectFillOpacityValue
}

export type SlideEditObjectFillOpacityHostCommandEffect<
  TSlideId extends SlideEditObjectFillOpacitySlideId =
    SlideEditObjectFillOpacitySlideId,
  TObjectId extends SlideEditObjectFillOpacityObjectId =
    SlideEditObjectFillOpacityObjectId,
> = {
  payload: SlideEditObjectFillOpacityUpdateCommand<TSlideId, TObjectId>
  selection: {
    objectIds: readonly TObjectId[]
    slideId: TSlideId
  }
  type: 'slide-command-effect'
}

export type SlideEditObjectFillOpacityDataTransfer = Pick<
  DataTransfer,
  'getData'
>

export type SlideEditObjectFillOpacityJSONPasteValue = {
  value: SlideEditObjectFillOpacityValue
}

export type SlideEditObjectFillOpacityJSONPasteInput = {
  dataTransfer: SlideEditObjectFillOpacityDataTransfer | null
  jsonMimeType?: string
}

export type SlideEditObjectFillOpacityJSONPasteValueMode =
  | 'direct'
  | 'wrapped'

export type SlideEditObjectFillOpacityJSONPasteValueOptions = {
  mode?: SlideEditObjectFillOpacityJSONPasteValueMode
}

export type SlideEditObjectFillOpacityPasteCommandInput<
  TSlideId extends SlideEditObjectFillOpacitySlideId =
    SlideEditObjectFillOpacitySlideId,
  TObjectId extends SlideEditObjectFillOpacityObjectId =
    SlideEditObjectFillOpacityObjectId,
> = {
  objectId: TObjectId
  pasteValue: SlideEditObjectFillOpacityJSONPasteValue
  slideId: TSlideId
}

export const SLIDE_EDIT_OBJECT_FILL_OPACITY_DATA_ATTRIBUTE =
  'data-slide-object-fill-opacity'

export const SLIDE_EDIT_OBJECT_FILL_OPACITY_DEFAULT = 1

export const SLIDE_EDIT_OBJECT_FILL_OPACITY_LIMITS = Object.freeze({
  max: 1,
  min: 0,
} as const satisfies SlideEditObjectFillOpacityNumericLimits)

export const SLIDE_EDIT_OBJECT_FILL_OPACITY_FIELD = Object.freeze({
  commandId: 'update-object-fill-opacity',
  control: 'fill-opacity-slider',
  id: 'fillOpacity',
  max: SLIDE_EDIT_OBJECT_FILL_OPACITY_LIMITS.max,
  min: SLIDE_EDIT_OBJECT_FILL_OPACITY_LIMITS.min,
  requiredAdapterSlot: 'command-effect',
  step: 0.01,
  unit: 'ratio',
} as const satisfies SlideEditObjectFillOpacityFieldDescriptor)

export const SLIDE_EDIT_OBJECT_FILL_OPACITY_JSON_MIME_TYPE =
  'application/vnd.interactive-os.slide-edit.object-fill-opacity+json'

export const SLIDE_EDIT_OBJECT_FILL_OPACITY_JSON_TYPES = Object.freeze([
  'application/json',
  'text/json',
  'text/plain',
] as const)

export const SLIDE_EDIT_OBJECT_FILL_OPACITY_JSON_WRAPPER_KEYS =
  Object.freeze([
    'objectFillOpacity',
    'shapeFillOpacity',
    'fillOpacity',
  ] as const)

const SLIDE_EDIT_OBJECT_FILL_OPACITY_DIRECT_JSON_KEYS = Object.freeze([
  'fillOpacity',
  'opacity',
  'value',
] as const)

export function createSlideEditObjectFillOpacityDescriptor<
  TSlideId extends SlideEditObjectFillOpacitySlideId,
  TObjectId extends SlideEditObjectFillOpacityObjectId,
>({
  field = SLIDE_EDIT_OBJECT_FILL_OPACITY_FIELD,
  isSupported = true,
  objectId,
  slideId,
  unsupportedReason,
  value = SLIDE_EDIT_OBJECT_FILL_OPACITY_DEFAULT,
}: {
  field?: SlideEditObjectFillOpacityFieldDescriptor
  isSupported?: boolean
  objectId: TObjectId
  slideId: TSlideId
  unsupportedReason?: SlideEditObjectFillOpacityUnsupportedReason
  value?: number | null
}): SlideEditObjectFillOpacityDescriptor<TSlideId, TObjectId> {
  const normalizedValue = normalizeSlideEditObjectFillOpacity(value)
  const normalizedUnsupportedReason = isSupported
    ? undefined
    : unsupportedReason ?? 'no-fill'

  return {
    field,
    isSupported,
    limits: SLIDE_EDIT_OBJECT_FILL_OPACITY_LIMITS,
    metadata: getSlideEditObjectFillOpacityMetadata({
      isSupported,
      unsupportedReason: normalizedUnsupportedReason,
      value: normalizedValue,
    }),
    objectId,
    slideId,
    surface: 'object-fill-opacity',
    unsupportedReason: normalizedUnsupportedReason,
    value: normalizedValue,
  }
}

export function getSlideEditObjectFillOpacityCommandEffect<
  TSlideId extends SlideEditObjectFillOpacitySlideId,
  TObjectId extends SlideEditObjectFillOpacityObjectId,
>(
  command: SlideEditObjectFillOpacityUpdateCommand<TSlideId, TObjectId>,
): SlideEditObjectFillOpacityHostCommandEffect<TSlideId, TObjectId> {
  return {
    payload: normalizeSlideEditObjectFillOpacityUpdateCommand(command),
    selection: {
      objectIds: [command.objectId],
      slideId: command.slideId,
    },
    type: 'slide-command-effect',
  }
}

export function getSlideEditObjectFillOpacityJSONPasteValue({
  dataTransfer,
  jsonMimeType = SLIDE_EDIT_OBJECT_FILL_OPACITY_JSON_MIME_TYPE,
}: SlideEditObjectFillOpacityJSONPasteInput):
  SlideEditObjectFillOpacityJSONPasteValue | null {
  if (!dataTransfer) {
    return null
  }

  if (jsonMimeType) {
    const customText = dataTransfer.getData(jsonMimeType)

    if (customText.trim()) {
      const customPasteValue =
        getSlideEditObjectFillOpacityJSONPasteValueFromText(
          customText,
          { mode: 'direct' },
        )

      if (customPasteValue !== null) {
        return customPasteValue
      }
    }
  }

  for (const type of SLIDE_EDIT_OBJECT_FILL_OPACITY_JSON_TYPES) {
    const text = dataTransfer.getData(type)

    if (!text.trim()) {
      continue
    }

    const pasteValue = getSlideEditObjectFillOpacityJSONPasteValueFromText(
      text,
      { mode: 'wrapped' },
    )

    if (pasteValue !== null) {
      return pasteValue
    }
  }

  return null
}

export function getSlideEditObjectFillOpacityJSONPasteValueFromText(
  text: string,
  options?: SlideEditObjectFillOpacityJSONPasteValueOptions,
): SlideEditObjectFillOpacityJSONPasteValue | null {
  return getSlideEditObjectFillOpacityJSONPasteValueFromValue(
    parseSlideEditObjectFillOpacityJSON(text),
    options,
  )
}

export function getSlideEditObjectFillOpacityJSONPasteValueFromValue(
  value: unknown,
  {
    mode = 'direct',
  }: SlideEditObjectFillOpacityJSONPasteValueOptions = {},
): SlideEditObjectFillOpacityJSONPasteValue | null {
  return mode === 'wrapped'
    ? getSlideEditObjectFillOpacityWrappedJSONPasteValue(value)
    : getSlideEditObjectFillOpacityDirectJSONPasteValue(value)
}

export function getSlideEditObjectFillOpacityPasteCommand<
  TSlideId extends SlideEditObjectFillOpacitySlideId,
  TObjectId extends SlideEditObjectFillOpacityObjectId,
>({
  objectId,
  pasteValue,
  slideId,
}: SlideEditObjectFillOpacityPasteCommandInput<TSlideId, TObjectId>):
  SlideEditObjectFillOpacityUpdateCommand<TSlideId, TObjectId> {
  return {
    fieldId: 'fillOpacity',
    id: 'update-object-fill-opacity',
    objectId,
    slideId,
    value: pasteValue.value,
  }
}

export function normalizeSlideEditObjectFillOpacityUpdateCommand<
  TSlideId extends SlideEditObjectFillOpacitySlideId,
  TObjectId extends SlideEditObjectFillOpacityObjectId,
>(
  command: SlideEditObjectFillOpacityUpdateCommand<TSlideId, TObjectId>,
): SlideEditObjectFillOpacityUpdateCommand<TSlideId, TObjectId> {
  return {
    ...command,
    value: normalizeSlideEditObjectFillOpacity(command.value),
  }
}

export function getSlideEditObjectFillOpacityMetadata({
  isSupported = true,
  unsupportedReason,
  value,
}: {
  isSupported?: boolean
  unsupportedReason?: SlideEditObjectFillOpacityUnsupportedReason
  value: number | null | undefined
}): SlideEditObjectFillOpacityMetadata {
  const normalizedValue = normalizeSlideEditObjectFillOpacity(value)

  return {
    attribute: SLIDE_EDIT_OBJECT_FILL_OPACITY_DATA_ATTRIBUTE,
    attributeValue: isSupported
      ? toSlideEditObjectFillOpacityAttributeValue(normalizedValue)
      : 'unsupported',
    defaultValue: SLIDE_EDIT_OBJECT_FILL_OPACITY_DEFAULT,
    isSupported,
    unsupportedReason: isSupported
      ? undefined
      : unsupportedReason ?? 'no-fill',
    value: normalizedValue,
  }
}

export function normalizeSlideEditObjectFillOpacity(
  value: number | null | undefined,
): SlideEditObjectFillOpacityValue {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return SLIDE_EDIT_OBJECT_FILL_OPACITY_DEFAULT
  }

  const rounded = Math.round(value * 100) / 100

  return Math.min(
    SLIDE_EDIT_OBJECT_FILL_OPACITY_LIMITS.max,
    Math.max(SLIDE_EDIT_OBJECT_FILL_OPACITY_LIMITS.min, rounded),
  )
}

export function toSlideEditObjectFillOpacityAttributeValue(
  value: number | null | undefined,
) {
  return String(normalizeSlideEditObjectFillOpacity(value))
}

function getSlideEditObjectFillOpacityDirectJSONPasteValue(
  value: unknown,
): SlideEditObjectFillOpacityJSONPasteValue | null {
  const normalizedValue = normalizeSlideEditObjectFillOpacityJSONValue(value)

  if (normalizedValue !== null) {
    return {
      value: normalizedValue,
    }
  }

  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  const record = value as Record<string, unknown>

  for (const key of SLIDE_EDIT_OBJECT_FILL_OPACITY_DIRECT_JSON_KEYS) {
    if (Object.hasOwn(record, key)) {
      return getSlideEditObjectFillOpacityDirectJSONPasteValue(record[key])
    }
  }

  return null
}

function getSlideEditObjectFillOpacityWrappedJSONPasteValue(
  value: unknown,
): SlideEditObjectFillOpacityJSONPasteValue | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  const record = value as Record<string, unknown>

  for (const key of SLIDE_EDIT_OBJECT_FILL_OPACITY_JSON_WRAPPER_KEYS) {
    if (Object.hasOwn(record, key)) {
      return getSlideEditObjectFillOpacityDirectJSONPasteValue(record[key])
    }
  }

  return null
}

function normalizeSlideEditObjectFillOpacityJSONValue(value: unknown) {
  const numericValue = getSlideEditObjectFillOpacityNumber(value)

  return numericValue === null
    ? null
    : normalizeSlideEditObjectFillOpacity(numericValue)
}

function getSlideEditObjectFillOpacityNumber(value: unknown) {
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

function parseSlideEditObjectFillOpacityJSON(value: string) {
  if (!value.trim()) {
    return null
  }

  try {
    return JSON.parse(value) as unknown
  } catch {
    return null
  }
}
