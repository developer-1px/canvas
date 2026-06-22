import {
  getCanvasDataTransferJSONTextBlock,
  getCanvasDataTransferJSONTextBlockMetadata,
} from './CanvasDataTransferJSONTextBlocks'
import type {
  CanvasDataTransferJSONCandidate,
  CanvasDataTransferJSONCandidateParseInput,
  CanvasDataTransferJSONCandidateReadInput,
  CanvasDataTransferJSONCandidateReadResult,
} from './CanvasDataTransferTextContracts'

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
