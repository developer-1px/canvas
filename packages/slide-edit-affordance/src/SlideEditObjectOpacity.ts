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

export type SlideEditObjectOpacityNumericLimits = {
  max: number
  min: number
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
