import {
  parseSlideEditJSONPasteTextValue,
  SLIDE_EDIT_TEXT_JSON_PASTE_TYPES,
} from './SlideEditTextJSONPaste'

export type SlideEditTextParagraphBulletSlideId = string
export type SlideEditTextParagraphBulletObjectId = string

export type SlideEditTextParagraphBulletValue =
  | 'bullet'
  | 'none'
  | 'numbered'

export type SlideEditTextParagraphBulletOption = {
  id: SlideEditTextParagraphBulletValue
  label: string
}

export type SlideEditTextParagraphBulletFieldDescriptor = {
  commandId: 'update-text-paragraph-bullet'
  control: 'paragraph-bullet-segmented-control'
  id: 'paragraphBullet'
  jsonKeys: readonly string[]
  jsonMimeType: string
  options: readonly SlideEditTextParagraphBulletOption[]
  requiredAdapterSlot: 'command-effect'
}

export type SlideEditTextParagraphBulletDescriptor<
  TSlideId extends SlideEditTextParagraphBulletSlideId =
    SlideEditTextParagraphBulletSlideId,
  TObjectId extends SlideEditTextParagraphBulletObjectId =
    SlideEditTextParagraphBulletObjectId,
> = {
  field: SlideEditTextParagraphBulletFieldDescriptor
  objectId: TObjectId
  slideId: TSlideId
  surface: 'text-paragraph-bullet'
  value: SlideEditTextParagraphBulletValue
}

export type SlideEditTextParagraphBulletUpdateCommand<
  TSlideId extends SlideEditTextParagraphBulletSlideId =
    SlideEditTextParagraphBulletSlideId,
  TObjectId extends SlideEditTextParagraphBulletObjectId =
    SlideEditTextParagraphBulletObjectId,
> = {
  fieldId: 'paragraphBullet'
  id: 'update-text-paragraph-bullet'
  objectId: TObjectId
  slideId: TSlideId
  value: SlideEditTextParagraphBulletValue
}

export type SlideEditTextParagraphBulletHostCommandEffect<
  TSlideId extends SlideEditTextParagraphBulletSlideId =
    SlideEditTextParagraphBulletSlideId,
  TObjectId extends SlideEditTextParagraphBulletObjectId =
    SlideEditTextParagraphBulletObjectId,
> = {
  payload: SlideEditTextParagraphBulletUpdateCommand<TSlideId, TObjectId>
  selection: {
    objectIds: readonly TObjectId[]
    slideId: TSlideId
  }
  type: 'slide-command-effect'
}

export type SlideEditTextParagraphBulletKeyboardIntentKind =
  | 'toggle-bullet'
  | 'toggle-numbered'

export type SlideEditTextParagraphBulletKeyboardIntent =
  | {
    commandId: 'toggle-text-paragraph-bullet'
    intent: typeof SLIDE_EDIT_TEXT_PARAGRAPH_BULLET_KEYBOARD_INTENT
    kind: 'toggle-bullet'
    preventDefault: true
    shortcut: typeof SLIDE_EDIT_TEXT_PARAGRAPH_BULLET_KEYBOARD_SHORTCUT
    value: 'bullet'
  }
  | {
    commandId: 'toggle-text-paragraph-bullet'
    intent: typeof SLIDE_EDIT_TEXT_PARAGRAPH_NUMBERED_KEYBOARD_INTENT
    kind: 'toggle-numbered'
    preventDefault: true
    shortcut: typeof SLIDE_EDIT_TEXT_PARAGRAPH_NUMBERED_KEYBOARD_SHORTCUT
    value: 'numbered'
  }

export type SlideEditTextParagraphBulletKeyboardIntentInput = {
  altKey?: boolean
  code?: string
  key: string
  mod: boolean
  shiftKey?: boolean
}

export type SlideEditTextParagraphBulletDataTransfer = Pick<DataTransfer, 'getData'>

export type SlideEditTextParagraphBulletJSONPasteInput = {
  dataTransfer: SlideEditTextParagraphBulletDataTransfer | null
  jsonMimeType?: string
}

export type SlideEditTextParagraphBulletJSONPasteValueMode =
  | 'direct'
  | 'wrapped'

export type SlideEditTextParagraphBulletJSONPasteValueOptions = {
  mode?: SlideEditTextParagraphBulletJSONPasteValueMode
}

export const SLIDE_EDIT_TEXT_PARAGRAPH_BULLET_DEFAULT = 'none'
export const SLIDE_EDIT_TEXT_PARAGRAPH_BULLET_VALUES = Object.freeze([
  'none',
  'bullet',
  'numbered',
] as const)
export const SLIDE_EDIT_TEXT_PARAGRAPH_BULLET_OPTIONS = Object.freeze([
  {
    id: 'none',
    label: 'None',
  },
  {
    id: 'bullet',
    label: 'Bullet',
  },
  {
    id: 'numbered',
    label: 'Numbered',
  },
] as const satisfies readonly SlideEditTextParagraphBulletOption[])

export const SLIDE_EDIT_TEXT_PARAGRAPH_BULLET_FIELD = Object.freeze({
  commandId: 'update-text-paragraph-bullet',
  control: 'paragraph-bullet-segmented-control',
  id: 'paragraphBullet',
  jsonKeys: [
    'paragraphBullet',
    'textParagraphBullet',
    'bullet',
    'list',
    'value',
  ],
  jsonMimeType:
    'application/vnd.interactive-os.slide-edit.text-paragraph-bullet+json',
  options: SLIDE_EDIT_TEXT_PARAGRAPH_BULLET_OPTIONS,
  requiredAdapterSlot: 'command-effect',
} as const satisfies SlideEditTextParagraphBulletFieldDescriptor)

export const SLIDE_EDIT_TEXT_PARAGRAPH_BULLET_KEYBOARD_SHORTCUT =
  'Cmd/Ctrl+Shift+L'
export const SLIDE_EDIT_TEXT_PARAGRAPH_NUMBERED_KEYBOARD_SHORTCUT =
  'Cmd/Ctrl+Shift+7'
export const SLIDE_EDIT_TEXT_PARAGRAPH_BULLET_KEYBOARD_MODEL =
  'slide-edit-text-paragraph-bullet-keyboard-shortcuts'
export const SLIDE_EDIT_TEXT_PARAGRAPH_BULLET_KEYBOARD_INTENT =
  'slide-edit-text-paragraph-bullet-keyboard-intent'
export const SLIDE_EDIT_TEXT_PARAGRAPH_NUMBERED_KEYBOARD_INTENT =
  'slide-edit-text-paragraph-numbered-keyboard-intent'
export const SLIDE_EDIT_TEXT_PARAGRAPH_BULLET_KEYBOARD_ROUTING_PRIORITY =
  'text-selection-before-host-command'

export function createSlideEditTextParagraphBulletDescriptor<
  TSlideId extends SlideEditTextParagraphBulletSlideId,
  TObjectId extends SlideEditTextParagraphBulletObjectId,
>({
  field = SLIDE_EDIT_TEXT_PARAGRAPH_BULLET_FIELD,
  objectId,
  slideId,
  value = SLIDE_EDIT_TEXT_PARAGRAPH_BULLET_DEFAULT,
}: {
  field?: SlideEditTextParagraphBulletFieldDescriptor
  objectId: TObjectId
  slideId: TSlideId
  value?: unknown
}): SlideEditTextParagraphBulletDescriptor<TSlideId, TObjectId> {
  return {
    field,
    objectId,
    slideId,
    surface: 'text-paragraph-bullet',
    value: normalizeSlideEditTextParagraphBulletValue(value) ??
      SLIDE_EDIT_TEXT_PARAGRAPH_BULLET_DEFAULT,
  }
}

export function getSlideEditTextParagraphBulletCommandEffect<
  TSlideId extends SlideEditTextParagraphBulletSlideId,
  TObjectId extends SlideEditTextParagraphBulletObjectId,
>(
  command: SlideEditTextParagraphBulletUpdateCommand<TSlideId, TObjectId>,
): SlideEditTextParagraphBulletHostCommandEffect<TSlideId, TObjectId> {
  return {
    payload: normalizeSlideEditTextParagraphBulletUpdateCommand(command),
    selection: {
      objectIds: [command.objectId],
      slideId: command.slideId,
    },
    type: 'slide-command-effect',
  }
}

export function getSlideEditTextParagraphBulletKeyboardIntent({
  altKey = false,
  code,
  key,
  mod,
  shiftKey = false,
}: SlideEditTextParagraphBulletKeyboardIntentInput):
  SlideEditTextParagraphBulletKeyboardIntent | null {
  if (!mod || !shiftKey || altKey) {
    return null
  }

  if (key.toLowerCase() === 'l') {
    return {
      commandId: 'toggle-text-paragraph-bullet',
      intent: SLIDE_EDIT_TEXT_PARAGRAPH_BULLET_KEYBOARD_INTENT,
      kind: 'toggle-bullet',
      preventDefault: true,
      shortcut: SLIDE_EDIT_TEXT_PARAGRAPH_BULLET_KEYBOARD_SHORTCUT,
      value: 'bullet',
    }
  }

  if (key === '7' || code === 'Digit7') {
    return {
      commandId: 'toggle-text-paragraph-bullet',
      intent: SLIDE_EDIT_TEXT_PARAGRAPH_NUMBERED_KEYBOARD_INTENT,
      kind: 'toggle-numbered',
      preventDefault: true,
      shortcut: SLIDE_EDIT_TEXT_PARAGRAPH_NUMBERED_KEYBOARD_SHORTCUT,
      value: 'numbered',
    }
  }

  return null
}

export function normalizeSlideEditTextParagraphBulletUpdateCommand<
  TSlideId extends SlideEditTextParagraphBulletSlideId,
  TObjectId extends SlideEditTextParagraphBulletObjectId,
>(
  command: SlideEditTextParagraphBulletUpdateCommand<TSlideId, TObjectId>,
): SlideEditTextParagraphBulletUpdateCommand<TSlideId, TObjectId> {
  return {
    ...command,
    value: normalizeSlideEditTextParagraphBulletValue(command.value) ??
      SLIDE_EDIT_TEXT_PARAGRAPH_BULLET_DEFAULT,
  }
}

export function getSlideEditTextParagraphBulletJSONPasteValue({
  dataTransfer,
  jsonMimeType = SLIDE_EDIT_TEXT_PARAGRAPH_BULLET_FIELD.jsonMimeType,
}: SlideEditTextParagraphBulletJSONPasteInput):
  SlideEditTextParagraphBulletValue | null {
  if (!dataTransfer) {
    return null
  }

  if (jsonMimeType) {
    const normalizedCustomValue =
      getSlideEditTextParagraphBulletJSONPasteValueFromText(
        dataTransfer.getData(jsonMimeType),
        { mode: 'direct' },
      )

    if (normalizedCustomValue !== null) {
      return normalizedCustomValue
    }
  }

  for (const type of SLIDE_EDIT_TEXT_JSON_PASTE_TYPES) {
    const explicitValue = getSlideEditTextParagraphBulletJSONPasteValueFromText(
      dataTransfer.getData(type),
      { mode: 'wrapped' },
    )

    if (explicitValue !== null) {
      return explicitValue
    }
  }

  return null
}

export function getSlideEditTextParagraphBulletJSONPasteValueFromText(
  text: string,
  options?: SlideEditTextParagraphBulletJSONPasteValueOptions,
) {
  return getSlideEditTextParagraphBulletJSONPasteValueFromValue(
    parseSlideEditTextParagraphBulletJSON(text),
    options,
  )
}

export function getSlideEditTextParagraphBulletJSONPasteValueFromValue(
  value: unknown,
  { mode = 'direct' }: SlideEditTextParagraphBulletJSONPasteValueOptions = {},
): SlideEditTextParagraphBulletValue | null {
  return mode === 'wrapped'
    ? getSlideEditTextParagraphBulletExplicitJSONValue(value)
    : normalizeSlideEditTextParagraphBulletValue(value)
}

export function normalizeSlideEditTextParagraphBulletValue(
  value: unknown,
): SlideEditTextParagraphBulletValue | null {
  return isSlideEditTextParagraphBulletValue(value) ? value : null
}

function isSlideEditTextParagraphBulletValue(
  value: unknown,
): value is SlideEditTextParagraphBulletValue {
  return typeof value === 'string' &&
    SLIDE_EDIT_TEXT_PARAGRAPH_BULLET_VALUES.includes(
      value as SlideEditTextParagraphBulletValue,
    )
}

function getSlideEditTextParagraphBulletExplicitJSONValue(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  const record = value as Record<string, unknown>

  for (const key of SLIDE_EDIT_TEXT_PARAGRAPH_BULLET_FIELD.jsonKeys) {
    if (Object.hasOwn(record, key)) {
      return normalizeSlideEditTextParagraphBulletValue(record[key])
    }
  }

  return null
}

function parseSlideEditTextParagraphBulletJSON(value: string) {
  return parseSlideEditJSONPasteTextValue(value)
}
