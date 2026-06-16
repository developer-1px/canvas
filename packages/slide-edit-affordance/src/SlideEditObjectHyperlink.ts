export type SlideEditObjectHyperlinkSlideId = string
export type SlideEditObjectHyperlinkObjectId = string

export type SlideEditObjectHyperlinkTarget =
  | 'new-context'
  | 'same-context'

export type SlideEditObjectHyperlink = {
  target: SlideEditObjectHyperlinkTarget
  title: string
  url: string | null
}

export type SlideEditObjectHyperlinkFieldId =
  | 'target'
  | 'title'
  | 'url'

export type SlideEditObjectHyperlinkFieldControl =
  | 'select'
  | 'text'
  | 'url'

export type SlideEditObjectHyperlinkFieldDescriptor = {
  allowedSchemes?: readonly string[]
  commandId: 'update-object-hyperlink'
  control: SlideEditObjectHyperlinkFieldControl
  id: SlideEditObjectHyperlinkFieldId
  options?: readonly SlideEditObjectHyperlinkTargetOption[]
  requiredAdapterSlot: 'command-effect'
}

export type SlideEditObjectHyperlinkTargetOption = {
  id: SlideEditObjectHyperlinkTarget
  label: string
}

export type SlideEditObjectHyperlinkValidation = {
  isAllowed: boolean
  reason?:
    | 'empty-url'
    | 'missing-scheme'
    | 'unsupported-scheme'
}

export type SlideEditObjectHyperlinkMetadata = {
  attribute: typeof SLIDE_EDIT_OBJECT_HYPERLINK_DATA_ATTRIBUTE
  attributeValue: string
  defaultValue: 'none'
  hyperlink: SlideEditObjectHyperlink
  isEnabled: boolean
  validation: SlideEditObjectHyperlinkValidation
}

export type SlideEditObjectHyperlinkDescriptor<
  TSlideId extends SlideEditObjectHyperlinkSlideId =
    SlideEditObjectHyperlinkSlideId,
  TObjectId extends SlideEditObjectHyperlinkObjectId =
    SlideEditObjectHyperlinkObjectId,
> = {
  fields: readonly SlideEditObjectHyperlinkFieldDescriptor[]
  hyperlink: SlideEditObjectHyperlink
  metadata: SlideEditObjectHyperlinkMetadata
  objectId: TObjectId
  slideId: TSlideId
  surface: 'object-hyperlink'
}

export type SlideEditObjectHyperlinkUpdateCommand<
  TSlideId extends SlideEditObjectHyperlinkSlideId =
    SlideEditObjectHyperlinkSlideId,
  TObjectId extends SlideEditObjectHyperlinkObjectId =
    SlideEditObjectHyperlinkObjectId,
> = {
  fieldId: SlideEditObjectHyperlinkFieldId
  id: 'update-object-hyperlink'
  objectId: TObjectId
  slideId: TSlideId
  value: string | null
}

export type SlideEditObjectHyperlinkRemoveCommand<
  TSlideId extends SlideEditObjectHyperlinkSlideId =
    SlideEditObjectHyperlinkSlideId,
  TObjectId extends SlideEditObjectHyperlinkObjectId =
    SlideEditObjectHyperlinkObjectId,
> = {
  id: 'remove-object-hyperlink'
  objectId: TObjectId
  slideId: TSlideId
}

export type SlideEditObjectHyperlinkCommand<
  TSlideId extends SlideEditObjectHyperlinkSlideId =
    SlideEditObjectHyperlinkSlideId,
  TObjectId extends SlideEditObjectHyperlinkObjectId =
    SlideEditObjectHyperlinkObjectId,
> =
  | SlideEditObjectHyperlinkRemoveCommand<TSlideId, TObjectId>
  | SlideEditObjectHyperlinkUpdateCommand<TSlideId, TObjectId>

export type SlideEditObjectHyperlinkHostCommandEffect<
  TSlideId extends SlideEditObjectHyperlinkSlideId =
    SlideEditObjectHyperlinkSlideId,
  TObjectId extends SlideEditObjectHyperlinkObjectId =
    SlideEditObjectHyperlinkObjectId,
> = {
  payload: SlideEditObjectHyperlinkCommand<TSlideId, TObjectId>
  selection: {
    objectIds: readonly TObjectId[]
    slideId: TSlideId
  }
  type: 'slide-command-effect'
}

export const SLIDE_EDIT_OBJECT_HYPERLINK_DATA_ATTRIBUTE =
  'data-slide-object-hyperlink'

export const SLIDE_EDIT_OBJECT_HYPERLINK_DEFAULT = Object.freeze({
  target: 'same-context',
  title: '',
  url: null,
} as const satisfies SlideEditObjectHyperlink)

export const SLIDE_EDIT_OBJECT_HYPERLINK_ALLOWED_SCHEMES = Object.freeze([
  'https',
  'http',
  'mailto',
] as const)

export const SLIDE_EDIT_OBJECT_HYPERLINK_TARGET_OPTIONS = Object.freeze([
  {
    id: 'same-context',
    label: 'Same context',
  },
  {
    id: 'new-context',
    label: 'New context',
  },
] as const satisfies readonly SlideEditObjectHyperlinkTargetOption[])

export const SLIDE_EDIT_OBJECT_HYPERLINK_FIELDS = Object.freeze([
  {
    allowedSchemes: SLIDE_EDIT_OBJECT_HYPERLINK_ALLOWED_SCHEMES,
    commandId: 'update-object-hyperlink',
    control: 'url',
    id: 'url',
    requiredAdapterSlot: 'command-effect',
  },
  {
    commandId: 'update-object-hyperlink',
    control: 'select',
    id: 'target',
    options: SLIDE_EDIT_OBJECT_HYPERLINK_TARGET_OPTIONS,
    requiredAdapterSlot: 'command-effect',
  },
  {
    commandId: 'update-object-hyperlink',
    control: 'text',
    id: 'title',
    requiredAdapterSlot: 'command-effect',
  },
] as const satisfies readonly SlideEditObjectHyperlinkFieldDescriptor[])

export function createSlideEditObjectHyperlinkDescriptor<
  TSlideId extends SlideEditObjectHyperlinkSlideId,
  TObjectId extends SlideEditObjectHyperlinkObjectId,
>({
  allowedSchemes = SLIDE_EDIT_OBJECT_HYPERLINK_ALLOWED_SCHEMES,
  fields = SLIDE_EDIT_OBJECT_HYPERLINK_FIELDS,
  hyperlink = SLIDE_EDIT_OBJECT_HYPERLINK_DEFAULT,
  objectId,
  slideId,
}: {
  allowedSchemes?: readonly string[]
  fields?: readonly SlideEditObjectHyperlinkFieldDescriptor[]
  hyperlink?: Partial<SlideEditObjectHyperlink> | null
  objectId: TObjectId
  slideId: TSlideId
}): SlideEditObjectHyperlinkDescriptor<TSlideId, TObjectId> {
  const normalizedHyperlink = normalizeSlideEditObjectHyperlink(hyperlink)

  return {
    fields,
    hyperlink: normalizedHyperlink,
    metadata: getSlideEditObjectHyperlinkMetadata({
      allowedSchemes,
      hyperlink: normalizedHyperlink,
    }),
    objectId,
    slideId,
    surface: 'object-hyperlink',
  }
}

export function getSlideEditObjectHyperlinkCommandEffect<
  TSlideId extends SlideEditObjectHyperlinkSlideId,
  TObjectId extends SlideEditObjectHyperlinkObjectId,
>(
  command: SlideEditObjectHyperlinkCommand<TSlideId, TObjectId>,
): SlideEditObjectHyperlinkHostCommandEffect<TSlideId, TObjectId> {
  return {
    payload: normalizeSlideEditObjectHyperlinkCommand(command),
    selection: {
      objectIds: [command.objectId],
      slideId: command.slideId,
    },
    type: 'slide-command-effect',
  }
}

export function normalizeSlideEditObjectHyperlinkCommand<
  TSlideId extends SlideEditObjectHyperlinkSlideId,
  TObjectId extends SlideEditObjectHyperlinkObjectId,
>(
  command: SlideEditObjectHyperlinkCommand<TSlideId, TObjectId>,
): SlideEditObjectHyperlinkCommand<TSlideId, TObjectId> {
  if (command.id === 'remove-object-hyperlink') {
    return command
  }

  return {
    ...command,
    value: normalizeSlideEditObjectHyperlinkFieldValue(
      command.fieldId,
      command.value,
    ),
  }
}

export function getSlideEditObjectHyperlinkMetadata({
  allowedSchemes = SLIDE_EDIT_OBJECT_HYPERLINK_ALLOWED_SCHEMES,
  hyperlink,
}: {
  allowedSchemes?: readonly string[]
  hyperlink: Partial<SlideEditObjectHyperlink> | null | undefined
}): SlideEditObjectHyperlinkMetadata {
  const normalizedHyperlink = normalizeSlideEditObjectHyperlink(hyperlink)
  const validation = getSlideEditObjectHyperlinkValidation({
    allowedSchemes,
    url: normalizedHyperlink.url,
  })
  const isEnabled = validation.isAllowed

  return {
    attribute: SLIDE_EDIT_OBJECT_HYPERLINK_DATA_ATTRIBUTE,
    attributeValue: isEnabled
      ? toSlideEditObjectHyperlinkAttributeValue(normalizedHyperlink)
      : 'none',
    defaultValue: 'none',
    hyperlink: normalizedHyperlink,
    isEnabled,
    validation,
  }
}

export function normalizeSlideEditObjectHyperlink(
  hyperlink: Partial<SlideEditObjectHyperlink> | null | undefined,
): SlideEditObjectHyperlink {
  return {
    target: normalizeSlideEditObjectHyperlinkTarget(hyperlink?.target),
    title: normalizeSlideEditObjectHyperlinkTitle(hyperlink?.title),
    url: normalizeSlideEditObjectHyperlinkUrl(hyperlink?.url),
  }
}

export function normalizeSlideEditObjectHyperlinkFieldValue(
  fieldId: SlideEditObjectHyperlinkFieldId,
  value: string | null,
) {
  if (fieldId === 'target') {
    return normalizeSlideEditObjectHyperlinkTarget(value)
  }

  if (fieldId === 'title') {
    return normalizeSlideEditObjectHyperlinkTitle(value)
  }

  return normalizeSlideEditObjectHyperlinkUrl(value)
}

export function getSlideEditObjectHyperlinkValidation({
  allowedSchemes = SLIDE_EDIT_OBJECT_HYPERLINK_ALLOWED_SCHEMES,
  url,
}: {
  allowedSchemes?: readonly string[]
  url: string | null | undefined
}): SlideEditObjectHyperlinkValidation {
  const normalizedUrl = normalizeSlideEditObjectHyperlinkUrl(url)

  if (!normalizedUrl) {
    return {
      isAllowed: false,
      reason: 'empty-url',
    }
  }

  const scheme = getSlideEditObjectHyperlinkScheme(normalizedUrl)

  if (!scheme) {
    return {
      isAllowed: false,
      reason: 'missing-scheme',
    }
  }

  if (!allowedSchemes.map((allowedScheme) =>
    allowedScheme.toLowerCase()
  ).includes(scheme)) {
    return {
      isAllowed: false,
      reason: 'unsupported-scheme',
    }
  }

  return {
    isAllowed: true,
  }
}

export function shouldEmitSlideEditObjectHyperlinkMetadata({
  allowedSchemes = SLIDE_EDIT_OBJECT_HYPERLINK_ALLOWED_SCHEMES,
  hyperlink,
}: {
  allowedSchemes?: readonly string[]
  hyperlink: Partial<SlideEditObjectHyperlink> | null | undefined
}) {
  return getSlideEditObjectHyperlinkMetadata({
    allowedSchemes,
    hyperlink,
  }).isEnabled
}

export function toSlideEditObjectHyperlinkAttributeValue(
  hyperlink: Partial<SlideEditObjectHyperlink> | null | undefined,
) {
  const normalizedHyperlink = normalizeSlideEditObjectHyperlink(hyperlink)

  if (!normalizedHyperlink.url) {
    return 'none'
  }

  return JSON.stringify(normalizedHyperlink)
}

function normalizeSlideEditObjectHyperlinkTarget(
  value: string | null | undefined,
): SlideEditObjectHyperlinkTarget {
  return value === 'new-context' ? 'new-context' : 'same-context'
}

function normalizeSlideEditObjectHyperlinkTitle(
  value: string | null | undefined,
) {
  return value?.trim() ?? ''
}

function normalizeSlideEditObjectHyperlinkUrl(
  value: string | null | undefined,
) {
  const normalizedValue = value?.trim()

  return normalizedValue ? normalizedValue : null
}

function getSlideEditObjectHyperlinkScheme(url: string) {
  return url.match(/^([a-z][a-z0-9+.-]*):/i)?.[1]?.toLowerCase() ?? null
}
