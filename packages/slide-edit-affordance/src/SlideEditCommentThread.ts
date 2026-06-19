export type SlideEditCommentThreadSlideId = string
export type SlideEditCommentThreadCommentId = string
export type SlideEditCommentThreadMessageId = string

export type SlideEditCommentThreadDataTransfer = Pick<DataTransfer, 'getData'>

export type SlideEditCommentThreadStoragePolicy = {
  maxBodyLength?: number
  maxMessageBodyLength?: number
}

export type SlideEditCommentThreadMessage<
  TMessageId extends SlideEditCommentThreadMessageId =
    SlideEditCommentThreadMessageId,
> = {
  authorName?: string
  body: string
  createdAt?: string
  id?: TMessageId
}

export type SlideEditCommentThreadPatch<
  TMessageId extends SlideEditCommentThreadMessageId =
    SlideEditCommentThreadMessageId,
> = {
  body?: string
  createdAt?: string
  messages: readonly SlideEditCommentThreadMessage<TMessageId>[]
  resolved?: boolean
}

export type SlideEditCommentThreadJSONPasteValue<
  TMessageId extends SlideEditCommentThreadMessageId =
    SlideEditCommentThreadMessageId,
> = {
  fields: readonly SlideEditCommentThreadPatchField[]
  format: 'json'
  patch: SlideEditCommentThreadPatch<TMessageId>
  payloadLength: number
  sourceType: string
  surface: 'comment-thread'
  wrapper?: string
}

export type SlideEditCommentThreadPatchField =
  | 'body'
  | 'createdAt'
  | 'messages'
  | 'resolved'

export type SlideEditCommentThreadJSONPasteInput = {
  dataTransfer: SlideEditCommentThreadDataTransfer | null
  jsonMimeType?: string
  storagePolicy?: SlideEditCommentThreadStoragePolicy
}

export type SlideEditCommentThreadJSONPasteValueMode =
  | 'direct'
  | 'wrapped'

export type SlideEditCommentThreadJSONPasteValueOptions = {
  mode?: SlideEditCommentThreadJSONPasteValueMode
  sourceType?: string
  storagePolicy?: SlideEditCommentThreadStoragePolicy
}

export type SlideEditCommentThreadPatchTarget<
  TCommentId extends SlideEditCommentThreadCommentId =
    SlideEditCommentThreadCommentId,
> = {
  commentId: TCommentId
  isHidden?: boolean
  isLocked?: boolean
}

export type SlideEditCommentThreadMessageIdInput<
  TMessageId extends SlideEditCommentThreadMessageId =
    SlideEditCommentThreadMessageId,
> = {
  body: string
  index: number
  message: SlideEditCommentThreadMessage<TMessageId>
}

export type SlideEditCommentThreadPatchCommand<
  TCommentId extends SlideEditCommentThreadCommentId =
    SlideEditCommentThreadCommentId,
  TMessageId extends SlideEditCommentThreadMessageId =
    SlideEditCommentThreadMessageId,
> = {
  commentId: TCommentId
  id: 'patch-comment-thread'
  patch: SlideEditCommentThreadPatch<TMessageId>
}

export type SlideEditCommentThreadPatchCommandMetadata<
  TCommentId extends SlideEditCommentThreadCommentId =
    SlideEditCommentThreadCommentId,
> = {
  fields: readonly SlideEditCommentThreadPatchField[]
  format: 'json'
  messageCount: number
  payloadLength: number
  resolved?: boolean
  targetIds: readonly TCommentId[]
}

export type SlideEditCommentThreadPatchHostCommandEffect<
  TSlideId extends SlideEditCommentThreadSlideId =
    SlideEditCommentThreadSlideId,
  TCommentId extends SlideEditCommentThreadCommentId =
    SlideEditCommentThreadCommentId,
  TMessageId extends SlideEditCommentThreadMessageId =
    SlideEditCommentThreadMessageId,
> = {
  metadata: SlideEditCommentThreadPatchCommandMetadata<TCommentId>
  payload: SlideEditCommentThreadPatchCommand<TCommentId, TMessageId>
  selection: {
    commentIds: readonly TCommentId[]
    slideId?: TSlideId
  }
  type: 'slide-command-effect'
}

export type SlideEditCommentThreadPasteCommandEffectInput<
  TSlideId extends SlideEditCommentThreadSlideId =
    SlideEditCommentThreadSlideId,
  TCommentId extends SlideEditCommentThreadCommentId =
    SlideEditCommentThreadCommentId,
  TMessageId extends SlideEditCommentThreadMessageId =
    SlideEditCommentThreadMessageId,
> = {
  createMessageId?: (
    input: SlideEditCommentThreadMessageIdInput<TMessageId>
  ) => TMessageId
  pasteValue: SlideEditCommentThreadJSONPasteValue<TMessageId>
  slideId?: TSlideId
  target: SlideEditCommentThreadPatchTarget<TCommentId> | null
}

export const SLIDE_EDIT_COMMENT_THREAD_JSON_MIME_TYPE =
  'application/vnd.interactive-os.slide-edit.comment-thread+json'

export const SLIDE_EDIT_COMMENT_THREAD_JSON_TYPES = Object.freeze([
  'application/json',
  'text/json',
  'text/plain',
] as const)

export const SLIDE_EDIT_COMMENT_THREAD_JSON_WRAPPER_KEYS = Object.freeze([
  'comment',
  'commentThread',
  'reviewComment',
] as const)

export function getSlideEditCommentThreadJSONPasteValue({
  dataTransfer,
  jsonMimeType = SLIDE_EDIT_COMMENT_THREAD_JSON_MIME_TYPE,
  storagePolicy = {},
}: SlideEditCommentThreadJSONPasteInput):
  SlideEditCommentThreadJSONPasteValue | null {
  if (!dataTransfer) {
    return null
  }

  if (jsonMimeType) {
    const customText = dataTransfer.getData(jsonMimeType)

    if (customText.trim()) {
      const customPasteValue = getSlideEditCommentThreadJSONPasteValueFromText(
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

  for (const type of SLIDE_EDIT_COMMENT_THREAD_JSON_TYPES) {
    const text = dataTransfer.getData(type)

    if (!text.trim()) {
      continue
    }

    const pasteValue = getSlideEditCommentThreadJSONPasteValueFromText(
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

export function getSlideEditCommentThreadJSONPasteValueFromText(
  text: string,
  options?: SlideEditCommentThreadJSONPasteValueOptions,
): SlideEditCommentThreadJSONPasteValue | null {
  return getSlideEditCommentThreadJSONPasteValueFromValue(
    parseSlideEditCommentThreadJSON(text),
    {
      ...options,
      payloadLength: text.length,
    },
  )
}

export function getSlideEditCommentThreadJSONPasteValueFromValue(
  value: unknown,
  {
    mode = 'direct',
    payloadLength = 0,
    sourceType = 'value',
    storagePolicy = {},
  }: SlideEditCommentThreadJSONPasteValueOptions & {
    payloadLength?: number
  } = {},
): SlideEditCommentThreadJSONPasteValue | null {
  const input = {
    payloadLength,
    sourceType,
    storagePolicy,
    value,
  }

  return mode === 'wrapped'
    ? getSlideEditCommentThreadWrappedJSONPasteValue(input)
    : getSlideEditCommentThreadDirectJSONPasteValue(input)
}

export function getSlideEditCommentThreadPasteCommandEffect<
  TSlideId extends SlideEditCommentThreadSlideId,
  TCommentId extends SlideEditCommentThreadCommentId,
  TMessageId extends SlideEditCommentThreadMessageId,
>({
  createMessageId,
  pasteValue,
  slideId,
  target,
}: SlideEditCommentThreadPasteCommandEffectInput<
  TSlideId,
  TCommentId,
  TMessageId
>): SlideEditCommentThreadPatchHostCommandEffect<
  TSlideId,
  TCommentId,
  TMessageId
> | null {
  if (!target || target.isHidden || target.isLocked) {
    return null
  }

  const patch = createMessageId
    ? {
        ...pasteValue.patch,
        messages: pasteValue.patch.messages.map((message, index) => ({
          ...message,
          id: message.id ?? createMessageId({ body: message.body, index, message }),
        })),
      }
    : pasteValue.patch

  return {
    metadata: {
      fields: pasteValue.fields,
      format: pasteValue.format,
      messageCount: patch.messages.length,
      payloadLength: pasteValue.payloadLength,
      ...(patch.resolved === undefined ? {} : { resolved: patch.resolved }),
      targetIds: [target.commentId],
    },
    payload: {
      commentId: target.commentId,
      id: 'patch-comment-thread',
      patch,
    },
    selection: {
      commentIds: [target.commentId],
      ...(slideId === undefined ? {} : { slideId }),
    },
    type: 'slide-command-effect',
  }
}

function getSlideEditCommentThreadWrappedJSONPasteValue({
  payloadLength,
  sourceType,
  storagePolicy,
  value,
}: {
  payloadLength: number
  sourceType: string
  storagePolicy: SlideEditCommentThreadStoragePolicy
  value: unknown
}): SlideEditCommentThreadJSONPasteValue | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  const record = value as Record<string, unknown>

  for (const key of SLIDE_EDIT_COMMENT_THREAD_JSON_WRAPPER_KEYS) {
    if (!Object.hasOwn(record, key)) {
      continue
    }

    const pasteValue = getSlideEditCommentThreadDirectJSONPasteValue({
      payloadLength,
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

function getSlideEditCommentThreadDirectJSONPasteValue({
  payloadLength,
  sourceType,
  storagePolicy,
  value,
  wrapper,
}: {
  payloadLength: number
  sourceType: string
  storagePolicy: SlideEditCommentThreadStoragePolicy
  value: unknown
  wrapper?: string
}): SlideEditCommentThreadJSONPasteValue | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  const record = value as Record<string, unknown>
  const body = getSlideEditCommentThreadBody(record, storagePolicy)
  const createdAt = getSlideEditCommentThreadText(record.createdAt)
  const resolved = typeof record.resolved === 'boolean'
    ? record.resolved
    : undefined
  const messages = syncSlideEditCommentThreadBodyMessage({
    body,
    messages: getSlideEditCommentThreadMessages(record, storagePolicy),
  })
  const patch = {
    ...(body === undefined ? {} : { body }),
    ...(createdAt === undefined ? {} : { createdAt }),
    messages,
    ...(resolved === undefined ? {} : { resolved }),
  }
  const fields = getSlideEditCommentThreadPatchFields(patch)

  if (fields.length === 0) {
    return null
  }

  return {
    fields,
    format: 'json',
    patch,
    payloadLength,
    sourceType,
    surface: 'comment-thread',
    ...(wrapper ? { wrapper } : {}),
  }
}

function getSlideEditCommentThreadPatchFields(
  patch: SlideEditCommentThreadPatch,
): SlideEditCommentThreadPatchField[] {
  return [
    ...(patch.body === undefined ? [] : ['body' as const]),
    ...(patch.createdAt === undefined ? [] : ['createdAt' as const]),
    ...(patch.messages.length === 0 ? [] : ['messages' as const]),
    ...(patch.resolved === undefined ? [] : ['resolved' as const]),
  ]
}

function getSlideEditCommentThreadBody(
  record: Record<string, unknown>,
  storagePolicy: SlideEditCommentThreadStoragePolicy,
) {
  return getSlideEditCommentThreadLimitedText(
    getSlideEditCommentThreadText(record.body) ??
      getSlideEditCommentThreadText(record.text),
    storagePolicy.maxBodyLength,
  )
}

function getSlideEditCommentThreadMessages(
  record: Record<string, unknown>,
  storagePolicy: SlideEditCommentThreadStoragePolicy,
) {
  return [
    ...getSlideEditCommentThreadMessageList(record.thread, storagePolicy),
    ...getSlideEditCommentThreadMessageList(record.messages, storagePolicy),
    ...getSlideEditCommentThreadMessageList(record.replies, storagePolicy),
  ]
}

function getSlideEditCommentThreadMessageList(
  value: unknown,
  storagePolicy: SlideEditCommentThreadStoragePolicy,
): SlideEditCommentThreadMessage[] {
  if (Array.isArray(value)) {
    return value.flatMap((item) => {
      const message = getSlideEditCommentThreadMessage(item, storagePolicy)

      return message ? [message] : []
    })
  }

  if (!value || typeof value !== 'object') {
    return []
  }

  const record = value as Record<string, unknown>

  return [
    ...getSlideEditCommentThreadMessageList(record.messages, storagePolicy),
    ...getSlideEditCommentThreadMessageList(record.replies, storagePolicy),
  ]
}

function getSlideEditCommentThreadMessage(
  value: unknown,
  storagePolicy: SlideEditCommentThreadStoragePolicy,
): SlideEditCommentThreadMessage | null {
  if (typeof value === 'string') {
    const body = getSlideEditCommentThreadLimitedText(
      value,
      storagePolicy.maxMessageBodyLength,
    )

    return body ? { body } : null
  }

  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  const record = value as Record<string, unknown>
  const body = getSlideEditCommentThreadLimitedText(
    getSlideEditCommentThreadText(record.body) ??
      getSlideEditCommentThreadText(record.text),
    storagePolicy.maxMessageBodyLength,
  )

  if (!body) {
    return null
  }

  const authorName = getSlideEditCommentThreadText(record.authorName)
  const createdAt = getSlideEditCommentThreadText(record.createdAt)
  const id = getSlideEditCommentThreadText(record.id)

  return {
    ...(authorName ? { authorName } : {}),
    body,
    ...(createdAt ? { createdAt } : {}),
    ...(id ? { id } : {}),
  }
}

function syncSlideEditCommentThreadBodyMessage({
  body,
  messages,
}: {
  body: string | undefined
  messages: SlideEditCommentThreadMessage[]
}) {
  if (body === undefined) {
    return messages
  }

  if (messages.length === 0) {
    return [{ body }]
  }

  return [
    {
      ...messages[0],
      body,
    },
    ...messages.slice(1),
  ]
}

function getSlideEditCommentThreadLimitedText(
  value: string | undefined,
  maxLength: number | undefined,
) {
  if (value === undefined) {
    return undefined
  }

  const text = value.trim()

  if (!text) {
    return undefined
  }

  return maxLength === undefined ? text : text.slice(0, maxLength)
}

function getSlideEditCommentThreadText(value: unknown) {
  if (typeof value !== 'string') {
    return undefined
  }

  const text = value.trim()

  return text || undefined
}

function parseSlideEditCommentThreadJSON(value: string) {
  if (!value.trim()) {
    return null
  }

  try {
    return JSON.parse(value) as unknown
  } catch {
    return null
  }
}
