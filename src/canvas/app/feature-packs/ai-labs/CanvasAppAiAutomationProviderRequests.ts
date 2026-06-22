import type {
  CanvasItem,
} from '../../../entities'
import type {
  CanvasAppAiAutomationProviderDataPolicy,
  CanvasAppAiAutomationProviderItemSnapshot,
  CanvasAppAiAutomationProviderRequest,
  CanvasAppAiAutomationSelectedItemField,
  CreateCanvasAppAiAutomationProviderRequestInput,
} from './CanvasAppAiAutomationContracts'
import {
  normalizeCanvasAppAiLabsTextValues,
} from './CanvasAppAiLabsText'

const CANVAS_APP_AI_AUTOMATION_SELECTED_ITEM_FIELDS: readonly
  CanvasAppAiAutomationSelectedItemField[] = Object.freeze([
    'id',
    'type',
    'bounds',
    'text',
  ])

export const CANVAS_APP_AI_AUTOMATION_LABS_DATA_POLICY:
  CanvasAppAiAutomationProviderDataPolicy = Object.freeze({
    excludedItemFields: Object.freeze([
      'style',
      'image bytes',
      'custom data',
      'comment thread',
      'provider credentials',
      'unselected items',
    ]),
    humanReviewRequired: true,
    selectedItemFields: CANVAS_APP_AI_AUTOMATION_SELECTED_ITEM_FIELDS,
    unselectedItems: false,
  })

export function createCanvasAppAiAutomationProviderRequest({
  instruction,
  items,
  operationId,
  selection,
}: CreateCanvasAppAiAutomationProviderRequestInput):
  CanvasAppAiAutomationProviderRequest {
  const selectedIds = new Set(selection)

  return {
    dataPolicy: CANVAS_APP_AI_AUTOMATION_LABS_DATA_POLICY,
    instruction,
    operationId,
    selectedItems: items
      .filter((item) => selectedIds.has(item.id))
      .map((item) => createCanvasAppAiAutomationProviderItemSnapshot(item)),
  }
}

export function hasCanvasAppAiAutomationProviderText(
  request: CanvasAppAiAutomationProviderRequest,
) {
  return request.selectedItems.some((item) => item.text.length > 0)
}

function createCanvasAppAiAutomationProviderItemSnapshot(
  item: CanvasItem,
): CanvasAppAiAutomationProviderItemSnapshot {
  return {
    bounds: {
      h: item.h,
      w: item.w,
      x: item.x,
      y: item.y,
    },
    id: item.id,
    text: getCanvasAppAiAutomationItemText(item),
    type: item.type,
  }
}

function getCanvasAppAiAutomationItemText(
  item: CanvasItem,
): readonly string[] {
  switch (item.type) {
    case 'arrow':
    case 'rect':
    case 'shape':
    case 'text':
      return normalizeCanvasAppAiLabsTextValues([item.text])
    case 'comment':
      return normalizeCanvasAppAiLabsTextValues([item.body])
    case 'component':
      return normalizeCanvasAppAiLabsTextValues([
        item.title,
        item.body,
        ...(item.items ?? []),
        ...(item.columns ?? []),
      ])
    case 'custom':
      return normalizeCanvasAppAiLabsTextValues([item.title])
    case 'group':
      return normalizeCanvasAppAiLabsTextValues(
        item.children.flatMap((child) => getCanvasAppAiAutomationItemText(child)),
      )
    case 'stamp':
      return normalizeCanvasAppAiLabsTextValues([item.label])
    case 'highlight':
    case 'image':
    case 'marker':
    case 'path':
      return []
  }
}
