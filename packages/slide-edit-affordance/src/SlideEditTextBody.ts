export type SlideEditTextBodySlideId = string
export type SlideEditTextBodyObjectId = string

export type SlideEditTextBodyDataTransfer = Pick<DataTransfer, 'getData'>

export type SlideEditTextBodyRun = {
  text: string
}

export type SlideEditTextBodyParagraph = {
  runs: readonly SlideEditTextBodyRun[]
  text: string
}

export type SlideEditTextBody = {
  paragraphs: readonly SlideEditTextBodyParagraph[]
}

export type SlideEditTextBodyStoragePolicy = {
  maxParagraphs?: number
  maxRunsPerParagraph?: number
  maxTextLength?: number
}

export type SlideEditTextBodyJSONPasteValue = {
  body: SlideEditTextBody
  format: 'json'
  paragraphCount: number
  payloadLength: number
  rawBody: unknown
  rawPayload: unknown
  runCount: number
  sourceType: string
  surface: 'text-body'
  wrapper?: string
}

export type SlideEditTextBodyJSONPasteInput = {
  dataTransfer: SlideEditTextBodyDataTransfer | null
  jsonMimeType?: string
  storagePolicy?: SlideEditTextBodyStoragePolicy
}

export type SlideEditTextBodyJSONPasteValueMode =
  | 'direct'
  | 'wrapped'

export type SlideEditTextBodyJSONPasteValueOptions = {
  mode?: SlideEditTextBodyJSONPasteValueMode
  sourceType?: string
  storagePolicy?: SlideEditTextBodyStoragePolicy
}

export type SlideEditTextBodyReplaceTarget<
  TObjectId extends SlideEditTextBodyObjectId = SlideEditTextBodyObjectId,
> = {
  isHidden?: boolean
  isLocked?: boolean
  isTextEditable?: boolean
  objectId: TObjectId
}

export type SlideEditTextBodyReplaceCommand<
  TObjectId extends SlideEditTextBodyObjectId = SlideEditTextBodyObjectId,
  TBody = SlideEditTextBody,
> = {
  body: TBody
  id: 'replace-text-body'
  objectId: TObjectId
}

export type SlideEditTextBodyReplaceCommandMetadata<
  TObjectId extends SlideEditTextBodyObjectId = SlideEditTextBodyObjectId,
> = {
  format: 'json'
  paragraphCount: number
  payloadLength: number
  runCount: number
  targetIds: readonly TObjectId[]
}

export type SlideEditTextBodyReplaceHostCommandEffect<
  TSlideId extends SlideEditTextBodySlideId = SlideEditTextBodySlideId,
  TObjectId extends SlideEditTextBodyObjectId = SlideEditTextBodyObjectId,
  TBody = SlideEditTextBody,
> = {
  metadata: SlideEditTextBodyReplaceCommandMetadata<TObjectId>
  payload: SlideEditTextBodyReplaceCommand<TObjectId, TBody>
  selection: {
    objectIds: readonly TObjectId[]
    slideId?: TSlideId
  }
  type: 'slide-command-effect'
}

export type SlideEditTextBodyPasteCommandEffectInput<
  TSlideId extends SlideEditTextBodySlideId = SlideEditTextBodySlideId,
  TObjectId extends SlideEditTextBodyObjectId = SlideEditTextBodyObjectId,
  TBody = SlideEditTextBody,
> = {
  normalizeBody?: (
    input: SlideEditTextBodyJSONPasteValue
  ) => TBody | null
  pasteValue: SlideEditTextBodyJSONPasteValue
  slideId?: TSlideId
  target: SlideEditTextBodyReplaceTarget<TObjectId> | null
}

export const SLIDE_EDIT_TEXT_BODY_JSON_MIME_TYPE =
  'application/vnd.interactive-os.slide-edit.text-body+json'

export const SLIDE_EDIT_TEXT_BODY_JSON_TYPES = Object.freeze([
  'application/json',
  'text/json',
  'text/plain',
] as const)

export const SLIDE_EDIT_TEXT_BODY_JSON_WRAPPER_KEYS = Object.freeze([
  'textBody',
  'body',
  'content',
  'text',
  'plainText',
] as const)

export function getSlideEditTextBodyJSONPasteValue({
  dataTransfer,
  jsonMimeType = SLIDE_EDIT_TEXT_BODY_JSON_MIME_TYPE,
  storagePolicy = {},
}: SlideEditTextBodyJSONPasteInput): SlideEditTextBodyJSONPasteValue | null {
  if (!dataTransfer) {
    return null
  }

  if (jsonMimeType) {
    const customText = dataTransfer.getData(jsonMimeType)

    if (customText.trim()) {
      const customPasteValue = getSlideEditTextBodyJSONPasteValueFromText(
        customText,
        {
          mode: 'direct',
          sourceType: jsonMimeType,
          storagePolicy,
        },
      )

      if (customPasteValue !== null) {
        return customPasteValue
      }
    }
  }

  for (const type of SLIDE_EDIT_TEXT_BODY_JSON_TYPES) {
    const text = dataTransfer.getData(type)

    if (!text.trim()) {
      continue
    }

    const pasteValue = getSlideEditTextBodyJSONPasteValueFromText(
      text,
      {
        mode: 'wrapped',
        sourceType: type,
        storagePolicy,
      },
    )

    if (pasteValue !== null) {
      return pasteValue
    }
  }

  return null
}

export function getSlideEditTextBodyJSONPasteValueFromText(
  text: string,
  options?: SlideEditTextBodyJSONPasteValueOptions,
): SlideEditTextBodyJSONPasteValue | null {
  return getSlideEditTextBodyJSONPasteValueFromValue(
    parseSlideEditTextBodyJSON(text),
    {
      ...options,
      payloadLength: text.length,
    },
  )
}

export function getSlideEditTextBodyJSONPasteValueFromValue(
  value: unknown,
  {
    mode = 'direct',
    payloadLength = 0,
    sourceType = 'value',
    storagePolicy = {},
  }: SlideEditTextBodyJSONPasteValueOptions & {
    payloadLength?: number
  } = {},
): SlideEditTextBodyJSONPasteValue | null {
  return mode === 'wrapped'
    ? getSlideEditTextBodyWrappedJSONPasteValue({
        payloadLength,
        sourceType,
        storagePolicy,
        value,
      })
    : getSlideEditTextBodyDirectJSONPasteValue({
        payloadLength,
        rawPayload: value,
        sourceType,
        storagePolicy,
        value,
      })
}

export function getSlideEditTextBodyPasteCommandEffect<
  TSlideId extends SlideEditTextBodySlideId,
  TObjectId extends SlideEditTextBodyObjectId,
  TBody = SlideEditTextBody,
>({
  normalizeBody = ({ body }) => body as TBody,
  pasteValue,
  slideId,
  target,
}: SlideEditTextBodyPasteCommandEffectInput<TSlideId, TObjectId, TBody>):
  SlideEditTextBodyReplaceHostCommandEffect<TSlideId, TObjectId, TBody> | null {
  if (!target || target.isHidden || target.isLocked ||
    target.isTextEditable === false) {
    return null
  }

  const body = normalizeBody(pasteValue)

  if (body === null) {
    return null
  }

  return {
    metadata: {
      format: pasteValue.format,
      paragraphCount: pasteValue.paragraphCount,
      payloadLength: pasteValue.payloadLength,
      runCount: pasteValue.runCount,
      targetIds: [target.objectId],
    },
    payload: {
      body,
      id: 'replace-text-body',
      objectId: target.objectId,
    },
    selection: {
      objectIds: [target.objectId],
      ...(slideId === undefined ? {} : { slideId }),
    },
    type: 'slide-command-effect',
  }
}

function getSlideEditTextBodyWrappedJSONPasteValue({
  payloadLength,
  sourceType,
  storagePolicy,
  value,
}: {
  payloadLength: number
  sourceType: string
  storagePolicy: SlideEditTextBodyStoragePolicy
  value: unknown
}): SlideEditTextBodyJSONPasteValue | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  const record = value as Record<string, unknown>

  for (const key of SLIDE_EDIT_TEXT_BODY_JSON_WRAPPER_KEYS) {
    if (!Object.hasOwn(record, key)) {
      continue
    }

    const pasteValue = getSlideEditTextBodyDirectJSONPasteValue({
      payloadLength,
      rawPayload: value,
      sourceType,
      storagePolicy,
      value: record[key],
      wrapper: key,
    })

    if (pasteValue !== null) {
      return pasteValue
    }
  }

  return null
}

function getSlideEditTextBodyDirectJSONPasteValue({
  payloadLength,
  rawPayload,
  sourceType,
  storagePolicy,
  value,
  wrapper,
}: {
  payloadLength: number
  rawPayload: unknown
  sourceType: string
  storagePolicy: SlideEditTextBodyStoragePolicy
  value: unknown
  wrapper?: string
}): SlideEditTextBodyJSONPasteValue | null {
  const body = getSlideEditTextBodyValue(value, storagePolicy)

  if (body.paragraphs.length === 0) {
    return null
  }

  return {
    body,
    format: 'json',
    paragraphCount: body.paragraphs.length,
    payloadLength,
    rawBody: value,
    rawPayload,
    runCount: body.paragraphs.reduce(
      (count, paragraph) => count + paragraph.runs.length,
      0,
    ),
    sourceType,
    surface: 'text-body',
    ...(wrapper ? { wrapper } : {}),
  }
}

function getSlideEditTextBodyValue(
  value: unknown,
  storagePolicy: SlideEditTextBodyStoragePolicy,
): SlideEditTextBody {
  if (typeof value === 'string') {
    return {
      paragraphs: normalizeSlideEditTextBodyParagraphs(
        value.split(/\r?\n/),
        storagePolicy,
      ),
    }
  }

  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return { paragraphs: [] }
  }

  const record = value as Record<string, unknown>
  const text = getSlideEditTextBodyText(record.text) ??
    getSlideEditTextBodyText(record.plainText) ??
    getSlideEditTextBodyText(record.body) ??
    getSlideEditTextBodyText(record.content)

  if (text !== null) {
    return {
      paragraphs: normalizeSlideEditTextBodyParagraphs(
        text.split(/\r?\n/),
        storagePolicy,
      ),
    }
  }

  if (Array.isArray(record.paragraphs)) {
    return {
      paragraphs: normalizeSlideEditTextBodyParagraphs(
        record.paragraphs,
        storagePolicy,
      ),
    }
  }

  return { paragraphs: [] }
}

function normalizeSlideEditTextBodyParagraphs(
  values: readonly unknown[],
  storagePolicy: SlideEditTextBodyStoragePolicy,
) {
  const maxParagraphs = storagePolicy.maxParagraphs ?? Number.POSITIVE_INFINITY

  return values
    .slice(0, maxParagraphs)
    .flatMap((value, rowIndex) =>
      normalizeSlideEditTextBodyParagraph(value, rowIndex, storagePolicy) ?? [])
}

function normalizeSlideEditTextBodyParagraph(
  value: unknown,
  paragraphIndex: number,
  storagePolicy: SlideEditTextBodyStoragePolicy,
): SlideEditTextBodyParagraph | null {
  if (typeof value === 'string') {
    const text = normalizeSlideEditTextBodyText(value, storagePolicy)

    return text ? { runs: [{ text }], text } : null
  }

  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  const record = value as Record<string, unknown>
  const runs = Array.isArray(record.runs)
    ? normalizeSlideEditTextBodyRuns(record.runs, paragraphIndex, storagePolicy)
    : []
  const text = normalizeSlideEditTextBodyText(
    getSlideEditTextBodyText(record.text) ?? runs.map((run) => run.text).join(''),
    storagePolicy,
  )

  if (!text) {
    return null
  }

  return {
    runs: runs.length > 0 ? runs : [{ text }],
    text,
  }
}

function normalizeSlideEditTextBodyRuns(
  values: readonly unknown[],
  _paragraphIndex: number,
  storagePolicy: SlideEditTextBodyStoragePolicy,
) {
  const maxRuns = storagePolicy.maxRunsPerParagraph ?? Number.POSITIVE_INFINITY

  return values.slice(0, maxRuns).flatMap((value) => {
    const text = typeof value === 'string'
      ? normalizeSlideEditTextBodyText(value, storagePolicy)
      : value && typeof value === 'object' && !Array.isArray(value)
      ? normalizeSlideEditTextBodyText(
          getSlideEditTextBodyText((value as Record<string, unknown>).text),
          storagePolicy,
        )
      : null

    return text ? [{ text }] : []
  })
}

function normalizeSlideEditTextBodyText(
  value: string | null,
  storagePolicy: SlideEditTextBodyStoragePolicy,
) {
  if (value === null) {
    return null
  }

  const text = value.trim()

  if (!text) {
    return null
  }

  return storagePolicy.maxTextLength === undefined
    ? text
    : text.slice(0, storagePolicy.maxTextLength)
}

function getSlideEditTextBodyText(value: unknown) {
  return typeof value === 'string' ? value : null
}

function parseSlideEditTextBodyJSON(value: string) {
  if (!value.trim()) {
    return null
  }

  try {
    return JSON.parse(value) as unknown
  } catch {
    return null
  }
}
