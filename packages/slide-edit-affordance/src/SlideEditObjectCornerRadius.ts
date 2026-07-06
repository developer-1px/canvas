import { parseSlideEditJSONPasteTextValue } from './SlideEditTextJSONPaste'

export type SlideEditObjectCornerRadiusSlideId = string
export type SlideEditObjectCornerRadiusObjectId = string

export type SlideEditObjectCornerRadiusValue = number

export type SlideEditObjectCornerRadiusUnit =
  | 'px'
  | 'slide-unit'

export type SlideEditObjectCornerRadiusUnsupportedReason =
  | 'mixed-selection'
  | 'unsupported-shape'

export type SlideEditObjectCornerRadiusNumericLimits = {
  max: number
  min: number
}

export type SlideEditObjectCornerRadiusPreviewSize = {
  h: number | null | undefined
  w: number | null | undefined
}

export type SlideEditObjectCornerRadiusFieldDescriptor = {
  commandId: 'update-object-corner-radius'
  control: 'corner-radius-slider'
  id: 'cornerRadius'
  max: number
  min: number
  requiredAdapterSlot: 'command-effect'
  step: number
  unit: SlideEditObjectCornerRadiusUnit
}

export type SlideEditObjectCornerRadiusMetadata = {
  attribute: typeof SLIDE_EDIT_OBJECT_CORNER_RADIUS_DATA_ATTRIBUTE
  attributeValue: string
  defaultValue: typeof SLIDE_EDIT_OBJECT_CORNER_RADIUS_DEFAULT
  isSupported: boolean
  unsupportedReason?: SlideEditObjectCornerRadiusUnsupportedReason
  value: SlideEditObjectCornerRadiusValue
}

export type SlideEditObjectCornerRadiusDescriptor<
  TSlideId extends SlideEditObjectCornerRadiusSlideId =
    SlideEditObjectCornerRadiusSlideId,
  TObjectId extends SlideEditObjectCornerRadiusObjectId =
    SlideEditObjectCornerRadiusObjectId,
> = {
  field: SlideEditObjectCornerRadiusFieldDescriptor
  isSupported: boolean
  limits: SlideEditObjectCornerRadiusNumericLimits
  metadata: SlideEditObjectCornerRadiusMetadata
  objectId: TObjectId
  slideId: TSlideId
  surface: 'object-corner-radius'
  unsupportedReason?: SlideEditObjectCornerRadiusUnsupportedReason
  value: SlideEditObjectCornerRadiusValue
}

export type SlideEditObjectCornerRadiusUpdateCommand<
  TSlideId extends SlideEditObjectCornerRadiusSlideId =
    SlideEditObjectCornerRadiusSlideId,
  TObjectId extends SlideEditObjectCornerRadiusObjectId =
    SlideEditObjectCornerRadiusObjectId,
> = {
  fieldId: 'cornerRadius'
  id: 'update-object-corner-radius'
  objectId: TObjectId
  slideId: TSlideId
  value: SlideEditObjectCornerRadiusValue
}

export type SlideEditObjectCornerRadiusHostCommandEffect<
  TSlideId extends SlideEditObjectCornerRadiusSlideId =
    SlideEditObjectCornerRadiusSlideId,
  TObjectId extends SlideEditObjectCornerRadiusObjectId =
    SlideEditObjectCornerRadiusObjectId,
> = {
  payload: SlideEditObjectCornerRadiusUpdateCommand<TSlideId, TObjectId>
  selection: {
    objectIds: readonly TObjectId[]
    slideId: TSlideId
  }
  type: 'slide-command-effect'
}

export type SlideEditObjectCornerRadiusDataTransfer = Pick<
  DataTransfer,
  'getData'
>

export type SlideEditObjectCornerRadiusJSONPasteValue = {
  value: SlideEditObjectCornerRadiusValue
}

export type SlideEditObjectCornerRadiusJSONPasteInput = {
  dataTransfer: SlideEditObjectCornerRadiusDataTransfer | null
  jsonMimeType?: string
}

export type SlideEditObjectCornerRadiusJSONPasteValueMode =
  | 'direct'
  | 'wrapped'

export type SlideEditObjectCornerRadiusJSONPasteValueOptions = {
  mode?: SlideEditObjectCornerRadiusJSONPasteValueMode
}

export type SlideEditObjectCornerRadiusPasteCommandInput<
  TSlideId extends SlideEditObjectCornerRadiusSlideId =
    SlideEditObjectCornerRadiusSlideId,
  TObjectId extends SlideEditObjectCornerRadiusObjectId =
    SlideEditObjectCornerRadiusObjectId,
> = {
  objectId: TObjectId
  pasteValue: SlideEditObjectCornerRadiusJSONPasteValue
  slideId: TSlideId
}

export const SLIDE_EDIT_OBJECT_CORNER_RADIUS_DATA_ATTRIBUTE =
  'data-slide-object-corner-radius'

export const SLIDE_EDIT_OBJECT_CORNER_RADIUS_DEFAULT = 0

export const SLIDE_EDIT_OBJECT_CORNER_RADIUS_LIMITS = Object.freeze({
  max: 1000,
  min: 0,
} as const satisfies SlideEditObjectCornerRadiusNumericLimits)

export const SLIDE_EDIT_OBJECT_CORNER_RADIUS_FIELD = Object.freeze({
  commandId: 'update-object-corner-radius',
  control: 'corner-radius-slider',
  id: 'cornerRadius',
  max: SLIDE_EDIT_OBJECT_CORNER_RADIUS_LIMITS.max,
  min: SLIDE_EDIT_OBJECT_CORNER_RADIUS_LIMITS.min,
  requiredAdapterSlot: 'command-effect',
  step: 1,
  unit: 'px',
} as const satisfies SlideEditObjectCornerRadiusFieldDescriptor)

export const SLIDE_EDIT_OBJECT_CORNER_RADIUS_JSON_MIME_TYPE =
  'application/vnd.interactive-os.slide-edit.object-corner-radius+json'

export const SLIDE_EDIT_OBJECT_CORNER_RADIUS_JSON_TYPES = Object.freeze([
  'application/json',
  'text/json',
  'text/plain',
] as const)

export const SLIDE_EDIT_OBJECT_CORNER_RADIUS_JSON_WRAPPER_KEYS =
  Object.freeze([
    'objectCornerRadius',
    'shapeCornerRadius',
    'cornerRadius',
  ] as const)

const SLIDE_EDIT_OBJECT_CORNER_RADIUS_DIRECT_JSON_KEYS = Object.freeze([
  'cornerRadius',
  'radius',
  'value',
] as const)

export function createSlideEditObjectCornerRadiusDescriptor<
  TSlideId extends SlideEditObjectCornerRadiusSlideId,
  TObjectId extends SlideEditObjectCornerRadiusObjectId,
>({
  field = SLIDE_EDIT_OBJECT_CORNER_RADIUS_FIELD,
  isSupported = true,
  objectId,
  slideId,
  unsupportedReason,
  value = SLIDE_EDIT_OBJECT_CORNER_RADIUS_DEFAULT,
}: {
  field?: SlideEditObjectCornerRadiusFieldDescriptor
  isSupported?: boolean
  objectId: TObjectId
  slideId: TSlideId
  unsupportedReason?: SlideEditObjectCornerRadiusUnsupportedReason
  value?: number | null
}): SlideEditObjectCornerRadiusDescriptor<TSlideId, TObjectId> {
  const normalizedValue = normalizeSlideEditObjectCornerRadius(value)
  const normalizedUnsupportedReason = isSupported
    ? undefined
    : unsupportedReason ?? 'unsupported-shape'

  return {
    field,
    isSupported,
    limits: SLIDE_EDIT_OBJECT_CORNER_RADIUS_LIMITS,
    metadata: getSlideEditObjectCornerRadiusMetadata({
      isSupported,
      unsupportedReason: normalizedUnsupportedReason,
      value: normalizedValue,
    }),
    objectId,
    slideId,
    surface: 'object-corner-radius',
    unsupportedReason: normalizedUnsupportedReason,
    value: normalizedValue,
  }
}

export function getSlideEditObjectCornerRadiusCommandEffect<
  TSlideId extends SlideEditObjectCornerRadiusSlideId,
  TObjectId extends SlideEditObjectCornerRadiusObjectId,
>(
  command: SlideEditObjectCornerRadiusUpdateCommand<TSlideId, TObjectId>,
): SlideEditObjectCornerRadiusHostCommandEffect<TSlideId, TObjectId> {
  return {
    payload: normalizeSlideEditObjectCornerRadiusUpdateCommand(command),
    selection: {
      objectIds: [command.objectId],
      slideId: command.slideId,
    },
    type: 'slide-command-effect',
  }
}

export function getSlideEditObjectCornerRadiusJSONPasteValue({
  dataTransfer,
  jsonMimeType = SLIDE_EDIT_OBJECT_CORNER_RADIUS_JSON_MIME_TYPE,
}: SlideEditObjectCornerRadiusJSONPasteInput):
  SlideEditObjectCornerRadiusJSONPasteValue | null {
  if (!dataTransfer) {
    return null
  }

  if (jsonMimeType) {
    const customText = dataTransfer.getData(jsonMimeType)

    if (customText.trim()) {
      const customPasteValue =
        getSlideEditObjectCornerRadiusJSONPasteValueFromText(
          customText,
          { mode: 'direct' },
        )

      if (customPasteValue !== null) {
        return customPasteValue
      }
    }
  }

  for (const type of SLIDE_EDIT_OBJECT_CORNER_RADIUS_JSON_TYPES) {
    const text = dataTransfer.getData(type)

    if (!text.trim()) {
      continue
    }

    const pasteValue = getSlideEditObjectCornerRadiusJSONPasteValueFromText(
      text,
      { mode: 'wrapped' },
    )

    if (pasteValue !== null) {
      return pasteValue
    }
  }

  return null
}

export function getSlideEditObjectCornerRadiusJSONPasteValueFromText(
  text: string,
  options?: SlideEditObjectCornerRadiusJSONPasteValueOptions,
): SlideEditObjectCornerRadiusJSONPasteValue | null {
  return getSlideEditObjectCornerRadiusJSONPasteValueFromValue(
    parseSlideEditObjectCornerRadiusJSON(text),
    options,
  )
}

export function getSlideEditObjectCornerRadiusJSONPasteValueFromValue(
  value: unknown,
  {
    mode = 'direct',
  }: SlideEditObjectCornerRadiusJSONPasteValueOptions = {},
): SlideEditObjectCornerRadiusJSONPasteValue | null {
  return mode === 'wrapped'
    ? getSlideEditObjectCornerRadiusWrappedJSONPasteValue(value)
    : getSlideEditObjectCornerRadiusDirectJSONPasteValue(value)
}

export function getSlideEditObjectCornerRadiusPasteCommand<
  TSlideId extends SlideEditObjectCornerRadiusSlideId,
  TObjectId extends SlideEditObjectCornerRadiusObjectId,
>({
  objectId,
  pasteValue,
  slideId,
}: SlideEditObjectCornerRadiusPasteCommandInput<TSlideId, TObjectId>):
  SlideEditObjectCornerRadiusUpdateCommand<TSlideId, TObjectId> {
  return {
    fieldId: 'cornerRadius',
    id: 'update-object-corner-radius',
    objectId,
    slideId,
    value: pasteValue.value,
  }
}

export function normalizeSlideEditObjectCornerRadiusUpdateCommand<
  TSlideId extends SlideEditObjectCornerRadiusSlideId,
  TObjectId extends SlideEditObjectCornerRadiusObjectId,
>(
  command: SlideEditObjectCornerRadiusUpdateCommand<TSlideId, TObjectId>,
): SlideEditObjectCornerRadiusUpdateCommand<TSlideId, TObjectId> {
  return {
    ...command,
    value: normalizeSlideEditObjectCornerRadius(command.value),
  }
}

export function getSlideEditObjectCornerRadiusMetadata({
  isSupported = true,
  unsupportedReason,
  value,
}: {
  isSupported?: boolean
  unsupportedReason?: SlideEditObjectCornerRadiusUnsupportedReason
  value: number | null | undefined
}): SlideEditObjectCornerRadiusMetadata {
  const normalizedValue = normalizeSlideEditObjectCornerRadius(value)

  return {
    attribute: SLIDE_EDIT_OBJECT_CORNER_RADIUS_DATA_ATTRIBUTE,
    attributeValue: isSupported
      ? toSlideEditObjectCornerRadiusAttributeValue(normalizedValue)
      : 'unsupported',
    defaultValue: SLIDE_EDIT_OBJECT_CORNER_RADIUS_DEFAULT,
    isSupported,
    unsupportedReason: isSupported
      ? undefined
      : unsupportedReason ?? 'unsupported-shape',
    value: normalizedValue,
  }
}

export function normalizeSlideEditObjectCornerRadius(
  value: number | null | undefined,
): SlideEditObjectCornerRadiusValue {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return SLIDE_EDIT_OBJECT_CORNER_RADIUS_DEFAULT
  }

  const rounded = Math.round(value * 100) / 100

  return Math.min(
    SLIDE_EDIT_OBJECT_CORNER_RADIUS_LIMITS.max,
    Math.max(SLIDE_EDIT_OBJECT_CORNER_RADIUS_LIMITS.min, rounded),
  )
}

export function toSlideEditObjectCornerRadiusAttributeValue(
  value: number | null | undefined,
) {
  return String(normalizeSlideEditObjectCornerRadius(value))
}

export function getSlideEditObjectCornerRadiusCSS(
  value: number | null | undefined,
) {
  return `${normalizeSlideEditObjectCornerRadius(value)}px`
}

export function getSlideEditObjectCornerRadiusPreviewCSS({
  h,
  value,
  w,
}: SlideEditObjectCornerRadiusPreviewSize & {
  value: number | null | undefined
}) {
  const minSize = Math.max(1, Math.min(
    normalizeSlideEditObjectCornerRadiusPreviewSide(w),
    normalizeSlideEditObjectCornerRadiusPreviewSide(h),
  ))
  const percent = Math.min(
    50,
    (normalizeSlideEditObjectCornerRadius(value) / minSize) * 100,
  )

  return `${Math.round(percent * 100) / 100}%`
}

function normalizeSlideEditObjectCornerRadiusPreviewSide(
  value: number | null | undefined,
) {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
    ? value
    : 1
}

function getSlideEditObjectCornerRadiusDirectJSONPasteValue(
  value: unknown,
): SlideEditObjectCornerRadiusJSONPasteValue | null {
  const normalizedValue = normalizeSlideEditObjectCornerRadiusJSONValue(value)

  if (normalizedValue !== null) {
    return {
      value: normalizedValue,
    }
  }

  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  const record = value as Record<string, unknown>

  for (const key of SLIDE_EDIT_OBJECT_CORNER_RADIUS_DIRECT_JSON_KEYS) {
    if (Object.hasOwn(record, key)) {
      return getSlideEditObjectCornerRadiusDirectJSONPasteValue(record[key])
    }
  }

  return null
}

function getSlideEditObjectCornerRadiusWrappedJSONPasteValue(
  value: unknown,
): SlideEditObjectCornerRadiusJSONPasteValue | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  const record = value as Record<string, unknown>

  for (const key of SLIDE_EDIT_OBJECT_CORNER_RADIUS_JSON_WRAPPER_KEYS) {
    if (Object.hasOwn(record, key)) {
      return getSlideEditObjectCornerRadiusDirectJSONPasteValue(record[key])
    }
  }

  return null
}

function normalizeSlideEditObjectCornerRadiusJSONValue(value: unknown) {
  const numericValue = getSlideEditObjectCornerRadiusNumber(value)

  return numericValue === null
    ? null
    : normalizeSlideEditObjectCornerRadius(numericValue)
}

function getSlideEditObjectCornerRadiusNumber(value: unknown) {
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

function parseSlideEditObjectCornerRadiusJSON(value: string) {
  return parseSlideEditJSONPasteTextValue(value)
}
