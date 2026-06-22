import type {
  CanvasDataTransferDropEffectInput,
  CanvasDataTransferTextCandidate,
  CanvasDataTransferTextCandidateReadInput,
  CanvasDataTransferTextCandidateReadResult,
  CanvasDataTransferTextInput,
  CanvasDataTransferTextWriteInput,
} from './CanvasDataTransferTextContracts'

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
