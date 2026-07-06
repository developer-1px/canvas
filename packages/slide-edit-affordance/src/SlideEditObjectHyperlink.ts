import { getSlideEditJSONPasteTextCandidates } from './SlideEditTextJSONPaste'

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

export type SlideEditObjectHyperlinkUrlStoragePolicy = {
  blockedSchemes?: readonly string[]
  maxLength?: number
  rejectControlCharacters?: boolean
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

export type SlideEditObjectHyperlinkDataTransfer = Pick<
  DataTransfer,
  'getData'
>

export type SlideEditObjectHyperlinkPasteFieldValue = {
  fieldId: SlideEditObjectHyperlinkFieldId
  value: string | null
}

export type SlideEditObjectHyperlinkJSONPasteValue =
  | {
    fields: readonly SlideEditObjectHyperlinkPasteFieldValue[]
    hyperlink: SlideEditObjectHyperlink
    kind: 'set-hyperlink'
    surface: 'object-hyperlink'
  }
  | {
    hyperlink: SlideEditObjectHyperlink
    kind: 'remove-hyperlink'
    surface: 'object-hyperlink'
  }

export type SlideEditObjectHyperlinkJSONPasteInput = {
  allowedSchemes?: readonly string[]
  dataTransfer: SlideEditObjectHyperlinkDataTransfer | null
  jsonMimeType?: string
  storagePolicy?: SlideEditObjectHyperlinkUrlStoragePolicy
}

export type SlideEditObjectHyperlinkJSONPasteValueMode =
  | 'direct'
  | 'wrapped'

export type SlideEditObjectHyperlinkJSONPasteValueOptions = {
  allowedSchemes?: readonly string[]
  mode?: SlideEditObjectHyperlinkJSONPasteValueMode
  storagePolicy?: SlideEditObjectHyperlinkUrlStoragePolicy
}

export type SlideEditObjectHyperlinkPasteCommandsInput<
  TSlideId extends SlideEditObjectHyperlinkSlideId =
    SlideEditObjectHyperlinkSlideId,
  TObjectId extends SlideEditObjectHyperlinkObjectId =
    SlideEditObjectHyperlinkObjectId,
> = {
  objectId: TObjectId
  pasteValue: SlideEditObjectHyperlinkJSONPasteValue
  slideId: TSlideId
}

type SlideEditObjectHyperlinkJSONPasteOptions = {
  allowedSchemes: readonly string[]
  storagePolicy: SlideEditObjectHyperlinkUrlStoragePolicy
}

export const SLIDE_EDIT_OBJECT_HYPERLINK_DATA_ATTRIBUTE =
  'data-slide-object-hyperlink'

export const SLIDE_EDIT_OBJECT_HYPERLINK_JSON_MIME_TYPE =
  'application/vnd.interactive-os.slide-edit.object-hyperlink+json'

export const SLIDE_EDIT_OBJECT_HYPERLINK_JSON_TYPES = Object.freeze([
  'application/json',
  'text/json',
  'text/plain',
] as const)

export const SLIDE_EDIT_OBJECT_HYPERLINK_JSON_WRAPPER_KEYS = Object.freeze([
  'objectHyperlink',
  'hyperlink',
  'link',
] as const)

const SLIDE_EDIT_OBJECT_HYPERLINK_DIRECT_URL_KEYS = Object.freeze([
  'url',
  'href',
  'value',
] as const)

const SLIDE_EDIT_OBJECT_HYPERLINK_INVALID_JSON = Symbol(
  'slide-edit-object-hyperlink-invalid-json',
)

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

export function getSlideEditObjectHyperlinkJSONPasteValue({
  allowedSchemes = SLIDE_EDIT_OBJECT_HYPERLINK_ALLOWED_SCHEMES,
  dataTransfer,
  jsonMimeType = SLIDE_EDIT_OBJECT_HYPERLINK_JSON_MIME_TYPE,
  storagePolicy = {},
}: SlideEditObjectHyperlinkJSONPasteInput):
  SlideEditObjectHyperlinkJSONPasteValue | null {
  if (!dataTransfer) {
    return null
  }

  if (jsonMimeType) {
    const customText = dataTransfer.getData(jsonMimeType)

    if (customText.trim()) {
      const customPasteValue = getSlideEditObjectHyperlinkJSONPasteValueFromText(
        customText,
        {
          allowedSchemes,
          mode: 'direct',
          storagePolicy,
        },
      )

      if (customPasteValue !== null) {
        return customPasteValue
      }
    }
  }

  for (const type of SLIDE_EDIT_OBJECT_HYPERLINK_JSON_TYPES) {
    const text = dataTransfer.getData(type)

    if (!text.trim()) {
      continue
    }

    const pasteValue = getSlideEditObjectHyperlinkJSONPasteValueFromText(
      text,
      {
        allowedSchemes,
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

export function getSlideEditObjectHyperlinkJSONPasteValueFromText(
  text: string,
  options?: SlideEditObjectHyperlinkJSONPasteValueOptions,
): SlideEditObjectHyperlinkJSONPasteValue | null {
  return getSlideEditObjectHyperlinkJSONPasteValueFromValue(
    parseSlideEditObjectHyperlinkJSON(text),
    options,
  )
}

export function getSlideEditObjectHyperlinkJSONPasteValueFromValue(
  value: unknown,
  {
    allowedSchemes = SLIDE_EDIT_OBJECT_HYPERLINK_ALLOWED_SCHEMES,
    mode = 'direct',
    storagePolicy = {},
  }: SlideEditObjectHyperlinkJSONPasteValueOptions = {},
): SlideEditObjectHyperlinkJSONPasteValue | null {
  const options = {
    allowedSchemes,
    storagePolicy,
  } satisfies SlideEditObjectHyperlinkJSONPasteOptions

  return mode === 'wrapped'
    ? getSlideEditObjectHyperlinkWrappedPasteValue(value, options)
    : getSlideEditObjectHyperlinkDirectPasteValue(value, options)
}

export function getSlideEditObjectHyperlinkPasteCommands<
  TSlideId extends SlideEditObjectHyperlinkSlideId,
  TObjectId extends SlideEditObjectHyperlinkObjectId,
>({
  objectId,
  pasteValue,
  slideId,
}: SlideEditObjectHyperlinkPasteCommandsInput<TSlideId, TObjectId>):
  readonly SlideEditObjectHyperlinkCommand<TSlideId, TObjectId>[] {
  if (pasteValue.kind === 'remove-hyperlink') {
    return [
      {
        id: 'remove-object-hyperlink',
        objectId,
        slideId,
      },
    ]
  }

  return pasteValue.fields.map((field) => ({
    fieldId: field.fieldId,
    id: 'update-object-hyperlink',
    objectId,
    slideId,
    value: field.value,
  }))
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

export function normalizeSlideEditObjectHyperlinkStorageUrl(
  value: string | null | undefined,
  {
    blockedSchemes = [],
    maxLength,
    rejectControlCharacters = true,
  }: SlideEditObjectHyperlinkUrlStoragePolicy = {},
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
    hasSlideEditObjectHyperlinkControlCharacter(normalizedValue)
  ) {
    return null
  }

  const scheme = getSlideEditObjectHyperlinkScheme(normalizedValue)

  if (
    scheme &&
    blockedSchemes.map((blockedScheme) =>
      blockedScheme.toLowerCase()
    ).includes(scheme)
  ) {
    return null
  }

  return normalizedValue
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

function hasSlideEditObjectHyperlinkControlCharacter(value: string) {
  return [...value].some((char) => {
    const code = char.charCodeAt(0)

    return code <= 31 || code === 127
  })
}

function getSlideEditObjectHyperlinkDirectPasteValue(
  value: unknown,
  options: SlideEditObjectHyperlinkJSONPasteOptions,
): SlideEditObjectHyperlinkJSONPasteValue | null {
  const directUrlPasteValue = getSlideEditObjectHyperlinkURLPasteValue(
    value,
    options,
  )

  if (directUrlPasteValue !== null) {
    return directUrlPasteValue
  }

  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  const record = value as Record<string, unknown>

  for (const key of SLIDE_EDIT_OBJECT_HYPERLINK_DIRECT_URL_KEYS) {
    if (!Object.hasOwn(record, key)) {
      continue
    }

    const pasteValue = getSlideEditObjectHyperlinkURLPasteValue(
      record[key],
      options,
      record,
    )

    if (pasteValue !== null) {
      return pasteValue
    }
  }

  return null
}

function getSlideEditObjectHyperlinkWrappedPasteValue(
  value: unknown,
  options: SlideEditObjectHyperlinkJSONPasteOptions,
): SlideEditObjectHyperlinkJSONPasteValue | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  const record = value as Record<string, unknown>

  for (const key of SLIDE_EDIT_OBJECT_HYPERLINK_JSON_WRAPPER_KEYS) {
    if (!Object.hasOwn(record, key)) {
      continue
    }

    const pasteValue = getSlideEditObjectHyperlinkDirectPasteValue(
      record[key],
      options,
    )

    if (pasteValue !== null) {
      return pasteValue
    }
  }

  return null
}

function getSlideEditObjectHyperlinkURLPasteValue(
  value: unknown,
  {
    allowedSchemes,
    storagePolicy,
  }: SlideEditObjectHyperlinkJSONPasteOptions,
  context?: Record<string, unknown>,
): SlideEditObjectHyperlinkJSONPasteValue | null {
  if (value === null || value === false) {
    return getSlideEditObjectHyperlinkRemovePasteValue()
  }

  if (typeof value !== 'string') {
    return null
  }

  if (!value.trim()) {
    return getSlideEditObjectHyperlinkRemovePasteValue()
  }

  const normalizedUrl = normalizeSlideEditObjectHyperlinkStorageUrl(
    value,
    storagePolicy,
  )

  if (normalizedUrl === null) {
    return null
  }

  const validation = getSlideEditObjectHyperlinkValidation({
    allowedSchemes,
    url: normalizedUrl,
  })

  if (!validation.isAllowed) {
    return null
  }

  return getSlideEditObjectHyperlinkSetPasteValue({
    context,
    url: normalizedUrl,
  })
}

function getSlideEditObjectHyperlinkSetPasteValue({
  context,
  url,
}: {
  context?: Record<string, unknown>
  url: string
}): SlideEditObjectHyperlinkJSONPasteValue {
  const hasTarget = context ? Object.hasOwn(context, 'target') : false
  const hasTitle = context ? Object.hasOwn(context, 'title') : false
  const target = hasTarget
    ? normalizeSlideEditObjectHyperlinkTarget(
      getSlideEditObjectHyperlinkString(context?.target),
    )
    : SLIDE_EDIT_OBJECT_HYPERLINK_DEFAULT.target
  const title = hasTitle
    ? normalizeSlideEditObjectHyperlinkTitle(
      getSlideEditObjectHyperlinkString(context?.title),
    )
    : SLIDE_EDIT_OBJECT_HYPERLINK_DEFAULT.title
  const fields: SlideEditObjectHyperlinkPasteFieldValue[] = [
    {
      fieldId: 'url',
      value: url,
    },
  ]

  if (hasTarget) {
    fields.push({
      fieldId: 'target',
      value: target,
    })
  }

  if (hasTitle) {
    fields.push({
      fieldId: 'title',
      value: title,
    })
  }

  return {
    fields,
    hyperlink: {
      target,
      title,
      url,
    },
    kind: 'set-hyperlink',
    surface: 'object-hyperlink',
  }
}

function getSlideEditObjectHyperlinkRemovePasteValue():
  SlideEditObjectHyperlinkJSONPasteValue {
  return {
    hyperlink: {
      ...SLIDE_EDIT_OBJECT_HYPERLINK_DEFAULT,
    },
    kind: 'remove-hyperlink',
    surface: 'object-hyperlink',
  }
}

function getSlideEditObjectHyperlinkString(value: unknown) {
  return typeof value === 'string' ? value : null
}

function parseSlideEditObjectHyperlinkJSON(value: string) {
  const candidates = getSlideEditJSONPasteTextCandidates(value)

  if (candidates.length === 0) {
    return null
  }

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate) as unknown
    } catch {
      // Try the next candidate before marking the payload invalid.
    }
  }

  return SLIDE_EDIT_OBJECT_HYPERLINK_INVALID_JSON
}
