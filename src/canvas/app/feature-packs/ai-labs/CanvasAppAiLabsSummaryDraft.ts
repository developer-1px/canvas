import {
  getCanvasViewportWorldPoint,
} from '../../../core'
import type {
  Bounds,
  RectItem,
  Viewport,
} from '../../../entities'
import type {
  CanvasAppAiAutomationDraft,
  CanvasAppAiAutomationProviderItemSnapshot,
  CreateCanvasAppAiLabsSummarizeSelectionDraftInput,
} from './CanvasAppAiAutomationContracts'
import {
  createCanvasAppAiAutomationProviderRequest,
  hasCanvasAppAiAutomationProviderText,
} from './CanvasAppAiAutomationProviderRequests'
import {
  normalizeCanvasAppAiLabsOutputText,
} from './CanvasAppAiLabsText'

export const CANVAS_APP_AI_LABS_SUMMARIZE_SELECTION_OPERATION_ID =
  'ai-labs-summarize-selection'

export const CANVAS_APP_AI_LABS_SUMMARIZE_SELECTION_INSTRUCTION =
  'Summarize the selected canvas text into one concise card.'

export async function createCanvasAppAiLabsSummarizeSelectionDraft({
  createId,
  items,
  provider,
  selection,
  viewport,
}: CreateCanvasAppAiLabsSummarizeSelectionDraftInput):
  Promise<CanvasAppAiAutomationDraft | null> {
  const request = createCanvasAppAiAutomationProviderRequest({
    instruction: CANVAS_APP_AI_LABS_SUMMARIZE_SELECTION_INSTRUCTION,
    items,
    operationId: CANVAS_APP_AI_LABS_SUMMARIZE_SELECTION_OPERATION_ID,
    selection,
  })

  if (!hasCanvasAppAiAutomationProviderText(request)) {
    return null
  }

  const output = await provider.complete(request)
  const text = normalizeCanvasAppAiLabsOutputText(output.text)

  if (!text) {
    return null
  }

  return {
    changes: [{
      type: 'add',
      items: [
        createCanvasAppAiLabsSummaryItem({
          id: createId('ai-summary'),
          selectedItems: request.selectedItems,
          text,
          viewport,
        }),
      ],
    }],
    operationId: CANVAS_APP_AI_LABS_SUMMARIZE_SELECTION_OPERATION_ID,
    provenance: {
      instruction: request.instruction,
      model: output.model,
      providerId: provider.id,
    },
    title: 'Summarize selected text',
  }
}

function createCanvasAppAiLabsSummaryItem({
  id,
  selectedItems,
  text,
  viewport,
}: {
  id: string
  selectedItems: readonly CanvasAppAiAutomationProviderItemSnapshot[]
  text: string
  viewport: Viewport
}): RectItem {
  const bounds = getCanvasAppAiLabsSelectedBounds(selectedItems)
  const lineCount = Math.max(1, text.split('\n').length)
  const defaultPoint = getCanvasViewportWorldPoint(viewport, { x: 80, y: 80 })

  return {
    fill: '#ffffff',
    h: Math.max(88, Math.min(180, 56 + lineCount * 20)),
    id,
    stroke: '#0f172a',
    text,
    textAlign: 'left',
    type: 'rect',
    w: 280,
    x: bounds ? bounds.x + bounds.w + 32 : defaultPoint.x,
    y: bounds ? bounds.y : defaultPoint.y,
  }
}

function getCanvasAppAiLabsSelectedBounds(
  items: readonly CanvasAppAiAutomationProviderItemSnapshot[],
): Bounds | null {
  if (items.length === 0) {
    return null
  }

  const minX = Math.min(...items.map((item) => item.bounds.x))
  const minY = Math.min(...items.map((item) => item.bounds.y))
  const maxX = Math.max(...items.map((item) => item.bounds.x + item.bounds.w))
  const maxY = Math.max(...items.map((item) => item.bounds.y + item.bounds.h))

  return {
    h: maxY - minY,
    w: maxX - minX,
    x: minX,
    y: minY,
  }
}
