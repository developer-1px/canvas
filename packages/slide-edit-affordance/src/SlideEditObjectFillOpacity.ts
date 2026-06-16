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
