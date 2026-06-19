export type SlideEditObjectImageReplaceSlideId = string
export type SlideEditObjectImageReplaceObjectId = string

export type SlideEditObjectImageReplaceSource = {
  altText?: string
  mimeType: string
  name?: string
  naturalHeight?: number
  naturalWidth?: number
  src: string
}

export type SlideEditObjectImageReplaceUnsupportedReason =
  | 'locked-object'
  | 'mixed-selection'
  | 'unsupported-object'

export type SlideEditObjectImageReplaceFieldDescriptor = {
  accept: 'image/*'
  commandId: 'replace-object-image'
  control: 'image-source-file-input'
  id: 'source'
  requiredAdapterSlot: 'command-effect'
}

export type SlideEditObjectImageReplaceMetadata = {
  attribute: typeof SLIDE_EDIT_OBJECT_IMAGE_REPLACE_DATA_ATTRIBUTE
  attributeValue: 'ready' | 'unsupported'
  isSupported: boolean
  unsupportedReason?: SlideEditObjectImageReplaceUnsupportedReason
}

export type SlideEditObjectImageReplaceDescriptor<
  TSlideId extends SlideEditObjectImageReplaceSlideId =
    SlideEditObjectImageReplaceSlideId,
  TObjectId extends SlideEditObjectImageReplaceObjectId =
    SlideEditObjectImageReplaceObjectId,
> = {
  field: SlideEditObjectImageReplaceFieldDescriptor
  isSupported: boolean
  metadata: SlideEditObjectImageReplaceMetadata
  objectId: TObjectId
  slideId: TSlideId
  sourceName?: string
  surface: 'object-image-replace'
  unsupportedReason?: SlideEditObjectImageReplaceUnsupportedReason
}

export type SlideEditObjectImageReplaceCommand<
  TSlideId extends SlideEditObjectImageReplaceSlideId =
    SlideEditObjectImageReplaceSlideId,
  TObjectId extends SlideEditObjectImageReplaceObjectId =
    SlideEditObjectImageReplaceObjectId,
> = {
  id: 'replace-object-image'
  objectId: TObjectId
  slideId: TSlideId
  source: SlideEditObjectImageReplaceSource
}

export type SlideEditObjectImageReplaceHostCommandEffect<
  TSlideId extends SlideEditObjectImageReplaceSlideId =
    SlideEditObjectImageReplaceSlideId,
  TObjectId extends SlideEditObjectImageReplaceObjectId =
    SlideEditObjectImageReplaceObjectId,
> = {
  payload: SlideEditObjectImageReplaceCommand<TSlideId, TObjectId>
  selection: {
    objectIds: readonly TObjectId[]
    slideId: TSlideId
  }
  type: 'slide-command-effect'
}

export type SlideEditObjectImageReplaceDataTransfer = Pick<
  DataTransfer,
  'getData'
>

export type SlideEditObjectImageReplaceSourceFields = {
  altText?: string
  mimeType?: string
  name?: string
  naturalHeight?: string
  naturalWidth?: string
  src: string
  wrapper?: string
}

export type SlideEditObjectImageReplaceJSONPasteValue = {
  source: SlideEditObjectImageReplaceSource
  sourceFields: SlideEditObjectImageReplaceSourceFields
  surface: 'object-image-replace'
}

export type SlideEditObjectImageReplaceJSONPasteInput = {
  dataTransfer: SlideEditObjectImageReplaceDataTransfer | null
  jsonMimeType?: string
}

export type SlideEditObjectImageReplaceJSONPasteValueMode =
  | 'direct'
  | 'wrapped'

export type SlideEditObjectImageReplaceJSONPasteValueOptions = {
  mode?: SlideEditObjectImageReplaceJSONPasteValueMode
}

export type SlideEditObjectImageReplacePasteTarget<
  TObjectId extends SlideEditObjectImageReplaceObjectId =
    SlideEditObjectImageReplaceObjectId,
> = {
  isHidden?: boolean
  isLocked?: boolean
  isSupported?: boolean
  objectId: TObjectId
  unsupportedReason?: SlideEditObjectImageReplaceUnsupportedReason
}

export type SlideEditObjectImageReplacePasteAppliedTarget<
  TObjectId extends SlideEditObjectImageReplaceObjectId =
    SlideEditObjectImageReplaceObjectId,
> = {
  commandId: 'replace-object-image'
  effectType: 'slide-command-effect'
  objectId: TObjectId
  sourceFields: SlideEditObjectImageReplaceSourceFields
}

export type SlideEditObjectImageReplacePasteRoute<
  TSlideId extends SlideEditObjectImageReplaceSlideId =
    SlideEditObjectImageReplaceSlideId,
  TObjectId extends SlideEditObjectImageReplaceObjectId =
    SlideEditObjectImageReplaceObjectId,
> =
  | {
    appliedTarget: SlideEditObjectImageReplacePasteAppliedTarget<TObjectId>
    effect: SlideEditObjectImageReplaceHostCommandEffect<TSlideId, TObjectId>
    pasteValue: SlideEditObjectImageReplaceJSONPasteValue
    status: 'available'
  }
  | {
    pasteValue: SlideEditObjectImageReplaceJSONPasteValue
    reason: SlideEditObjectImageReplaceUnsupportedReason
    status: 'unavailable'
  }

export type SlideEditObjectImageReplacePasteCommandEffectInput<
  TSlideId extends SlideEditObjectImageReplaceSlideId =
    SlideEditObjectImageReplaceSlideId,
  TObjectId extends SlideEditObjectImageReplaceObjectId =
    SlideEditObjectImageReplaceObjectId,
> = {
  pasteValue: SlideEditObjectImageReplaceJSONPasteValue
  slideId: TSlideId
  targets: readonly SlideEditObjectImageReplacePasteTarget<TObjectId>[]
}

export const SLIDE_EDIT_OBJECT_IMAGE_REPLACE_DATA_ATTRIBUTE =
  'data-slide-object-image-replace'

export const SLIDE_EDIT_OBJECT_IMAGE_REPLACE_FIELD = Object.freeze({
  accept: 'image/*',
  commandId: 'replace-object-image',
  control: 'image-source-file-input',
  id: 'source',
  requiredAdapterSlot: 'command-effect',
} as const satisfies SlideEditObjectImageReplaceFieldDescriptor)

export function createSlideEditObjectImageReplaceDescriptor<
  TSlideId extends SlideEditObjectImageReplaceSlideId,
  TObjectId extends SlideEditObjectImageReplaceObjectId,
>({
  field = SLIDE_EDIT_OBJECT_IMAGE_REPLACE_FIELD,
  isSupported = true,
  objectId,
  slideId,
  sourceName,
  unsupportedReason,
}: {
  field?: SlideEditObjectImageReplaceFieldDescriptor
  isSupported?: boolean
  objectId: TObjectId
  slideId: TSlideId
  sourceName?: string
  unsupportedReason?: SlideEditObjectImageReplaceUnsupportedReason
}): SlideEditObjectImageReplaceDescriptor<TSlideId, TObjectId> {
  const normalizedUnsupportedReason = isSupported
    ? undefined
    : unsupportedReason ?? 'unsupported-object'

  return {
    field,
    isSupported,
    metadata: getSlideEditObjectImageReplaceMetadata({
      isSupported,
      unsupportedReason: normalizedUnsupportedReason,
    }),
    objectId,
    slideId,
    sourceName: normalizeSlideEditObjectImageReplaceOptionalText(sourceName),
    surface: 'object-image-replace',
    unsupportedReason: normalizedUnsupportedReason,
  }
}

export function getSlideEditObjectImageReplaceJSONPasteValue({
  dataTransfer,
  jsonMimeType = SLIDE_EDIT_OBJECT_IMAGE_REPLACE_JSON_MIME_TYPE,
}: SlideEditObjectImageReplaceJSONPasteInput):
  SlideEditObjectImageReplaceJSONPasteValue | null {
  if (!dataTransfer) {
    return null
  }

  if (jsonMimeType) {
    const customText = dataTransfer.getData(jsonMimeType)

    if (customText.trim()) {
      const customPasteValue =
        getSlideEditObjectImageReplaceJSONPasteValueFromText(customText)

      if (customPasteValue !== null) {
        return customPasteValue
      }
    }
  }

  for (const type of SLIDE_EDIT_OBJECT_IMAGE_REPLACE_JSON_TYPES) {
    const text = dataTransfer.getData(type)

    if (!text.trim()) {
      continue
    }

    const pasteValue = getSlideEditObjectImageReplaceJSONPasteValueFromText(
      text,
      { mode: 'wrapped' },
    )

    if (pasteValue !== null) {
      return pasteValue
    }
  }

  return null
}

export function getSlideEditObjectImageReplaceJSONPasteValueFromText(
  text: string,
  options?: SlideEditObjectImageReplaceJSONPasteValueOptions,
): SlideEditObjectImageReplaceJSONPasteValue | null {
  return getSlideEditObjectImageReplaceJSONPasteValueFromValue(
    parseSlideEditObjectImageReplaceJSON(text),
    options,
  )
}

export function getSlideEditObjectImageReplaceJSONPasteValueFromValue(
  value: unknown,
  {
    mode = 'direct',
  }: SlideEditObjectImageReplaceJSONPasteValueOptions = {},
): SlideEditObjectImageReplaceJSONPasteValue | null {
  return mode === 'wrapped'
    ? getSlideEditObjectImageReplaceWrappedPasteValue(value)
    : getSlideEditObjectImageReplaceDirectPasteValue(value)
}

export function getSlideEditObjectImageReplacePasteCommandEffect<
  TSlideId extends SlideEditObjectImageReplaceSlideId,
  TObjectId extends SlideEditObjectImageReplaceObjectId,
>({
  pasteValue,
  slideId,
  targets,
}: SlideEditObjectImageReplacePasteCommandEffectInput<TSlideId, TObjectId>):
  SlideEditObjectImageReplacePasteRoute<TSlideId, TObjectId> {
  if (targets.length !== 1) {
    return {
      pasteValue,
      reason: 'mixed-selection',
      status: 'unavailable',
    }
  }

  const target = targets[0]!

  if (target.isLocked) {
    return {
      pasteValue,
      reason: 'locked-object',
      status: 'unavailable',
    }
  }

  if (target.isHidden) {
    return {
      pasteValue,
      reason: 'hidden-object',
      status: 'unavailable',
    }
  }

  if (target.isSupported === false) {
    return {
      pasteValue,
      reason: target.unsupportedReason ?? 'unsupported-object',
      status: 'unavailable',
    }
  }

  const effect = getSlideEditObjectImageReplaceCommandEffect({
    id: 'replace-object-image',
    objectId: target.objectId,
    slideId,
    source: pasteValue.source,
  })

  return {
    appliedTarget: {
      commandId: effect.payload.id,
      effectType: effect.type,
      objectId: target.objectId,
      sourceFields: pasteValue.sourceFields,
    },
    effect,
    pasteValue,
    status: 'available',
  }
}

export function getSlideEditObjectImageReplaceCommandEffect<
  TSlideId extends SlideEditObjectImageReplaceSlideId,
  TObjectId extends SlideEditObjectImageReplaceObjectId,
>(
  command: SlideEditObjectImageReplaceCommand<TSlideId, TObjectId>,
): SlideEditObjectImageReplaceHostCommandEffect<TSlideId, TObjectId> {
  const payload = normalizeSlideEditObjectImageReplaceCommand(command)

  return {
    payload,
    selection: {
      objectIds: [payload.objectId],
      slideId: payload.slideId,
    },
    type: 'slide-command-effect',
  }
}

export function normalizeSlideEditObjectImageReplaceCommand<
  TSlideId extends SlideEditObjectImageReplaceSlideId,
  TObjectId extends SlideEditObjectImageReplaceObjectId,
>(
  command: SlideEditObjectImageReplaceCommand<TSlideId, TObjectId>,
): SlideEditObjectImageReplaceCommand<TSlideId, TObjectId> {
  return {
    ...command,
    source: normalizeSlideEditObjectImageReplaceSource(command.source),
  }
}

export function normalizeSlideEditObjectImageReplaceSource(
  source: SlideEditObjectImageReplaceSource,
): SlideEditObjectImageReplaceSource {
  const src = String(source.src ?? '').trim()

  return {
    altText: normalizeSlideEditObjectImageReplaceOptionalText(source.altText),
    mimeType: normalizeSlideEditObjectImageReplaceMimeType(
      source.mimeType || getSlideEditObjectImageReplaceDataUrlMimeType(src),
    ),
    name: normalizeSlideEditObjectImageReplaceOptionalText(source.name),
    naturalHeight: normalizeSlideEditObjectImageReplaceNaturalSize(
      source.naturalHeight,
    ),
    naturalWidth: normalizeSlideEditObjectImageReplaceNaturalSize(
      source.naturalWidth,
    ),
    src,
  }
}

export function getSlideEditObjectImageReplaceMetadata({
  isSupported = true,
  unsupportedReason,
}: {
  isSupported?: boolean
  unsupportedReason?: SlideEditObjectImageReplaceUnsupportedReason
} = {}): SlideEditObjectImageReplaceMetadata {
  return {
    attribute: SLIDE_EDIT_OBJECT_IMAGE_REPLACE_DATA_ATTRIBUTE,
    attributeValue: isSupported ? 'ready' : 'unsupported',
    isSupported,
    unsupportedReason: isSupported
      ? undefined
      : unsupportedReason ?? 'unsupported-object',
  }
}

function normalizeSlideEditObjectImageReplaceOptionalText(
  value: string | undefined,
) {
  const normalized = value?.trim()

  return normalized ? normalized : undefined
}

function normalizeSlideEditObjectImageReplaceNaturalSize(
  value: number | undefined,
) {
  if (value === undefined || !Number.isFinite(value) || value <= 0) {
    return undefined
  }

  return Math.round(value)
}

function normalizeSlideEditObjectImageReplaceMimeType(value: string) {
  const normalized = value.trim().toLowerCase()

  return /^image\/[a-z0-9.+-]+$/i.test(normalized)
    ? normalized
    : 'image/unknown'
}

function getSlideEditObjectImageReplaceDataUrlMimeType(src: string) {
  return src.match(/^data:([^;,]+)/i)?.[1] ?? ''
}
