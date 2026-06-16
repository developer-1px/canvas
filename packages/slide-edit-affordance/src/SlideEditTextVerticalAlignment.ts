export type SlideEditTextVerticalAlignmentSlideId = string
export type SlideEditTextVerticalAlignmentObjectId = string

export type SlideEditTextVerticalAlignmentValue =
  | 'bottom'
  | 'middle'
  | 'top'

export type SlideEditTextVerticalAlignmentOption = {
  id: SlideEditTextVerticalAlignmentValue
  label: string
}

export type SlideEditTextVerticalAlignmentFlexAlignItems =
  | 'center'
  | 'flex-end'
  | 'flex-start'

export type SlideEditTextVerticalAlignmentFieldDescriptor = {
  commandId: 'update-text-vertical-alignment'
  control: 'vertical-alignment-segmented-control'
  id: 'verticalAlignment'
  options: readonly SlideEditTextVerticalAlignmentOption[]
  requiredAdapterSlot: 'command-effect'
}

export type SlideEditTextVerticalAlignmentMetadata = {
  attribute: typeof SLIDE_EDIT_TEXT_VERTICAL_ALIGNMENT_DATA_ATTRIBUTE
  defaultValue: typeof SLIDE_EDIT_TEXT_VERTICAL_ALIGNMENT_DEFAULT
  value: SlideEditTextVerticalAlignmentValue
}

export type SlideEditTextVerticalAlignmentDescriptor<
  TSlideId extends SlideEditTextVerticalAlignmentSlideId =
    SlideEditTextVerticalAlignmentSlideId,
  TObjectId extends SlideEditTextVerticalAlignmentObjectId =
    SlideEditTextVerticalAlignmentObjectId,
> = {
  field: SlideEditTextVerticalAlignmentFieldDescriptor
  metadata: SlideEditTextVerticalAlignmentMetadata
  objectId: TObjectId
  slideId: TSlideId
  surface: 'text-vertical-alignment'
  value: SlideEditTextVerticalAlignmentValue
}

export type SlideEditTextVerticalAlignmentUpdateCommand<
  TSlideId extends SlideEditTextVerticalAlignmentSlideId =
    SlideEditTextVerticalAlignmentSlideId,
  TObjectId extends SlideEditTextVerticalAlignmentObjectId =
    SlideEditTextVerticalAlignmentObjectId,
> = {
  fieldId: 'verticalAlignment'
  id: 'update-text-vertical-alignment'
  objectId: TObjectId
  slideId: TSlideId
  value: SlideEditTextVerticalAlignmentValue
}

export type SlideEditTextVerticalAlignmentHostCommandEffect<
  TSlideId extends SlideEditTextVerticalAlignmentSlideId =
    SlideEditTextVerticalAlignmentSlideId,
  TObjectId extends SlideEditTextVerticalAlignmentObjectId =
    SlideEditTextVerticalAlignmentObjectId,
> = {
  payload: SlideEditTextVerticalAlignmentUpdateCommand<TSlideId, TObjectId>
  selection: {
    objectIds: readonly TObjectId[]
    slideId: TSlideId
  }
  type: 'slide-command-effect'
}

export const SLIDE_EDIT_TEXT_VERTICAL_ALIGNMENT_DEFAULT = 'top'

export const SLIDE_EDIT_TEXT_VERTICAL_ALIGNMENT_DATA_ATTRIBUTE =
  'data-slide-text-vertical-align'

export const SLIDE_EDIT_TEXT_VERTICAL_ALIGNMENT_OPTIONS = Object.freeze([
  {
    id: 'top',
    label: 'Top',
  },
  {
    id: 'middle',
    label: 'Middle',
  },
  {
    id: 'bottom',
    label: 'Bottom',
  },
] as const satisfies readonly SlideEditTextVerticalAlignmentOption[])

export const SLIDE_EDIT_TEXT_VERTICAL_ALIGNMENT_FIELD = Object.freeze({
  commandId: 'update-text-vertical-alignment',
  control: 'vertical-alignment-segmented-control',
  id: 'verticalAlignment',
  options: SLIDE_EDIT_TEXT_VERTICAL_ALIGNMENT_OPTIONS,
  requiredAdapterSlot: 'command-effect',
} as const satisfies SlideEditTextVerticalAlignmentFieldDescriptor)

export function createSlideEditTextVerticalAlignmentDescriptor<
  TSlideId extends SlideEditTextVerticalAlignmentSlideId,
  TObjectId extends SlideEditTextVerticalAlignmentObjectId,
>({
  field = SLIDE_EDIT_TEXT_VERTICAL_ALIGNMENT_FIELD,
  objectId,
  slideId,
  value = SLIDE_EDIT_TEXT_VERTICAL_ALIGNMENT_DEFAULT,
}: {
  field?: SlideEditTextVerticalAlignmentFieldDescriptor
  objectId: TObjectId
  slideId: TSlideId
  value?: string | null
}): SlideEditTextVerticalAlignmentDescriptor<TSlideId, TObjectId> {
  const normalizedValue = normalizeSlideEditTextVerticalAlignment(value)

  return {
    field,
    metadata: getSlideEditTextVerticalAlignmentMetadata(normalizedValue),
    objectId,
    slideId,
    surface: 'text-vertical-alignment',
    value: normalizedValue,
  }
}

export function getSlideEditTextVerticalAlignmentCommandEffect<
  TSlideId extends SlideEditTextVerticalAlignmentSlideId,
  TObjectId extends SlideEditTextVerticalAlignmentObjectId,
>(
  command: SlideEditTextVerticalAlignmentUpdateCommand<TSlideId, TObjectId>,
): SlideEditTextVerticalAlignmentHostCommandEffect<TSlideId, TObjectId> {
  return {
    payload: normalizeSlideEditTextVerticalAlignmentUpdateCommand(command),
    selection: {
      objectIds: [command.objectId],
      slideId: command.slideId,
    },
    type: 'slide-command-effect',
  }
}

export function normalizeSlideEditTextVerticalAlignmentUpdateCommand<
  TSlideId extends SlideEditTextVerticalAlignmentSlideId,
  TObjectId extends SlideEditTextVerticalAlignmentObjectId,
>(
  command: SlideEditTextVerticalAlignmentUpdateCommand<TSlideId, TObjectId>,
): SlideEditTextVerticalAlignmentUpdateCommand<TSlideId, TObjectId> {
  return {
    ...command,
    value: normalizeSlideEditTextVerticalAlignment(command.value),
  }
}

export function getSlideEditTextVerticalAlignmentMetadata(
  value: string | null | undefined,
): SlideEditTextVerticalAlignmentMetadata {
  return {
    attribute: SLIDE_EDIT_TEXT_VERTICAL_ALIGNMENT_DATA_ATTRIBUTE,
    defaultValue: SLIDE_EDIT_TEXT_VERTICAL_ALIGNMENT_DEFAULT,
    value: normalizeSlideEditTextVerticalAlignment(value),
  }
}

export function normalizeSlideEditTextVerticalAlignment(
  value: string | null | undefined,
): SlideEditTextVerticalAlignmentValue {
  return isSlideEditTextVerticalAlignmentValue(value)
    ? value
    : SLIDE_EDIT_TEXT_VERTICAL_ALIGNMENT_DEFAULT
}

export function getSlideEditTextVerticalAlignmentFlexAlignItems(
  value: string | null | undefined,
): SlideEditTextVerticalAlignmentFlexAlignItems {
  switch (normalizeSlideEditTextVerticalAlignment(value)) {
    case 'bottom':
      return 'flex-end'
    case 'middle':
      return 'center'
    case 'top':
      return 'flex-start'
  }
}

export function isSlideEditTextVerticalAlignmentValue(
  value: string | null | undefined,
): value is SlideEditTextVerticalAlignmentValue {
  return value === 'top' || value === 'middle' || value === 'bottom'
}
