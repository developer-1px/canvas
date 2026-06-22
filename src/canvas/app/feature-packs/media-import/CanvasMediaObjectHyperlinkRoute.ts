import {
  normalizeCanvasLinkPreviewUrl,
} from '../../../host'
import type {
  CanvasMediaImportSource,
} from './CanvasMediaImporters'
import type {
  CanvasMediaObjectHyperlinkFallbackReason,
  CanvasMediaObjectHyperlinkFallbackRoute,
  CanvasMediaObjectHyperlinkRoute,
  CanvasMediaObjectHyperlinkRouteInput,
} from './CanvasMediaImportContracts'

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
