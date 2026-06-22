import type {
  CanvasDataTransferJSONTextBlockKind,
  CanvasDataTransferJSONTextBlockOptions,
} from './CanvasDataTransferTextContracts'

export const CANVAS_DATA_TRANSFER_JSON_TEXT_FENCE_LANGUAGES = Object.freeze([
  'json',
  'ppt',
  'ppt-json',
] as const)

export type CanvasDataTransferJSONTextBlock = Readonly<{
  jsonText: string
  kind: CanvasDataTransferJSONTextBlockKind
  language?: string
}>

export type GetCanvasDataTransferJSONTextBlockInput = Readonly<{
  extractTextJSON: boolean | CanvasDataTransferJSONTextBlockOptions
  rawText: string
}>

export function getCanvasDataTransferJSONTextBlock({
  extractTextJSON,
  rawText,
}: GetCanvasDataTransferJSONTextBlockInput): CanvasDataTransferJSONTextBlock | null {
  if (!extractTextJSON) {
    return Object.freeze({
      jsonText: rawText,
      kind: 'raw-json',
    })
  }

  const rawJSONText = rawText.trim()

  if (rawJSONText.startsWith('{') || rawJSONText.startsWith('[')) {
    return Object.freeze({
      jsonText: rawJSONText,
      kind: 'raw-json',
    })
  }

  return getCanvasDataTransferJSONCodeFenceTextBlock({
    fenceLanguages: getCanvasDataTransferJSONTextBlockFenceLanguages(
      extractTextJSON,
    ),
    rawText,
  })
}

export function getCanvasDataTransferJSONTextBlockMetadata({
  extractTextJSON,
  jsonTextBlock,
}: Readonly<{
  extractTextJSON: boolean | CanvasDataTransferJSONTextBlockOptions
  jsonTextBlock: CanvasDataTransferJSONTextBlock
}>) {
  if (!extractTextJSON) {
    return {}
  }

  return {
    jsonText: jsonTextBlock.jsonText,
    jsonTextKind: jsonTextBlock.kind,
    ...(jsonTextBlock.language === undefined
      ? {}
      : { jsonTextLanguage: jsonTextBlock.language }),
  }
}

function getCanvasDataTransferJSONTextBlockFenceLanguages(
  extractTextJSON: true | CanvasDataTransferJSONTextBlockOptions,
) {
  if (extractTextJSON === true) {
    return CANVAS_DATA_TRANSFER_JSON_TEXT_FENCE_LANGUAGES
  }

  return extractTextJSON.fenceLanguages ??
    CANVAS_DATA_TRANSFER_JSON_TEXT_FENCE_LANGUAGES
}

function getCanvasDataTransferJSONCodeFenceTextBlock({
  fenceLanguages,
  rawText,
}: Readonly<{
  fenceLanguages: readonly string[]
  rawText: string
}>): CanvasDataTransferJSONTextBlock | null {
  const acceptedLanguages = new Set(
    fenceLanguages.map((language) => language.toLowerCase()),
  )
  const lines = rawText.split(/\r?\n/)

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
    const openMatch = lines[lineIndex]?.match(/^\s*```([^\s`]*)?.*$/)

    if (!openMatch) {
      continue
    }

    const language = (openMatch[1] ?? '').toLowerCase()

    if (!acceptedLanguages.has(language)) {
      continue
    }

    const bodyLines: string[] = []

    for (
      let bodyLineIndex = lineIndex + 1;
      bodyLineIndex < lines.length;
      bodyLineIndex += 1
    ) {
      if (/^\s*```\s*$/.test(lines[bodyLineIndex] ?? '')) {
        return Object.freeze({
          jsonText: bodyLines.join('\n').trim(),
          kind: 'markdown-code-fence',
          language,
        })
      }

      bodyLines.push(lines[bodyLineIndex] ?? '')
    }
  }

  return null
}
