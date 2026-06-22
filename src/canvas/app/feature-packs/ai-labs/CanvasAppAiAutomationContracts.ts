import type {
  Bounds,
  CanvasItem,
  Viewport,
} from '../../../entities'
import type {
  CanvasAppCustomCommandContext,
} from '../../extensions/custom-commands'
import type {
  CanvasAppCommitItemsChange,
  CanvasAppItemsChange,
} from '../../workspace/document/CanvasAppDocumentContracts'

type MaybePromise<TValue> = TValue | Promise<TValue>

export type CanvasAppAiAutomationSelectedItemField =
  | 'bounds'
  | 'id'
  | 'text'
  | 'type'

export type CanvasAppAiAutomationProviderDataPolicy = Readonly<{
  excludedItemFields: readonly string[]
  humanReviewRequired: true
  selectedItemFields: readonly CanvasAppAiAutomationSelectedItemField[]
  unselectedItems: false
}>

export type CanvasAppAiAutomationProviderItemSnapshot = {
  bounds: Bounds
  id: string
  text: readonly string[]
  type: CanvasItem['type']
}

export type CanvasAppAiAutomationProviderRequest = {
  dataPolicy: CanvasAppAiAutomationProviderDataPolicy
  instruction: string
  operationId: string
  selectedItems: readonly CanvasAppAiAutomationProviderItemSnapshot[]
}

export type CanvasAppAiAutomationProviderOutput = {
  model?: string
  text: string
}

export type CanvasAppAiAutomationProvider = {
  complete: (
    request: CanvasAppAiAutomationProviderRequest,
  ) => MaybePromise<CanvasAppAiAutomationProviderOutput>
  id: string
}

export type CanvasAppAiAutomationDraft = {
  changes: readonly CanvasAppItemsChange[]
  operationId: string
  provenance: {
    instruction: string
    model?: string
    providerId: string
  }
  title: string
}

export type CanvasAppAiAutomationReviewDecision =
  | { kind: 'apply' }
  | { kind: 'cancel'; reason?: string }

export type CanvasAppAiAutomationReviewRequest = (
  draft: CanvasAppAiAutomationDraft,
) => MaybePromise<CanvasAppAiAutomationReviewDecision>

export type CanvasAppAiAutomationReviewResult = {
  applied: boolean
  committedChanges: number
}

export type CreateCanvasAppAiAutomationProviderRequestInput = {
  instruction: string
  items: readonly CanvasItem[]
  operationId: string
  selection: readonly string[]
}

export type CreateCanvasAppAiLabsSummarizeSelectionDraftInput = {
  createId: (prefix: string) => string
  items: readonly CanvasItem[]
  provider: CanvasAppAiAutomationProvider
  selection: readonly string[]
  viewport: Viewport
}

export type CommitCanvasAppAiAutomationDraftInput = {
  commitItemsChange: CanvasAppCommitItemsChange
  decision: CanvasAppAiAutomationReviewDecision
  draft: CanvasAppAiAutomationDraft
}

export type RunCanvasAppAiLabsSummarizeSelectionCommandInput = {
  context: CanvasAppCustomCommandContext
  provider: CanvasAppAiAutomationProvider
  requestReview: CanvasAppAiAutomationReviewRequest
}

export type CreateCanvasAppAiLabsSummarizeSelectionCommandInput = {
  provider: CanvasAppAiAutomationProvider
  requestReview: CanvasAppAiAutomationReviewRequest
}
