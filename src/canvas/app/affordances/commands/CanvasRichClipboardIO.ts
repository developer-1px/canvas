export type CanvasRichClipboardReadFormat =
  | 'custom-json'
  | 'text-html'
  | 'text-plain'

export type CanvasRichClipboardWriteMode =
  | 'clipboard-item'
  | 'unavailable'
  | 'write-failed'
  | 'write-text'

export type CanvasRichClipboardReadResult<TPayload> = {
  format: CanvasRichClipboardReadFormat
  payload: TPayload
}

export type CanvasRichClipboardDataTransfer = Pick<DataTransfer, 'getData'>

export type CanvasRichClipboardClipboard = {
  write?: (items: ClipboardItem[]) => Promise<void>
  writeText?: (text: string) => Promise<void>
}

export type CanvasRichClipboardItemConstructor = new (
  items: Record<string, Blob>,
) => ClipboardItem

export type CanvasRichClipboardParsePayload<TPayload> = (
  value: unknown,
) => TPayload | null

export type CanvasRichClipboardHTMLInput = {
  fallbackHTML?: string | null
  json: string
  rootAttribute?: string
  scriptAttribute?: string
}

export type CanvasRichClipboardDataTransferInput<TPayload> = {
  dataTransfer: CanvasRichClipboardDataTransfer | null
  jsonMimeType: string
  parsePayload: CanvasRichClipboardParsePayload<TPayload>
  scriptAttribute?: string
}

export type CanvasRichClipboardWriteInput = {
  clipboard?: CanvasRichClipboardClipboard | null
  clipboardItem?: CanvasRichClipboardItemConstructor
  html: string
  json: string
  jsonMimeType: string
  plainText?: string
  selectionSvg?: string | null
  svgMimeType?: string
}

export const CANVAS_RICH_CLIPBOARD_ROOT_ATTRIBUTE =
  'data-canvas-rich-clipboard'
export const CANVAS_RICH_CLIPBOARD_JSON_SCRIPT_ATTRIBUTE =
  'data-canvas-rich-clipboard-json'
export const CANVAS_RICH_CLIPBOARD_DEFAULT_FALLBACK_HTML =
  '<p>Canvas selection</p>'

export function stringifyCanvasRichClipboardPayload(payload: unknown) {
  return JSON.stringify(payload, null, 2)
}

export function createCanvasRichClipboardHTML({
  fallbackHTML = CANVAS_RICH_CLIPBOARD_DEFAULT_FALLBACK_HTML,
  json,
  rootAttribute = CANVAS_RICH_CLIPBOARD_ROOT_ATTRIBUTE,
  scriptAttribute = CANVAS_RICH_CLIPBOARD_JSON_SCRIPT_ATTRIBUTE,
}: CanvasRichClipboardHTMLInput) {
  const rootDataAttribute = normalizeCanvasRichClipboardDataAttribute(
    rootAttribute,
    CANVAS_RICH_CLIPBOARD_ROOT_ATTRIBUTE,
  )
  const scriptDataAttribute = normalizeCanvasRichClipboardDataAttribute(
    scriptAttribute,
    CANVAS_RICH_CLIPBOARD_JSON_SCRIPT_ATTRIBUTE,
  )
  const escapedJson = escapeCanvasRichClipboardScriptJSON(json)

  return [
    `<section ${rootDataAttribute}="true">`,
    fallbackHTML ?? CANVAS_RICH_CLIPBOARD_DEFAULT_FALLBACK_HTML,
    `<script type="application/json" ${scriptDataAttribute}>${escapedJson}</script>`,
    '</section>',
  ].join('')
}

export function getCanvasRichClipboardJSONFromHTML(
  value: string,
  {
    scriptAttribute = CANVAS_RICH_CLIPBOARD_JSON_SCRIPT_ATTRIBUTE,
  }: { scriptAttribute?: string } = {},
) {
  if (!value) {
    return null
  }

  const normalizedScriptAttribute = normalizeCanvasRichClipboardDataAttribute(
    scriptAttribute,
    CANVAS_RICH_CLIPBOARD_JSON_SCRIPT_ATTRIBUTE,
  )
  const parsed = getCanvasRichClipboardJSONFromDOMParser(
    value,
    normalizedScriptAttribute,
  )

  return parsed ?? getCanvasRichClipboardJSONFromHTMLString(
    value,
    normalizedScriptAttribute,
  )
}

export function parseCanvasRichClipboardPayload<TPayload>(
  value: string | null,
  parsePayload: CanvasRichClipboardParsePayload<TPayload>,
): TPayload | null {
  if (!value) {
    return null
  }

  try {
    return parsePayload(JSON.parse(value))
  } catch {
    return null
  }
}

export function readCanvasRichClipboardFromDataTransfer<TPayload>({
  dataTransfer,
  jsonMimeType,
  parsePayload,
  scriptAttribute,
}: CanvasRichClipboardDataTransferInput<TPayload>):
  CanvasRichClipboardReadResult<TPayload> | null {
  if (!dataTransfer) {
    return null
  }

  const customPayload = parseCanvasRichClipboardPayload(
    dataTransfer.getData(jsonMimeType),
    parsePayload,
  )

  if (customPayload) {
    return {
      format: 'custom-json',
      payload: customPayload,
    }
  }

  const plainPayload = parseCanvasRichClipboardPayload(
    dataTransfer.getData('text/plain'),
    parsePayload,
  )

  if (plainPayload) {
    return {
      format: 'text-plain',
      payload: plainPayload,
    }
  }

  const htmlPayload = parseCanvasRichClipboardPayload(
    getCanvasRichClipboardJSONFromHTML(dataTransfer.getData('text/html'), {
      scriptAttribute,
    }),
    parsePayload,
  )

  if (htmlPayload) {
    return {
      format: 'text-html',
      payload: htmlPayload,
    }
  }

  return null
}

export async function writeCanvasRichClipboardPayload({
  clipboard = getCanvasRichClipboardNavigatorClipboard(),
  clipboardItem = getCanvasRichClipboardItemConstructor(),
  html,
  json,
  jsonMimeType,
  plainText = json,
  selectionSvg,
  svgMimeType = 'image/svg+xml',
}: CanvasRichClipboardWriteInput): Promise<CanvasRichClipboardWriteMode> {
  if (clipboard?.write && clipboardItem) {
    try {
      const items: Record<string, Blob> = {
        [jsonMimeType]: new Blob([json], { type: jsonMimeType }),
        'text/html': new Blob([html], { type: 'text/html' }),
        'text/plain': new Blob([plainText], { type: 'text/plain' }),
      }

      if (selectionSvg !== undefined && selectionSvg !== null) {
        items[svgMimeType] = new Blob([selectionSvg], { type: svgMimeType })
      }

      await clipboard.write([new clipboardItem(items)])

      return 'clipboard-item'
    } catch {
      // Browser support for custom MIME clipboard writes is uneven.
    }
  }

  if (clipboard?.writeText) {
    try {
      await clipboard.writeText(plainText)

      return 'write-text'
    } catch {
      return 'write-failed'
    }
  }

  return 'unavailable'
}

function escapeCanvasRichClipboardScriptJSON(value: string) {
  return value.replace(/</g, '\\u003c')
}

function getCanvasRichClipboardJSONFromDOMParser(
  value: string,
  scriptAttribute: string,
) {
  if (typeof DOMParser === 'undefined') {
    return null
  }

  const doc = new DOMParser().parseFromString(value, 'text/html')

  return doc.querySelector(`script[${scriptAttribute}]`)?.textContent ?? null
}

function getCanvasRichClipboardJSONFromHTMLString(
  value: string,
  scriptAttribute: string,
) {
  const escapedAttribute = escapeCanvasRichClipboardRegExp(scriptAttribute)
  const match = value.match(new RegExp(
    `<script\\b(?=[^>]*\\s${escapedAttribute}(?:\\s|=|>))[^>]*>` +
      '([\\s\\S]*?)</script>',
    'i',
  ))

  return match?.[1] ?? null
}

function normalizeCanvasRichClipboardDataAttribute(
  value: string,
  fallback: string,
) {
  return /^data-[a-z0-9][a-z0-9-]*$/.test(value) ? value : fallback
}

function escapeCanvasRichClipboardRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function getCanvasRichClipboardNavigatorClipboard() {
  if (typeof navigator === 'undefined') {
    return null
  }

  return navigator.clipboard ?? null
}

function getCanvasRichClipboardItemConstructor() {
  if (typeof ClipboardItem === 'undefined') {
    return undefined
  }

  return ClipboardItem
}
