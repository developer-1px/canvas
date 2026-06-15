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
