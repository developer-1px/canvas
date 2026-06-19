export type SlideEditObjectAccessibilitySlideId = string
export type SlideEditObjectAccessibilityObjectId = string

export type SlideEditObjectAccessibility = {
  altText: string
  decorative: boolean
}

export type SlideEditObjectAltTextStoragePolicy = {
  maxLength?: number
  rejectControlCharacters?: boolean
}

export type SlideEditObjectAccessibilityFieldId =
  | 'altText'
  | 'decorative'

export type SlideEditObjectAccessibilityFieldDescriptor = {
  commandId: 'update-object-accessibility'
  control: 'checkbox' | 'multiline-text'
  id: SlideEditObjectAccessibilityFieldId
  requiredAdapterSlot: 'command-effect'
}

export type SlideEditObjectAccessibilityMetadata = {
  attribute: typeof SLIDE_EDIT_OBJECT_ACCESSIBILITY_DATA_ATTRIBUTE
  attributeValue: string
  defaultValue: 'none'
  isDecorative: boolean
  isDescribed: boolean
  value: SlideEditObjectAccessibility
}

export type SlideEditObjectAccessibilityDescriptor<
  TSlideId extends SlideEditObjectAccessibilitySlideId =
    SlideEditObjectAccessibilitySlideId,
  TObjectId extends SlideEditObjectAccessibilityObjectId =
    SlideEditObjectAccessibilityObjectId,
> = {
  fields: readonly SlideEditObjectAccessibilityFieldDescriptor[]
  metadata: SlideEditObjectAccessibilityMetadata
  objectId: TObjectId
  slideId: TSlideId
  surface: 'object-accessibility'
  value: SlideEditObjectAccessibility
}

export type SlideEditObjectAccessibilityUpdateCommand<
  TSlideId extends SlideEditObjectAccessibilitySlideId =
    SlideEditObjectAccessibilitySlideId,
  TObjectId extends SlideEditObjectAccessibilityObjectId =
    SlideEditObjectAccessibilityObjectId,
> = {
  fieldId: SlideEditObjectAccessibilityFieldId
  id: 'update-object-accessibility'
  objectId: TObjectId
  slideId: TSlideId
  value: boolean | string
}

export type SlideEditObjectAltTextRemoveCommand<
  TSlideId extends SlideEditObjectAccessibilitySlideId =
    SlideEditObjectAccessibilitySlideId,
  TObjectId extends SlideEditObjectAccessibilityObjectId =
    SlideEditObjectAccessibilityObjectId,
> = {
  id: 'remove-object-alt-text'
  objectId: TObjectId
  slideId: TSlideId
}

export type SlideEditObjectAccessibilityCommand<
  TSlideId extends SlideEditObjectAccessibilitySlideId =
    SlideEditObjectAccessibilitySlideId,
  TObjectId extends SlideEditObjectAccessibilityObjectId =
    SlideEditObjectAccessibilityObjectId,
> =
  | SlideEditObjectAccessibilityUpdateCommand<TSlideId, TObjectId>
  | SlideEditObjectAltTextRemoveCommand<TSlideId, TObjectId>

export type SlideEditObjectAccessibilityHostCommandEffect<
  TSlideId extends SlideEditObjectAccessibilitySlideId =
    SlideEditObjectAccessibilitySlideId,
  TObjectId extends SlideEditObjectAccessibilityObjectId =
    SlideEditObjectAccessibilityObjectId,
> = {
  payload: SlideEditObjectAccessibilityCommand<TSlideId, TObjectId>
  selection: {
    objectIds: readonly TObjectId[]
    slideId: TSlideId
  }
  type: 'slide-command-effect'
}

export type SlideEditObjectAccessibilityDataTransfer = Pick<
  DataTransfer,
  'getData'
>

export type SlideEditObjectAccessibilityJSONPasteValue =
  | {
    altText: string
    kind: 'alt-text'
    value: SlideEditObjectAccessibility
  }
  | {
    kind: 'decorative'
    value: SlideEditObjectAccessibility
  }
  | {
    kind: 'remove-alt-text'
    value: SlideEditObjectAccessibility
  }

export type SlideEditObjectAccessibilityJSONPasteInput = {
  dataTransfer: SlideEditObjectAccessibilityDataTransfer | null
  jsonMimeType?: string
  storagePolicy?: SlideEditObjectAltTextStoragePolicy
}

export type SlideEditObjectAccessibilityJSONPasteValueMode =
  | 'direct'
  | 'wrapped'

export type SlideEditObjectAccessibilityJSONPasteValueOptions = {
  mode?: SlideEditObjectAccessibilityJSONPasteValueMode
  storagePolicy?: SlideEditObjectAltTextStoragePolicy
}

export type SlideEditObjectAccessibilityPasteCommandInput<
  TSlideId extends SlideEditObjectAccessibilitySlideId =
    SlideEditObjectAccessibilitySlideId,
  TObjectId extends SlideEditObjectAccessibilityObjectId =
    SlideEditObjectAccessibilityObjectId,
> = {
  objectId: TObjectId
  pasteValue: SlideEditObjectAccessibilityJSONPasteValue
  slideId: TSlideId
  supportsDecorative?: boolean
}

export const SLIDE_EDIT_OBJECT_ACCESSIBILITY_DATA_ATTRIBUTE =
  'data-slide-object-accessibility'

export const SLIDE_EDIT_OBJECT_ACCESSIBILITY_JSON_MIME_TYPE =
  'application/vnd.interactive-os.slide-edit.object-accessibility+json'

export const SLIDE_EDIT_OBJECT_ACCESSIBILITY_JSON_TYPES = Object.freeze([
  'application/json',
  'text/json',
  'text/plain',
] as const)

export const SLIDE_EDIT_OBJECT_ACCESSIBILITY_JSON_WRAPPER_KEYS = Object.freeze([
  'objectAccessibility',
  'accessibility',
  'objectAltText',
] as const)

const SLIDE_EDIT_OBJECT_ACCESSIBILITY_INVALID_JSON = Symbol(
  'slide-edit-object-accessibility-invalid-json',
)

export const SLIDE_EDIT_OBJECT_ACCESSIBILITY_DEFAULT = Object.freeze({
  altText: '',
  decorative: false,
} as const satisfies SlideEditObjectAccessibility)

export const SLIDE_EDIT_OBJECT_ACCESSIBILITY_FIELDS = Object.freeze([
  {
    commandId: 'update-object-accessibility',
    control: 'multiline-text',
    id: 'altText',
    requiredAdapterSlot: 'command-effect',
  },
  {
    commandId: 'update-object-accessibility',
    control: 'checkbox',
    id: 'decorative',
    requiredAdapterSlot: 'command-effect',
  },
] as const satisfies readonly SlideEditObjectAccessibilityFieldDescriptor[])

export function createSlideEditObjectAccessibilityDescriptor<
  TSlideId extends SlideEditObjectAccessibilitySlideId,
  TObjectId extends SlideEditObjectAccessibilityObjectId,
>({
  fields = SLIDE_EDIT_OBJECT_ACCESSIBILITY_FIELDS,
  objectId,
  slideId,
  value = SLIDE_EDIT_OBJECT_ACCESSIBILITY_DEFAULT,
}: {
  fields?: readonly SlideEditObjectAccessibilityFieldDescriptor[]
  objectId: TObjectId
  slideId: TSlideId
  value?: Partial<SlideEditObjectAccessibility> | null
}): SlideEditObjectAccessibilityDescriptor<TSlideId, TObjectId> {
  const normalizedValue = normalizeSlideEditObjectAccessibility(value)

  return {
    fields,
    metadata: getSlideEditObjectAccessibilityMetadata(normalizedValue),
    objectId,
    slideId,
    surface: 'object-accessibility',
    value: normalizedValue,
  }
}

export function getSlideEditObjectAccessibilityCommandEffect<
  TSlideId extends SlideEditObjectAccessibilitySlideId,
  TObjectId extends SlideEditObjectAccessibilityObjectId,
>(
  command: SlideEditObjectAccessibilityCommand<TSlideId, TObjectId>,
): SlideEditObjectAccessibilityHostCommandEffect<TSlideId, TObjectId> {
  return {
    payload: normalizeSlideEditObjectAccessibilityCommand(command),
    selection: {
      objectIds: [command.objectId],
      slideId: command.slideId,
    },
    type: 'slide-command-effect',
  }
}

export function getSlideEditObjectAccessibilityJSONPasteValue({
  dataTransfer,
  jsonMimeType = SLIDE_EDIT_OBJECT_ACCESSIBILITY_JSON_MIME_TYPE,
  storagePolicy = {},
}: SlideEditObjectAccessibilityJSONPasteInput):
  SlideEditObjectAccessibilityJSONPasteValue | null {
  if (!dataTransfer) {
    return null
  }

  if (jsonMimeType) {
    const customText = dataTransfer.getData(jsonMimeType)

    if (!customText.trim()) {
      return getSlideEditObjectAccessibilityGeneralJSONPasteValue(
        dataTransfer,
        storagePolicy,
      )
    }

    const customPasteValue = getSlideEditObjectAccessibilityJSONPasteValueFromText(
      customText,
      { storagePolicy },
    )

    if (customPasteValue !== null) {
      return customPasteValue
    }
  }

  return getSlideEditObjectAccessibilityGeneralJSONPasteValue(
    dataTransfer,
    storagePolicy,
  )
}

function getSlideEditObjectAccessibilityGeneralJSONPasteValue(
  dataTransfer: SlideEditObjectAccessibilityDataTransfer,
  storagePolicy: SlideEditObjectAltTextStoragePolicy,
): SlideEditObjectAccessibilityJSONPasteValue | null {
  for (const type of SLIDE_EDIT_OBJECT_ACCESSIBILITY_JSON_TYPES) {
    const text = dataTransfer.getData(type)

    if (!text.trim()) {
      continue
    }

    const pasteValue = getSlideEditObjectAccessibilityJSONPasteValueFromText(
      text,
      {
        mode: 'wrapped',
        storagePolicy,
      },
    )

    if (pasteValue !== null) {
      return pasteValue
    }
  }

  return null
}

export function getSlideEditObjectAccessibilityJSONPasteValueFromText(
  text: string,
  options?: SlideEditObjectAccessibilityJSONPasteValueOptions,
): SlideEditObjectAccessibilityJSONPasteValue | null {
  return getSlideEditObjectAccessibilityJSONPasteValueFromValue(
    parseSlideEditObjectAccessibilityJSON(text),
    options,
  )
}

export function getSlideEditObjectAccessibilityJSONPasteValueFromValue(
  value: unknown,
  {
    mode = 'direct',
    storagePolicy = {},
  }: SlideEditObjectAccessibilityJSONPasteValueOptions = {},
): SlideEditObjectAccessibilityJSONPasteValue | null {
  return mode === 'wrapped'
    ? getSlideEditObjectAccessibilityWrappedPasteValue(value, storagePolicy)
    : getSlideEditObjectAccessibilityDirectPasteValue(value, storagePolicy)
}

export function getSlideEditObjectAccessibilityPasteCommand<
  TSlideId extends SlideEditObjectAccessibilitySlideId,
  TObjectId extends SlideEditObjectAccessibilityObjectId,
>({
  objectId,
  pasteValue,
  slideId,
  supportsDecorative = true,
}: SlideEditObjectAccessibilityPasteCommandInput<TSlideId, TObjectId>):
  SlideEditObjectAccessibilityCommand<TSlideId, TObjectId> {
  switch (pasteValue.kind) {
    case 'alt-text':
      return {
        fieldId: 'altText',
        id: 'update-object-accessibility',
        objectId,
        slideId,
        value: pasteValue.altText,
      }
    case 'decorative':
      return supportsDecorative
        ? {
          fieldId: 'decorative',
          id: 'update-object-accessibility',
          objectId,
          slideId,
          value: true,
        }
        : {
          id: 'remove-object-alt-text',
          objectId,
          slideId,
        }
    case 'remove-alt-text':
      return {
        id: 'remove-object-alt-text',
        objectId,
        slideId,
      }
  }
}

export function normalizeSlideEditObjectAccessibilityCommand<
  TSlideId extends SlideEditObjectAccessibilitySlideId,
  TObjectId extends SlideEditObjectAccessibilityObjectId,
>(
  command: SlideEditObjectAccessibilityCommand<TSlideId, TObjectId>,
): SlideEditObjectAccessibilityCommand<TSlideId, TObjectId> {
  if (command.id === 'remove-object-alt-text') {
    return command
  }

  return {
    ...command,
    value: normalizeSlideEditObjectAccessibilityFieldValue(
      command.fieldId,
      command.value,
    ),
  }
}

export function getSlideEditObjectAccessibilityMetadata(
  value: Partial<SlideEditObjectAccessibility> | null | undefined,
): SlideEditObjectAccessibilityMetadata {
  const normalizedValue = normalizeSlideEditObjectAccessibility(value)
  const isDescribed = !normalizedValue.decorative &&
    normalizedValue.altText.length > 0

  return {
    attribute: SLIDE_EDIT_OBJECT_ACCESSIBILITY_DATA_ATTRIBUTE,
    attributeValue: toSlideEditObjectAccessibilityAttributeValue(
      normalizedValue,
    ),
    defaultValue: 'none',
    isDecorative: normalizedValue.decorative,
    isDescribed,
    value: normalizedValue,
  }
}

export function normalizeSlideEditObjectAccessibility(
  value: Partial<SlideEditObjectAccessibility> | null | undefined,
): SlideEditObjectAccessibility {
  const decorative = value?.decorative === true

  return {
    altText: decorative
      ? ''
      : normalizeSlideEditObjectAltText(value?.altText),
    decorative,
  }
}

export function normalizeSlideEditObjectAccessibilityFieldValue(
  fieldId: SlideEditObjectAccessibilityFieldId,
  value: boolean | string,
) {
  if (fieldId === 'decorative') {
    return value === true
  }

  return normalizeSlideEditObjectAltText(String(value))
}

export function normalizeSlideEditObjectAltTextStorageValue(
  value: string | null | undefined,
  {
    maxLength,
    rejectControlCharacters = true,
  }: SlideEditObjectAltTextStoragePolicy = {},
) {
  const trimmedValue = value?.trim() ?? ''
  const normalizedValue = typeof maxLength === 'number'
    ? trimmedValue.slice(0, Math.max(0, maxLength))
    : trimmedValue

  if (!normalizedValue) {
    return null
  }

  if (
    rejectControlCharacters &&
    hasSlideEditObjectAltTextControlCharacter(normalizedValue)
  ) {
    return null
  }

  return normalizedValue
}

export function shouldEmitSlideEditObjectAccessibilityMetadata(
  value: Partial<SlideEditObjectAccessibility> | null | undefined,
) {
  const normalizedValue = normalizeSlideEditObjectAccessibility(value)

  return normalizedValue.decorative || normalizedValue.altText.length > 0
}

export function toSlideEditObjectAccessibilityAttributeValue(
  value: Partial<SlideEditObjectAccessibility> | null | undefined,
) {
  const normalizedValue = normalizeSlideEditObjectAccessibility(value)

  if (!shouldEmitSlideEditObjectAccessibilityMetadata(normalizedValue)) {
    return 'none'
  }

  return JSON.stringify(normalizedValue)
}

function normalizeSlideEditObjectAltText(value: string | null | undefined) {
  return value?.trim() ?? ''
}

function hasSlideEditObjectAltTextControlCharacter(value: string) {
  return [...value].some((char) => {
    const code = char.charCodeAt(0)

    return code <= 31 || code === 127
  })
}

function getSlideEditObjectAccessibilityDirectPasteValue(
  value: unknown,
  storagePolicy: SlideEditObjectAltTextStoragePolicy,
): SlideEditObjectAccessibilityJSONPasteValue | null {
  const directAltTextValue = getSlideEditObjectAccessibilityAltTextPasteValue(
    value,
    storagePolicy,
  )

  if (directAltTextValue !== null) {
    return directAltTextValue
  }

  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  const record = value as Record<string, unknown>

  if (Object.hasOwn(record, 'value')) {
    return getSlideEditObjectAccessibilityDirectPasteValue(
      record.value,
      storagePolicy,
    )
  }

  return getSlideEditObjectAccessibilityObjectPasteValue(record, storagePolicy)
}

function getSlideEditObjectAccessibilityWrappedPasteValue(
  value: unknown,
  storagePolicy: SlideEditObjectAltTextStoragePolicy,
): SlideEditObjectAccessibilityJSONPasteValue | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  const record = value as Record<string, unknown>

  for (const key of SLIDE_EDIT_OBJECT_ACCESSIBILITY_JSON_WRAPPER_KEYS) {
    if (!Object.hasOwn(record, key)) {
      continue
    }

    if (key === 'objectAltText') {
      return getSlideEditObjectAccessibilityAltTextPasteValue(
        record[key],
        storagePolicy,
      )
    }

    return getSlideEditObjectAccessibilityDirectPasteValue(
      record[key],
      storagePolicy,
    )
  }

  return getSlideEditObjectAccessibilityObjectPasteValue(record, storagePolicy)
}

function getSlideEditObjectAccessibilityObjectPasteValue(
  record: Record<string, unknown>,
  storagePolicy: SlideEditObjectAltTextStoragePolicy,
): SlideEditObjectAccessibilityJSONPasteValue | null {
  if (record.decorative === true) {
    return {
      kind: 'decorative',
      value: {
        altText: '',
        decorative: true,
      },
    }
  }

  if (Object.hasOwn(record, 'altText')) {
    return getSlideEditObjectAccessibilityAltTextPasteValue(
      record.altText,
      storagePolicy,
    )
  }

  if (record.decorative === false) {
    return getSlideEditObjectAccessibilityRemovePasteValue()
  }

  return null
}

function getSlideEditObjectAccessibilityAltTextPasteValue(
  value: unknown,
  storagePolicy: SlideEditObjectAltTextStoragePolicy,
): SlideEditObjectAccessibilityJSONPasteValue | null {
  if (value === null || value === false) {
    return getSlideEditObjectAccessibilityRemovePasteValue()
  }

  if (typeof value !== 'string') {
    return null
  }

  if (!value.trim()) {
    return getSlideEditObjectAccessibilityRemovePasteValue()
  }

  const normalizedAltText = normalizeSlideEditObjectAltTextStorageValue(
    value,
    storagePolicy,
  )

  if (normalizedAltText === null) {
    return null
  }

  return {
    altText: normalizedAltText,
    kind: 'alt-text',
    value: {
      altText: normalizedAltText,
      decorative: false,
    },
  }
}

function getSlideEditObjectAccessibilityRemovePasteValue():
  SlideEditObjectAccessibilityJSONPasteValue {
  return {
    kind: 'remove-alt-text',
    value: {
      altText: '',
      decorative: false,
    },
  }
}

function parseSlideEditObjectAccessibilityJSON(value: string) {
  if (!value.trim()) {
    return null
  }

  try {
    return JSON.parse(value) as unknown
  } catch {
    return SLIDE_EDIT_OBJECT_ACCESSIBILITY_INVALID_JSON
  }
}
