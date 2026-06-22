import {
  getCanvasTextPasteSourceText,
  type CanvasTextPasteSource,
} from './CanvasTextPasteSources'

export type CanvasTextPasteReplaceTarget = Readonly<{
  id: string
  selection: readonly string[]
}>

export type CanvasTextPasteReplaceTargetInput = Readonly<{
  selection: readonly string[]
  source: CanvasTextPasteSource
  text: string
}>

export type CanvasTextPasteReplaceIntent = Readonly<{
  kind: 'text-replace'
  source: CanvasTextPasteSource
  target: CanvasTextPasteReplaceTarget
  text: string
}>

export type CanvasTextPasteReplaceRoute =
  | CanvasTextPasteReplaceFallbackRoute
  | CanvasTextPasteReplaceRoutedRoute

export type CanvasTextPasteReplaceRoutedRoute = Readonly<{
  intent: CanvasTextPasteReplaceIntent
  kind: 'text-replace'
  source: CanvasTextPasteSource
  status: 'routed'
  text: string
}>

export type CanvasTextPasteReplaceFallbackReason =
  | 'disabled'
  | 'empty-source'
  | 'no-target'

export type CanvasTextPasteReplaceFallbackRoute = Readonly<{
  kind: 'text-insert'
  reason: CanvasTextPasteReplaceFallbackReason
  source: CanvasTextPasteSource
  status: 'fallback'
  text: string
}>

export type CanvasTextPasteReplaceRouteInput = Readonly<{
  disabled?: boolean
  getTarget: (
    input: CanvasTextPasteReplaceTargetInput
  ) => CanvasTextPasteReplaceTarget | null
  selection: readonly string[]
  source: CanvasTextPasteSource
}>

export function routeCanvasTextPasteReplace({
  disabled = false,
  getTarget,
  selection,
  source,
}: CanvasTextPasteReplaceRouteInput): CanvasTextPasteReplaceRoute {
  const text = getCanvasTextPasteSourceText(source)

  if (disabled) {
    return createCanvasTextPasteReplaceFallbackRoute({
      reason: 'disabled',
      source,
      text,
    })
  }

  if (!text.trim()) {
    return createCanvasTextPasteReplaceFallbackRoute({
      reason: 'empty-source',
      source,
      text,
    })
  }

  const target = getTarget({
    selection,
    source,
    text,
  })

  if (!target) {
    return createCanvasTextPasteReplaceFallbackRoute({
      reason: 'no-target',
      source,
      text,
    })
  }

  return Object.freeze({
    intent: Object.freeze({
      kind: 'text-replace',
      source,
      target,
      text,
    }),
    kind: 'text-replace',
    source,
    status: 'routed',
    text,
  })
}

function createCanvasTextPasteReplaceFallbackRoute({
  reason,
  source,
  text,
}: {
  reason: CanvasTextPasteReplaceFallbackReason
  source: CanvasTextPasteSource
  text: string
}): CanvasTextPasteReplaceFallbackRoute {
  return Object.freeze({
    kind: 'text-insert',
    reason,
    source,
    status: 'fallback',
    text,
  })
}
