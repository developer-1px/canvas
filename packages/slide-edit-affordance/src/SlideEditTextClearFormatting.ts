import {
  parseSlideEditJSONPasteTextValue,
  SLIDE_EDIT_TEXT_JSON_PASTE_TYPES,
} from './SlideEditTextJSONPaste'

export type SlideEditTextClearFormattingDataTransfer = Pick<
  DataTransfer,
  'getData'
>

export type SlideEditTextClearFormattingDescriptor<
  TSlideId extends string = string,
  TObjectId extends string = string,
> = {
  commandId: 'clear-text-formatting'
  control: 'button'
  jsonKeys: readonly string[]
  jsonMimeType: typeof SLIDE_EDIT_TEXT_CLEAR_FORMATTING_JSON_MIME_TYPE
  objectIds: readonly TObjectId[]
  requiredAdapterSlot: 'command-effect'
  slideId: TSlideId
  surface: 'text-clear-formatting'
}

export type SlideEditTextClearFormattingCommand<
  TSlideId extends string = string,
  TObjectId extends string = string,
> = {
  id: 'clear-text-formatting'
  objectIds: readonly TObjectId[]
  slideId: TSlideId
}

export type SlideEditTextClearFormattingHostCommandEffect<
  TSlideId extends string = string,
  TObjectId extends string = string,
> = {
  payload: SlideEditTextClearFormattingCommand<TSlideId, TObjectId>
  selection: {
    objectIds: readonly TObjectId[]
    slideId: TSlideId
  }
  type: 'slide-command-effect'
}

export type SlideEditTextClearFormattingCommandEffectInput<
  TSlideId extends string = string,
  TObjectId extends string = string,
> = {
  objectIds: readonly TObjectId[]
  slideId: TSlideId
}

export type SlideEditTextClearFormattingJSONPasteInput = {
  dataTransfer: SlideEditTextClearFormattingDataTransfer | null
  jsonMimeType?: string
}

export type SlideEditTextClearFormattingJSONPasteValueMode =
  | 'direct'
  | 'wrapped'

export type SlideEditTextClearFormattingJSONPasteValueOptions = {
  mode?: SlideEditTextClearFormattingJSONPasteValueMode
}

export const SLIDE_EDIT_TEXT_CLEAR_FORMATTING_JSON_MIME_TYPE =
  'application/vnd.interactive-os.slide-edit.text-clear-formatting+json'
export const SLIDE_EDIT_TEXT_CLEAR_FORMATTING_JSON_KEYS = Object.freeze([
  'textClearFormatting',
  'clearTextFormatting',
  'clearFormatting',
  'clearFormat',
  'resetFormatting',
  'value',
] as const)

export function createSlideEditTextClearFormattingDescriptor<
  TSlideId extends string,
  TObjectId extends string,
>({
  objectIds,
  slideId,
}: {
  objectIds: readonly TObjectId[]
  slideId: TSlideId
}): SlideEditTextClearFormattingDescriptor<TSlideId, TObjectId> {
  return {
    commandId: 'clear-text-formatting',
    control: 'button',
    jsonKeys: SLIDE_EDIT_TEXT_CLEAR_FORMATTING_JSON_KEYS,
    jsonMimeType: SLIDE_EDIT_TEXT_CLEAR_FORMATTING_JSON_MIME_TYPE,
    objectIds,
    requiredAdapterSlot: 'command-effect',
    slideId,
    surface: 'text-clear-formatting',
  }
}

export function getSlideEditTextClearFormattingCommandEffect<
  TSlideId extends string,
  TObjectId extends string,
>({
  objectIds,
  slideId,
}: SlideEditTextClearFormattingCommandEffectInput<TSlideId, TObjectId>):
  SlideEditTextClearFormattingHostCommandEffect<TSlideId, TObjectId> {
  return {
    payload: {
      id: 'clear-text-formatting',
      objectIds,
      slideId,
    },
    selection: {
      objectIds,
      slideId,
    },
    type: 'slide-command-effect',
  }
}

export function getSlideEditTextClearFormattingJSONPasteValue({
  dataTransfer,
  jsonMimeType = SLIDE_EDIT_TEXT_CLEAR_FORMATTING_JSON_MIME_TYPE,
}: SlideEditTextClearFormattingJSONPasteInput): true | null {
  if (!dataTransfer) {
    return null
  }

  const customValue = getSlideEditTextClearFormattingJSONPasteValueFromText(
    dataTransfer.getData(jsonMimeType),
    { mode: 'direct' },
  )

  if (customValue !== null) {
    return customValue
  }

  for (const type of SLIDE_EDIT_TEXT_JSON_PASTE_TYPES) {
    const explicitValue = getSlideEditTextClearFormattingJSONPasteValueFromText(
      dataTransfer.getData(type),
      { mode: 'wrapped' },
    )

    if (explicitValue !== null) {
      return explicitValue
    }
  }

  return null
}

export function getSlideEditTextClearFormattingJSONPasteValueFromText(
  text: string,
  options?: SlideEditTextClearFormattingJSONPasteValueOptions,
) {
  return getSlideEditTextClearFormattingJSONPasteValueFromValue(
    parseSlideEditTextClearFormattingJSON(text),
    options,
  )
}

export function getSlideEditTextClearFormattingJSONPasteValueFromValue(
  value: unknown,
  { mode = 'direct' }: SlideEditTextClearFormattingJSONPasteValueOptions = {},
): true | null {
  return mode === 'wrapped'
    ? getSlideEditTextClearFormattingExplicitJSONValue(value)
    : normalizeSlideEditTextClearFormattingValue(value)
}

export function normalizeSlideEditTextClearFormattingValue(
  value: unknown,
): true | null {
  return value === true ? true : null
}

function getSlideEditTextClearFormattingExplicitJSONValue(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  const record = value as Record<string, unknown>

  for (const key of SLIDE_EDIT_TEXT_CLEAR_FORMATTING_JSON_KEYS) {
    if (Object.hasOwn(record, key)) {
      return normalizeSlideEditTextClearFormattingValue(record[key])
    }
  }

  return null
}

function parseSlideEditTextClearFormattingJSON(value: string) {
  return parseSlideEditJSONPasteTextValue(value)
}
