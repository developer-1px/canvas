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
import type { CanvasAppStageElement } from '../../rendering/stage/CanvasAppStageElement'
import type { CommitCanvasItemsChange } from '../../workflow/CanvasWorkflowContract'
import type {
  CanvasMediaImporter,
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

export function routeCanvasMediaSourceObjectHyperlink({
  disabled = false,
  getTarget,
  normalizeUrl = normalizeCanvasLinkPreviewUrl,
  selection,
  source,
}: CanvasMediaObjectHyperlinkRouteInput): CanvasMediaObjectHyperlinkRoute {
  if (disabled) {
    return createCanvasMediaObjectHyperlinkFallbackRoute({
      reason: 'disabled',
      source,
    })
  }

  const url = normalizeUrl(source.url)

  if (!url) {
    return createCanvasMediaObjectHyperlinkFallbackRoute({
      reason: 'invalid-url',
      source,
    })
  }

  const normalizedSource = Object.freeze({
    ...source,
    url,
  })
  const target = getTarget({
    selection,
    source: normalizedSource,
    url,
  })

  if (!target) {
    return createCanvasMediaObjectHyperlinkFallbackRoute({
      reason: 'no-target',
      source: normalizedSource,
      url,
    })
  }

  return Object.freeze({
    intent: Object.freeze({
      kind: 'object-hyperlink-update',
      target,
      url,
    }),
    kind: 'object-hyperlink',
    source: normalizedSource,
    status: 'routed',
  })
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

function createCanvasMediaObjectHyperlinkFallbackRoute({
  reason,
  source,
  url,
}: {
  reason: CanvasMediaObjectHyperlinkFallbackReason
  source: CanvasMediaImportSource
  url?: string
}): CanvasMediaObjectHyperlinkFallbackRoute {
  return Object.freeze({
    kind: 'media-insert',
    reason,
    source,
    status: 'fallback',
    ...(url ? { url } : {}),
  })
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
