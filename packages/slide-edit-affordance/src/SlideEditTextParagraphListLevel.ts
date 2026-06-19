import { SLIDE_EDIT_TEXT_JSON_PASTE_TYPES } from './SlideEditTextJSONPaste'

export type SlideEditTextParagraphListLevelSlideId = string
export type SlideEditTextParagraphListLevelObjectId = string

export type SlideEditTextParagraphListLevelCommandKind =
  | 'decrease-list-level'
  | 'increase-list-level'
  | 'set-list-level'

export type SlideEditTextParagraphListLevelFieldDescriptor = {
  commandIds: {
    decrease: 'decrease-text-paragraph-list-level'
    increase: 'increase-text-paragraph-list-level'
    set: 'set-text-paragraph-list-level'
  }
  control: 'paragraph-list-level-stepper'
  id: 'paragraphListLevel'
  indentEm: number
  jsonKeys: readonly string[]
  jsonMimeType: string
  max: number
  min: number
  requiredAdapterSlot: 'command-effect'
  step: number
  unit: 'level'
}

export type SlideEditTextParagraphListLevelDescriptor<
  TSlideId extends SlideEditTextParagraphListLevelSlideId =
    SlideEditTextParagraphListLevelSlideId,
  TObjectId extends SlideEditTextParagraphListLevelObjectId =
    SlideEditTextParagraphListLevelObjectId,
> = {
  canDecrease: boolean
  canIncrease: boolean
  field: SlideEditTextParagraphListLevelFieldDescriptor
  indent: {
    cssValue: string
    em: number
  }
  level: number
  objectId: TObjectId
  slideId: TSlideId
  surface: 'text-paragraph-list-level'
}

export type SlideEditTextParagraphListLevelSetCommand<
  TSlideId extends SlideEditTextParagraphListLevelSlideId =
    SlideEditTextParagraphListLevelSlideId,
  TObjectId extends SlideEditTextParagraphListLevelObjectId =
    SlideEditTextParagraphListLevelObjectId,
> = {
  fieldId: 'paragraphListLevel'
  id: 'set-text-paragraph-list-level'
  kind: Extract<SlideEditTextParagraphListLevelCommandKind, 'set-list-level'>
  objectId: TObjectId
  slideId: TSlideId
  value: number
}

export type SlideEditTextParagraphListLevelStepCommand<
  TSlideId extends SlideEditTextParagraphListLevelSlideId =
    SlideEditTextParagraphListLevelSlideId,
  TObjectId extends SlideEditTextParagraphListLevelObjectId =
    SlideEditTextParagraphListLevelObjectId,
> = {
  delta: -1 | 1
  fieldId: 'paragraphListLevel'
  id:
    | 'decrease-text-paragraph-list-level'
    | 'increase-text-paragraph-list-level'
  kind: Exclude<
    SlideEditTextParagraphListLevelCommandKind,
    'set-list-level'
  >
  objectId: TObjectId
  slideId: TSlideId
}

export type SlideEditTextParagraphListLevelCommand<
  TSlideId extends SlideEditTextParagraphListLevelSlideId =
    SlideEditTextParagraphListLevelSlideId,
  TObjectId extends SlideEditTextParagraphListLevelObjectId =
    SlideEditTextParagraphListLevelObjectId,
> =
  | SlideEditTextParagraphListLevelSetCommand<TSlideId, TObjectId>
  | SlideEditTextParagraphListLevelStepCommand<TSlideId, TObjectId>

export type SlideEditTextParagraphListLevelHostCommandEffect<
  TSlideId extends SlideEditTextParagraphListLevelSlideId =
    SlideEditTextParagraphListLevelSlideId,
  TObjectId extends SlideEditTextParagraphListLevelObjectId =
    SlideEditTextParagraphListLevelObjectId,
> = {
  payload: SlideEditTextParagraphListLevelCommand<TSlideId, TObjectId>
  selection: {
    objectIds: readonly TObjectId[]
    slideId: TSlideId
  }
  type: 'slide-command-effect'
}

export type SlideEditTextParagraphListLevelKeyboardIntentKind =
  | 'decrease-list-level'
  | 'increase-list-level'

export type SlideEditTextParagraphListLevelKeyboardIntent = {
  commandId:
    | 'decrease-text-paragraph-list-level'
    | 'increase-text-paragraph-list-level'
  delta: -1 | 1
  intent: typeof SLIDE_EDIT_TEXT_PARAGRAPH_LIST_LEVEL_KEYBOARD_INTENT
  kind: SlideEditTextParagraphListLevelKeyboardIntentKind
  preventDefault: true
  shortcut:
    | typeof SLIDE_EDIT_TEXT_PARAGRAPH_LIST_LEVEL_DECREASE_KEYBOARD_SHORTCUT
    | typeof SLIDE_EDIT_TEXT_PARAGRAPH_LIST_LEVEL_INCREASE_KEYBOARD_SHORTCUT
}

export type SlideEditTextParagraphListLevelKeyboardIntentInput = {
  altKey?: boolean
  code?: string
  key: string
  mod?: boolean
  shiftKey?: boolean
}

export type SlideEditTextParagraphListLevelDataTransfer = Pick<
  DataTransfer,
  'getData'
>

export type SlideEditTextParagraphListLevelJSONPasteInput = {
  dataTransfer: SlideEditTextParagraphListLevelDataTransfer | null
  jsonMimeType?: string
}

export type SlideEditTextParagraphListLevelJSONPasteValueMode =
  | 'direct'
  | 'wrapped'

export type SlideEditTextParagraphListLevelJSONPasteValueOptions = {
  mode?: SlideEditTextParagraphListLevelJSONPasteValueMode
}

export type SlideEditTextParagraphListLevelLimits = {
  indentEm: number
  max: number
  min: number
  step: number
}

export const SLIDE_EDIT_TEXT_PARAGRAPH_LIST_LEVEL_LIMITS = Object.freeze({
  indentEm: 1.35,
  max: 5,
  min: 0,
  step: 1,
} as const satisfies SlideEditTextParagraphListLevelLimits)

export const SLIDE_EDIT_TEXT_PARAGRAPH_LIST_LEVEL_JSON_MIME_TYPE =
  'application/vnd.interactive-os.slide-edit.text-paragraph-list-level+json'

export const SLIDE_EDIT_TEXT_PARAGRAPH_LIST_LEVEL_JSON_TYPES =
  SLIDE_EDIT_TEXT_JSON_PASTE_TYPES

export const SLIDE_EDIT_TEXT_PARAGRAPH_LIST_LEVEL_JSON_WRAPPER_KEYS =
  Object.freeze([
    'textParagraphListLevel',
    'paragraphListLevel',
    'paragraph',
    'paragraphStyle',
    'textParagraph',
    'list',
  ] as const)

export const SLIDE_EDIT_TEXT_PARAGRAPH_LIST_LEVEL_FIELD = Object.freeze({
  commandIds: {
    decrease: 'decrease-text-paragraph-list-level',
    increase: 'increase-text-paragraph-list-level',
    set: 'set-text-paragraph-list-level',
  },
  control: 'paragraph-list-level-stepper',
  id: 'paragraphListLevel',
  indentEm: SLIDE_EDIT_TEXT_PARAGRAPH_LIST_LEVEL_LIMITS.indentEm,
  jsonKeys: [
    'paragraphLevel',
    'paragraphListLevel',
    'textParagraphListLevel',
    'listLevel',
    'indentLevel',
    'level',
    'value',
  ],
  jsonMimeType: SLIDE_EDIT_TEXT_PARAGRAPH_LIST_LEVEL_JSON_MIME_TYPE,
  max: SLIDE_EDIT_TEXT_PARAGRAPH_LIST_LEVEL_LIMITS.max,
  min: SLIDE_EDIT_TEXT_PARAGRAPH_LIST_LEVEL_LIMITS.min,
  requiredAdapterSlot: 'command-effect',
  step: SLIDE_EDIT_TEXT_PARAGRAPH_LIST_LEVEL_LIMITS.step,
  unit: 'level',
} as const satisfies SlideEditTextParagraphListLevelFieldDescriptor)

export const SLIDE_EDIT_TEXT_PARAGRAPH_LIST_LEVEL_INCREASE_KEYBOARD_SHORTCUT =
  'Tab'

export const SLIDE_EDIT_TEXT_PARAGRAPH_LIST_LEVEL_DECREASE_KEYBOARD_SHORTCUT =
  'Shift+Tab'

export const SLIDE_EDIT_TEXT_PARAGRAPH_LIST_LEVEL_KEYBOARD_KEYS =
  `${SLIDE_EDIT_TEXT_PARAGRAPH_LIST_LEVEL_INCREASE_KEYBOARD_SHORTCUT} ${SLIDE_EDIT_TEXT_PARAGRAPH_LIST_LEVEL_DECREASE_KEYBOARD_SHORTCUT}`

export const SLIDE_EDIT_TEXT_PARAGRAPH_LIST_LEVEL_KEYBOARD_MODEL =
  'slide-edit-text-paragraph-list-level-keyboard-shortcuts'

export const SLIDE_EDIT_TEXT_PARAGRAPH_LIST_LEVEL_KEYBOARD_INTENT =
  'slide-edit-text-paragraph-list-level-keyboard-intent'

export const SLIDE_EDIT_TEXT_PARAGRAPH_LIST_LEVEL_KEYBOARD_ROUTING_PRIORITY =
  'text-edit-before-focus-navigation'

export function createSlideEditTextParagraphListLevelDescriptor<
  TSlideId extends SlideEditTextParagraphListLevelSlideId,
  TObjectId extends SlideEditTextParagraphListLevelObjectId,
>({
  field = SLIDE_EDIT_TEXT_PARAGRAPH_LIST_LEVEL_FIELD,
  level = SLIDE_EDIT_TEXT_PARAGRAPH_LIST_LEVEL_LIMITS.min,
  objectId,
  slideId,
}: {
  field?: SlideEditTextParagraphListLevelFieldDescriptor
  level?: unknown
  objectId: TObjectId
  slideId: TSlideId
}): SlideEditTextParagraphListLevelDescriptor<TSlideId, TObjectId> {
  const normalizedLevel = normalizeSlideEditTextParagraphListLevel(level)

  return {
    canDecrease: normalizedLevel > field.min,
    canIncrease: normalizedLevel < field.max,
    field,
    indent: {
      cssValue: getSlideEditTextParagraphListLevelIndentCSSValue(
        normalizedLevel,
        field.indentEm,
      ),
      em: getSlideEditTextParagraphListLevelIndentEm(
        normalizedLevel,
        field.indentEm,
      ),
    },
    level: normalizedLevel,
    objectId,
    slideId,
    surface: 'text-paragraph-list-level',
  }
}

export function getSlideEditTextParagraphListLevelCommandEffect<
  TSlideId extends SlideEditTextParagraphListLevelSlideId,
  TObjectId extends SlideEditTextParagraphListLevelObjectId,
>(
  command: SlideEditTextParagraphListLevelCommand<TSlideId, TObjectId>,
): SlideEditTextParagraphListLevelHostCommandEffect<TSlideId, TObjectId> {
  return {
    payload: normalizeSlideEditTextParagraphListLevelCommand(command),
    selection: {
      objectIds: [command.objectId],
      slideId: command.slideId,
    },
    type: 'slide-command-effect',
  }
}

export function normalizeSlideEditTextParagraphListLevelCommand<
  TSlideId extends SlideEditTextParagraphListLevelSlideId,
  TObjectId extends SlideEditTextParagraphListLevelObjectId,
>(
  command: SlideEditTextParagraphListLevelCommand<TSlideId, TObjectId>,
): SlideEditTextParagraphListLevelCommand<TSlideId, TObjectId> {
  switch (command.kind) {
    case 'set-list-level':
      return {
        ...command,
        fieldId: 'paragraphListLevel',
        id: 'set-text-paragraph-list-level',
        value: normalizeSlideEditTextParagraphListLevel(command.value),
      }
    case 'decrease-list-level':
      return {
        ...command,
        delta: -1,
        fieldId: 'paragraphListLevel',
        id: 'decrease-text-paragraph-list-level',
      }
    case 'increase-list-level':
      return {
        ...command,
        delta: 1,
        fieldId: 'paragraphListLevel',
        id: 'increase-text-paragraph-list-level',
      }
  }
}

export function getSlideEditTextParagraphListLevelKeyboardIntent({
  altKey = false,
  code,
  key,
  mod = false,
  shiftKey = false,
}: SlideEditTextParagraphListLevelKeyboardIntentInput):
  SlideEditTextParagraphListLevelKeyboardIntent | null {
  if (altKey || mod || (key !== 'Tab' && code !== 'Tab')) {
    return null
  }

  if (shiftKey) {
    return {
      commandId: 'decrease-text-paragraph-list-level',
      delta: -1,
      intent: SLIDE_EDIT_TEXT_PARAGRAPH_LIST_LEVEL_KEYBOARD_INTENT,
      kind: 'decrease-list-level',
      preventDefault: true,
      shortcut: SLIDE_EDIT_TEXT_PARAGRAPH_LIST_LEVEL_DECREASE_KEYBOARD_SHORTCUT,
    }
  }

  return {
    commandId: 'increase-text-paragraph-list-level',
    delta: 1,
    intent: SLIDE_EDIT_TEXT_PARAGRAPH_LIST_LEVEL_KEYBOARD_INTENT,
    kind: 'increase-list-level',
    preventDefault: true,
    shortcut: SLIDE_EDIT_TEXT_PARAGRAPH_LIST_LEVEL_INCREASE_KEYBOARD_SHORTCUT,
  }
}

export function getSlideEditTextParagraphListLevelJSONPasteValue({
  dataTransfer,
  jsonMimeType = SLIDE_EDIT_TEXT_PARAGRAPH_LIST_LEVEL_JSON_MIME_TYPE,
}: SlideEditTextParagraphListLevelJSONPasteInput): number | null {
  if (!dataTransfer) {
    return null
  }

  if (jsonMimeType) {
    const customLevel =
      getSlideEditTextParagraphListLevelJSONPasteValueFromText(
        dataTransfer.getData(jsonMimeType),
        { mode: 'direct' },
      )

    if (customLevel !== null) {
      return customLevel
    }
  }

  for (const type of SLIDE_EDIT_TEXT_PARAGRAPH_LIST_LEVEL_JSON_TYPES) {
    const level = getSlideEditTextParagraphListLevelJSONPasteValueFromText(
      dataTransfer.getData(type),
      { mode: 'wrapped' },
    )

    if (level !== null) {
      return level
    }
  }

  return null
}

export function getSlideEditTextParagraphListLevelJSONPasteValueFromText(
  text: string,
  options?: SlideEditTextParagraphListLevelJSONPasteValueOptions,
): number | null {
  return getSlideEditTextParagraphListLevelJSONPasteValueFromValue(
    parseSlideEditTextParagraphListLevelJSON(text),
    options,
  )
}

export function getSlideEditTextParagraphListLevelJSONPasteValueFromValue(
  value: unknown,
  { mode = 'direct' }: SlideEditTextParagraphListLevelJSONPasteValueOptions = {},
): number | null {
  return mode === 'wrapped'
    ? getSlideEditTextParagraphListLevelWrappedJSONValue(value)
    : getSlideEditTextParagraphListLevelDirectJSONValue(value)
}

export function normalizeSlideEditTextParagraphListLevel(
  value: unknown,
): number {
  const numericValue = getSlideEditTextParagraphListLevelNumber(value)

  if (numericValue === null) {
    return SLIDE_EDIT_TEXT_PARAGRAPH_LIST_LEVEL_LIMITS.min
  }

  return Math.round(Math.min(
    SLIDE_EDIT_TEXT_PARAGRAPH_LIST_LEVEL_LIMITS.max,
    Math.max(SLIDE_EDIT_TEXT_PARAGRAPH_LIST_LEVEL_LIMITS.min, numericValue),
  ))
}

export function getSlideEditTextParagraphListLevelModelValue(
  value: unknown,
): number | undefined {
  const level = normalizeSlideEditTextParagraphListLevel(value)

  return level === SLIDE_EDIT_TEXT_PARAGRAPH_LIST_LEVEL_LIMITS.min
    ? undefined
    : level
}

export function getSlideEditTextParagraphListLevelIndentEm(
  value: unknown,
  indentEm: number = SLIDE_EDIT_TEXT_PARAGRAPH_LIST_LEVEL_LIMITS.indentEm,
) {
  const level = normalizeSlideEditTextParagraphListLevel(value)

  return Math.round(level * indentEm * 100) / 100
}

export function getSlideEditTextParagraphListLevelIndentCSSValue(
  value: unknown,
  indentEm: number = SLIDE_EDIT_TEXT_PARAGRAPH_LIST_LEVEL_LIMITS.indentEm,
) {
  return `${getSlideEditTextParagraphListLevelIndentEm(value, indentEm)}em`
}

function getSlideEditTextParagraphListLevelWrappedJSONValue(
  value: unknown,
): number | null {
  const directLevel = getSlideEditTextParagraphListLevelDirectJSONValue(value)

  if (directLevel !== null) {
    return directLevel
  }

  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  const record = value as Record<string, unknown>

  for (const key of SLIDE_EDIT_TEXT_PARAGRAPH_LIST_LEVEL_JSON_WRAPPER_KEYS) {
    if (!Object.hasOwn(record, key)) {
      continue
    }

    const level = getSlideEditTextParagraphListLevelDirectJSONValue(
      record[key],
    )

    if (level !== null) {
      return level
    }
  }

  return null
}

function getSlideEditTextParagraphListLevelDirectJSONValue(
  value: unknown,
): number | null {
  const numericValue = getSlideEditTextParagraphListLevelNumber(value)

  if (numericValue !== null) {
    return normalizeSlideEditTextParagraphListLevel(numericValue)
  }

  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  const record = value as Record<string, unknown>

  for (const key of SLIDE_EDIT_TEXT_PARAGRAPH_LIST_LEVEL_FIELD.jsonKeys) {
    if (!Object.hasOwn(record, key)) {
      continue
    }

    const level = getSlideEditTextParagraphListLevelNumber(record[key])

    if (level !== null) {
      return normalizeSlideEditTextParagraphListLevel(level)
    }
  }

  return null
}

function getSlideEditTextParagraphListLevelNumber(value: unknown) {
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

function parseSlideEditTextParagraphListLevelJSON(value: string) {
  if (!value.trim()) {
    return null
  }

  try {
    return JSON.parse(value) as unknown
  } catch {
    return null
  }
}
