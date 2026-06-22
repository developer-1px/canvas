import type {
  CanvasItem,
  Point,
  Viewport,
} from '../../../entities'
import {
  getCanvasViewportWorldPoint,
} from '../../../core'
import {
  createCanvasLinkPreviewComponentItem,
  normalizeCanvasLinkPreviewUrl,
} from '../../../host'
import type {
  CanvasMediaImporter,
  CanvasMediaImportSource,
} from './CanvasMediaImporters'
import type {
  CanvasMediaImportResult,
  CanvasMediaInsertionContext,
  CanvasMediaInsertPositionInput,
} from './CanvasMediaImportContracts'

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

    return getCanvasViewportWorldPoint(viewport, point)
  }

  return stageElement.getViewportCenter(viewport) ?? { x: 0, y: 0 }
}
