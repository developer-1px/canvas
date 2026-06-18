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
