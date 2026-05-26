import type {
  Point,
  Viewport,
} from '../../../entities'
import {
  createCanvasLinkPreviewComponentItem,
  normalizeCanvasLinkPreviewUrl,
} from '../../../host'
import type { CanvasAppStageElement } from '../../stage/CanvasAppStageElement'
import type { CommitCanvasItemsChange } from '../../workflow/CanvasWorkflowContract'

export type CanvasLinkPreviewImportSource = {
  title?: string
  url: string
}

export type CanvasLinkPreviewInsertionContext = {
  commitItemsChange: CommitCanvasItemsChange
  createId: (prefix: string) => string
  selection: string[]
}

export type CanvasLinkPreviewInsertCenterInput = {
  event?: { clientX: number; clientY: number }
  stageElement: CanvasAppStageElement
  viewport: Viewport
}

const CANVAS_URL_PATTERN = /https?:\/\/[^\s"'<>]+/i

export function insertCanvasLinkPreviewSource({
  center,
  context,
  source,
}: {
  center: Point
  context: CanvasLinkPreviewInsertionContext
  source: CanvasLinkPreviewImportSource
}) {
  const createdItem = createCanvasLinkPreviewComponentItem({
    id: context.createId('component'),
    point: center,
    title: source.title,
    url: source.url,
  })
  const item = {
    ...createdItem,
    x: createdItem.x - createdItem.w / 2,
    y: createdItem.y - createdItem.h / 2,
  }

  return context.commitItemsChange(
    { type: 'add', items: [item] },
    {
      before: context.selection,
      after: [item.id],
    },
  )
}

export function getCanvasLinkPreviewInsertCenter({
  event,
  stageElement,
  viewport,
}: CanvasLinkPreviewInsertCenterInput): Point {
  if (event) {
    const point = stageElement.getScreenPoint(event)

    return {
      x: (point.x - viewport.x) / viewport.scale,
      y: (point.y - viewport.y) / viewport.scale,
    }
  }

  return stageElement.getViewportCenter(viewport) ?? { x: 0, y: 0 }
}

export function getCanvasLinkPreviewSourceFromDataTransfer(
  dataTransfer: DataTransfer | null,
) {
  if (!dataTransfer) {
    return null
  }

  return getCanvasLinkPreviewSourceFromText(
    dataTransfer.getData('text/uri-list') ||
      dataTransfer.getData('text/plain'),
  )
}

export function getCanvasLinkPreviewSourceFromText(
  text: string,
): CanvasLinkPreviewImportSource | null {
  const url = normalizeCanvasLinkPreviewUrl(
    extractCanvasLinkPreviewUrlText(text),
  )

  return url ? { url } : null
}

function extractCanvasLinkPreviewUrlText(text: string) {
  const trimmed = text.trim()
  const match = trimmed.match(CANVAS_URL_PATTERN)

  return match?.[0] ?? trimmed
}
