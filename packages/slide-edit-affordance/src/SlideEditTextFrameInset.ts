import { SLIDE_EDIT_TEXT_JSON_PASTE_TYPES } from './SlideEditTextJSONPaste'

export type SlideEditTextFrameInsetSlideId = string
export type SlideEditTextFrameInsetObjectId = string

export type SlideEditTextFrameInsetSide =
  | 'bottom'
  | 'left'
  | 'right'
  | 'top'

export type SlideEditTextFrameInset = {
  bottom: number
  left: number
  right: number
  top: number
}

export type SlideEditTextFrameInsetFieldDescriptor = {
  commandId: 'update-text-frame-inset'
  control: 'inset-number'
  id: SlideEditTextFrameInsetSide
  max: number
  min: number
  requiredAdapterSlot: 'command-effect'
  step: number
  unit: 'px'
}

export type SlideEditTextFrameInsetMetadata = {
  attribute: typeof SLIDE_EDIT_TEXT_FRAME_INSET_DATA_ATTRIBUTE
  defaultValue: string
  inset: SlideEditTextFrameInset
  value: string
}

export type SlideEditTextFrameInsetDescriptor<
  TSlideId extends SlideEditTextFrameInsetSlideId =
    SlideEditTextFrameInsetSlideId,
  TObjectId extends SlideEditTextFrameInsetObjectId =
    SlideEditTextFrameInsetObjectId,
> = {
  fields: readonly SlideEditTextFrameInsetFieldDescriptor[]
  inset: SlideEditTextFrameInset
  metadata: SlideEditTextFrameInsetMetadata
  objectId: TObjectId
  slideId: TSlideId
  surface: 'text-frame-inset'
}

export type SlideEditTextFrameInsetUpdateCommand<
  TSlideId extends SlideEditTextFrameInsetSlideId =
    SlideEditTextFrameInsetSlideId,
  TObjectId extends SlideEditTextFrameInsetObjectId =
    SlideEditTextFrameInsetObjectId,
> = {
  fieldId: SlideEditTextFrameInsetSide
  id: 'update-text-frame-inset'
  objectId: TObjectId
  slideId: TSlideId
  value: number
}

export type SlideEditTextFrameInsetHostCommandEffect<
  TSlideId extends SlideEditTextFrameInsetSlideId =
    SlideEditTextFrameInsetSlideId,
  TObjectId extends SlideEditTextFrameInsetObjectId =
    SlideEditTextFrameInsetObjectId,
> = {
  payload: SlideEditTextFrameInsetUpdateCommand<TSlideId, TObjectId>
  selection: {
    objectIds: readonly TObjectId[]
    slideId: TSlideId
  }
  type: 'slide-command-effect'
}

export type SlideEditTextFrameInsetDataTransfer = Pick<DataTransfer, 'getData'>

export type SlideEditTextFrameInsetPasteFieldValue = {
  fieldId: SlideEditTextFrameInsetSide
  value: number
}

export type SlideEditTextFrameInsetJSONPasteValue = {
  fields: readonly SlideEditTextFrameInsetPasteFieldValue[]
  inset: Partial<SlideEditTextFrameInset>
  surface: 'text-frame-inset'
}

export type SlideEditTextFrameInsetJSONPasteInput = {
  dataTransfer: SlideEditTextFrameInsetDataTransfer | null
  jsonMimeType?: string
}

export type SlideEditTextFrameInsetPasteCommandsInput<
  TSlideId extends SlideEditTextFrameInsetSlideId =
    SlideEditTextFrameInsetSlideId,
  TObjectId extends SlideEditTextFrameInsetObjectId =
    SlideEditTextFrameInsetObjectId,
> = {
  objectIds: readonly TObjectId[]
  pasteValue: SlideEditTextFrameInsetJSONPasteValue
  slideId: TSlideId
}

export type SlideEditTextFrameInsetNumericLimits = {
  max: number
  min: number
}

export const SLIDE_EDIT_TEXT_FRAME_INSET_DATA_ATTRIBUTE =
  'data-slide-text-frame-inset'

export const SLIDE_EDIT_TEXT_FRAME_INSET_LIMITS = Object.freeze({
  max: 1000,
  min: 0,
} as const satisfies SlideEditTextFrameInsetNumericLimits)

export const SLIDE_EDIT_TEXT_FRAME_INSET_DEFAULT = Object.freeze({
  bottom: 0,
  left: 0,
  right: 0,
  top: 0,
} as const satisfies SlideEditTextFrameInset)

export const SLIDE_EDIT_TEXT_FRAME_INSET_FIELDS = Object.freeze([
  {
    commandId: 'update-text-frame-inset',
    control: 'inset-number',
    id: 'top',
    max: SLIDE_EDIT_TEXT_FRAME_INSET_LIMITS.max,
    min: SLIDE_EDIT_TEXT_FRAME_INSET_LIMITS.min,
    requiredAdapterSlot: 'command-effect',
    step: 1,
    unit: 'px',
  },
  {
    commandId: 'update-text-frame-inset',
    control: 'inset-number',
    id: 'right',
    max: SLIDE_EDIT_TEXT_FRAME_INSET_LIMITS.max,
    min: SLIDE_EDIT_TEXT_FRAME_INSET_LIMITS.min,
    requiredAdapterSlot: 'command-effect',
    step: 1,
    unit: 'px',
  },
  {
    commandId: 'update-text-frame-inset',
    control: 'inset-number',
    id: 'bottom',
    max: SLIDE_EDIT_TEXT_FRAME_INSET_LIMITS.max,
    min: SLIDE_EDIT_TEXT_FRAME_INSET_LIMITS.min,
    requiredAdapterSlot: 'command-effect',
    step: 1,
    unit: 'px',
  },
  {
    commandId: 'update-text-frame-inset',
    control: 'inset-number',
    id: 'left',
    max: SLIDE_EDIT_TEXT_FRAME_INSET_LIMITS.max,
    min: SLIDE_EDIT_TEXT_FRAME_INSET_LIMITS.min,
    requiredAdapterSlot: 'command-effect',
    step: 1,
    unit: 'px',
  },
] as const satisfies readonly SlideEditTextFrameInsetFieldDescriptor[])

export const SLIDE_EDIT_TEXT_FRAME_INSET_JSON_MIME_TYPE =
  'application/vnd.interactive-os.slide-edit.text-frame-inset+json'

export const SLIDE_EDIT_TEXT_FRAME_INSET_JSON_TYPES =
  SLIDE_EDIT_TEXT_JSON_PASTE_TYPES

export const SLIDE_EDIT_TEXT_FRAME_INSET_JSON_WRAPPER_KEYS = Object.freeze([
  'textFrameInset',
  'textInset',
  'textPadding',
  'inset',
  'padding',
] as const)

const SLIDE_EDIT_TEXT_FRAME_INSET_SIDES = Object.freeze([
  'top',
  'right',
  'bottom',
  'left',
] as const satisfies readonly SlideEditTextFrameInsetSide[])

export function createSlideEditTextFrameInsetDescriptor<
  TSlideId extends SlideEditTextFrameInsetSlideId,
  TObjectId extends SlideEditTextFrameInsetObjectId,
>({
  fields = SLIDE_EDIT_TEXT_FRAME_INSET_FIELDS,
  inset = SLIDE_EDIT_TEXT_FRAME_INSET_DEFAULT,
  objectId,
  slideId,
}: {
  fields?: readonly SlideEditTextFrameInsetFieldDescriptor[]
  inset?: Partial<SlideEditTextFrameInset> | null
  objectId: TObjectId
  slideId: TSlideId
}): SlideEditTextFrameInsetDescriptor<TSlideId, TObjectId> {
  const normalizedInset = normalizeSlideEditTextFrameInset(inset)

  return {
    fields,
    inset: normalizedInset,
    metadata: getSlideEditTextFrameInsetMetadata(normalizedInset),
    objectId,
    slideId,
    surface: 'text-frame-inset',
  }
}

export function getSlideEditTextFrameInsetCommandEffect<
  TSlideId extends SlideEditTextFrameInsetSlideId,
  TObjectId extends SlideEditTextFrameInsetObjectId,
>(
  command: SlideEditTextFrameInsetUpdateCommand<TSlideId, TObjectId>,
): SlideEditTextFrameInsetHostCommandEffect<TSlideId, TObjectId> {
  return {
    payload: normalizeSlideEditTextFrameInsetUpdateCommand(command),
    selection: {
      objectIds: [command.objectId],
      slideId: command.slideId,
    },
    type: 'slide-command-effect',
  }
}

export function getSlideEditTextFrameInsetJSONPasteValue({
  dataTransfer,
  jsonMimeType = SLIDE_EDIT_TEXT_FRAME_INSET_JSON_MIME_TYPE,
}: SlideEditTextFrameInsetJSONPasteInput):
  SlideEditTextFrameInsetJSONPasteValue | null {
  if (!dataTransfer) {
    return null
  }

  if (jsonMimeType) {
    const customText = dataTransfer.getData(jsonMimeType)

    if (customText.trim()) {
      const customValue = parseSlideEditTextFrameInsetJSON(customText)
      const customPasteValue =
        getSlideEditTextFrameInsetDirectPasteValue(customValue)

      if (customPasteValue !== null) {
        return customPasteValue
      }
    }
  }

  for (const type of SLIDE_EDIT_TEXT_FRAME_INSET_JSON_TYPES) {
    const text = dataTransfer.getData(type)

    if (!text.trim()) {
      continue
    }

    const value = parseSlideEditTextFrameInsetJSON(text)
    const pasteValue = getSlideEditTextFrameInsetWrappedPasteValue(value)

    if (pasteValue !== null) {
      return pasteValue
    }
  }

  return null
}

export function getSlideEditTextFrameInsetPasteCommands<
  TSlideId extends SlideEditTextFrameInsetSlideId,
  TObjectId extends SlideEditTextFrameInsetObjectId,
>({
  objectIds,
  pasteValue,
  slideId,
}: SlideEditTextFrameInsetPasteCommandsInput<TSlideId, TObjectId>):
  readonly SlideEditTextFrameInsetUpdateCommand<TSlideId, TObjectId>[] {
  return objectIds.flatMap((objectId) =>
    pasteValue.fields.map((field) => ({
      fieldId: field.fieldId,
      id: 'update-text-frame-inset',
      objectId,
      slideId,
      value: field.value,
    }))
  )
}

export function normalizeSlideEditTextFrameInsetUpdateCommand<
  TSlideId extends SlideEditTextFrameInsetSlideId,
  TObjectId extends SlideEditTextFrameInsetObjectId,
>(
  command: SlideEditTextFrameInsetUpdateCommand<TSlideId, TObjectId>,
): SlideEditTextFrameInsetUpdateCommand<TSlideId, TObjectId> {
  return {
    ...command,
    value: normalizeSlideEditTextFrameInsetValue(command.value),
  }
}

export function getSlideEditTextFrameInsetMetadata(
  inset: Partial<SlideEditTextFrameInset> | null | undefined,
): SlideEditTextFrameInsetMetadata {
  const normalizedInset = normalizeSlideEditTextFrameInset(inset)

  return {
    attribute: SLIDE_EDIT_TEXT_FRAME_INSET_DATA_ATTRIBUTE,
    defaultValue: toSlideEditTextFrameInsetAttributeValue(
      SLIDE_EDIT_TEXT_FRAME_INSET_DEFAULT,
    ),
    inset: normalizedInset,
    value: toSlideEditTextFrameInsetAttributeValue(normalizedInset),
  }
}

export function normalizeSlideEditTextFrameInset(
  inset: Partial<SlideEditTextFrameInset> | null | undefined,
): SlideEditTextFrameInset {
  return {
    bottom: normalizeSlideEditTextFrameInsetValue(inset?.bottom),
    left: normalizeSlideEditTextFrameInsetValue(inset?.left),
    right: normalizeSlideEditTextFrameInsetValue(inset?.right),
    top: normalizeSlideEditTextFrameInsetValue(inset?.top),
  }
}

export function normalizeSlideEditTextFrameInsetValue(
  value: number | null | undefined,
) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return SLIDE_EDIT_TEXT_FRAME_INSET_DEFAULT.top
  }

  const rounded = Math.round(value * 100) / 100

  return Math.min(
    SLIDE_EDIT_TEXT_FRAME_INSET_LIMITS.max,
    Math.max(SLIDE_EDIT_TEXT_FRAME_INSET_LIMITS.min, rounded),
  )
}

export function toSlideEditTextFrameInsetAttributeValue(
  inset: SlideEditTextFrameInset,
) {
  return [
    inset.top,
    inset.right,
    inset.bottom,
    inset.left,
  ].join(' ')
}

export function getSlideEditTextFrameInsetPaddingCSS(
  inset: Partial<SlideEditTextFrameInset> | null | undefined,
) {
  const normalizedInset = normalizeSlideEditTextFrameInset(inset)

  return [
    normalizedInset.top,
    normalizedInset.right,
    normalizedInset.bottom,
    normalizedInset.left,
  ].map((value) => `${value}px`).join(' ')
}

function getSlideEditTextFrameInsetDirectPasteValue(
  value: unknown,
): SlideEditTextFrameInsetJSONPasteValue | null {
  const numericValue = getSlideEditTextFrameInsetJSONNumber(value)

  if (numericValue !== null) {
    return createSlideEditTextFrameInsetPasteValue(
      SLIDE_EDIT_TEXT_FRAME_INSET_SIDES.map((side) => ({
        fieldId: side,
        value: numericValue,
      })),
    )
  }

  if (Array.isArray(value)) {
    return createSlideEditTextFrameInsetPasteValue(
      SLIDE_EDIT_TEXT_FRAME_INSET_SIDES.flatMap((side, index) => {
        const sideValue = getSlideEditTextFrameInsetJSONValue(value[index])

        return sideValue === null
          ? []
          : [
            {
              fieldId: side,
              value: sideValue,
            },
          ]
      }),
    )
  }

  if (!value || typeof value !== 'object') {
    return null
  }

  const record = value as Record<string, unknown>

  return createSlideEditTextFrameInsetPasteValue(
    SLIDE_EDIT_TEXT_FRAME_INSET_SIDES.flatMap((side) => {
      if (!Object.hasOwn(record, side)) {
        return []
      }

      const sideValue = getSlideEditTextFrameInsetJSONValue(record[side])

      return sideValue === null
        ? []
        : [
          {
            fieldId: side,
            value: sideValue,
          },
        ]
    }),
  )
}

function getSlideEditTextFrameInsetWrappedPasteValue(
  value: unknown,
): SlideEditTextFrameInsetJSONPasteValue | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  const record = value as Record<string, unknown>

  for (const key of SLIDE_EDIT_TEXT_FRAME_INSET_JSON_WRAPPER_KEYS) {
    if (!Object.hasOwn(record, key)) {
      continue
    }

    const pasteValue = getSlideEditTextFrameInsetDirectPasteValue(record[key])

    if (pasteValue !== null) {
      return pasteValue
    }
  }

  return null
}

function createSlideEditTextFrameInsetPasteValue(
  fields: readonly SlideEditTextFrameInsetPasteFieldValue[],
): SlideEditTextFrameInsetJSONPasteValue | null {
  if (fields.length === 0) {
    return null
  }

  const inset: Partial<SlideEditTextFrameInset> = {}
  const normalizedFields = fields.map((field) => ({
    fieldId: field.fieldId,
    value: normalizeSlideEditTextFrameInsetValue(field.value),
  }))

  for (const field of normalizedFields) {
    inset[field.fieldId] = field.value
  }

  return {
    fields: normalizedFields,
    inset,
    surface: 'text-frame-inset',
  }
}

function getSlideEditTextFrameInsetJSONValue(value: unknown) {
  const numericValue = getSlideEditTextFrameInsetJSONNumber(value)

  return numericValue === null
    ? null
    : normalizeSlideEditTextFrameInsetValue(numericValue)
}

function getSlideEditTextFrameInsetJSONNumber(value: unknown) {
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

  const numericText = trimmedValue.toLowerCase().endsWith('px')
    ? trimmedValue.slice(0, -2).trim()
    : trimmedValue
  const numericValue = Number(numericText)

  return Number.isFinite(numericValue) ? numericValue : null
}

function parseSlideEditTextFrameInsetJSON(value: string) {
  if (!value.trim()) {
    return null
  }

  try {
    return JSON.parse(value) as unknown
  } catch {
    return null
  }
}
