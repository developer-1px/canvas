import { normalizeSlideEditColorHex } from './SlideEditColorSwatchPalette'
import { SLIDE_EDIT_TEXT_JSON_PASTE_TYPES } from './SlideEditTextJSONPaste'

const SLIDE_EDIT_TEXT_RUN_FORMATTING_MIME_PREFIX =
  'application/vnd.interactive-os.slide-edit.text-run'

export type SlideEditTextFormattingKeyboardIntentKind =
  | 'toggle-bold'
  | 'toggle-italic'
  | 'toggle-underline'

export type SlideEditTextRunFormattingFieldId =
  | 'bold'
  | 'color'
  | 'highlight'
  | 'italic'
  | 'size'
  | 'strikethrough'
  | 'underline'

export type SlideEditTextRunFormattingBooleanFieldId =
  | 'bold'
  | 'italic'
  | 'strikethrough'
  | 'underline'

export type SlideEditTextRunSizeValue = number
export type SlideEditTextRunColorValue = string

export type SlideEditTextRunFormattingValue<
  TFieldId extends SlideEditTextRunFormattingFieldId =
    SlideEditTextRunFormattingFieldId,
> = TFieldId extends 'size' ? SlideEditTextRunSizeValue
  : TFieldId extends 'color' | 'highlight' ? SlideEditTextRunColorValue
  : boolean

export type SlideEditTextRunSizeLimits = {
  defaultValue: number
  max: number
  min: number
  precision: number
  step: number
  unit: 'px'
}

export type SlideEditTextFormattingKeyboardShortcut =
  | 'Cmd/Ctrl+B'
  | 'Cmd/Ctrl+I'
  | 'Cmd/Ctrl+U'

export type SlideEditTextFormattingKeyboardIntent = {
  commandId: SlideEditTextFormattingKeyboardIntentKind
  kind: SlideEditTextFormattingKeyboardIntentKind
  preventDefault: true
  shortcut: SlideEditTextFormattingKeyboardShortcut
}

export type SlideEditTextFormattingKeyboardIntentInput = {
  altKey?: boolean
  key: string
  mod: boolean
  shiftKey?: boolean
}

export type SlideEditTextRunFormattingDataTransfer = Pick<
  DataTransfer,
  'getData'
>

export type SlideEditTextRunFormattingFieldDescriptor = {
  commandId: 'update-text-run-formatting'
  control: 'color-swatch' | 'font-size-stepper' | 'toggle'
  id: SlideEditTextRunFormattingFieldId
  jsonKeys: readonly string[]
  jsonMimeType: string
  max?: number
  min?: number
  requiredAdapterSlot: 'command-effect'
  step?: number
  unit?: 'px'
}

export type SlideEditTextRunFormattingDescriptor<
  TSlideId extends string = string,
  TObjectId extends string = string,
> = {
  fields: readonly SlideEditTextRunFormattingFieldDescriptor[]
  objectIds: readonly TObjectId[]
  slideId: TSlideId
  surface: 'text-run-formatting'
}

export type SlideEditTextRunFormattingUpdateCommand<
  TSlideId extends string = string,
  TObjectId extends string = string,
  TFieldId extends SlideEditTextRunFormattingFieldId =
    SlideEditTextRunFormattingFieldId,
> = {
  fieldId: TFieldId
  id: 'update-text-run-formatting'
  objectIds: readonly TObjectId[]
  slideId: TSlideId
  value: SlideEditTextRunFormattingValue<TFieldId>
}

export type SlideEditTextRunFormattingHostCommandEffect<
  TSlideId extends string = string,
  TObjectId extends string = string,
  TFieldId extends SlideEditTextRunFormattingFieldId =
    SlideEditTextRunFormattingFieldId,
> = {
  payload: SlideEditTextRunFormattingUpdateCommand<
    TSlideId,
    TObjectId,
    TFieldId
  >
  selection: {
    objectIds: readonly TObjectId[]
    slideId: TSlideId
  }
  type: 'slide-command-effect'
}

export type SlideEditTextRunFormattingJSONPasteInput = {
  dataTransfer: SlideEditTextRunFormattingDataTransfer | null
  fieldId: SlideEditTextRunFormattingFieldId
  jsonMimeType?: string
}

export type SlideEditTextRunFormattingJSONPasteValueMode =
  | 'direct'
  | 'wrapped'

export type SlideEditTextRunFormattingJSONPasteValueOptions<
  TFieldId extends SlideEditTextRunFormattingFieldId =
    SlideEditTextRunFormattingFieldId,
> = {
  fieldId: TFieldId
  mode?: SlideEditTextRunFormattingJSONPasteValueMode
}

export type SlideEditTextRunSizeJSONPasteInput = {
  dataTransfer: SlideEditTextRunFormattingDataTransfer | null
  jsonMimeType?: string
}

export type SlideEditTextRunColorJSONPasteInput =
  SlideEditTextRunSizeJSONPasteInput
export type SlideEditTextRunHighlightJSONPasteInput =
  SlideEditTextRunSizeJSONPasteInput

export type SlideEditTextRunSizeJSONPasteValueOptions = {
  mode?: SlideEditTextRunFormattingJSONPasteValueMode
}

export type SlideEditTextRunColorJSONPasteValueOptions =
  SlideEditTextRunSizeJSONPasteValueOptions
export type SlideEditTextRunHighlightJSONPasteValueOptions =
  SlideEditTextRunSizeJSONPasteValueOptions

export type SlideEditTextRunStyleCommandEffectInput<
  TSlideId extends string = string,
  TObjectId extends string = string,
> = {
  objectIds: readonly TObjectId[]
  slideId: TSlideId
}

export type SlideEditTextRunSizeCommandEffectInput<
  TSlideId extends string = string,
  TObjectId extends string = string,
> = SlideEditTextRunStyleCommandEffectInput<TSlideId, TObjectId> & {
  value: unknown
}

export type SlideEditTextRunColorCommandEffectInput<
  TSlideId extends string = string,
  TObjectId extends string = string,
> = SlideEditTextRunStyleCommandEffectInput<TSlideId, TObjectId> & {
  value: string
}

export const SLIDE_EDIT_TEXT_RUN_SIZE_DEFAULT = 16

export const SLIDE_EDIT_TEXT_RUN_SIZE_LIMITS = Object.freeze({
  defaultValue: SLIDE_EDIT_TEXT_RUN_SIZE_DEFAULT,
  max: 400,
  min: 1,
  precision: 2,
  step: 0.5,
  unit: 'px',
} as const satisfies SlideEditTextRunSizeLimits)

export const SLIDE_EDIT_TEXT_RUN_FORMATTING_FIELDS = Object.freeze([
  {
    commandId: 'update-text-run-formatting',
    control: 'toggle',
    id: 'bold',
    jsonKeys: ['textRunBold', 'runBold', 'bold', 'value'],
    jsonMimeType: `${SLIDE_EDIT_TEXT_RUN_FORMATTING_MIME_PREFIX}-bold+json`,
    requiredAdapterSlot: 'command-effect',
  },
  {
    commandId: 'update-text-run-formatting',
    control: 'toggle',
    id: 'italic',
    jsonKeys: ['textRunItalic', 'runItalic', 'italic', 'value'],
    jsonMimeType: `${SLIDE_EDIT_TEXT_RUN_FORMATTING_MIME_PREFIX}-italic+json`,
    requiredAdapterSlot: 'command-effect',
  },
  {
    commandId: 'update-text-run-formatting',
    control: 'toggle',
    id: 'underline',
    jsonKeys: ['textRunUnderline', 'runUnderline', 'underline', 'value'],
    jsonMimeType:
      `${SLIDE_EDIT_TEXT_RUN_FORMATTING_MIME_PREFIX}-underline+json`,
    requiredAdapterSlot: 'command-effect',
  },
  {
    commandId: 'update-text-run-formatting',
    control: 'font-size-stepper',
    id: 'size',
    jsonKeys: ['textRunSize', 'runSize', 'size', 'fontSize', 'value'],
    jsonMimeType: `${SLIDE_EDIT_TEXT_RUN_FORMATTING_MIME_PREFIX}-size+json`,
    max: SLIDE_EDIT_TEXT_RUN_SIZE_LIMITS.max,
    min: SLIDE_EDIT_TEXT_RUN_SIZE_LIMITS.min,
    requiredAdapterSlot: 'command-effect',
    step: SLIDE_EDIT_TEXT_RUN_SIZE_LIMITS.step,
    unit: 'px',
  },
  {
    commandId: 'update-text-run-formatting',
    control: 'color-swatch',
    id: 'color',
    jsonKeys: ['textRunColor', 'runColor', 'color', 'value'],
    jsonMimeType: `${SLIDE_EDIT_TEXT_RUN_FORMATTING_MIME_PREFIX}-color+json`,
    requiredAdapterSlot: 'command-effect',
  },
  {
    commandId: 'update-text-run-formatting',
    control: 'color-swatch',
    id: 'highlight',
    jsonKeys: [
      'textRunHighlight',
      'textRunHighlightColor',
      'runHighlight',
      'runHighlightColor',
      'highlight',
      'highlightColor',
      'backgroundColor',
      'value',
    ],
    jsonMimeType:
      `${SLIDE_EDIT_TEXT_RUN_FORMATTING_MIME_PREFIX}-highlight+json`,
    requiredAdapterSlot: 'command-effect',
  },
  {
    commandId: 'update-text-run-formatting',
    control: 'toggle',
    id: 'strikethrough',
    jsonKeys: [
      'textRunStrikethrough',
      'textRunStrikeThrough',
      'runStrikethrough',
      'runStrikeThrough',
      'strikethrough',
      'strikeThrough',
      'strike',
      'value',
    ],
    jsonMimeType:
      `${SLIDE_EDIT_TEXT_RUN_FORMATTING_MIME_PREFIX}-strikethrough+json`,
    requiredAdapterSlot: 'command-effect',
  },
] as const satisfies readonly SlideEditTextRunFormattingFieldDescriptor[])

export function getSlideEditTextFormattingKeyboardIntent({
  altKey = false,
  key,
  mod,
  shiftKey = false,
}: SlideEditTextFormattingKeyboardIntentInput):
  SlideEditTextFormattingKeyboardIntent | null {
  if (!mod || altKey || shiftKey) {
    return null
  }

  const normalizedKey = key.toLowerCase()

  if (normalizedKey === 'b') {
    return {
      commandId: 'toggle-bold',
      kind: 'toggle-bold',
      preventDefault: true,
      shortcut: 'Cmd/Ctrl+B',
    }
  }

  if (normalizedKey === 'i') {
    return {
      commandId: 'toggle-italic',
      kind: 'toggle-italic',
      preventDefault: true,
      shortcut: 'Cmd/Ctrl+I',
    }
  }

  if (normalizedKey === 'u') {
    return {
      commandId: 'toggle-underline',
      kind: 'toggle-underline',
      preventDefault: true,
      shortcut: 'Cmd/Ctrl+U',
    }
  }

  return null
}

export function createSlideEditTextRunFormattingDescriptor<
  TSlideId extends string,
  TObjectId extends string,
>({
  fields = SLIDE_EDIT_TEXT_RUN_FORMATTING_FIELDS,
  objectIds,
  slideId,
}: {
  fields?: readonly SlideEditTextRunFormattingFieldDescriptor[]
  objectIds: readonly TObjectId[]
  slideId: TSlideId
}): SlideEditTextRunFormattingDescriptor<TSlideId, TObjectId> {
  return {
    fields,
    objectIds,
    slideId,
    surface: 'text-run-formatting',
  }
}

export function getSlideEditTextRunFormattingCommandEffect<
  TSlideId extends string,
  TObjectId extends string,
  TFieldId extends SlideEditTextRunFormattingFieldId,
>(
  command: SlideEditTextRunFormattingUpdateCommand<
    TSlideId,
    TObjectId,
    TFieldId
  >,
): SlideEditTextRunFormattingHostCommandEffect<
  TSlideId,
  TObjectId,
  TFieldId
> {
  const normalizedCommand =
    normalizeSlideEditTextRunFormattingUpdateCommand(command)

  return {
    payload: normalizedCommand,
    selection: {
      objectIds: command.objectIds,
      slideId: command.slideId,
    },
    type: 'slide-command-effect',
  }
}

export function getSlideEditTextRunSizeCommandEffect<
  TSlideId extends string,
  TObjectId extends string,
>({
  objectIds,
  slideId,
  value,
}: SlideEditTextRunSizeCommandEffectInput<TSlideId, TObjectId>):
  SlideEditTextRunFormattingHostCommandEffect<TSlideId, TObjectId, 'size'> {
  return getSlideEditTextRunFormattingCommandEffect({
    fieldId: 'size',
    id: 'update-text-run-formatting',
    objectIds,
    slideId,
    value: normalizeSlideEditTextRunSize(value),
  })
}

export function getSlideEditTextRunColorCommandEffect<
  TSlideId extends string,
  TObjectId extends string,
>({
  objectIds,
  slideId,
  value,
}: SlideEditTextRunColorCommandEffectInput<TSlideId, TObjectId>):
  SlideEditTextRunFormattingHostCommandEffect<TSlideId, TObjectId, 'color'> {
  return getSlideEditTextRunFormattingCommandEffect({
    fieldId: 'color',
    id: 'update-text-run-formatting',
    objectIds,
    slideId,
    value: normalizeSlideEditTextRunColorValue(value) ?? value,
  })
}

export function normalizeSlideEditTextRunFormattingUpdateCommand<
  TSlideId extends string,
  TObjectId extends string,
  TFieldId extends SlideEditTextRunFormattingFieldId,
>(
  command: SlideEditTextRunFormattingUpdateCommand<
    TSlideId,
    TObjectId,
    TFieldId
  >,
): SlideEditTextRunFormattingUpdateCommand<TSlideId, TObjectId, TFieldId> {
  const normalizedValue = normalizeSlideEditTextRunFormattingFieldValue(
    command.fieldId,
    command.value,
  )

  return {
    ...command,
    value: (normalizedValue ?? command.value) as SlideEditTextRunFormattingValue<
      TFieldId
    >,
  }
}

export function getSlideEditTextRunFormattingJSONPasteValue<
  TFieldId extends SlideEditTextRunFormattingFieldId,
>({
  dataTransfer,
  fieldId,
  jsonMimeType = getSlideEditTextRunFormattingField(fieldId)?.jsonMimeType,
}: SlideEditTextRunFormattingJSONPasteInput & { fieldId: TFieldId }):
  SlideEditTextRunFormattingValue<TFieldId> | null {
  if (!dataTransfer) {
    return null
  }

  if (jsonMimeType) {
    const normalizedCustomValue =
      getSlideEditTextRunFormattingJSONPasteValueFromText(
        dataTransfer.getData(jsonMimeType),
        {
          fieldId,
          mode: 'direct',
        },
      )

    if (normalizedCustomValue !== null) {
      return normalizedCustomValue
    }
  }

  for (const type of SLIDE_EDIT_TEXT_JSON_PASTE_TYPES) {
    const explicitValue = getSlideEditTextRunFormattingJSONPasteValueFromText(
      dataTransfer.getData(type),
      {
        fieldId,
        mode: 'wrapped',
      },
    )

    if (explicitValue !== null) {
      return explicitValue
    }
  }

  return null
}

export function getSlideEditTextRunFormattingJSONPasteValueFromText<
  TFieldId extends SlideEditTextRunFormattingFieldId,
>(
  text: string,
  options: SlideEditTextRunFormattingJSONPasteValueOptions<TFieldId>,
) {
  return getSlideEditTextRunFormattingJSONPasteValueFromValue(
    parseSlideEditTextRunFormattingJSON(text),
    options,
  )
}

export function getSlideEditTextRunFormattingJSONPasteValueFromValue<
  TFieldId extends SlideEditTextRunFormattingFieldId,
>(
  value: unknown,
  {
    fieldId,
    mode = 'direct',
  }: SlideEditTextRunFormattingJSONPasteValueOptions<TFieldId>,
): SlideEditTextRunFormattingValue<TFieldId> | null {
  return mode === 'wrapped'
    ? getSlideEditTextRunFormattingExplicitJSONValue(fieldId, value)
    : normalizeSlideEditTextRunFormattingFieldValue(fieldId, value)
}

export function getSlideEditTextRunSizeJSONPasteValue(
  input: SlideEditTextRunSizeJSONPasteInput,
) {
  return getSlideEditTextRunFormattingJSONPasteValue({
    ...input,
    fieldId: 'size',
  })
}

export function getSlideEditTextRunSizeJSONPasteValueFromText(
  text: string,
  options?: SlideEditTextRunSizeJSONPasteValueOptions,
) {
  return getSlideEditTextRunFormattingJSONPasteValueFromText(text, {
    ...options,
    fieldId: 'size',
  })
}

export function getSlideEditTextRunSizeJSONPasteValueFromValue(
  value: unknown,
  options?: SlideEditTextRunSizeJSONPasteValueOptions,
) {
  return getSlideEditTextRunFormattingJSONPasteValueFromValue(value, {
    ...options,
    fieldId: 'size',
  })
}

export function getSlideEditTextRunColorJSONPasteValue(
  input: SlideEditTextRunColorJSONPasteInput,
) {
  return getSlideEditTextRunFormattingJSONPasteValue({
    ...input,
    fieldId: 'color',
  })
}

export function getSlideEditTextRunColorJSONPasteValueFromText(
  text: string,
  options?: SlideEditTextRunColorJSONPasteValueOptions,
) {
  return getSlideEditTextRunFormattingJSONPasteValueFromText(text, {
    ...options,
    fieldId: 'color',
  })
}

export function getSlideEditTextRunColorJSONPasteValueFromValue(
  value: unknown,
  options?: SlideEditTextRunColorJSONPasteValueOptions,
) {
  return getSlideEditTextRunFormattingJSONPasteValueFromValue(value, {
    ...options,
    fieldId: 'color',
  })
}

export function getSlideEditTextRunHighlightJSONPasteValue(
  input: SlideEditTextRunHighlightJSONPasteInput,
) {
  return getSlideEditTextRunFormattingJSONPasteValue({
    ...input,
    fieldId: 'highlight',
  })
}

export function getSlideEditTextRunHighlightJSONPasteValueFromText(
  text: string,
  options?: SlideEditTextRunHighlightJSONPasteValueOptions,
) {
  return getSlideEditTextRunFormattingJSONPasteValueFromText(text, {
    ...options,
    fieldId: 'highlight',
  })
}

export function getSlideEditTextRunHighlightJSONPasteValueFromValue(
  value: unknown,
  options?: SlideEditTextRunHighlightJSONPasteValueOptions,
) {
  return getSlideEditTextRunFormattingJSONPasteValueFromValue(value, {
    ...options,
    fieldId: 'highlight',
  })
}

export function normalizeSlideEditTextRunFormattingValue(value: unknown) {
  return typeof value === 'boolean' ? value : null
}

export function normalizeSlideEditTextRunSizeValue(
  value: unknown,
): SlideEditTextRunSizeValue | null {
  const numericValue = getSlideEditTextRunSizeNumber(value)

  if (numericValue === null) {
    return null
  }

  const factor = 10 ** SLIDE_EDIT_TEXT_RUN_SIZE_LIMITS.precision
  const rounded = Math.round(numericValue * factor) / factor

  return Math.min(
    SLIDE_EDIT_TEXT_RUN_SIZE_LIMITS.max,
    Math.max(SLIDE_EDIT_TEXT_RUN_SIZE_LIMITS.min, rounded),
  )
}

export function normalizeSlideEditTextRunSize(
  value: unknown,
): SlideEditTextRunSizeValue {
  return normalizeSlideEditTextRunSizeValue(value) ??
    SLIDE_EDIT_TEXT_RUN_SIZE_DEFAULT
}

export function normalizeSlideEditTextRunColorValue(
  value: unknown,
): SlideEditTextRunColorValue | null {
  if (typeof value !== 'string') {
    return null
  }

  const trimmedValue = value.trim()

  if (!trimmedValue) {
    return null
  }

  return normalizeSlideEditColorHex(trimmedValue) ??
    normalizeSlideEditColorHex(`#${trimmedValue}`) ??
    trimmedValue
}

function getSlideEditTextRunFormattingField(
  fieldId: SlideEditTextRunFormattingFieldId,
) {
  return SLIDE_EDIT_TEXT_RUN_FORMATTING_FIELDS.find((field) =>
    field.id === fieldId
  )
}

function getSlideEditTextRunFormattingExplicitJSONValue<
  TFieldId extends SlideEditTextRunFormattingFieldId,
>(
  fieldId: TFieldId,
  value: unknown,
): SlideEditTextRunFormattingValue<TFieldId> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  const descriptor = getSlideEditTextRunFormattingField(fieldId)

  if (!descriptor) {
    return null
  }

  const record = value as Record<string, unknown>

  for (const key of descriptor.jsonKeys) {
    if (Object.hasOwn(record, key)) {
      return normalizeSlideEditTextRunFormattingFieldValue(
        fieldId,
        record[key],
      )
    }
  }

  return null
}

function normalizeSlideEditTextRunFormattingFieldValue<
  TFieldId extends SlideEditTextRunFormattingFieldId,
>(
  fieldId: TFieldId,
  value: unknown,
): SlideEditTextRunFormattingValue<TFieldId> | null {
  switch (fieldId) {
    case 'color':
    case 'highlight':
      return normalizeSlideEditTextRunColorValue(value) as
        | SlideEditTextRunFormattingValue<TFieldId>
        | null
    case 'size':
      return normalizeSlideEditTextRunSizeValue(value) as
        | SlideEditTextRunFormattingValue<TFieldId>
        | null
    case 'bold':
    case 'italic':
    case 'strikethrough':
    case 'underline':
      return normalizeSlideEditTextRunFormattingValue(value) as
        | SlideEditTextRunFormattingValue<TFieldId>
        | null
  }
}

function getSlideEditTextRunSizeNumber(value: unknown) {
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

function parseSlideEditTextRunFormattingJSON(value: string) {
  if (!value.trim()) {
    return null
  }

  try {
    return JSON.parse(value) as unknown
  } catch {
    return null
  }
}
