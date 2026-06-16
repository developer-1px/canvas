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
