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

export type SlideEditObjectImageCropJSONFieldId =
  Exclude<SlideEditObjectImageCropFieldId, 'reset'>

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

export type SlideEditObjectImageCropDataTransfer = Pick<DataTransfer, 'getData'>

export type SlideEditObjectImageCropSourceFields =
  Partial<Record<SlideEditObjectImageCropJSONFieldId, string>> & {
    wrapper?: string
  }

export type SlideEditObjectImageCropJSONPasteValue = {
  crop: Partial<SlideEditObjectImageCropPosition>
  fields: readonly SlideEditObjectImageCropJSONFieldId[]
  fit?: SlideEditObjectImageCropFit
  format: 'json'
  payloadLength: number
  sourceFields: SlideEditObjectImageCropSourceFields
  sourceType: string
  surface: 'object-image-crop'
  wrapper?: string
}

export type SlideEditObjectImageCropJSONPasteInput = {
  dataTransfer: SlideEditObjectImageCropDataTransfer | null
  jsonMimeType?: string
}

export type SlideEditObjectImageCropJSONPasteValueMode =
  | 'direct'
  | 'wrapped'

export type SlideEditObjectImageCropJSONPasteValueOptions = {
  mode?: SlideEditObjectImageCropJSONPasteValueMode
  payloadLength?: number
  sourceType?: string
}

export type SlideEditObjectImageCropPasteTarget<
  TObjectId extends SlideEditObjectImageCropObjectId =
    SlideEditObjectImageCropObjectId,
> = {
  crop?: Partial<SlideEditObjectImageCropPosition> | null
  fit?: string | null
  isHidden?: boolean
  isLocked?: boolean
  isSupported?: boolean
  objectId: TObjectId
}

export type SlideEditObjectImageCropPasteSkipReason =
  | 'hidden-target'
  | 'locked-target'
  | 'unsupported-target'

export type SlideEditObjectImageCropPasteSkippedTarget<
  TObjectId extends SlideEditObjectImageCropObjectId =
    SlideEditObjectImageCropObjectId,
> = {
  objectId: TObjectId
  reason: SlideEditObjectImageCropPasteSkipReason
}

export type SlideEditObjectImageCropPasteAppliedTarget<
  TObjectId extends SlideEditObjectImageCropObjectId =
    SlideEditObjectImageCropObjectId,
> = {
  commandId: 'update-object-image-crop'
  crop: SlideEditObjectImageCropPosition
  effectType: 'slide-command-effect'
  fields: readonly SlideEditObjectImageCropJSONFieldId[]
  fit: SlideEditObjectImageCropFit
  objectId: TObjectId
}

export type SlideEditObjectImageCropTargetSupportInput<
  TObjectId extends SlideEditObjectImageCropObjectId =
    SlideEditObjectImageCropObjectId,
> = {
  pasteValue: SlideEditObjectImageCropJSONPasteValue
  target: SlideEditObjectImageCropPasteTarget<TObjectId>
}

export type SlideEditObjectImageCropPasteCommandEffectsInput<
  TSlideId extends SlideEditObjectImageCropSlideId =
    SlideEditObjectImageCropSlideId,
  TObjectId extends SlideEditObjectImageCropObjectId =
    SlideEditObjectImageCropObjectId,
> = {
  isTargetSupported?: (
    input: SlideEditObjectImageCropTargetSupportInput<TObjectId>
  ) => boolean
  pasteValue: SlideEditObjectImageCropJSONPasteValue
  slideId: TSlideId
  targets: readonly SlideEditObjectImageCropPasteTarget<TObjectId>[]
}

export type SlideEditObjectImageCropPasteCommandEffectsResult<
  TSlideId extends SlideEditObjectImageCropSlideId =
    SlideEditObjectImageCropSlideId,
  TObjectId extends SlideEditObjectImageCropObjectId =
    SlideEditObjectImageCropObjectId,
> = {
  appliedTargets: readonly SlideEditObjectImageCropPasteAppliedTarget<TObjectId>[]
  effects: readonly SlideEditObjectImageCropHostCommandEffect<
    TSlideId,
    TObjectId
  >[]
  pasteValue: SlideEditObjectImageCropJSONPasteValue
  skippedTargets: readonly SlideEditObjectImageCropPasteSkippedTarget<TObjectId>[]
}

export type SlideEditObjectImageCropForTargetInput<
  TObjectId extends SlideEditObjectImageCropObjectId =
    SlideEditObjectImageCropObjectId,
> = {
  pasteValue: SlideEditObjectImageCropJSONPasteValue
  target: SlideEditObjectImageCropPasteTarget<TObjectId>
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

export const SLIDE_EDIT_OBJECT_IMAGE_CROP_JSON_MIME_TYPE =
  'application/vnd.interactive-os.slide-edit.object-image-crop+json'

export const SLIDE_EDIT_OBJECT_IMAGE_CROP_JSON_TYPES = Object.freeze([
  'application/json',
  'text/json',
  'text/plain',
] as const)

export const SLIDE_EDIT_OBJECT_IMAGE_CROP_JSON_WRAPPER_KEYS = Object.freeze([
  'imageCrop',
  'objectImageCrop',
  'crop',
] as const)

const SLIDE_EDIT_OBJECT_IMAGE_CROP_JSON_FIELDS = Object.freeze([
  'fit',
  'x',
  'y',
] as const satisfies readonly SlideEditObjectImageCropJSONFieldId[])

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

export function getSlideEditObjectImageCropJSONPasteValue({
  dataTransfer,
  jsonMimeType = SLIDE_EDIT_OBJECT_IMAGE_CROP_JSON_MIME_TYPE,
}: SlideEditObjectImageCropJSONPasteInput):
  SlideEditObjectImageCropJSONPasteValue | null {
  if (!dataTransfer) {
    return null
  }

  if (jsonMimeType) {
    const customText = dataTransfer.getData(jsonMimeType)

    if (customText.trim()) {
      const customPasteValue =
        getSlideEditObjectImageCropJSONPasteValueFromText(
          customText,
          {
            payloadLength: customText.length,
            sourceType: jsonMimeType,
          },
        )

      if (customPasteValue !== null) {
        return customPasteValue
      }
    }
  }

  for (const type of SLIDE_EDIT_OBJECT_IMAGE_CROP_JSON_TYPES) {
    const text = dataTransfer.getData(type)

    if (!text.trim()) {
      continue
    }

    const pasteValue = getSlideEditObjectImageCropJSONPasteValueFromText(
      text,
      {
        mode: 'wrapped',
        payloadLength: text.length,
        sourceType: type,
      },
    )

    if (pasteValue !== null) {
      return pasteValue
    }
  }

  return null
}

export function getSlideEditObjectImageCropJSONPasteValueFromText(
  text: string,
  options?: SlideEditObjectImageCropJSONPasteValueOptions,
): SlideEditObjectImageCropJSONPasteValue | null {
  return getSlideEditObjectImageCropJSONPasteValueFromValue(
    parseSlideEditObjectImageCropJSON(text),
    {
      ...options,
      payloadLength: options?.payloadLength ?? text.length,
    },
  )
}

export function getSlideEditObjectImageCropJSONPasteValueFromValue(
  value: unknown,
  {
    mode = 'direct',
    payloadLength = 0,
    sourceType = 'json',
  }: SlideEditObjectImageCropJSONPasteValueOptions = {},
): SlideEditObjectImageCropJSONPasteValue | null {
  return mode === 'wrapped'
    ? getSlideEditObjectImageCropWrappedJSONPasteValue({
      payloadLength,
      sourceType,
      value,
    })
    : getSlideEditObjectImageCropAnyJSONPasteValue({
      payloadLength,
      sourceType,
      value,
    })
}

export function getSlideEditObjectImageCropForTarget<
  TObjectId extends SlideEditObjectImageCropObjectId,
>({
  pasteValue,
  target,
}: SlideEditObjectImageCropForTargetInput<TObjectId>): {
  crop: SlideEditObjectImageCropPosition
  fit: SlideEditObjectImageCropFit
} {
  const currentCrop = normalizeSlideEditObjectImageCrop(target.crop)
  const currentFit = normalizeSlideEditObjectImageCropFit(target.fit)

  return {
    crop: {
      x: pasteValue.crop.x ?? currentCrop.x,
      y: pasteValue.crop.y ?? currentCrop.y,
    },
    fit: pasteValue.fit ?? currentFit,
  }
}

export function getSlideEditObjectImageCropPasteCommandEffects<
  TSlideId extends SlideEditObjectImageCropSlideId,
  TObjectId extends SlideEditObjectImageCropObjectId,
>({
  isTargetSupported,
  pasteValue,
  slideId,
  targets,
}: SlideEditObjectImageCropPasteCommandEffectsInput<TSlideId, TObjectId>):
  SlideEditObjectImageCropPasteCommandEffectsResult<TSlideId, TObjectId> {
  const appliedTargets:
    SlideEditObjectImageCropPasteAppliedTarget<TObjectId>[] = []
  const effects:
    SlideEditObjectImageCropHostCommandEffect<TSlideId, TObjectId>[] = []
  const skippedTargets:
    SlideEditObjectImageCropPasteSkippedTarget<TObjectId>[] = []

  for (const target of targets) {
    if (target.isLocked) {
      skippedTargets.push({
        objectId: target.objectId,
        reason: 'locked-target',
      })
      continue
    }

    if (target.isHidden) {
      skippedTargets.push({
        objectId: target.objectId,
        reason: 'hidden-target',
      })
      continue
    }

    if (target.isSupported === false) {
      skippedTargets.push({
        objectId: target.objectId,
        reason: 'unsupported-target',
      })
      continue
    }

    if (
      isTargetSupported &&
      !isTargetSupported({
        pasteValue,
        target,
      })
    ) {
      skippedTargets.push({
        objectId: target.objectId,
        reason: 'unsupported-target',
      })
      continue
    }

    const nextImageCrop = getSlideEditObjectImageCropForTarget({
      pasteValue,
      target,
    })

    for (const field of pasteValue.fields) {
      const effect = getSlideEditObjectImageCropCommandEffect({
        fieldId: field,
        id: 'update-object-image-crop',
        objectId: target.objectId,
        slideId,
        value: field === 'fit'
          ? nextImageCrop.fit
          : nextImageCrop.crop[field],
      })

      effects.push(effect)
    }

    appliedTargets.push({
      commandId: 'update-object-image-crop',
      crop: nextImageCrop.crop,
      effectType: 'slide-command-effect',
      fields: pasteValue.fields,
      fit: nextImageCrop.fit,
      objectId: target.objectId,
    })
  }

  return {
    appliedTargets,
    effects,
    pasteValue,
    skippedTargets,
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

function getSlideEditObjectImageCropAnyJSONPasteValue({
  payloadLength,
  sourceType,
  value,
}: {
  payloadLength: number
  sourceType: string
  value: unknown
}) {
  return getSlideEditObjectImageCropDirectJSONPasteValue({
    payloadLength,
    sourceType,
    value,
  }) ?? getSlideEditObjectImageCropWrappedJSONPasteValue({
    payloadLength,
    sourceType,
    value,
  })
}

function getSlideEditObjectImageCropWrappedJSONPasteValue({
  payloadLength,
  sourceType,
  value,
}: {
  payloadLength: number
  sourceType: string
  value: unknown
}): SlideEditObjectImageCropJSONPasteValue | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  const record = value as Record<string, unknown>

  for (const key of SLIDE_EDIT_OBJECT_IMAGE_CROP_JSON_WRAPPER_KEYS) {
    if (!Object.hasOwn(record, key)) {
      continue
    }

    const pasteValue = getSlideEditObjectImageCropDirectJSONPasteValue({
      payloadLength,
      sourceType,
      value: record[key],
      wrapper: key,
    })

    if (pasteValue !== null) {
      return pasteValue
    }
  }

  return null
}

function getSlideEditObjectImageCropDirectJSONPasteValue({
  payloadLength,
  sourceType,
  value,
  wrapper,
}: {
  payloadLength: number
  sourceType: string
  value: unknown
  wrapper?: string
}): SlideEditObjectImageCropJSONPasteValue | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  const record = value as Record<string, unknown>
  const sourceFields: SlideEditObjectImageCropSourceFields = wrapper
    ? { wrapper }
    : {}
  const crop: Partial<SlideEditObjectImageCropPosition> = {}
  let fit: SlideEditObjectImageCropFit | undefined

  if (Object.hasOwn(record, 'fit')) {
    fit = normalizeSlideEditObjectImageCropFit(
      typeof record.fit === 'string' ? record.fit : String(record.fit ?? ''),
    )
    sourceFields.fit = 'fit'
  }

  readSlideEditObjectImageCropPositionFields({
    crop,
    record: getSlideEditObjectImageCropRecord(record.crop),
    sourceFields,
    sourcePrefix: 'crop',
  })
  readSlideEditObjectImageCropPositionFields({
    crop,
    record,
    sourceFields,
    sourcePrefix: '',
  })

  const fields = SLIDE_EDIT_OBJECT_IMAGE_CROP_JSON_FIELDS.filter((field) =>
    field === 'fit' ? fit !== undefined : crop[field] !== undefined
  )

  if (fields.length === 0) {
    return null
  }

  return {
    crop,
    fields,
    ...(fit === undefined ? {} : { fit }),
    format: 'json',
    payloadLength,
    sourceFields,
    sourceType,
    surface: 'object-image-crop',
    ...(wrapper ? { wrapper } : {}),
  }
}

function readSlideEditObjectImageCropPositionFields({
  crop,
  record,
  sourceFields,
  sourcePrefix,
}: {
  crop: Partial<SlideEditObjectImageCropPosition>
  record: Record<string, unknown> | null
  sourceFields: SlideEditObjectImageCropSourceFields
  sourcePrefix: string
}) {
  if (!record) {
    return
  }

  for (const field of ['x', 'y'] as const) {
    if (!Object.hasOwn(record, field)) {
      continue
    }

    const fieldValue = getSlideEditObjectImageCropJSONNumber(record[field])

    crop[field] = normalizeSlideEditObjectImageCropValue(
      fieldValue,
      SLIDE_EDIT_OBJECT_IMAGE_CROP_DEFAULT[field],
    )
    sourceFields[field] = sourcePrefix ? `${sourcePrefix}.${field}` : field
  }
}

function getSlideEditObjectImageCropRecord(value: unknown) {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null
}

function getSlideEditObjectImageCropJSONNumber(value: unknown) {
  if (typeof value === 'number') {
    return value
  }

  if (typeof value === 'string' && value.trim()) {
    return Number(value)
  }

  return null
}

function parseSlideEditObjectImageCropJSON(value: string) {
  if (!value.trim()) {
    return null
  }

  try {
    return JSON.parse(value) as unknown
  } catch {
    return null
  }
}
