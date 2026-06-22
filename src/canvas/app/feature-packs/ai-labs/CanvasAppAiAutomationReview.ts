import type {
  CanvasAppAiAutomationReviewResult,
  CommitCanvasAppAiAutomationDraftInput,
} from './CanvasAppAiAutomationContracts'

export function commitCanvasAppAiAutomationDraft({
  commitItemsChange,
  decision,
  draft,
}: CommitCanvasAppAiAutomationDraftInput): CanvasAppAiAutomationReviewResult {
  if (decision.kind !== 'apply') {
    return {
      applied: false,
      committedChanges: 0,
    }
  }

  let committedChanges = 0

  for (const change of draft.changes) {
    if (!commitItemsChange(change)) {
      return {
        applied: false,
        committedChanges,
      }
    }

    committedChanges += 1
  }

  return {
    applied: true,
    committedChanges,
  }
}
