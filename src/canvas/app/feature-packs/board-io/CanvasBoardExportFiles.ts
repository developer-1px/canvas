import type {
  CanvasImageExportPayload,
} from '../image-io'
import {
  CANVAS_BOARD_JSON_MIME_TYPE,
  CANVAS_BOARD_SVG_MIME_TYPE,
  DEFAULT_BOARD_JSON_FILENAME,
  type CanvasBoardExportPayload,
  type CanvasBoardIoTextFile,
} from './CanvasBoardIoContracts'
import {
  stringifyCanvasBoardExportPayload,
} from './CanvasBoardJsonPayload'

export function createCanvasBoardJsonExportFile({
  filename = DEFAULT_BOARD_JSON_FILENAME,
  mimeType = CANVAS_BOARD_JSON_MIME_TYPE,
  payload,
}: {
  filename?: string
  mimeType?: string
  payload: CanvasBoardExportPayload
}): CanvasBoardIoTextFile<CanvasBoardExportPayload> {
  return {
    filename,
    mimeType,
    payload,
    text: stringifyCanvasBoardExportPayload(payload),
  }
}

export function createCanvasBoardSvgExportFile({
  mimeType = CANVAS_BOARD_SVG_MIME_TYPE,
  payload,
}: {
  mimeType?: string
  payload: CanvasImageExportPayload
}): CanvasBoardIoTextFile<CanvasImageExportPayload> {
  return {
    filename: payload.filename,
    mimeType,
    payload,
    text: payload.svg,
  }
}
