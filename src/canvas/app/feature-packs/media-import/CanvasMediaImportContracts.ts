import type {
  CanvasItem,
  Viewport,
} from '../../../entities'
import type { CanvasAppStageElement } from '../../rendering/stage/CanvasAppStageElement'
import type { CommitCanvasItemsChange } from '../../workflow/CanvasWorkflowContract'
import type {
  CanvasMediaImportSource,
} from './CanvasMediaImporters'

export const CANVAS_MEDIA_IMPORT_MODEL = 'canvas-media-import'

export type CanvasMediaInsertionContext = {
  commitItemsChange: CommitCanvasItemsChange
  createId: (prefix: string) => string
  selection: string[]
}

export type CanvasMediaInsertPositionInput = {
  event?: { clientX: number; clientY: number }
  stageElement: CanvasAppStageElement
  viewport: Viewport
}

export type CanvasMediaImportResult = {
  importerId: string
  items: CanvasItem[]
}

export type CanvasMediaObjectHyperlinkTarget = Readonly<{
  id: string
  selection: readonly string[]
}>

export type CanvasMediaObjectHyperlinkTargetInput = Readonly<{
  selection: readonly string[]
  source: CanvasMediaImportSource
  url: string
}>

export type CanvasMediaObjectHyperlinkUpdateIntent = Readonly<{
  kind: 'object-hyperlink-update'
  target: CanvasMediaObjectHyperlinkTarget
  url: string
}>

export type CanvasMediaObjectHyperlinkRoute =
  | CanvasMediaObjectHyperlinkFallbackRoute
  | CanvasMediaObjectHyperlinkRoutedRoute

export type CanvasMediaObjectHyperlinkRoutedRoute = Readonly<{
  intent: CanvasMediaObjectHyperlinkUpdateIntent
  kind: 'object-hyperlink'
  source: CanvasMediaImportSource
  status: 'routed'
}>

export type CanvasMediaObjectHyperlinkFallbackReason =
  | 'disabled'
  | 'invalid-url'
  | 'no-target'

export type CanvasMediaObjectHyperlinkFallbackRoute = Readonly<{
  kind: 'media-insert'
  reason: CanvasMediaObjectHyperlinkFallbackReason
  source: CanvasMediaImportSource
  status: 'fallback'
  url?: string
}>

export type CanvasMediaObjectHyperlinkRouteInput = Readonly<{
  disabled?: boolean
  getTarget: (
    input: CanvasMediaObjectHyperlinkTargetInput
  ) => CanvasMediaObjectHyperlinkTarget | null
  normalizeUrl?: (url: string) => string | null
  selection: readonly string[]
  source: CanvasMediaImportSource
}>

export type CanvasMediaSourceDataTransfer = Pick<DataTransfer, 'getData'>
