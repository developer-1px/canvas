import type {
  Bounds,
  CanvasItem,
  RectItem,
  Viewport,
} from '../../../entities'
import type {
  CanvasAppCustomCommand,
  CanvasAppCustomCommandContext,
} from '../../affordances/commands/CanvasAppCustomCommands'
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

export const CANVAS_APP_AI_LABS_SUMMARIZE_SELECTION_OPERATION_ID =
  'ai-labs-summarize-selection'

export const CANVAS_APP_AI_LABS_SUMMARIZE_SELECTION_COMMAND_ID =
  'ai-labs-summarize-selection'

const CANVAS_APP_AI_LABS_SUMMARIZE_SELECTION_INSTRUCTION =
  'Summarize the selected canvas text into one concise card.'

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

function hasCanvasAppAiAutomationProviderText(
  request: CanvasAppAiAutomationProviderRequest,
) {
  return request.selectedItems.some((item) => item.text.length > 0)
}

function summarizeCanvasAppAiLabsText(values: readonly string[]) {
  const text = normalizeCanvasAppAiLabsTextValues(values)
  const head = text.slice(0, 3)
  const remaining = Math.max(0, text.length - head.length)

  if (remaining === 0) {
    return head.join('\n')
  }

  return `${head.join('\n')}\n+${remaining} more`
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

  return {
    fill: '#ffffff',
    h: Math.max(88, Math.min(180, 56 + lineCount * 20)),
    id,
    stroke: '#0f172a',
    text,
    textAlign: 'left',
    type: 'rect',
    w: 280,
    x: bounds ? bounds.x + bounds.w + 32 : (-viewport.x + 80) / viewport.scale,
    y: bounds ? bounds.y : (-viewport.y + 80) / viewport.scale,
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

function normalizeCanvasAppAiLabsTextValues(
  values: readonly (string | undefined)[],
) {
  return values
    .map((value) => normalizeCanvasAppAiLabsText(value ?? ''))
    .filter((value) => value.length > 0)
}

function normalizeCanvasAppAiLabsText(value: string) {
  return value.replace(/\s+/g, ' ').trim()
}

function normalizeCanvasAppAiLabsOutputText(value: string) {
  return value
    .split('\n')
    .map((line) => normalizeCanvasAppAiLabsText(line))
    .filter((line) => line.length > 0)
    .join('\n')
}
