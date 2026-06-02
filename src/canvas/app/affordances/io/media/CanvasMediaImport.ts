import type {
  CanvasItem,
  Point,
  Viewport,
} from '../../../../entities'
import {
  createCanvasLinkPreviewComponentItem,
  normalizeCanvasLinkPreviewUrl,
} from '../../../../host'
import type { CanvasAppStageElement } from '../../../rendering/stage/CanvasAppStageElement'
import type { CommitCanvasItemsChange } from '../../../workflow/CanvasWorkflowContract'
import type {
  CanvasMediaImporter,
  CanvasMediaImportSource,
} from './CanvasMediaImporters'

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

const CANVAS_URL_PATTERN = /https?:\/\/[^\s"'<>]+/i

const CANVAS_LINK_PREVIEW_MEDIA_IMPORTER: CanvasMediaImporter = {
  id: 'link-preview',
  createItems: ({ createId, position, source }) => {
    const createdItem = createCanvasLinkPreviewComponentItem({
      id: createId('component'),
      point: position,
      title: source.title,
      url: source.url,
    })

    return [{
      ...createdItem,
      x: createdItem.x - createdItem.w / 2,
      y: createdItem.y - createdItem.h / 2,
    }]
  },
}

export function insertCanvasMediaSource({
  context,
  importers,
  position,
  source,
  viewport,
}: {
  context: CanvasMediaInsertionContext
  importers: readonly CanvasMediaImporter[]
  position: Point
  source: CanvasMediaImportSource
  viewport: Viewport
}) {
  const result = createCanvasMediaImportItems({
    createId: context.createId,
    importers,
    position,
    source,
    viewport,
  })

  if (!result) {
    return false
  }

  return context.commitItemsChange(
    { type: 'add', items: result.items },
    {
      before: context.selection,
      after: result.items.map((item) => item.id),
    },
  )
}

export function createCanvasMediaImportItems({
  createId,
  importers,
  position,
  source,
  viewport,
}: {
  createId: (prefix: string) => string
  importers: readonly CanvasMediaImporter[]
  position: Point
  source: CanvasMediaImportSource
  viewport: Viewport
}): CanvasMediaImportResult | null {
  const url = normalizeCanvasLinkPreviewUrl(source.url)

  if (!url) {
    return null
  }

  const normalizedSource = {
    ...source,
    url,
  }

  for (const importer of [...importers, CANVAS_LINK_PREVIEW_MEDIA_IMPORTER]) {
    let items: CanvasItem[] | null

    try {
      items = importer.createItems({
        createId,
        position,
        source: normalizedSource,
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

export function getCanvasMediaInsertPosition({
  event,
  stageElement,
  viewport,
}: CanvasMediaInsertPositionInput): Point {
  if (event) {
    const point = stageElement.getScreenPoint(event)

    return {
      x: (point.x - viewport.x) / viewport.scale,
      y: (point.y - viewport.y) / viewport.scale,
    }
  }

  return stageElement.getViewportCenter(viewport) ?? { x: 0, y: 0 }
}

export function getCanvasMediaSourceFromDataTransfer(
  dataTransfer: DataTransfer | null,
) {
  if (!dataTransfer) {
    return null
  }

  return getCanvasMediaSourceFromText(
    dataTransfer.getData('text/uri-list') ||
      dataTransfer.getData('text/plain'),
  )
}

export function getCanvasMediaSourceFromText(
  text: string,
): CanvasMediaImportSource | null {
  const url = normalizeCanvasLinkPreviewUrl(
    extractCanvasMediaUrlText(text),
  )

  return url ? { url } : null
}

function extractCanvasMediaUrlText(text: string) {
  const trimmed = text.trim()
  const match = trimmed.match(CANVAS_URL_PATTERN)

  return match?.[0] ?? trimmed
}
