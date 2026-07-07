import {
  createCanvasAppExtensionBundle,
} from '../../extensions/CanvasAppExtensionBundle'
import {
  createCanvasAppFeaturePackManifest,
} from '../CanvasAppFeaturePackManifests'
import {
  createCanvasAppFeaturePack,
} from '../CanvasAppFeaturePacks'
import {
  createCanvasAppAiLabsSummarizeSelectionCommand,
  type CreateCanvasAppAiLabsSummarizeSelectionCommandInput,
} from './CanvasAppAiAutomationLabs'

export {
  CANVAS_APP_AI_AUTOMATION_LABS_DATA_POLICY,
  CANVAS_APP_AI_LABS_SUMMARIZE_SELECTION_COMMAND_ID,
  CANVAS_APP_AI_LABS_SUMMARIZE_SELECTION_OPERATION_ID,
  commitCanvasAppAiAutomationDraft,
  createCanvasAppAiAutomationProviderRequest,
  createCanvasAppAiLabsSampleSummaryProvider,
  createCanvasAppAiLabsSummarizeSelectionCommand,
  createCanvasAppAiLabsSummarizeSelectionDraft,
  runCanvasAppAiLabsSummarizeSelectionCommand,
  type CreateCanvasAppAiLabsSummarizeSelectionCommandInput,
  type CanvasAppAiAutomationDraft,
  type CanvasAppAiAutomationProvider,
  type CanvasAppAiAutomationProviderDataPolicy,
  type CanvasAppAiAutomationProviderItemSnapshot,
  type CanvasAppAiAutomationProviderOutput,
  type CanvasAppAiAutomationProviderRequest,
  type CanvasAppAiAutomationReviewDecision,
  type CanvasAppAiAutomationReviewRequest,
  type CanvasAppAiAutomationReviewResult,
} from './CanvasAppAiAutomationLabs'

export type CanvasAppAiLabsFeaturePackManifestInput =
  CreateCanvasAppAiLabsSummarizeSelectionCommandInput

export function createCanvasAppAiLabsFeaturePackManifest(
  input: CanvasAppAiLabsFeaturePackManifestInput,
) {
  const id = 'ai-labs'
  const label = 'AI labs'

  return createCanvasAppFeaturePackManifest({
    extensionFeaturePack: createCanvasAppFeaturePack({
      extensionBundle: createCanvasAppExtensionBundle({
        customCommands: [
          createCanvasAppAiLabsSummarizeSelectionCommand(input),
        ],
      }),
      id,
      label,
    }),
    id,
    label,
  })
}
