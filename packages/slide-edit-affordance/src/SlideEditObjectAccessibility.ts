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

export const SLIDE_EDIT_OBJECT_ACCESSIBILITY_DATA_ATTRIBUTE =
  'data-slide-object-accessibility'

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
