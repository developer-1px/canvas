import type {
  CanvasAppAiAutomationProvider,
} from './CanvasAppAiAutomationContracts'
import {
  summarizeCanvasAppAiLabsText,
} from './CanvasAppAiLabsText'

export function createCanvasAppAiLabsDemoSummaryProvider():
  CanvasAppAiAutomationProvider {
  return {
    complete: (request) => ({
      model: 'demo-rule-based',
      text: summarizeCanvasAppAiLabsText(
        request.selectedItems.flatMap((item) => item.text),
      ),
    }),
    id: 'demo-ai-labs-summary',
  }
}
