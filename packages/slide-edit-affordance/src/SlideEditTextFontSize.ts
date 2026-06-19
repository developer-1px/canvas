import { SLIDE_EDIT_TEXT_JSON_PASTE_TYPES } from './SlideEditTextJSONPaste'

export type SlideEditTextFontSizeSlideId = string
export type SlideEditTextFontSizeObjectId = string
export type SlideEditTextFontSizeValue = number

export type SlideEditTextFontSizeNumericLimits = {
  defaultValue: number
  max: number
  min: number
  precision: number
  step: number
  unit: 'px'
}

export type SlideEditTextFontSizeFieldDescriptor = {
  commandId: 'update-text-font-size'
  control: 'font-size-stepper'
  id: 'fontSize'
  jsonKeys: readonly string[]
  jsonMimeType: string
  max: number
  min: number
  requiredAdapterSlot: 'command-effect'
  step: number
  unit: 'px'
}

export type SlideEditTextFontSizeMetadata = {
  attribute: typeof SLIDE_EDIT_TEXT_FONT_SIZE_DATA_ATTRIBUTE
  defaultValue: typeof SLIDE_EDIT_TEXT_FONT_SIZE_DEFAULT
  value: SlideEditTextFontSizeValue
}

export type SlideEditTextFontSizeDescriptor<
  TSlideId extends SlideEditTextFontSizeSlideId = SlideEditTextFontSizeSlideId,
  TObjectId extends SlideEditTextFontSizeObjectId =
    SlideEditTextFontSizeObjectId,
> = {
  field: SlideEditTextFontSizeFieldDescriptor
  metadata: SlideEditTextFontSizeMetadata
  objectId: TObjectId
  slideId: TSlideId
  surface: 'text-font-size'
  value: SlideEditTextFontSizeValue
}

export type SlideEditTextFontSizeUpdateCommand<
  TSlideId extends SlideEditTextFontSizeSlideId = SlideEditTextFontSizeSlideId,
  TObjectId extends SlideEditTextFontSizeObjectId =
    SlideEditTextFontSizeObjectId,
> = {
  fieldId: 'fontSize'
  id: 'update-text-font-size'
  objectId: TObjectId
  slideId: TSlideId
  value: SlideEditTextFontSizeValue
}

export type SlideEditTextFontSizeHostCommandEffect<
  TSlideId extends SlideEditTextFontSizeSlideId = SlideEditTextFontSizeSlideId,
  TObjectId extends SlideEditTextFontSizeObjectId =
    SlideEditTextFontSizeObjectId,
> = {
  payload: SlideEditTextFontSizeUpdateCommand<TSlideId, TObjectId>
  selection: {
    objectIds: readonly TObjectId[]
    slideId: TSlideId
  }
  type: 'slide-command-effect'
}

export type SlideEditTextFontSizeKeyboardDirection =
  | 'decrease'
  | 'increase'

export type SlideEditTextFontSizeKeyboardShortcut =
  | typeof SLIDE_EDIT_TEXT_FONT_SIZE_DECREASE_KEYBOARD_SHORTCUT
  | typeof SLIDE_EDIT_TEXT_FONT_SIZE_INCREASE_KEYBOARD_SHORTCUT

export type SlideEditTextFontSizeKeyboardIntentKind =
  | 'decrease-text-font-size'
  | 'increase-text-font-size'

export type SlideEditTextFontSizeKeyboardIntent = {
  commandId: 'update-text-font-size'
  delta: number
  direction: SlideEditTextFontSizeKeyboardDirection
  fieldId: 'fontSize'
  intent: typeof SLIDE_EDIT_TEXT_FONT_SIZE_KEYBOARD_INTENT
  kind: SlideEditTextFontSizeKeyboardIntentKind
  keyboardModel: typeof SLIDE_EDIT_TEXT_FONT_SIZE_KEYBOARD_MODEL
  preventDefault: true
  shortcut: SlideEditTextFontSizeKeyboardShortcut
  step: number
}

export type SlideEditTextFontSizeKeyboardIntentInput = {
  altKey?: boolean
  code?: string
  key: string
  mod: boolean
  shiftKey?: boolean
}

export type SlideEditTextFontSizeDataTransfer = Pick<DataTransfer, 'getData'>

export type SlideEditTextFontSizeJSONPasteInput = {
  dataTransfer: SlideEditTextFontSizeDataTransfer | null
  jsonMimeType?: string
}

export type SlideEditTextFontSizeJSONPasteValueMode =
  | 'direct'
  | 'wrapped'

export type SlideEditTextFontSizeJSONPasteValueOptions = {
  mode?: SlideEditTextFontSizeJSONPasteValueMode
}

export const SLIDE_EDIT_TEXT_FONT_SIZE_DEFAULT = 16
export const SLIDE_EDIT_TEXT_FONT_SIZE_DATA_ATTRIBUTE =
  'data-slide-text-font-size'

export const SLIDE_EDIT_TEXT_FONT_SIZE_LIMITS = Object.freeze({
  defaultValue: SLIDE_EDIT_TEXT_FONT_SIZE_DEFAULT,
  max: 400,
  min: 1,
  precision: 2,
  step: 0.5,
  unit: 'px',
} as const satisfies SlideEditTextFontSizeNumericLimits)

export const SLIDE_EDIT_TEXT_FONT_SIZE_FIELD = Object.freeze({
  commandId: 'update-text-font-size',
  control: 'font-size-stepper',
  id: 'fontSize',
  jsonKeys: ['textFontSize', 'fontSize', 'size', 'value'],
  jsonMimeType:
    'application/vnd.interactive-os.slide-edit.text-font-size+json',
  max: SLIDE_EDIT_TEXT_FONT_SIZE_LIMITS.max,
  min: SLIDE_EDIT_TEXT_FONT_SIZE_LIMITS.min,
  requiredAdapterSlot: 'command-effect',
  step: SLIDE_EDIT_TEXT_FONT_SIZE_LIMITS.step,
  unit: 'px',
} as const satisfies SlideEditTextFontSizeFieldDescriptor)

export const SLIDE_EDIT_TEXT_FONT_SIZE_JSON_TYPES =
  SLIDE_EDIT_TEXT_JSON_PASTE_TYPES

export const SLIDE_EDIT_TEXT_FONT_SIZE_INCREASE_KEYBOARD_SHORTCUT =
  'Cmd/Ctrl+Shift+>'
export const SLIDE_EDIT_TEXT_FONT_SIZE_DECREASE_KEYBOARD_SHORTCUT =
  'Cmd/Ctrl+Shift+<'
export const SLIDE_EDIT_TEXT_FONT_SIZE_KEYBOARD_KEYS =
  `${SLIDE_EDIT_TEXT_FONT_SIZE_INCREASE_KEYBOARD_SHORTCUT} ${SLIDE_EDIT_TEXT_FONT_SIZE_DECREASE_KEYBOARD_SHORTCUT}`
export const SLIDE_EDIT_TEXT_FONT_SIZE_KEYBOARD_MODEL =
  'slide-edit-text-font-size-keyboard-shortcuts'
export const SLIDE_EDIT_TEXT_FONT_SIZE_KEYBOARD_INTENT =
  'slide-edit-text-font-size-keyboard-intent'
export const SLIDE_EDIT_TEXT_FONT_SIZE_KEYBOARD_ROUTING_PRIORITY =
  'text-selection-before-host-command'

export function createSlideEditTextFontSizeDescriptor<
  TSlideId extends SlideEditTextFontSizeSlideId,
  TObjectId extends SlideEditTextFontSizeObjectId,
>({
  field = SLIDE_EDIT_TEXT_FONT_SIZE_FIELD,
  objectId,
  slideId,
  value = SLIDE_EDIT_TEXT_FONT_SIZE_DEFAULT,
}: {
  field?: SlideEditTextFontSizeFieldDescriptor
  objectId: TObjectId
  slideId: TSlideId
  value?: unknown
}): SlideEditTextFontSizeDescriptor<TSlideId, TObjectId> {
  const normalizedValue = normalizeSlideEditTextFontSize(value)

  return {
    field,
    metadata: getSlideEditTextFontSizeMetadata(normalizedValue),
    objectId,
    slideId,
    surface: 'text-font-size',
    value: normalizedValue,
  }
}

export function getSlideEditTextFontSizeCommandEffect<
  TSlideId extends SlideEditTextFontSizeSlideId,
  TObjectId extends SlideEditTextFontSizeObjectId,
>(
  command: SlideEditTextFontSizeUpdateCommand<TSlideId, TObjectId>,
): SlideEditTextFontSizeHostCommandEffect<TSlideId, TObjectId> {
  return {
    payload: normalizeSlideEditTextFontSizeUpdateCommand(command),
    selection: {
      objectIds: [command.objectId],
      slideId: command.slideId,
    },
    type: 'slide-command-effect',
  }
}

export function getSlideEditTextFontSizeKeyboardIntent({
  altKey = false,
  code,
  key,
  mod,
  shiftKey = false,
}: SlideEditTextFontSizeKeyboardIntentInput):
  SlideEditTextFontSizeKeyboardIntent | null {
  if (!mod || !shiftKey || altKey) {
    return null
  }

  if (key === '>' || code === 'Period') {
    return createSlideEditTextFontSizeKeyboardIntent('increase')
  }

  if (key === '<' || code === 'Comma') {
    return createSlideEditTextFontSizeKeyboardIntent('decrease')
  }

  return null
}

export function normalizeSlideEditTextFontSizeUpdateCommand<
  TSlideId extends SlideEditTextFontSizeSlideId,
  TObjectId extends SlideEditTextFontSizeObjectId,
>(
  command: SlideEditTextFontSizeUpdateCommand<TSlideId, TObjectId>,
): SlideEditTextFontSizeUpdateCommand<TSlideId, TObjectId> {
  return {
    ...command,
    value: normalizeSlideEditTextFontSize(command.value),
  }
}

export function getSlideEditTextFontSizeCSSValue(value: unknown) {
  return `${normalizeSlideEditTextFontSize(value)}px`
}

export function getSlideEditTextFontSizeMetadata(
  value: unknown,
): SlideEditTextFontSizeMetadata {
  const normalizedValue = normalizeSlideEditTextFontSize(value)

  return {
    attribute: SLIDE_EDIT_TEXT_FONT_SIZE_DATA_ATTRIBUTE,
    defaultValue: SLIDE_EDIT_TEXT_FONT_SIZE_DEFAULT,
    value: normalizedValue,
  }
}

export function toSlideEditTextFontSizeAttributeValue(value: unknown) {
  return String(normalizeSlideEditTextFontSize(value))
}

export function getSlideEditTextFontSizeJSONPasteValue({
  dataTransfer,
  jsonMimeType = SLIDE_EDIT_TEXT_FONT_SIZE_FIELD.jsonMimeType,
}: SlideEditTextFontSizeJSONPasteInput): SlideEditTextFontSizeValue | null {
  if (!dataTransfer) {
    return null
  }

  if (jsonMimeType) {
    const normalizedCustomValue =
      getSlideEditTextFontSizeJSONPasteValueFromText(
        dataTransfer.getData(jsonMimeType),
        { mode: 'direct' },
      )

    if (normalizedCustomValue !== null) {
      return normalizedCustomValue
    }
  }

  for (const type of SLIDE_EDIT_TEXT_FONT_SIZE_JSON_TYPES) {
    const explicitValue = getSlideEditTextFontSizeJSONPasteValueFromText(
      dataTransfer.getData(type),
      { mode: 'wrapped' },
    )

    if (explicitValue !== null) {
      return explicitValue
    }
  }

  return null
}

export function getSlideEditTextFontSizeJSONPasteValueFromText(
  text: string,
  options?: SlideEditTextFontSizeJSONPasteValueOptions,
): SlideEditTextFontSizeValue | null {
  return getSlideEditTextFontSizeJSONPasteValueFromValue(
    parseSlideEditTextFontSizeJSON(text),
    options,
  )
}

export function getSlideEditTextFontSizeJSONPasteValueFromValue(
  value: unknown,
  { mode = 'direct' }: SlideEditTextFontSizeJSONPasteValueOptions = {},
): SlideEditTextFontSizeValue | null {
  return mode === 'wrapped'
    ? getSlideEditTextFontSizeExplicitJSONValue(value)
    : normalizeSlideEditTextFontSizeJSONValue(value)
}

export function normalizeSlideEditTextFontSize(
  value: unknown,
): SlideEditTextFontSizeValue {
  return normalizeSlideEditTextFontSizeJSONValue(value) ??
    SLIDE_EDIT_TEXT_FONT_SIZE_DEFAULT
}

function createSlideEditTextFontSizeKeyboardIntent(
  direction: SlideEditTextFontSizeKeyboardDirection,
): SlideEditTextFontSizeKeyboardIntent {
  const step = SLIDE_EDIT_TEXT_FONT_SIZE_LIMITS.step

  return {
    commandId: 'update-text-font-size',
    delta: direction === 'increase' ? step : -step,
    direction,
    fieldId: 'fontSize',
    intent: SLIDE_EDIT_TEXT_FONT_SIZE_KEYBOARD_INTENT,
    keyboardModel: SLIDE_EDIT_TEXT_FONT_SIZE_KEYBOARD_MODEL,
    kind: direction === 'increase'
      ? 'increase-text-font-size'
      : 'decrease-text-font-size',
    preventDefault: true,
    shortcut: direction === 'increase'
      ? SLIDE_EDIT_TEXT_FONT_SIZE_INCREASE_KEYBOARD_SHORTCUT
      : SLIDE_EDIT_TEXT_FONT_SIZE_DECREASE_KEYBOARD_SHORTCUT,
    step,
  }
}

function normalizeSlideEditTextFontSizeJSONValue(
  value: unknown,
): SlideEditTextFontSizeValue | null {
  const numericValue = getSlideEditTextFontSizeNumber(value)

  if (numericValue === null) {
    return null
  }

  const factor = 10 ** SLIDE_EDIT_TEXT_FONT_SIZE_LIMITS.precision
  const rounded = Math.round(numericValue * factor) / factor

  return Math.min(
    SLIDE_EDIT_TEXT_FONT_SIZE_LIMITS.max,
    Math.max(SLIDE_EDIT_TEXT_FONT_SIZE_LIMITS.min, rounded),
  )
}

function getSlideEditTextFontSizeNumber(value: unknown) {
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

function getSlideEditTextFontSizeExplicitJSONValue(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  const record = value as Record<string, unknown>

  for (const key of SLIDE_EDIT_TEXT_FONT_SIZE_FIELD.jsonKeys) {
    if (Object.hasOwn(record, key)) {
      return normalizeSlideEditTextFontSizeJSONValue(record[key])
    }
  }

  return null
}

function parseSlideEditTextFontSizeJSON(value: string) {
  if (!value.trim()) {
    return null
  }

  try {
    return JSON.parse(value) as unknown
  } catch {
    return null
  }
}
