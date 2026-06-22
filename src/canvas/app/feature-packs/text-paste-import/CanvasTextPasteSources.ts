import {
  CANVAS_DATA_TRANSFER_TEXT_MIME_TYPE,
} from '../../affordances/commands/CanvasDataTransferText'
import {
  getCanvasRichTextPasteSourceFromDataTransfer,
  type CanvasRichTextPasteSource,
} from './CanvasRichTextPasteSources'

export type CanvasPlainTextPasteSource = Readonly<{
  format: 'text-plain'
  text: string
}>

export type CanvasTextPasteSource =
  | CanvasPlainTextPasteSource
  | CanvasRichTextPasteSource

export const CANVAS_TEXT_PASTE_SUPPORTED_FORMATS = Object.freeze([
  CANVAS_DATA_TRANSFER_TEXT_MIME_TYPE,
  'text/html',
] as const)

export function createCanvasPlainTextPasteSource(
  text: string,
): CanvasPlainTextPasteSource | null {
  const normalizedText = text.trim()

  return normalizedText
    ? Object.freeze({
        format: 'text-plain',
        text: normalizedText,
      })
    : null
}

export function getCanvasTextPasteSourceText(
  source: CanvasTextPasteSource,
): string {
  return source.text
}

export function getCanvasTextPasteSourcesFromDataTransfer(
  dataTransfer: DataTransfer | null,
) {
  if (!dataTransfer) {
    return []
  }

  const sources: string[] = []

  for (const type of CANVAS_TEXT_PASTE_SUPPORTED_FORMATS) {
    const text = dataTransfer.getData(type).trim()

    if (text && !sources.includes(text)) {
      sources.push(text)
    }
  }

  return sources
}

export function getCanvasTextPasteSourceCandidatesFromDataTransfer(
  dataTransfer: DataTransfer | null,
): CanvasTextPasteSource[] {
  if (!dataTransfer) {
    return []
  }

  const sources: CanvasTextPasteSource[] = []
  const richSource = getCanvasRichTextPasteSourceFromDataTransfer(dataTransfer)

  if (richSource) {
    sources.push(richSource)
  }

  const fallbackTexts = richSource
    ? [dataTransfer.getData('text/plain').trim()]
    : getCanvasTextPasteSourcesFromDataTransfer(dataTransfer)

  for (const text of fallbackTexts) {
    const plainSource = createCanvasPlainTextPasteSource(text)

    if (
      plainSource &&
      !sources.some((source) => source.text === plainSource.text)
    ) {
      sources.push(plainSource)
    }
  }

  return sources
}
