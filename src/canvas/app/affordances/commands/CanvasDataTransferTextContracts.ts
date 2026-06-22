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
