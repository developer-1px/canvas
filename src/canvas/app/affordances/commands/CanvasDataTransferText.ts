export type CanvasTextDataTransfer = {
  dropEffect?: DataTransfer['dropEffect']
  effectAllowed?: DataTransfer['effectAllowed']
  getData?: (format: string) => string
  setData?: (format: string, data: string) => void
}

export type CanvasDataTransferTextInput = {
  dataTransfer: CanvasTextDataTransfer | null
  mimeType?: string
}

export type CanvasDataTransferTextCandidate =
  | string
  | Readonly<{
    mimeType: string
    source?: string
  }>

export type CanvasDataTransferTextCandidateReadInput<
  TCandidate extends CanvasDataTransferTextCandidate =
    CanvasDataTransferTextCandidate,
> = Readonly<{
  candidates: readonly TCandidate[]
  dataTransfer: CanvasTextDataTransfer | null
  trimText?: boolean
}>

export type CanvasDataTransferTextCandidateReadResult<
  TCandidate extends CanvasDataTransferTextCandidate =
    CanvasDataTransferTextCandidate,
> = Readonly<{
  candidate: TCandidate
  candidateIndex: number
  mimeType: string
  rawText: string
  source?: string
  text: string
}>

export type CanvasDataTransferTextWriteInput =
  CanvasDataTransferTextInput & {
    effectAllowed?: DataTransfer['effectAllowed']
    text: string
  }

export type CanvasDataTransferDropEffectInput = {
  dataTransfer: CanvasTextDataTransfer | null
  dropEffect: DataTransfer['dropEffect']
}

export type CanvasDataTransferJSONCandidate = Readonly<{
  mimeType: string
  source?: string
}>

export type CanvasDataTransferJSONTextBlockKind =
  | 'raw-json'
  | 'markdown-code-fence'

export type CanvasDataTransferJSONTextBlockOptions = Readonly<{
  fenceLanguages?: readonly string[]
}>

export type CanvasDataTransferJSONCandidateParseInput<
  TCandidate extends CanvasDataTransferJSONCandidate =
    CanvasDataTransferJSONCandidate,
> = Readonly<{
  candidate: TCandidate
  candidateIndex: number
  json: unknown
  jsonText?: string
  jsonTextKind?: CanvasDataTransferJSONTextBlockKind
  jsonTextLanguage?: string
  mimeType: string
  rawText: string
  source?: TCandidate['source']
}>

export type CanvasDataTransferJSONCandidateParseValue<
  TValue,
  TCandidate extends CanvasDataTransferJSONCandidate =
    CanvasDataTransferJSONCandidate,
> = (
  input: CanvasDataTransferJSONCandidateParseInput<TCandidate>,
) => TValue

export type CanvasDataTransferJSONCandidateReadInput<
  TValue,
  TCandidate extends CanvasDataTransferJSONCandidate =
    CanvasDataTransferJSONCandidate,
> = Readonly<{
  candidates: readonly TCandidate[]
  dataTransfer: CanvasTextDataTransfer | null
  extractTextJSON?: boolean | CanvasDataTransferJSONTextBlockOptions
  parseValue?: CanvasDataTransferJSONCandidateParseValue<TValue, TCandidate>
}>

export type CanvasDataTransferJSONCandidateReadResult<
  TValue,
  TCandidate extends CanvasDataTransferJSONCandidate =
    CanvasDataTransferJSONCandidate,
> = Readonly<{
  candidate: TCandidate
  candidateIndex: number
  jsonText?: string
  jsonTextKind?: CanvasDataTransferJSONTextBlockKind
  jsonTextLanguage?: string
  mimeType: string
  rawText: string
  source?: TCandidate['source']
  value: TValue
}>

export const CANVAS_DATA_TRANSFER_TEXT_MIME_TYPE = 'text/plain'
export const CANVAS_DATA_TRANSFER_JSON_TEXT_FENCE_LANGUAGES = Object.freeze([
  'json',
  'ppt',
  'ppt-json',
] as const)

export function setCanvasDataTransferText({
  dataTransfer,
  effectAllowed,
  mimeType = CANVAS_DATA_TRANSFER_TEXT_MIME_TYPE,
  text,
}: CanvasDataTransferTextWriteInput) {
  if (!dataTransfer?.setData) {
    return false
  }

  if (effectAllowed !== undefined && 'effectAllowed' in dataTransfer) {
    dataTransfer.effectAllowed = effectAllowed
  }
  dataTransfer.setData(mimeType, text)

  return true
}

export function getCanvasDataTransferText({
  dataTransfer,
  mimeType = CANVAS_DATA_TRANSFER_TEXT_MIME_TYPE,
}: CanvasDataTransferTextInput) {
  return dataTransfer?.getData?.(mimeType) ?? ''
}

export function readCanvasDataTransferTextCandidate<
  TCandidate extends CanvasDataTransferTextCandidate =
    CanvasDataTransferTextCandidate,
>({
  candidates,
  dataTransfer,
  trimText = false,
}: CanvasDataTransferTextCandidateReadInput<TCandidate>):
  CanvasDataTransferTextCandidateReadResult<TCandidate> | null {
  if (!dataTransfer?.getData) {
    return null
  }

  for (const [candidateIndex, candidate] of candidates.entries()) {
    const mimeType = getCanvasDataTransferTextCandidateMimeType(candidate)

    if (!mimeType) {
      continue
    }

    const rawText = dataTransfer.getData(mimeType)

    if (rawText.trim() === '') {
      continue
    }

    const source = getCanvasDataTransferTextCandidateSource(candidate)

    return Object.freeze({
      candidate,
      candidateIndex,
      mimeType,
      rawText,
      ...(source === undefined ? {} : { source }),
      text: trimText ? rawText.trim() : rawText,
    })
  }

  return null
}

export function readCanvasDataTransferJSONCandidate<
  TCandidate extends CanvasDataTransferJSONCandidate =
    CanvasDataTransferJSONCandidate,
>(
  input: Omit<
    CanvasDataTransferJSONCandidateReadInput<unknown, TCandidate>,
    'parseValue'
  >,
): CanvasDataTransferJSONCandidateReadResult<unknown, TCandidate> | null
export function readCanvasDataTransferJSONCandidate<
  TValue,
  TCandidate extends CanvasDataTransferJSONCandidate =
    CanvasDataTransferJSONCandidate,
>(
  input: CanvasDataTransferJSONCandidateReadInput<TValue, TCandidate>,
): CanvasDataTransferJSONCandidateReadResult<TValue, TCandidate> | null
export function readCanvasDataTransferJSONCandidate<
  TValue,
  TCandidate extends CanvasDataTransferJSONCandidate =
    CanvasDataTransferJSONCandidate,
>({
  candidates,
  dataTransfer,
  extractTextJSON = false,
  parseValue,
}: CanvasDataTransferJSONCandidateReadInput<TValue, TCandidate>):
  CanvasDataTransferJSONCandidateReadResult<TValue | unknown, TCandidate> | null {
  if (!dataTransfer?.getData) {
    return null
  }

  for (const [candidateIndex, candidate] of candidates.entries()) {
    const rawText = dataTransfer.getData(candidate.mimeType)

    if (rawText.trim() === '') {
      continue
    }

    const jsonTextBlock = getCanvasDataTransferJSONTextBlock({
      extractTextJSON,
      rawText,
    })

    if (!jsonTextBlock) {
      continue
    }

    let json: unknown

    try {
      json = JSON.parse(jsonTextBlock.jsonText)
    } catch {
      continue
    }

    const jsonTextMetadata = getCanvasDataTransferJSONTextBlockMetadata({
      extractTextJSON,
      jsonTextBlock,
    })

    try {
      const parseInput = Object.freeze({
        candidate,
        candidateIndex,
        json,
        ...jsonTextMetadata,
        mimeType: candidate.mimeType,
        rawText,
        source: candidate.source,
      }) satisfies CanvasDataTransferJSONCandidateParseInput<TCandidate>
      const value = parseValue ? parseValue(parseInput) : json

      return Object.freeze({
        candidate,
        candidateIndex,
        ...jsonTextMetadata,
        mimeType: candidate.mimeType,
        rawText,
        source: candidate.source,
        value,
      })
    } catch {
      continue
    }
  }

  return null
}

function getCanvasDataTransferTextCandidateMimeType(
  candidate: CanvasDataTransferTextCandidate,
) {
  return typeof candidate === 'string' ? candidate : candidate.mimeType
}

function getCanvasDataTransferTextCandidateSource(
  candidate: CanvasDataTransferTextCandidate,
) {
  return typeof candidate === 'string' ? undefined : candidate.source
}

type CanvasDataTransferJSONTextBlock = Readonly<{
  jsonText: string
  kind: CanvasDataTransferJSONTextBlockKind
  language?: string
}>

type GetCanvasDataTransferJSONTextBlockInput = Readonly<{
  extractTextJSON: boolean | CanvasDataTransferJSONTextBlockOptions
  rawText: string
}>

function getCanvasDataTransferJSONTextBlock({
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

function getCanvasDataTransferJSONTextBlockMetadata({
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

export function setCanvasDataTransferDropEffect({
  dataTransfer,
  dropEffect,
}: CanvasDataTransferDropEffectInput) {
  if (!dataTransfer || !('dropEffect' in dataTransfer)) {
    return false
  }

  dataTransfer.dropEffect = dropEffect

  return true
}
