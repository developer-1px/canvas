export type SlideEditTextFormattingKeyboardIntentKind =
  | 'toggle-bold'
  | 'toggle-italic'
  | 'toggle-underline'

export type SlideEditTextRunFormattingFieldId =
  | 'bold'
  | 'italic'
  | 'underline'

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

export type SlideEditTextRunFormattingDataTransfer = Pick<DataTransfer, 'getData'>

export type SlideEditTextRunFormattingFieldDescriptor = {
  commandId: 'update-text-run-formatting'
  control: 'toggle'
  id: SlideEditTextRunFormattingFieldId
  jsonKeys: readonly string[]
  jsonMimeType: string
  requiredAdapterSlot: 'command-effect'
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
> = {
  fieldId: SlideEditTextRunFormattingFieldId
  id: 'update-text-run-formatting'
  objectIds: readonly TObjectId[]
  slideId: TSlideId
  value: boolean
}

export type SlideEditTextRunFormattingHostCommandEffect<
  TSlideId extends string = string,
  TObjectId extends string = string,
> = {
  payload: SlideEditTextRunFormattingUpdateCommand<TSlideId, TObjectId>
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

const SLIDE_EDIT_TEXT_RUN_FORMATTING_MIME_PREFIX =
  'application/vnd.interactive-os.slide-edit.text-run'

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
>(
  command: SlideEditTextRunFormattingUpdateCommand<TSlideId, TObjectId>,
): SlideEditTextRunFormattingHostCommandEffect<TSlideId, TObjectId> {
  return {
    payload: command,
    selection: {
      objectIds: command.objectIds,
      slideId: command.slideId,
    },
    type: 'slide-command-effect',
  }
}

export function getSlideEditTextRunFormattingJSONPasteValue({
  dataTransfer,
  fieldId,
  jsonMimeType = getSlideEditTextRunFormattingField(fieldId)?.jsonMimeType,
}: SlideEditTextRunFormattingJSONPasteInput): boolean | null {
  if (!dataTransfer) {
    return null
  }

  if (jsonMimeType) {
    const customValue = parseSlideEditTextRunFormattingJSON(
      dataTransfer.getData(jsonMimeType),
    )
    const normalizedCustomValue =
      normalizeSlideEditTextRunFormattingValue(customValue)

    if (normalizedCustomValue !== null) {
      return normalizedCustomValue
    }
  }

  for (const type of ['application/json', 'text/plain']) {
    const value = parseSlideEditTextRunFormattingJSON(dataTransfer.getData(type))
    const explicitValue =
      getSlideEditTextRunFormattingExplicitJSONValue(fieldId, value)

    if (explicitValue !== null) {
      return explicitValue
    }
  }

  return null
}

export function normalizeSlideEditTextRunFormattingValue(
  value: unknown,
): boolean | null {
  return typeof value === 'boolean' ? value : null
}

function getSlideEditTextRunFormattingField(
  fieldId: SlideEditTextRunFormattingFieldId,
) {
  return SLIDE_EDIT_TEXT_RUN_FORMATTING_FIELDS.find(
    (field) => field.id === fieldId,
  )
}

function getSlideEditTextRunFormattingExplicitJSONValue(
  fieldId: SlideEditTextRunFormattingFieldId,
  value: unknown,
) {
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
      return normalizeSlideEditTextRunFormattingValue(record[key])
    }
  }

  return null
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
