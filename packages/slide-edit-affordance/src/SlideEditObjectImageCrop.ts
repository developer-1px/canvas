export type SlideEditObjectImageCropSlideId = string
export type SlideEditObjectImageCropObjectId = string

export type SlideEditObjectImageCropFit = 'contain' | 'cover'

export type SlideEditObjectImageCropPosition = {
  x: number
  y: number
}

export type SlideEditObjectImageCropFieldId =
  | 'fit'
  | 'reset'
  | 'x'
  | 'y'

export type SlideEditObjectImageCropUnsupportedReason =
  | 'mixed-selection'
  | 'unsupported-object'

export type SlideEditObjectImageCropNumericLimits = {
  max: number
  min: number
}

export type SlideEditObjectImageCropFitOption = {
  id: SlideEditObjectImageCropFit
  label: string
}

export type SlideEditObjectImageCropFitFieldDescriptor = {
  commandId: 'update-object-image-crop'
  control: 'image-fit-select'
  id: 'fit'
  options: readonly SlideEditObjectImageCropFitOption[]
  requiredAdapterSlot: 'command-effect'
}

export type SlideEditObjectImageCropPositionFieldDescriptor = {
  commandId: 'update-object-image-crop'
  control: 'crop-position-input'
  id: 'x' | 'y'
  max: number
  min: number
  requiredAdapterSlot: 'command-effect'
  step: number
  unit: 'percent'
}

export type SlideEditObjectImageCropResetFieldDescriptor = {
  commandId: 'reset-object-image-crop'
  control: 'image-crop-reset-button'
  id: 'reset'
  requiredAdapterSlot: 'command-effect'
}

export type SlideEditObjectImageCropFieldDescriptor =
  | SlideEditObjectImageCropFitFieldDescriptor
  | SlideEditObjectImageCropPositionFieldDescriptor
  | SlideEditObjectImageCropResetFieldDescriptor

export type SlideEditObjectImageCropFieldsDescriptor = {
  fit: SlideEditObjectImageCropFitFieldDescriptor
  reset: SlideEditObjectImageCropResetFieldDescriptor
  x: SlideEditObjectImageCropPositionFieldDescriptor
  y: SlideEditObjectImageCropPositionFieldDescriptor
}

export type SlideEditObjectImageCropMetadata = {
  attribute: typeof SLIDE_EDIT_OBJECT_IMAGE_CROP_DATA_ATTRIBUTE
  attributeValue: string
  defaultCrop: typeof SLIDE_EDIT_OBJECT_IMAGE_CROP_DEFAULT
  defaultFit: typeof SLIDE_EDIT_OBJECT_IMAGE_CROP_DEFAULT_FIT
  crop: SlideEditObjectImageCropPosition
  fit: SlideEditObjectImageCropFit
  isSupported: boolean
  unsupportedReason?: SlideEditObjectImageCropUnsupportedReason
}

export type SlideEditObjectImageCropDescriptor<
  TSlideId extends SlideEditObjectImageCropSlideId =
    SlideEditObjectImageCropSlideId,
  TObjectId extends SlideEditObjectImageCropObjectId =
    SlideEditObjectImageCropObjectId,
> = {
  crop: SlideEditObjectImageCropPosition
  fields: SlideEditObjectImageCropFieldsDescriptor
  fit: SlideEditObjectImageCropFit
  isSupported: boolean
  limits: SlideEditObjectImageCropNumericLimits
  metadata: SlideEditObjectImageCropMetadata
  objectId: TObjectId
  slideId: TSlideId
  surface: 'object-image-crop'
  unsupportedReason?: SlideEditObjectImageCropUnsupportedReason
}

export type SlideEditObjectImageCropUpdateCommand<
  TSlideId extends SlideEditObjectImageCropSlideId =
    SlideEditObjectImageCropSlideId,
  TObjectId extends SlideEditObjectImageCropObjectId =
    SlideEditObjectImageCropObjectId,
> = {
  fieldId: Exclude<SlideEditObjectImageCropFieldId, 'reset'>
  id: 'update-object-image-crop'
  objectId: TObjectId
  slideId: TSlideId
  value: SlideEditObjectImageCropFit | number
}

export type SlideEditObjectImageCropResetCommand<
  TSlideId extends SlideEditObjectImageCropSlideId =
    SlideEditObjectImageCropSlideId,
  TObjectId extends SlideEditObjectImageCropObjectId =
    SlideEditObjectImageCropObjectId,
> = {
  crop?: Partial<SlideEditObjectImageCropPosition> | null
  fit?: string | null
  id: 'reset-object-image-crop'
  objectId: TObjectId
  slideId: TSlideId
}

export type SlideEditObjectImageCropCommand<
  TSlideId extends SlideEditObjectImageCropSlideId =
    SlideEditObjectImageCropSlideId,
  TObjectId extends SlideEditObjectImageCropObjectId =
    SlideEditObjectImageCropObjectId,
> =
  | SlideEditObjectImageCropResetCommand<TSlideId, TObjectId>
  | SlideEditObjectImageCropUpdateCommand<TSlideId, TObjectId>

export type SlideEditObjectImageCropResetPayload<
  TSlideId extends SlideEditObjectImageCropSlideId =
    SlideEditObjectImageCropSlideId,
  TObjectId extends SlideEditObjectImageCropObjectId =
    SlideEditObjectImageCropObjectId,
> = {
  crop: SlideEditObjectImageCropPosition
  fit: SlideEditObjectImageCropFit
  id: 'reset-object-image-crop'
  objectId: TObjectId
  slideId: TSlideId
}

export type SlideEditObjectImageCropCommandPayload<
  TSlideId extends SlideEditObjectImageCropSlideId =
    SlideEditObjectImageCropSlideId,
  TObjectId extends SlideEditObjectImageCropObjectId =
    SlideEditObjectImageCropObjectId,
> =
  | SlideEditObjectImageCropResetPayload<TSlideId, TObjectId>
  | SlideEditObjectImageCropUpdateCommand<TSlideId, TObjectId>

export type SlideEditObjectImageCropHostCommandEffect<
  TSlideId extends SlideEditObjectImageCropSlideId =
    SlideEditObjectImageCropSlideId,
  TObjectId extends SlideEditObjectImageCropObjectId =
    SlideEditObjectImageCropObjectId,
> = {
  payload: SlideEditObjectImageCropCommandPayload<TSlideId, TObjectId>
  selection: {
    objectIds: readonly TObjectId[]
    slideId: TSlideId
  }
  type: 'slide-command-effect'
}

export const SLIDE_EDIT_OBJECT_IMAGE_CROP_DATA_ATTRIBUTE =
  'data-slide-object-image-crop'

export const SLIDE_EDIT_OBJECT_IMAGE_CROP_DEFAULT = Object.freeze({
  x: 50,
  y: 50,
} as const satisfies SlideEditObjectImageCropPosition)

export const SLIDE_EDIT_OBJECT_IMAGE_CROP_DEFAULT_FIT = 'cover'

export const SLIDE_EDIT_OBJECT_IMAGE_CROP_LIMITS = Object.freeze({
  max: 100,
  min: 0,
} as const satisfies SlideEditObjectImageCropNumericLimits)

export const SLIDE_EDIT_OBJECT_IMAGE_CROP_FIT_OPTIONS = Object.freeze([
  {
    id: 'cover',
    label: 'Fill',
  },
  {
    id: 'contain',
    label: 'Fit',
  },
] as const satisfies readonly SlideEditObjectImageCropFitOption[])

export const SLIDE_EDIT_OBJECT_IMAGE_CROP_FIELDS = Object.freeze({
  fit: {
    commandId: 'update-object-image-crop',
    control: 'image-fit-select',
    id: 'fit',
    options: SLIDE_EDIT_OBJECT_IMAGE_CROP_FIT_OPTIONS,
    requiredAdapterSlot: 'command-effect',
  },
  reset: {
    commandId: 'reset-object-image-crop',
    control: 'image-crop-reset-button',
    id: 'reset',
    requiredAdapterSlot: 'command-effect',
  },
  x: {
    commandId: 'update-object-image-crop',
    control: 'crop-position-input',
    id: 'x',
    max: SLIDE_EDIT_OBJECT_IMAGE_CROP_LIMITS.max,
    min: SLIDE_EDIT_OBJECT_IMAGE_CROP_LIMITS.min,
    requiredAdapterSlot: 'command-effect',
    step: 1,
    unit: 'percent',
  },
  y: {
    commandId: 'update-object-image-crop',
    control: 'crop-position-input',
    id: 'y',
    max: SLIDE_EDIT_OBJECT_IMAGE_CROP_LIMITS.max,
    min: SLIDE_EDIT_OBJECT_IMAGE_CROP_LIMITS.min,
    requiredAdapterSlot: 'command-effect',
    step: 1,
    unit: 'percent',
  },
} as const satisfies SlideEditObjectImageCropFieldsDescriptor)

export function createSlideEditObjectImageCropDescriptor<
  TSlideId extends SlideEditObjectImageCropSlideId,
  TObjectId extends SlideEditObjectImageCropObjectId,
>({
  crop = SLIDE_EDIT_OBJECT_IMAGE_CROP_DEFAULT,
  fields = SLIDE_EDIT_OBJECT_IMAGE_CROP_FIELDS,
  fit = SLIDE_EDIT_OBJECT_IMAGE_CROP_DEFAULT_FIT,
  isSupported = true,
  objectId,
  slideId,
  unsupportedReason,
}: {
  crop?: Partial<SlideEditObjectImageCropPosition> | null
  fields?: SlideEditObjectImageCropFieldsDescriptor
  fit?: string | null
  isSupported?: boolean
  objectId: TObjectId
  slideId: TSlideId
  unsupportedReason?: SlideEditObjectImageCropUnsupportedReason
}): SlideEditObjectImageCropDescriptor<TSlideId, TObjectId> {
  const normalizedCrop = normalizeSlideEditObjectImageCrop(crop)
  const normalizedFit = normalizeSlideEditObjectImageCropFit(fit)
  const normalizedUnsupportedReason = isSupported
    ? undefined
    : unsupportedReason ?? 'unsupported-object'

  return {
    crop: normalizedCrop,
    fields,
    fit: normalizedFit,
    isSupported,
    limits: SLIDE_EDIT_OBJECT_IMAGE_CROP_LIMITS,
    metadata: getSlideEditObjectImageCropMetadata({
      crop: normalizedCrop,
      fit: normalizedFit,
      isSupported,
      unsupportedReason: normalizedUnsupportedReason,
    }),
    objectId,
    slideId,
    surface: 'object-image-crop',
    unsupportedReason: normalizedUnsupportedReason,
  }
}

export function getSlideEditObjectImageCropCommandEffect<
  TSlideId extends SlideEditObjectImageCropSlideId,
  TObjectId extends SlideEditObjectImageCropObjectId,
>(
  command: SlideEditObjectImageCropCommand<TSlideId, TObjectId>,
): SlideEditObjectImageCropHostCommandEffect<TSlideId, TObjectId> {
  return {
    payload: normalizeSlideEditObjectImageCropCommand(command),
    selection: {
      objectIds: [command.objectId],
      slideId: command.slideId,
    },
    type: 'slide-command-effect',
  }
}

export function normalizeSlideEditObjectImageCropUpdateCommand<
  TSlideId extends SlideEditObjectImageCropSlideId,
  TObjectId extends SlideEditObjectImageCropObjectId,
>(
  command: SlideEditObjectImageCropUpdateCommand<TSlideId, TObjectId>,
): SlideEditObjectImageCropUpdateCommand<TSlideId, TObjectId> {
  return {
    ...command,
    value: command.fieldId === 'fit'
      ? normalizeSlideEditObjectImageCropFit(String(command.value))
      : normalizeSlideEditObjectImageCropValue(Number(command.value)),
  }
}

export function normalizeSlideEditObjectImageCropCommand<
  TSlideId extends SlideEditObjectImageCropSlideId,
  TObjectId extends SlideEditObjectImageCropObjectId,
>(
  command: SlideEditObjectImageCropCommand<TSlideId, TObjectId>,
): SlideEditObjectImageCropCommandPayload<TSlideId, TObjectId> {
  if (command.id === 'reset-object-image-crop') {
    return {
      crop: normalizeSlideEditObjectImageCrop(
        command.crop ?? SLIDE_EDIT_OBJECT_IMAGE_CROP_DEFAULT,
      ),
      fit: normalizeSlideEditObjectImageCropFit(
        command.fit ?? SLIDE_EDIT_OBJECT_IMAGE_CROP_DEFAULT_FIT,
      ),
      id: 'reset-object-image-crop',
      objectId: command.objectId,
      slideId: command.slideId,
    }
  }

  return normalizeSlideEditObjectImageCropUpdateCommand(command)
}

export function getSlideEditObjectImageCropMetadata({
  crop,
  fit,
  isSupported = true,
  unsupportedReason,
}: {
  crop?: Partial<SlideEditObjectImageCropPosition> | null
  fit?: string | null
  isSupported?: boolean
  unsupportedReason?: SlideEditObjectImageCropUnsupportedReason
}): SlideEditObjectImageCropMetadata {
  const normalizedCrop = normalizeSlideEditObjectImageCrop(crop)
  const normalizedFit = normalizeSlideEditObjectImageCropFit(fit)

  return {
    attribute: SLIDE_EDIT_OBJECT_IMAGE_CROP_DATA_ATTRIBUTE,
    attributeValue: isSupported
      ? toSlideEditObjectImageCropAttributeValue({
          crop: normalizedCrop,
          fit: normalizedFit,
        })
      : 'unsupported',
    defaultCrop: SLIDE_EDIT_OBJECT_IMAGE_CROP_DEFAULT,
    defaultFit: SLIDE_EDIT_OBJECT_IMAGE_CROP_DEFAULT_FIT,
    crop: normalizedCrop,
    fit: normalizedFit,
    isSupported,
    unsupportedReason: isSupported
      ? undefined
      : unsupportedReason ?? 'unsupported-object',
  }
}

export function normalizeSlideEditObjectImageCrop(
  crop: Partial<SlideEditObjectImageCropPosition> | null | undefined,
): SlideEditObjectImageCropPosition {
  return {
    x: normalizeSlideEditObjectImageCropValue(
      crop?.x,
      SLIDE_EDIT_OBJECT_IMAGE_CROP_DEFAULT.x,
    ),
    y: normalizeSlideEditObjectImageCropValue(
      crop?.y,
      SLIDE_EDIT_OBJECT_IMAGE_CROP_DEFAULT.y,
    ),
  }
}

export function normalizeSlideEditObjectImageCropValue(
  value: number | null | undefined,
  fallback = 50,
): number {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return fallback
  }

  const rounded = Math.round(value * 100) / 100

  return Math.min(
    SLIDE_EDIT_OBJECT_IMAGE_CROP_LIMITS.max,
    Math.max(SLIDE_EDIT_OBJECT_IMAGE_CROP_LIMITS.min, rounded),
  )
}

export function normalizeSlideEditObjectImageCropFit(
  fit: string | null | undefined,
): SlideEditObjectImageCropFit {
  return fit === 'contain' ? 'contain' : SLIDE_EDIT_OBJECT_IMAGE_CROP_DEFAULT_FIT
}

export function toSlideEditObjectImageCropAttributeValue({
  crop,
  fit,
}: {
  crop?: Partial<SlideEditObjectImageCropPosition> | null
  fit?: string | null
}) {
  const normalizedCrop = normalizeSlideEditObjectImageCrop(crop)
  const normalizedFit = normalizeSlideEditObjectImageCropFit(fit)

  return `${normalizedFit}:${normalizedCrop.x},${normalizedCrop.y}`
}

export function getSlideEditObjectImageCropPositionCSS(
  crop: Partial<SlideEditObjectImageCropPosition> | null | undefined,
) {
  const normalizedCrop = normalizeSlideEditObjectImageCrop(crop)

  return `${normalizedCrop.x}% ${normalizedCrop.y}%`
}
