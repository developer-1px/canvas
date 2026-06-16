export type SlideEditObjectStrokeLineStyleSlideId = string
export type SlideEditObjectStrokeLineStyleObjectId = string

export type SlideEditObjectStrokeLineStyleValue =
  | 'dash'
  | 'dot'
  | 'solid'

export type SlideEditObjectStrokeLineStyleUnsupportedReason =
  | 'mixed-selection'
  | 'no-stroke'

export type SlideEditObjectStrokeLineStyleOption = {
  id: SlideEditObjectStrokeLineStyleValue
  label: string
}

export type SlideEditObjectStrokeLineStyleFieldDescriptor = {
  commandId: 'update-object-stroke-line-style'
  control: 'stroke-line-style-segmented-control'
  id: 'strokeLineStyle'
  options: readonly SlideEditObjectStrokeLineStyleOption[]
  requiredAdapterSlot: 'command-effect'
}

export type SlideEditObjectStrokeLineStyleMetadata = {
  attribute: typeof SLIDE_EDIT_OBJECT_STROKE_LINE_STYLE_DATA_ATTRIBUTE
  attributeValue: string
  defaultValue: typeof SLIDE_EDIT_OBJECT_STROKE_LINE_STYLE_DEFAULT
  isSupported: boolean
  unsupportedReason?: SlideEditObjectStrokeLineStyleUnsupportedReason
  value: SlideEditObjectStrokeLineStyleValue
}

export type SlideEditObjectStrokeLineStyleDescriptor<
  TSlideId extends SlideEditObjectStrokeLineStyleSlideId =
    SlideEditObjectStrokeLineStyleSlideId,
  TObjectId extends SlideEditObjectStrokeLineStyleObjectId =
    SlideEditObjectStrokeLineStyleObjectId,
> = {
  field: SlideEditObjectStrokeLineStyleFieldDescriptor
  isSupported: boolean
  metadata: SlideEditObjectStrokeLineStyleMetadata
  objectId: TObjectId
  slideId: TSlideId
  surface: 'object-stroke-line-style'
  unsupportedReason?: SlideEditObjectStrokeLineStyleUnsupportedReason
  value: SlideEditObjectStrokeLineStyleValue
}

export type SlideEditObjectStrokeLineStyleUpdateCommand<
  TSlideId extends SlideEditObjectStrokeLineStyleSlideId =
    SlideEditObjectStrokeLineStyleSlideId,
  TObjectId extends SlideEditObjectStrokeLineStyleObjectId =
    SlideEditObjectStrokeLineStyleObjectId,
> = {
  fieldId: 'strokeLineStyle'
  id: 'update-object-stroke-line-style'
  objectId: TObjectId
  slideId: TSlideId
  value: SlideEditObjectStrokeLineStyleValue
}

export type SlideEditObjectStrokeLineStyleHostCommandEffect<
  TSlideId extends SlideEditObjectStrokeLineStyleSlideId =
    SlideEditObjectStrokeLineStyleSlideId,
  TObjectId extends SlideEditObjectStrokeLineStyleObjectId =
    SlideEditObjectStrokeLineStyleObjectId,
> = {
  payload: SlideEditObjectStrokeLineStyleUpdateCommand<TSlideId, TObjectId>
  selection: {
    objectIds: readonly TObjectId[]
    slideId: TSlideId
  }
  type: 'slide-command-effect'
}

export const SLIDE_EDIT_OBJECT_STROKE_LINE_STYLE_DATA_ATTRIBUTE =
  'data-slide-object-stroke-line-style'

export const SLIDE_EDIT_OBJECT_STROKE_LINE_STYLE_DEFAULT = 'solid'

export const SLIDE_EDIT_OBJECT_STROKE_LINE_STYLE_OPTIONS = Object.freeze([
  {
    id: 'solid',
    label: 'Solid',
  },
  {
    id: 'dash',
    label: 'Dash',
  },
  {
    id: 'dot',
    label: 'Dot',
  },
] as const satisfies readonly SlideEditObjectStrokeLineStyleOption[])

export const SLIDE_EDIT_OBJECT_STROKE_LINE_STYLE_FIELD = Object.freeze({
  commandId: 'update-object-stroke-line-style',
  control: 'stroke-line-style-segmented-control',
  id: 'strokeLineStyle',
  options: SLIDE_EDIT_OBJECT_STROKE_LINE_STYLE_OPTIONS,
  requiredAdapterSlot: 'command-effect',
} as const satisfies SlideEditObjectStrokeLineStyleFieldDescriptor)

export function createSlideEditObjectStrokeLineStyleDescriptor<
  TSlideId extends SlideEditObjectStrokeLineStyleSlideId,
  TObjectId extends SlideEditObjectStrokeLineStyleObjectId,
>({
  field = SLIDE_EDIT_OBJECT_STROKE_LINE_STYLE_FIELD,
  isSupported = true,
  objectId,
  slideId,
  unsupportedReason,
  value = SLIDE_EDIT_OBJECT_STROKE_LINE_STYLE_DEFAULT,
}: {
  field?: SlideEditObjectStrokeLineStyleFieldDescriptor
  isSupported?: boolean
  objectId: TObjectId
  slideId: TSlideId
  unsupportedReason?: SlideEditObjectStrokeLineStyleUnsupportedReason
  value?: string | null
}): SlideEditObjectStrokeLineStyleDescriptor<TSlideId, TObjectId> {
  const normalizedValue = normalizeSlideEditObjectStrokeLineStyle(value)
  const normalizedUnsupportedReason = isSupported
    ? undefined
    : unsupportedReason ?? 'no-stroke'

  return {
    field,
    isSupported,
    metadata: getSlideEditObjectStrokeLineStyleMetadata({
      isSupported,
      unsupportedReason: normalizedUnsupportedReason,
      value: normalizedValue,
    }),
    objectId,
    slideId,
    surface: 'object-stroke-line-style',
    unsupportedReason: normalizedUnsupportedReason,
    value: normalizedValue,
  }
}

export function getSlideEditObjectStrokeLineStyleCommandEffect<
  TSlideId extends SlideEditObjectStrokeLineStyleSlideId,
  TObjectId extends SlideEditObjectStrokeLineStyleObjectId,
>(
  command: SlideEditObjectStrokeLineStyleUpdateCommand<TSlideId, TObjectId>,
): SlideEditObjectStrokeLineStyleHostCommandEffect<TSlideId, TObjectId> {
  return {
    payload: normalizeSlideEditObjectStrokeLineStyleUpdateCommand(command),
    selection: {
      objectIds: [command.objectId],
      slideId: command.slideId,
    },
    type: 'slide-command-effect',
  }
}

export function normalizeSlideEditObjectStrokeLineStyleUpdateCommand<
  TSlideId extends SlideEditObjectStrokeLineStyleSlideId,
  TObjectId extends SlideEditObjectStrokeLineStyleObjectId,
>(
  command: SlideEditObjectStrokeLineStyleUpdateCommand<TSlideId, TObjectId>,
): SlideEditObjectStrokeLineStyleUpdateCommand<TSlideId, TObjectId> {
  return {
    ...command,
    value: normalizeSlideEditObjectStrokeLineStyle(command.value),
  }
}

export function getSlideEditObjectStrokeLineStyleMetadata({
  isSupported = true,
  unsupportedReason,
  value,
}: {
  isSupported?: boolean
  unsupportedReason?: SlideEditObjectStrokeLineStyleUnsupportedReason
  value: string | null | undefined
}): SlideEditObjectStrokeLineStyleMetadata {
  const normalizedValue = normalizeSlideEditObjectStrokeLineStyle(value)

  return {
    attribute: SLIDE_EDIT_OBJECT_STROKE_LINE_STYLE_DATA_ATTRIBUTE,
    attributeValue: isSupported ? normalizedValue : 'unsupported',
    defaultValue: SLIDE_EDIT_OBJECT_STROKE_LINE_STYLE_DEFAULT,
    isSupported,
    unsupportedReason: isSupported
      ? undefined
      : unsupportedReason ?? 'no-stroke',
    value: normalizedValue,
  }
}

export function normalizeSlideEditObjectStrokeLineStyle(
  value: string | null | undefined,
): SlideEditObjectStrokeLineStyleValue {
  if (
    value === 'dash' ||
    value === 'dot' ||
    value === 'solid'
  ) {
    return value
  }

  return SLIDE_EDIT_OBJECT_STROKE_LINE_STYLE_DEFAULT
}

export function isSlideEditObjectStrokeLineStyleValue(
  value: string | null | undefined,
): value is SlideEditObjectStrokeLineStyleValue {
  return value === 'dash' || value === 'dot' || value === 'solid'
}
