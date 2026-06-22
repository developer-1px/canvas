import type {
  CanvasImageImportSource,
  CanvasImagePasteReplaceFallbackReason,
  CanvasImagePasteReplaceFallbackRoute,
  CanvasImagePasteReplaceRoute,
  CanvasImagePasteReplaceRouteInput,
} from './CanvasImageImportContracts'

export function routeCanvasImagePasteReplace({
  disabled = false,
  getTarget,
  selection,
  sources,
}: CanvasImagePasteReplaceRouteInput): CanvasImagePasteReplaceRoute {
  if (disabled) {
    return createCanvasImagePasteReplaceFallbackRoute({
      reason: 'disabled',
      sources,
    })
  }

  if (sources.length === 0) {
    return createCanvasImagePasteReplaceFallbackRoute({
      reason: 'no-source',
      sources,
    })
  }

  if (sources.length > 1) {
    return createCanvasImagePasteReplaceFallbackRoute({
      reason: 'batch',
      sources,
    })
  }

  const source = sources[0]!
  const target = getTarget({
    selection,
    source,
  })

  if (!target) {
    return createCanvasImagePasteReplaceFallbackRoute({
      reason: 'no-target',
      sources,
    })
  }

  return Object.freeze({
    intent: Object.freeze({
      kind: 'image-replace',
      source,
      target,
    }),
    kind: 'image-replace',
    source,
    status: 'routed',
  })
}

function createCanvasImagePasteReplaceFallbackRoute({
  reason,
  sources,
}: {
  reason: CanvasImagePasteReplaceFallbackReason
  sources: readonly CanvasImageImportSource[]
}): CanvasImagePasteReplaceFallbackRoute {
  return Object.freeze({
    kind: 'image-insert',
    reason,
    sources: Object.freeze([...sources]),
    status: 'fallback',
  })
}
