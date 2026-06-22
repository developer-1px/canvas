import {
  getCanvasViewportWorldPoint,
} from '../../../core'
import { createCanvasTableComponentItem } from '../../../host'
import type {
  CanvasTableImportSource,
  CanvasTableImportTargetReplaceFallbackReason,
  CanvasTableImportTargetReplaceFallbackRoute,
  CanvasTableImportTargetReplaceRoute,
  CanvasTableImportTargetReplaceRouteInput,
  CanvasTableInsertCenterInput,
  CanvasTableInsertSourceInput,
} from './CanvasTableImportContracts'
import {
  isCanvasTableImportRows,
} from './CanvasTableImportRows'

export function insertCanvasTableSource({
  center,
  context,
  source,
}: CanvasTableInsertSourceInput) {
  const createdItem = createCanvasTableComponentItem({
    id: context.createId('component'),
    point: center,
    rows: source.rows,
    title: getCanvasTableImportTitle(source),
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

export function routeCanvasTableImportTargetReplace({
  disabled = false,
  getTarget,
  normalizeRows = ({ source }) => source.rows,
  selection,
  source,
}: CanvasTableImportTargetReplaceRouteInput):
  CanvasTableImportTargetReplaceRoute {
  const rows = normalizeRows({ source }) ?? []

  if (disabled) {
    return createCanvasTableImportTargetReplaceFallbackRoute({
      reason: 'disabled',
      rows,
      source,
    })
  }

  if (!isCanvasTableImportRows(rows)) {
    return createCanvasTableImportTargetReplaceFallbackRoute({
      reason: 'empty-source',
      rows,
      source,
    })
  }

  const target = getTarget({
    rows,
    selection,
    source,
  })

  if (!target) {
    return createCanvasTableImportTargetReplaceFallbackRoute({
      reason: 'no-target',
      rows,
      source,
    })
  }

  return Object.freeze({
    intent: Object.freeze({
      kind: 'table-rows-replace',
      rows,
      source,
      target,
    }),
    kind: 'table-rows-replace',
    rows,
    source,
    status: 'routed',
  })
}

export function getCanvasTableInsertCenter({
  event,
  stageElement,
  viewport,
}: CanvasTableInsertCenterInput) {
  if (event) {
    const point = stageElement.getScreenPoint(event)

    return getCanvasViewportWorldPoint(viewport, point)
  }

  return stageElement.getViewportCenter(viewport) ?? { x: 0, y: 0 }
}

function getCanvasTableImportTitle({ name }: CanvasTableImportSource) {
  if (!name) {
    return 'Table'
  }

  return name.replace(/\.[^.]+$/, '') || 'Table'
}

function createCanvasTableImportTargetReplaceFallbackRoute({
  reason,
  rows,
  source,
}: {
  reason: CanvasTableImportTargetReplaceFallbackReason
  rows: readonly (readonly string[])[]
  source: CanvasTableImportSource
}): CanvasTableImportTargetReplaceFallbackRoute {
  return Object.freeze({
    kind: 'table-insert',
    reason,
    rows,
    source,
    status: 'fallback',
  })
}
