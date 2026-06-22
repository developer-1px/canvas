import type {
  CanvasRichClipboardExtraItemValue,
  CanvasRichClipboardWriteInput,
  CanvasRichClipboardWriteMode,
} from './CanvasRichClipboardIO'

export async function writeCanvasRichClipboardPayload({
  clipboard = getCanvasRichClipboardNavigatorClipboard(),
  clipboardItem = getCanvasRichClipboardItemConstructor(),
  extraItems,
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

      for (const [mimeType, value] of Object.entries(extraItems ?? {})) {
        const normalizedMimeType = mimeType.trim()

        if (!normalizedMimeType || items[normalizedMimeType]) {
          continue
        }

        items[normalizedMimeType] = getCanvasRichClipboardItemBlob(
          normalizedMimeType,
          value,
        )
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

function getCanvasRichClipboardItemBlob(
  mimeType: string,
  value: CanvasRichClipboardExtraItemValue,
) {
  return value instanceof Blob
    ? value
    : new Blob([value], { type: mimeType })
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
