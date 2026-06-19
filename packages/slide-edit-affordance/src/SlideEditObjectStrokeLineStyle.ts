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

export type SlideEditObjectStrokeLineStyleBorderStyle =
  | 'dashed'
  | 'dotted'
  | 'solid'

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

export type SlideEditObjectStrokeLineStyleDataTransfer = Pick<
  DataTransfer,
  'getData'
>

export type SlideEditObjectStrokeLineStyleJSONPasteInput = {
  dataTransfer: SlideEditObjectStrokeLineStyleDataTransfer | null
  jsonMimeType?: string
}

export type SlideEditObjectStrokeLineStyleJSONPasteValueMode =
  | 'direct'
  | 'wrapped'

export type SlideEditObjectStrokeLineStyleJSONPasteValueOptions = {
  mode?: SlideEditObjectStrokeLineStyleJSONPasteValueMode
}

export type SlideEditObjectStrokeLineStylePasteCommandInput<
  TSlideId extends SlideEditObjectStrokeLineStyleSlideId =
    SlideEditObjectStrokeLineStyleSlideId,
  TObjectId extends SlideEditObjectStrokeLineStyleObjectId =
    SlideEditObjectStrokeLineStyleObjectId,
> = {
  objectId: TObjectId
  slideId: TSlideId
  value: SlideEditObjectStrokeLineStyleValue
}

export const SLIDE_EDIT_OBJECT_STROKE_LINE_STYLE_DATA_ATTRIBUTE =
  'data-slide-object-stroke-line-style'

export const SLIDE_EDIT_OBJECT_STROKE_LINE_STYLE_DEFAULT = 'solid'

export const SLIDE_EDIT_OBJECT_STROKE_LINE_STYLE_JSON_MIME_TYPE =
  'application/vnd.interactive-os.slide-edit.object-stroke-line-style+json'

export const SLIDE_EDIT_OBJECT_STROKE_LINE_STYLE_JSON_TYPES = Object.freeze([
  'application/json',
  'text/json',
  'text/plain',
] as const)

export const SLIDE_EDIT_OBJECT_STROKE_LINE_STYLE_JSON_WRAPPER_KEYS =
  Object.freeze([
    'objectStrokeLineStyle',
    'strokeLineStyle',
    'strokeDash',
  ] as const)

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

export function getSlideEditObjectStrokeLineStyleJSONPasteValue({
  dataTransfer,
  jsonMimeType = SLIDE_EDIT_OBJECT_STROKE_LINE_STYLE_JSON_MIME_TYPE,
}: SlideEditObjectStrokeLineStyleJSONPasteInput):
  SlideEditObjectStrokeLineStyleValue | null {
  if (!dataTransfer) {
    return null
  }

  if (jsonMimeType) {
    const customText = dataTransfer.getData(jsonMimeType)

    if (customText.trim()) {
      const customLineStyle =
        getSlideEditObjectStrokeLineStyleJSONPasteValueFromText(
          customText,
          { mode: 'direct' },
        )

      if (customLineStyle !== null) {
        return customLineStyle
      }
    }
  }

  for (const type of SLIDE_EDIT_OBJECT_STROKE_LINE_STYLE_JSON_TYPES) {
    const text = dataTransfer.getData(type)

    if (!text.trim()) {
      continue
    }

    const lineStyle = getSlideEditObjectStrokeLineStyleJSONPasteValueFromText(
      text,
      { mode: 'wrapped' },
    )

    if (lineStyle !== null) {
      return lineStyle
    }
  }

  return null
}

export function getSlideEditObjectStrokeLineStyleJSONPasteValueFromText(
  text: string,
  options?: SlideEditObjectStrokeLineStyleJSONPasteValueOptions,
): SlideEditObjectStrokeLineStyleValue | null {
  return getSlideEditObjectStrokeLineStyleJSONPasteValueFromValue(
    parseSlideEditObjectStrokeLineStyleJSON(text),
    options,
  )
}

export function getSlideEditObjectStrokeLineStyleJSONPasteValueFromValue(
  value: unknown,
  {
    mode = 'direct',
  }: SlideEditObjectStrokeLineStyleJSONPasteValueOptions = {},
): SlideEditObjectStrokeLineStyleValue | null {
  return mode === 'wrapped'
    ? getSlideEditObjectStrokeLineStyleWrappedPasteValue(value)
    : getSlideEditObjectStrokeLineStyleDirectPasteValue(value)
}

export function getSlideEditObjectStrokeLineStylePasteCommand<
  TSlideId extends SlideEditObjectStrokeLineStyleSlideId,
  TObjectId extends SlideEditObjectStrokeLineStyleObjectId,
>({
  objectId,
  slideId,
  value,
}: SlideEditObjectStrokeLineStylePasteCommandInput<TSlideId, TObjectId>):
  SlideEditObjectStrokeLineStyleUpdateCommand<TSlideId, TObjectId> {
  return {
    fieldId: 'strokeLineStyle',
    id: 'update-object-stroke-line-style',
    objectId,
    slideId,
    value,
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

export function getSlideEditObjectStrokeLineStyleBorderStyle(
  value: string | null | undefined,
): SlideEditObjectStrokeLineStyleBorderStyle {
  const lineStyle = normalizeSlideEditObjectStrokeLineStyle(value)

  if (lineStyle === 'dash') {
    return 'dashed'
  }

  if (lineStyle === 'dot') {
    return 'dotted'
  }

  return 'solid'
}

export function getSlideEditObjectStrokeLineStyleDashArray({
  strokeWidth,
  value,
}: {
  strokeWidth: number
  value: string | null | undefined
}) {
  const lineStyle = normalizeSlideEditObjectStrokeLineStyle(value)
  const normalizedWidth = Number.isFinite(strokeWidth)
    ? Math.max(0, strokeWidth)
    : 1

  if (lineStyle === 'dash') {
    return [
      Math.max(4, normalizedWidth * 3),
      Math.max(3, normalizedWidth * 2),
    ].join(' ')
  }

  if (lineStyle === 'dot') {
    return `1 ${Math.max(3, normalizedWidth * 2)}`
  }

  return undefined
}

export function isSlideEditObjectStrokeLineStyleValue(
  value: string | null | undefined,
): value is SlideEditObjectStrokeLineStyleValue {
  return value === 'dash' || value === 'dot' || value === 'solid'
}

function getSlideEditObjectStrokeLineStyleDirectPasteValue(
  value: unknown,
): SlideEditObjectStrokeLineStyleValue | null {
  if (typeof value === 'string') {
    return isSlideEditObjectStrokeLineStyleValue(value) ? value : null
  }

  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  const record = value as Record<string, unknown>

  for (const key of ['value', 'strokeLineStyle'] as const) {
    if (Object.hasOwn(record, key)) {
      return getSlideEditObjectStrokeLineStyleDirectPasteValue(record[key])
    }
  }

  for (const key of ['dash', 'strokeDash'] as const) {
    if (Object.hasOwn(record, key)) {
      return getSlideEditObjectStrokeDashPasteValue(record[key])
    }
  }

  return null
}

function getSlideEditObjectStrokeLineStyleWrappedPasteValue(
  value: unknown,
): SlideEditObjectStrokeLineStyleValue | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  const record = value as Record<string, unknown>

  for (const key of SLIDE_EDIT_OBJECT_STROKE_LINE_STYLE_JSON_WRAPPER_KEYS) {
    if (!Object.hasOwn(record, key)) {
      continue
    }

    return key === 'strokeDash'
      ? getSlideEditObjectStrokeDashPasteValue(record[key])
      : getSlideEditObjectStrokeLineStyleDirectPasteValue(record[key])
  }

  return null
}

function getSlideEditObjectStrokeDashPasteValue(
  value: unknown,
): SlideEditObjectStrokeLineStyleValue | null {
  if (value === true) {
    return 'dash'
  }

  if (value === false) {
    return 'solid'
  }

  return getSlideEditObjectStrokeLineStyleDirectPasteValue(value)
}

function parseSlideEditObjectStrokeLineStyleJSON(value: string) {
  if (!value.trim()) {
    return null
  }

  try {
    return JSON.parse(value) as unknown
  } catch {
    return null
  }
}
