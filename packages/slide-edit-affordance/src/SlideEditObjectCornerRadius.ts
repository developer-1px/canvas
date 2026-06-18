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
