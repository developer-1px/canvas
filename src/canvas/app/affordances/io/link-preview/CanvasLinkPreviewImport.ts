import {
  type Point,
  type Viewport,
} from '../../../../entities'
import {
  getCanvasMediaInsertPosition,
  getCanvasMediaSourceFromDataTransfer,
  getCanvasMediaSourceFromText,
  insertCanvasMediaSource,
  type CanvasMediaInsertPositionInput,
  type CanvasMediaInsertionContext,
} from '../media/CanvasMediaImport'
import type {
  CanvasMediaImporter,
  CanvasMediaImportSource,
} from '../media/CanvasMediaImporters'

export type CanvasLinkPreviewImportSource = CanvasMediaImportSource
export type CanvasLinkPreviewInsertionContext = CanvasMediaInsertionContext
export type CanvasLinkPreviewInsertCenterInput = CanvasMediaInsertPositionInput

export function insertCanvasLinkPreviewSource({
  center,
  context,
  importers = [],
  source,
  viewport = { scale: 1, x: 0, y: 0 },
}: {
  center: Point
  context: CanvasLinkPreviewInsertionContext
  importers?: readonly CanvasMediaImporter[]
  source: CanvasLinkPreviewImportSource
  viewport?: Viewport
}) {
  return insertCanvasMediaSource({
    context,
    importers,
    position: center,
    source,
    viewport,
  })
}

export const getCanvasLinkPreviewInsertCenter = getCanvasMediaInsertPosition
export const getCanvasLinkPreviewSourceFromDataTransfer =
  getCanvasMediaSourceFromDataTransfer
export const getCanvasLinkPreviewSourceFromText = getCanvasMediaSourceFromText
