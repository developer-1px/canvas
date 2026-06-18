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

export type CanvasDataTransferJSONCandidateParseInput<
  TCandidate extends CanvasDataTransferJSONCandidate =
    CanvasDataTransferJSONCandidate,
> = Readonly<{
  candidate: TCandidate
  candidateIndex: number
  json: unknown
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
  parseValue?: CanvasDataTransferJSONCandidateParseValue<TValue, TCandidate>
}>

export type CanvasDataTransferJSONCandidateReadResult<
  TValue,
  TCandidate extends CanvasDataTransferJSONCandidate =
    CanvasDataTransferJSONCandidate,
> = Readonly<{
  candidate: TCandidate
  candidateIndex: number
  mimeType: string
  rawText: string
  source?: TCandidate['source']
  value: TValue
}>

export const CANVAS_DATA_TRANSFER_TEXT_MIME_TYPE = 'text/plain'

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

    let json: unknown

    try {
      json = JSON.parse(rawText)
    } catch {
      continue
    }

    try {
      const parseInput = Object.freeze({
        candidate,
        candidateIndex,
        json,
        mimeType: candidate.mimeType,
        rawText,
        source: candidate.source,
      }) satisfies CanvasDataTransferJSONCandidateParseInput<TCandidate>
      const value = parseValue ? parseValue(parseInput) : json

      return Object.freeze({
        candidate,
        candidateIndex,
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
