import type {
  Point,
} from '../../../entities'
import {
  CANVAS_DATA_TRANSFER_TEXT_MIME_TYPE,
} from '../../affordances/commands/CanvasDataTransferText'

export type CanvasImageImportSource = {
  dataUrl: string
  format?: CanvasImageImportFormat
  mimeType: string
  name?: string
  naturalHeight?: number
  naturalWidth?: number
}

export type CanvasImageImportFormat =
  | 'data-url-html-img'
  | 'data-url-plain'
  | 'file'
  | 'svg-html-img'
  | 'svg-html-inline'
  | 'svg-mime'
  | 'svg-plain'

export type CanvasImportedImageItemInput = {
  center: Point
  createId: (prefix: string) => string
  source: CanvasImageImportSource
}

export type CanvasImportedImageSize = {
  h: number
  w: number
}

export type CanvasImportedImageSizeOptions = {
  fallbackSize?: Partial<CanvasImportedImageSize>
  maxSize?: Partial<CanvasImportedImageSize>
}

export type CanvasImagePasteReplaceTarget = Readonly<{
  id: string
  selection: readonly string[]
}>

export type CanvasImagePasteReplaceTargetInput = Readonly<{
  selection: readonly string[]
  source: CanvasImageImportSource
}>

export type CanvasImagePasteReplaceIntent = Readonly<{
  kind: 'image-replace'
  source: CanvasImageImportSource
  target: CanvasImagePasteReplaceTarget
}>

export type CanvasImagePasteReplaceRoute =
  | CanvasImagePasteReplaceFallbackRoute
  | CanvasImagePasteReplaceRoutedRoute

export type CanvasImagePasteReplaceRoutedRoute = Readonly<{
  intent: CanvasImagePasteReplaceIntent
  kind: 'image-replace'
  source: CanvasImageImportSource
  status: 'routed'
}>

export type CanvasImagePasteReplaceFallbackReason =
  | 'batch'
  | 'disabled'
  | 'no-source'
  | 'no-target'

export type CanvasImagePasteReplaceFallbackRoute = Readonly<{
  kind: 'image-insert'
  reason: CanvasImagePasteReplaceFallbackReason
  sources: readonly CanvasImageImportSource[]
  status: 'fallback'
}>

export type CanvasImagePasteReplaceRouteInput = Readonly<{
  disabled?: boolean
  getTarget: (
    input: CanvasImagePasteReplaceTargetInput
  ) => CanvasImagePasteReplaceTarget | null
  selection: readonly string[]
  sources: readonly CanvasImageImportSource[]
}>

export const CANVAS_IMAGE_IMPORT_MODEL = 'canvas-image-import'

export const CANVAS_IMAGE_FILE_IMPORT_SUPPORTED_FORMATS = Object.freeze([
  'Files',
  'image/*',
] as const)
export const CANVAS_IMAGE_SOURCE_IMPORT_SUPPORTED_FORMATS = Object.freeze([
  'image/svg+xml',
  'text/html',
  CANVAS_DATA_TRANSFER_TEXT_MIME_TYPE,
] as const)
