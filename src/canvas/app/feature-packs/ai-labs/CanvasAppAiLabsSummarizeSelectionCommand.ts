import type {
  CanvasAppCustomCommand,
} from '../../extensions/custom-commands'
import type {
  CanvasAppAiAutomationReviewResult,
  CreateCanvasAppAiLabsSummarizeSelectionCommandInput,
  RunCanvasAppAiLabsSummarizeSelectionCommandInput,
} from './CanvasAppAiAutomationContracts'
import {
  createCanvasAppAiAutomationProviderRequest,
  hasCanvasAppAiAutomationProviderText,
} from './CanvasAppAiAutomationProviderRequests'
import {
  commitCanvasAppAiAutomationDraft,
} from './CanvasAppAiAutomationReview'
import {
  CANVAS_APP_AI_LABS_SUMMARIZE_SELECTION_INSTRUCTION,
  CANVAS_APP_AI_LABS_SUMMARIZE_SELECTION_OPERATION_ID,
  createCanvasAppAiLabsSummarizeSelectionDraft,
} from './CanvasAppAiLabsSummaryDraft'

export const CANVAS_APP_AI_LABS_SUMMARIZE_SELECTION_COMMAND_ID =
  'ai-labs-summarize-selection'

export async function runCanvasAppAiLabsSummarizeSelectionCommand({
  context,
  provider,
  requestReview,
}: RunCanvasAppAiLabsSummarizeSelectionCommandInput):
  Promise<CanvasAppAiAutomationReviewResult> {
  const draft = await createCanvasAppAiLabsSummarizeSelectionDraft({
    createId: context.createId,
    items: context.items,
    provider,
    selection: context.selection,
    viewport: context.viewport,
  })

  if (!draft) {
    return {
      applied: false,
      committedChanges: 0,
    }
  }

  return commitCanvasAppAiAutomationDraft({
    commitItemsChange: context.commitItemsChange,
    decision: await requestReview(draft),
    draft,
  })
}

export function createCanvasAppAiLabsSummarizeSelectionCommand({
  provider,
  requestReview,
}: CreateCanvasAppAiLabsSummarizeSelectionCommandInput):
  CanvasAppCustomCommand {
  return {
    ariaLabel: 'Summarize selected text',
    id: CANVAS_APP_AI_LABS_SUMMARIZE_SELECTION_COMMAND_ID,
    isEnabled: (context) => hasCanvasAppAiAutomationProviderText(
      createCanvasAppAiAutomationProviderRequest({
        instruction: CANVAS_APP_AI_LABS_SUMMARIZE_SELECTION_INSTRUCTION,
        items: context.items,
        operationId: CANVAS_APP_AI_LABS_SUMMARIZE_SELECTION_OPERATION_ID,
        selection: context.selection,
      }),
    ),
    label: 'Summarize',
    run: (context) => {
      void runCanvasAppAiLabsSummarizeSelectionCommand({
        context,
        provider,
        requestReview,
      }).catch(() => undefined)
    },
    title: 'Summarize selected text',
  }
}
