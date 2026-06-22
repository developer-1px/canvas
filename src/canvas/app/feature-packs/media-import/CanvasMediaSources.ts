import {
  normalizeCanvasLinkPreviewUrl,
} from '../../../host'
import {
  CANVAS_DATA_TRANSFER_TEXT_MIME_TYPE,
} from '../../affordances/commands/CanvasDataTransferText'
import type {
  CanvasMediaImportSource,
} from './CanvasMediaImporters'
import type {
  CanvasMediaSourceDataTransfer,
} from './CanvasMediaImportContracts'

const CANVAS_URL_PATTERN = /https?:\/\/[^\s"'<>]+/i

export const CANVAS_MEDIA_SOURCE_JSON_MIME_TYPE =
  'application/vnd.interactive-os.canvas.media-source+json'

export const CANVAS_MEDIA_SOURCE_JSON_TYPES = Object.freeze([
  'application/json',
] as const)

export const CANVAS_MEDIA_SOURCE_URI_LIST_MIME_TYPE = 'text/uri-list'

export const CANVAS_MEDIA_SOURCE_IMPORT_SUPPORTED_FORMATS = Object.freeze([
  CANVAS_MEDIA_SOURCE_JSON_MIME_TYPE,
  CANVAS_MEDIA_SOURCE_URI_LIST_MIME_TYPE,
  CANVAS_DATA_TRANSFER_TEXT_MIME_TYPE,
  ...CANVAS_MEDIA_SOURCE_JSON_TYPES,
] as const)

export const CANVAS_MEDIA_SOURCE_JSON_WRAPPER_KEYS = Object.freeze([
  'media',
  'mediaSource',
  'linkCard',
  'linkPreview',
  'embed',
] as const)

const CANVAS_MEDIA_SOURCE_JSON_URL_KEYS = Object.freeze([
  'url',
  'href',
  'src',
] as const)

const CANVAS_MEDIA_SOURCE_JSON_TITLE_KEYS = Object.freeze([
  'title',
  'name',
  'label',
] as const)

export function getCanvasMediaSourceFromDataTransfer(
  dataTransfer: CanvasMediaSourceDataTransfer | null,
) {
  if (!dataTransfer) {
    return null
  }

  const customJSONSource = getCanvasMediaSourceFromCustomJSONDataTransfer(
    dataTransfer,
  )

  if (customJSONSource) {
    return customJSONSource
  }

  const textSource = getCanvasMediaSourceFromText(
    dataTransfer.getData(CANVAS_MEDIA_SOURCE_URI_LIST_MIME_TYPE) ||
      dataTransfer.getData(CANVAS_DATA_TRANSFER_TEXT_MIME_TYPE),
  )

  if (textSource) {
    return textSource
  }

  return getCanvasMediaSourceFromWrappedJSONDataTransfer(dataTransfer)
}

export function getCanvasMediaSourceFromJSONDataTransfer(
  dataTransfer: CanvasMediaSourceDataTransfer | null,
): CanvasMediaImportSource | null {
  if (!dataTransfer) {
    return null
  }

  return getCanvasMediaSourceFromCustomJSONDataTransfer(dataTransfer) ??
    getCanvasMediaSourceFromWrappedJSONDataTransfer(dataTransfer)
}

export function getCanvasMediaSourceFromText(
  text: string,
): CanvasMediaImportSource | null {
  const url = normalizeCanvasLinkPreviewUrl(
    extractCanvasMediaUrlText(text),
  )

  return url ? { url } : null
}

function getCanvasMediaSourceFromCustomJSONDataTransfer(
  dataTransfer: CanvasMediaSourceDataTransfer,
) {
  const text = dataTransfer.getData(CANVAS_MEDIA_SOURCE_JSON_MIME_TYPE)

  if (!text.trim()) {
    return null
  }

  const value = parseCanvasMediaSourceJSON(text)

  return getCanvasMediaSourceFromDirectJSONValue(value) ??
    getCanvasMediaSourceFromWrappedJSONValue(value)
}

function getCanvasMediaSourceFromWrappedJSONDataTransfer(
  dataTransfer: CanvasMediaSourceDataTransfer,
) {
  for (const type of CANVAS_MEDIA_SOURCE_JSON_TYPES) {
    const text = dataTransfer.getData(type)

    if (!text.trim()) {
      continue
    }

    const source = getCanvasMediaSourceFromWrappedJSONValue(
      parseCanvasMediaSourceJSON(text),
    )

    if (source) {
      return source
    }
  }

  return null
}

function getCanvasMediaSourceFromWrappedJSONValue(
  value: unknown,
): CanvasMediaImportSource | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  const record = value as Record<string, unknown>

  for (const key of CANVAS_MEDIA_SOURCE_JSON_WRAPPER_KEYS) {
    if (!Object.hasOwn(record, key)) {
      continue
    }

    const wrappedValue = record[key]
    const source = getCanvasMediaSourceFromDirectJSONValue(wrappedValue) ??
      getCanvasMediaSourceFromStringJSONValue(wrappedValue)

    if (source) {
      return source
    }
  }

  return null
}

function getCanvasMediaSourceFromDirectJSONValue(
  value: unknown,
): CanvasMediaImportSource | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  const record = value as Record<string, unknown>
  const urlText = getCanvasMediaSourceJSONText(
    record,
    CANVAS_MEDIA_SOURCE_JSON_URL_KEYS,
  )
  const source = urlText ? getCanvasMediaSourceFromText(urlText) : null

  if (!source) {
    return null
  }

  const title = getCanvasMediaSourceJSONText(
    record,
    CANVAS_MEDIA_SOURCE_JSON_TITLE_KEYS,
  )

  return title
    ? {
      ...source,
      title,
    }
    : source
}

function getCanvasMediaSourceFromStringJSONValue(
  value: unknown,
): CanvasMediaImportSource | null {
  if (typeof value !== 'string' || value.trim() === '') {
    return null
  }

  return getCanvasMediaSourceFromText(value)
}

function getCanvasMediaSourceJSONText(
  record: Record<string, unknown>,
  keys: readonly string[],
) {
  for (const key of keys) {
    if (!Object.hasOwn(record, key) || typeof record[key] !== 'string') {
      continue
    }

    const value = record[key].trim()

    if (value) {
      return value
    }
  }

  return null
}

function parseCanvasMediaSourceJSON(value: string) {
  if (!value.trim()) {
    return null
  }

  try {
    return JSON.parse(value) as unknown
  } catch {
    return null
  }
}

function extractCanvasMediaUrlText(text: string) {
  const trimmed = text.trim()
  const match = trimmed.match(CANVAS_URL_PATTERN)

  return match?.[0] ?? trimmed
}
