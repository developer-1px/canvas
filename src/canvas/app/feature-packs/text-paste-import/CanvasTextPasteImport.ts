import type {
  CanvasItem,
  Point,
  Viewport,
} from '../../../entities'
import {
  getCanvasViewportWorldPoint,
} from '../../../core'
import type { CanvasAppStageElement } from '../../rendering/stage/CanvasAppStageElement'
import type { CommitCanvasItemsChange } from '../../workflow/CanvasWorkflowContract'
import type { CanvasTextPasteImporter } from './CanvasTextPasteImporters'

export type CanvasTextPasteInsertionContext = {
  commitItemsChange: CommitCanvasItemsChange
  createId: (prefix: string) => string
  selection: string[]
}

export type CanvasTextPasteInsertPositionInput = {
  event?: { clientX: number; clientY: number }
  stageElement: CanvasAppStageElement
  viewport: Viewport
}

export type CanvasTextPasteImportResult = {
  importerId: string
  items: CanvasItem[]
}

const CANVAS_TEXT_PASTE_DATA_TYPES = [
  'text/plain',
  'text/html',
] as const

export function insertCanvasTextPasteSource({
  context,
  importers,
  position,
  text,
  viewport,
}: {
  context: CanvasTextPasteInsertionContext
  importers: readonly CanvasTextPasteImporter[]
  position: Point
  text: string
  viewport: Viewport
}) {
  const result = createCanvasTextPasteItems({
    createId: context.createId,
    importers,
    position,
    text,
    viewport,
  })

  if (!result) {
    return false
  }

  return context.commitItemsChange(
    { type: 'add', items: result.items },
    {
      after: result.items.map((item) => item.id),
      before: context.selection,
    },
  )
}

export function createCanvasTextPasteItems({
  createId,
  importers,
  position,
  text,
  viewport,
}: {
  createId: (prefix: string) => string
  importers: readonly CanvasTextPasteImporter[]
  position: Point
  text: string
  viewport: Viewport
}): CanvasTextPasteImportResult | null {
  const trimmedText = text.trim()

  if (!trimmedText) {
    return null
  }

  for (const importer of importers) {
    let items: CanvasItem[] | null

    try {
      items = importer.createItems({
        createId,
        position,
        text: trimmedText,
        viewport,
      })
    } catch {
      items = null
    }

    if (items && items.length > 0) {
      return {
        importerId: importer.id,
        items,
      }
    }
  }

  return null
}

export function getCanvasTextPasteSourcesFromDataTransfer(
  dataTransfer: DataTransfer | null,
) {
  if (!dataTransfer) {
    return []
  }

  const sources: string[] = []

  for (const type of CANVAS_TEXT_PASTE_DATA_TYPES) {
    const text = dataTransfer.getData(type).trim()

    if (text && !sources.includes(text)) {
      sources.push(text)
    }
  }

  return sources
}

export function getCanvasTextPasteInsertPosition({
  event,
  stageElement,
  viewport,
}: CanvasTextPasteInsertPositionInput): Point {
  if (event) {
    const point = stageElement.getScreenPoint(event)

    return getCanvasViewportWorldPoint(viewport, point)
  }

  return stageElement.getViewportCenter(viewport) ?? { x: 0, y: 0 }
}
