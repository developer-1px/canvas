import type {
  Point,
  Viewport,
} from '../../../entities'
import {
  CANVAS_DATA_TRANSFER_TEXT_MIME_TYPE,
} from '../../affordances/commands/CanvasDataTransferText'
import type { CanvasAppStageElement } from '../../rendering/stage/CanvasAppStageElement'
import type { CommitCanvasItemsChange } from '../../workflow/CanvasWorkflowContract'

export type CanvasTableImportFormat =
  | 'text-markdown'
  | 'text-csv'
  | 'text-delimited'
  | 'text-html'
  | 'text-tsv'

export type CanvasTableImportSource = {
  format?: CanvasTableImportFormat
  name?: string
  rows: readonly (readonly string[])[]
}

export type CanvasTableRowsNormalizationOptions = {
  fallbackRows?: readonly (readonly string[])[]
  maxCellLength?: number
  maxColumns?: number
  maxRows?: number
}

export type CanvasTableImportTargetReplaceTarget = Readonly<{
  id: string
  selection: readonly string[]
}>

export type CanvasTableImportTargetReplaceTargetInput = Readonly<{
  rows: readonly (readonly string[])[]
  selection: readonly string[]
  source: CanvasTableImportSource
}>

export type CanvasTableImportTargetReplaceIntent = Readonly<{
  kind: 'table-rows-replace'
  rows: readonly (readonly string[])[]
  source: CanvasTableImportSource
  target: CanvasTableImportTargetReplaceTarget
}>

export type CanvasTableImportTargetReplaceRoute =
  | CanvasTableImportTargetReplaceFallbackRoute
  | CanvasTableImportTargetReplaceRoutedRoute

export type CanvasTableImportTargetReplaceRoutedRoute = Readonly<{
  intent: CanvasTableImportTargetReplaceIntent
  kind: 'table-rows-replace'
  rows: readonly (readonly string[])[]
  source: CanvasTableImportSource
  status: 'routed'
}>

export type CanvasTableImportTargetReplaceFallbackReason =
  | 'disabled'
  | 'empty-source'
  | 'no-target'

export type CanvasTableImportTargetReplaceFallbackRoute = Readonly<{
  kind: 'table-insert'
  reason: CanvasTableImportTargetReplaceFallbackReason
  rows: readonly (readonly string[])[]
  source: CanvasTableImportSource
  status: 'fallback'
}>

export type CanvasTableImportTargetReplaceRouteInput = Readonly<{
  disabled?: boolean
  getTarget: (
    input: CanvasTableImportTargetReplaceTargetInput
  ) => CanvasTableImportTargetReplaceTarget | null
  normalizeRows?: (
    input: Readonly<{ source: CanvasTableImportSource }>
  ) => readonly (readonly string[])[] | null
  selection: readonly string[]
  source: CanvasTableImportSource
}>

export type CanvasTableInsertionContext = {
  commitItemsChange: CommitCanvasItemsChange
  createId: (prefix: string) => string
  selection: string[]
}

export type CanvasTableInsertCenterInput = {
  event?: { clientX: number; clientY: number }
  stageElement: CanvasAppStageElement
  viewport: Viewport
}

export type CanvasTableInsertSourceInput = {
  center: Point
  context: CanvasTableInsertionContext
  source: CanvasTableImportSource
}

export const CANVAS_TABLE_IMPORT_MODEL = 'canvas-table-import'

export const CANVAS_TABLE_CSV_MIME_TYPES = Object.freeze([
  'application/vnd.ms-excel',
  'text/comma-separated-values',
  'text/csv',
] as const)
export const CANVAS_TABLE_TSV_MIME_TYPES = Object.freeze([
  'text/tab-separated-values',
] as const)
export const CANVAS_TABLE_IMPORT_SUPPORTED_FORMATS = Object.freeze([
  'text/tab-separated-values',
  'text/csv',
  'text/html',
  'text/markdown',
  'text/x-markdown',
  CANVAS_DATA_TRANSFER_TEXT_MIME_TYPE,
] as const)
export const CANVAS_TABLE_FILE_IMPORT_SUPPORTED_FORMATS = Object.freeze([
  'Files',
  ...CANVAS_TABLE_CSV_MIME_TYPES,
  ...CANVAS_TABLE_TSV_MIME_TYPES,
] as const)
