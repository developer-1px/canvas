export type SlideEditObjectShadowSlideId = string
export type SlideEditObjectShadowObjectId = string

export type SlideEditObjectShadow = {
  angle: number
  blur: number
  color: string
  distance: number
  enabled: boolean
  opacity: number
}

export type SlideEditObjectShadowFieldId = keyof SlideEditObjectShadow

export type SlideEditObjectShadowFieldControl =
  | 'color'
  | 'number'
  | 'shadow-toggle'
  | 'slider'

export type SlideEditObjectShadowFieldDescriptor = {
  commandId: 'update-object-shadow'
  control: SlideEditObjectShadowFieldControl
  id: SlideEditObjectShadowFieldId
  max?: number
  min?: number
  requiredAdapterSlot: 'command-effect'
  step?: number
  unit?: 'deg' | 'px' | 'ratio'
}

export type SlideEditObjectShadowMetadata = {
  attribute: typeof SLIDE_EDIT_OBJECT_SHADOW_DATA_ATTRIBUTE
  attributeValue: string
  defaultValue: 'none'
  isEnabled: boolean
  shadow: SlideEditObjectShadow
}

export type SlideEditObjectShadowDescriptor<
  TSlideId extends SlideEditObjectShadowSlideId =
    SlideEditObjectShadowSlideId,
  TObjectId extends SlideEditObjectShadowObjectId =
    SlideEditObjectShadowObjectId,
> = {
  fields: readonly SlideEditObjectShadowFieldDescriptor[]
  metadata: SlideEditObjectShadowMetadata
  objectId: TObjectId
  shadow: SlideEditObjectShadow
  slideId: TSlideId
  surface: 'object-shadow'
}

export type SlideEditObjectShadowUpdateCommand<
  TSlideId extends SlideEditObjectShadowSlideId =
    SlideEditObjectShadowSlideId,
  TObjectId extends SlideEditObjectShadowObjectId =
    SlideEditObjectShadowObjectId,
> = {
  fieldId: SlideEditObjectShadowFieldId
  id: 'update-object-shadow'
  objectId: TObjectId
  slideId: TSlideId
  value: boolean | number | string
}

export type SlideEditObjectShadowHostCommandEffect<
  TSlideId extends SlideEditObjectShadowSlideId =
    SlideEditObjectShadowSlideId,
  TObjectId extends SlideEditObjectShadowObjectId =
    SlideEditObjectShadowObjectId,
> = {
  payload: SlideEditObjectShadowUpdateCommand<TSlideId, TObjectId>
  selection: {
    objectIds: readonly TObjectId[]
    slideId: TSlideId
  }
  type: 'slide-command-effect'
}

export type SlideEditObjectShadowDataTransfer = Pick<DataTransfer, 'getData'>

export type SlideEditObjectShadowPasteFieldValue = {
  fieldId: SlideEditObjectShadowFieldId
  value: boolean | number | string
}

export type SlideEditObjectShadowJSONPasteValue = {
  fields: readonly SlideEditObjectShadowPasteFieldValue[]
  shadow: SlideEditObjectShadow
  surface: 'object-shadow'
}

export type SlideEditObjectShadowJSONPasteInput = {
  dataTransfer: SlideEditObjectShadowDataTransfer | null
  jsonMimeType?: string
}

export type SlideEditObjectShadowPasteCommandsInput<
  TSlideId extends SlideEditObjectShadowSlideId = SlideEditObjectShadowSlideId,
  TObjectId extends SlideEditObjectShadowObjectId =
    SlideEditObjectShadowObjectId,
> = {
  objectId: TObjectId
  pasteValue: SlideEditObjectShadowJSONPasteValue
  slideId: TSlideId
}

export type SlideEditObjectShadowNumericLimits = {
  max: number
  min: number
}

export type SlideEditObjectShadowLimits = {
  angle: SlideEditObjectShadowNumericLimits
  blur: SlideEditObjectShadowNumericLimits
  distance: SlideEditObjectShadowNumericLimits
  opacity: SlideEditObjectShadowNumericLimits
}

export const SLIDE_EDIT_OBJECT_SHADOW_DATA_ATTRIBUTE =
  'data-slide-object-shadow'

export const SLIDE_EDIT_OBJECT_SHADOW_JSON_MIME_TYPE =
  'application/vnd.interactive-os.slide-edit.object-shadow+json'

export const SLIDE_EDIT_OBJECT_SHADOW_JSON_TYPES = Object.freeze([
  'application/json',
  'text/json',
  'text/plain',
] as const)

export const SLIDE_EDIT_OBJECT_SHADOW_JSON_WRAPPER_KEYS = Object.freeze([
  'objectShadow',
  'objectEffectShadow',
  'shadow',
] as const)

const SLIDE_EDIT_OBJECT_SHADOW_INVALID_JSON = Symbol(
  'slide-edit-object-shadow-invalid-json',
)

export const SLIDE_EDIT_OBJECT_SHADOW_DEFAULT = Object.freeze({
  angle: 45,
  blur: 12,
  color: '#000000',
  distance: 4,
  enabled: false,
  opacity: 0.25,
} as const satisfies SlideEditObjectShadow)

export const SLIDE_EDIT_OBJECT_SHADOW_LIMITS = Object.freeze({
  angle: {
    max: 360,
    min: 0,
  },
  blur: {
    max: 200,
    min: 0,
  },
  distance: {
    max: 1000,
    min: 0,
  },
  opacity: {
    max: 1,
    min: 0,
  },
} as const satisfies SlideEditObjectShadowLimits)

export const SLIDE_EDIT_OBJECT_SHADOW_FIELDS = Object.freeze([
  {
    commandId: 'update-object-shadow',
    control: 'shadow-toggle',
    id: 'enabled',
    requiredAdapterSlot: 'command-effect',
  },
  {
    commandId: 'update-object-shadow',
    control: 'color',
    id: 'color',
    requiredAdapterSlot: 'command-effect',
  },
  {
    commandId: 'update-object-shadow',
    control: 'slider',
    id: 'opacity',
    max: SLIDE_EDIT_OBJECT_SHADOW_LIMITS.opacity.max,
    min: SLIDE_EDIT_OBJECT_SHADOW_LIMITS.opacity.min,
    requiredAdapterSlot: 'command-effect',
    step: 0.01,
    unit: 'ratio',
  },
  {
    commandId: 'update-object-shadow',
    control: 'number',
    id: 'blur',
    max: SLIDE_EDIT_OBJECT_SHADOW_LIMITS.blur.max,
    min: SLIDE_EDIT_OBJECT_SHADOW_LIMITS.blur.min,
    requiredAdapterSlot: 'command-effect',
    step: 1,
    unit: 'px',
  },
  {
    commandId: 'update-object-shadow',
    control: 'number',
    id: 'angle',
    max: SLIDE_EDIT_OBJECT_SHADOW_LIMITS.angle.max,
    min: SLIDE_EDIT_OBJECT_SHADOW_LIMITS.angle.min,
    requiredAdapterSlot: 'command-effect',
    step: 1,
    unit: 'deg',
  },
  {
    commandId: 'update-object-shadow',
    control: 'number',
    id: 'distance',
    max: SLIDE_EDIT_OBJECT_SHADOW_LIMITS.distance.max,
    min: SLIDE_EDIT_OBJECT_SHADOW_LIMITS.distance.min,
    requiredAdapterSlot: 'command-effect',
    step: 1,
    unit: 'px',
  },
] as const satisfies readonly SlideEditObjectShadowFieldDescriptor[])

export function createSlideEditObjectShadowDescriptor<
  TSlideId extends SlideEditObjectShadowSlideId,
  TObjectId extends SlideEditObjectShadowObjectId,
>({
  fields = SLIDE_EDIT_OBJECT_SHADOW_FIELDS,
  objectId,
  shadow = SLIDE_EDIT_OBJECT_SHADOW_DEFAULT,
  slideId,
}: {
  fields?: readonly SlideEditObjectShadowFieldDescriptor[]
  objectId: TObjectId
  shadow?: Partial<SlideEditObjectShadow> | null
  slideId: TSlideId
}): SlideEditObjectShadowDescriptor<TSlideId, TObjectId> {
  const normalizedShadow = normalizeSlideEditObjectShadow(shadow)

  return {
    fields,
    metadata: getSlideEditObjectShadowMetadata(normalizedShadow),
    objectId,
    shadow: normalizedShadow,
    slideId,
    surface: 'object-shadow',
  }
}

export function getSlideEditObjectShadowCommandEffect<
  TSlideId extends SlideEditObjectShadowSlideId,
  TObjectId extends SlideEditObjectShadowObjectId,
>(
  command: SlideEditObjectShadowUpdateCommand<TSlideId, TObjectId>,
): SlideEditObjectShadowHostCommandEffect<TSlideId, TObjectId> {
  return {
    payload: normalizeSlideEditObjectShadowUpdateCommand(command),
    selection: {
      objectIds: [command.objectId],
      slideId: command.slideId,
    },
    type: 'slide-command-effect',
  }
}

export function getSlideEditObjectShadowJSONPasteValue({
  dataTransfer,
  jsonMimeType = SLIDE_EDIT_OBJECT_SHADOW_JSON_MIME_TYPE,
}: SlideEditObjectShadowJSONPasteInput):
  SlideEditObjectShadowJSONPasteValue | null {
  if (!dataTransfer) {
    return null
  }

  if (jsonMimeType) {
    const customText = dataTransfer.getData(jsonMimeType)

    if (customText.trim()) {
      const customValue = parseSlideEditObjectShadowJSON(customText)
      const customPasteValue =
        getSlideEditObjectShadowDirectPasteValue(customValue)

      if (customPasteValue !== null) {
        return customPasteValue
      }
    }
  }

  for (const type of SLIDE_EDIT_OBJECT_SHADOW_JSON_TYPES) {
    const text = dataTransfer.getData(type)

    if (!text.trim()) {
      continue
    }

    const value = parseSlideEditObjectShadowJSON(text)
    const pasteValue = getSlideEditObjectShadowWrappedPasteValue(value)

    if (pasteValue !== null) {
      return pasteValue
    }
  }

  return null
}

export function getSlideEditObjectShadowPasteCommands<
  TSlideId extends SlideEditObjectShadowSlideId,
  TObjectId extends SlideEditObjectShadowObjectId,
>({
  objectId,
  pasteValue,
  slideId,
}: SlideEditObjectShadowPasteCommandsInput<TSlideId, TObjectId>):
  readonly SlideEditObjectShadowUpdateCommand<TSlideId, TObjectId>[] {
  return pasteValue.fields.map((field) => ({
    fieldId: field.fieldId,
    id: 'update-object-shadow',
    objectId,
    slideId,
    value: field.value,
  }))
}

export function normalizeSlideEditObjectShadowUpdateCommand<
  TSlideId extends SlideEditObjectShadowSlideId,
  TObjectId extends SlideEditObjectShadowObjectId,
>(
  command: SlideEditObjectShadowUpdateCommand<TSlideId, TObjectId>,
): SlideEditObjectShadowUpdateCommand<TSlideId, TObjectId> {
  return {
    ...command,
    value: normalizeSlideEditObjectShadowFieldValue(
      command.fieldId,
      command.value,
    ),
  }
}

export function getSlideEditObjectShadowMetadata(
  shadow: Partial<SlideEditObjectShadow> | null | undefined,
): SlideEditObjectShadowMetadata {
  const normalizedShadow = normalizeSlideEditObjectShadow(shadow)

  return {
    attribute: SLIDE_EDIT_OBJECT_SHADOW_DATA_ATTRIBUTE,
    attributeValue: toSlideEditObjectShadowAttributeValue(normalizedShadow),
    defaultValue: 'none',
    isEnabled: normalizedShadow.enabled,
    shadow: normalizedShadow,
  }
}

export function normalizeSlideEditObjectShadow(
  shadow: Partial<SlideEditObjectShadow> | null | undefined,
): SlideEditObjectShadow {
  return {
    angle: normalizeSlideEditObjectShadowNumber(
      shadow?.angle,
      SLIDE_EDIT_OBJECT_SHADOW_LIMITS.angle,
      SLIDE_EDIT_OBJECT_SHADOW_DEFAULT.angle,
    ),
    blur: normalizeSlideEditObjectShadowNumber(
      shadow?.blur,
      SLIDE_EDIT_OBJECT_SHADOW_LIMITS.blur,
      SLIDE_EDIT_OBJECT_SHADOW_DEFAULT.blur,
    ),
    color: normalizeSlideEditObjectShadowColor(shadow?.color),
    distance: normalizeSlideEditObjectShadowNumber(
      shadow?.distance,
      SLIDE_EDIT_OBJECT_SHADOW_LIMITS.distance,
      SLIDE_EDIT_OBJECT_SHADOW_DEFAULT.distance,
    ),
    enabled: shadow?.enabled === true,
    opacity: normalizeSlideEditObjectShadowNumber(
      shadow?.opacity,
      SLIDE_EDIT_OBJECT_SHADOW_LIMITS.opacity,
      SLIDE_EDIT_OBJECT_SHADOW_DEFAULT.opacity,
    ),
  }
}

export function normalizeSlideEditObjectShadowFieldValue(
  fieldId: SlideEditObjectShadowFieldId,
  value: boolean | number | string,
) {
  if (fieldId === 'enabled') {
    return value === true
  }

  if (fieldId === 'color') {
    return normalizeSlideEditObjectShadowColor(String(value))
  }

  if (fieldId === 'opacity') {
    return normalizeSlideEditObjectShadowNumber(
      Number(value),
      SLIDE_EDIT_OBJECT_SHADOW_LIMITS.opacity,
      SLIDE_EDIT_OBJECT_SHADOW_DEFAULT.opacity,
    )
  }

  if (fieldId === 'blur') {
    return normalizeSlideEditObjectShadowNumber(
      Number(value),
      SLIDE_EDIT_OBJECT_SHADOW_LIMITS.blur,
      SLIDE_EDIT_OBJECT_SHADOW_DEFAULT.blur,
    )
  }

  if (fieldId === 'angle') {
    return normalizeSlideEditObjectShadowNumber(
      Number(value),
      SLIDE_EDIT_OBJECT_SHADOW_LIMITS.angle,
      SLIDE_EDIT_OBJECT_SHADOW_DEFAULT.angle,
    )
  }

  return normalizeSlideEditObjectShadowNumber(
    Number(value),
    SLIDE_EDIT_OBJECT_SHADOW_LIMITS.distance,
    SLIDE_EDIT_OBJECT_SHADOW_DEFAULT.distance,
  )
}

export function shouldEmitSlideEditObjectShadowMetadata(
  shadow: Partial<SlideEditObjectShadow> | null | undefined,
) {
  return normalizeSlideEditObjectShadow(shadow).enabled
}

export function toSlideEditObjectShadowAttributeValue(
  shadow: Partial<SlideEditObjectShadow> | null | undefined,
) {
  const normalizedShadow = normalizeSlideEditObjectShadow(shadow)

  if (!normalizedShadow.enabled) {
    return 'none'
  }

  return JSON.stringify(normalizedShadow)
}

export function getSlideEditObjectShadowFilter(
  shadow: Partial<SlideEditObjectShadow> | null | undefined,
) {
  const filterCss = getSlideEditObjectShadowFilterCSS(shadow)

  return filterCss ? `drop-shadow(${filterCss})` : undefined
}

export function getSlideEditObjectShadowFilterCSS(
  shadow: Partial<SlideEditObjectShadow> | null | undefined,
) {
  const normalizedShadow = normalizeSlideEditObjectShadow(shadow)

  if (!normalizedShadow.enabled) {
    return undefined
  }

  const radians = (normalizedShadow.angle * Math.PI) / 180
  const offsetX = formatSlideEditObjectShadowCSSNumber(
    Math.cos(radians) * normalizedShadow.distance,
  )
  const offsetY = formatSlideEditObjectShadowCSSNumber(
    Math.sin(radians) * normalizedShadow.distance,
  )

  return [
    `${offsetX}px`,
    `${offsetY}px`,
    `${normalizedShadow.blur}px`,
    getSlideEditObjectShadowColorCSS(normalizedShadow),
  ].join(' ')
}

export function getSlideEditObjectShadowColorCSS(
  shadow: Partial<SlideEditObjectShadow> | null | undefined,
) {
  const normalizedShadow = normalizeSlideEditObjectShadow(shadow)
  const match = /^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i
    .exec(normalizedShadow.color)

  if (!match) {
    return normalizedShadow.color
  }

  const [, red, green, blue] = match

  return [
    `rgb(${Number.parseInt(red, 16)}`,
    `${Number.parseInt(green, 16)}`,
    `${Number.parseInt(blue, 16)}`,
    `/ ${normalizedShadow.opacity})`,
  ].join(' ')
}

function normalizeSlideEditObjectShadowColor(value: string | undefined) {
  const normalizedValue = value?.trim()

  return normalizedValue
    ? normalizedValue
    : SLIDE_EDIT_OBJECT_SHADOW_DEFAULT.color
}

function normalizeSlideEditObjectShadowNumber(
  value: number | null | undefined,
  limits: SlideEditObjectShadowNumericLimits,
  fallback: number,
) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return fallback
  }

  const rounded = Math.round(value * 100) / 100

  return Math.min(limits.max, Math.max(limits.min, rounded))
}

function formatSlideEditObjectShadowCSSNumber(value: number) {
  return String(Number(value.toFixed(2)))
}

function getSlideEditObjectShadowDirectPasteValue(
  value: unknown,
): SlideEditObjectShadowJSONPasteValue | null {
  if (value === null || value === false) {
    return createSlideEditObjectShadowJSONPasteValue([
      {
        fieldId: 'enabled',
        value: false,
      },
    ])
  }

  if (value === true) {
    return createSlideEditObjectShadowJSONPasteValue([
      {
        fieldId: 'enabled',
        value: true,
      },
    ])
  }

  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  const record = value as Record<string, unknown>

  if (Object.hasOwn(record, 'value')) {
    return getSlideEditObjectShadowDirectPasteValue(record.value)
  }

  if (Object.hasOwn(record, 'shadow')) {
    return getSlideEditObjectShadowDirectPasteValue(record.shadow)
  }

  return getSlideEditObjectShadowObjectPasteValue(record)
}

function getSlideEditObjectShadowWrappedPasteValue(
  value: unknown,
): SlideEditObjectShadowJSONPasteValue | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  const record = value as Record<string, unknown>

  for (const key of SLIDE_EDIT_OBJECT_SHADOW_JSON_WRAPPER_KEYS) {
    if (Object.hasOwn(record, key)) {
      return getSlideEditObjectShadowDirectPasteValue(record[key])
    }
  }

  return null
}

function getSlideEditObjectShadowObjectPasteValue(
  record: Record<string, unknown>,
): SlideEditObjectShadowJSONPasteValue | null {
  const fields = SLIDE_EDIT_OBJECT_SHADOW_FIELDS.flatMap((field) => {
    if (!Object.hasOwn(record, field.id)) {
      return []
    }

    return [
      {
        fieldId: field.id,
        value: normalizeSlideEditObjectShadowFieldValue(
          field.id,
          record[field.id] as boolean | number | string,
        ),
      },
    ]
  })

  return fields.length > 0
    ? createSlideEditObjectShadowJSONPasteValue(fields)
    : null
}

function createSlideEditObjectShadowJSONPasteValue(
  fields: readonly SlideEditObjectShadowPasteFieldValue[],
): SlideEditObjectShadowJSONPasteValue {
  return {
    fields,
    shadow: normalizeSlideEditObjectShadow(
      Object.fromEntries(fields.map((field) => [field.fieldId, field.value])),
    ),
    surface: 'object-shadow',
  }
}

function parseSlideEditObjectShadowJSON(value: string) {
  if (!value.trim()) {
    return null
  }

  try {
    return JSON.parse(value) as unknown
  } catch {
    return SLIDE_EDIT_OBJECT_SHADOW_INVALID_JSON
  }
}
