import { describe, expect, it, vi } from 'vitest'
import type {
  CanvasItem,
  Viewport,
} from '@interactive-os/canvas'
import type {
  CanvasAppCustomCommandContext,
  CanvasAppItemsChange,
} from '@interactive-os/canvas/app/authoring'
import {
  CANVAS_APP_AI_AUTOMATION_LABS_DATA_POLICY,
  CANVAS_APP_AI_LABS_SUMMARIZE_SELECTION_COMMAND_ID,
  CANVAS_APP_AI_LABS_SUMMARIZE_SELECTION_OPERATION_ID,
  type CanvasAppAiAutomationDraft,
  commitCanvasAppAiAutomationDraft,
  createCanvasAppAiAutomationProviderRequest,
  createCanvasAppAiLabsSampleSummaryProvider,
  createCanvasAppAiLabsSummarizeSelectionCommand,
  createCanvasAppAiLabsSummarizeSelectionDraft,
  runCanvasAppAiLabsSummarizeSelectionCommand,
} from './CanvasAppAiAutomationLabs'

describe('CanvasAppAiAutomationLabs', () => {
  it('limits provider input to selected item ids, type, bounds, and text', () => {
    const request = createCanvasAppAiAutomationProviderRequest({
      instruction: 'Summarize selected text',
      items: [
        createRectItem({ id: 'rect-1', text: 'First sticky' }),
        createComponentItem({
          body: 'Private body is allowed as selected text',
          id: 'component-1',
          items: ['Task A', 'Task B'],
          title: 'Plan',
          url: 'https://example.com/private',
        }),
        createCustomItem(),
        createImageItem(),
      ],
      operationId: 'ai-labs-test',
      selection: ['component-1', 'rect-1', 'custom-1'],
    })

    expect(request.dataPolicy).toBe(CANVAS_APP_AI_AUTOMATION_LABS_DATA_POLICY)
    expect(request.dataPolicy.selectedItemFields).toEqual([
      'id',
      'type',
      'bounds',
      'text',
    ])
    expect(request.dataPolicy.excludedItemFields).toContain('custom data')
    expect(request.dataPolicy.excludedItemFields).toContain('unselected items')
    expect(request.selectedItems.map((item) => item.id)).toEqual([
      'rect-1',
      'component-1',
      'custom-1',
    ])
    expect(request.selectedItems.map((item) => Object.keys(item))).toEqual([
      ['bounds', 'id', 'text', 'type'],
      ['bounds', 'id', 'text', 'type'],
      ['bounds', 'id', 'text', 'type'],
    ])
    expect(request.selectedItems[0]?.text).toEqual(['First sticky'])
    expect(request.selectedItems[1]?.text).toEqual([
      'Plan',
      'Private body is allowed as selected text',
      'Task A',
      'Task B',
    ])
    expect(request.selectedItems[2]?.text).toEqual(['Custom title only'])
    expect(JSON.stringify(request.selectedItems)).not.toContain('secret')
    expect(JSON.stringify(request.selectedItems)).not.toContain('example.com')
    expect(JSON.stringify(request.selectedItems)).not.toContain('data:image')
  })

  it('turns provider output into a reviewable CanvasItemsChange draft', async () => {
    const draft = await createCanvasAppAiLabsSummarizeSelectionDraft({
      createId: (prefix) => `${prefix}-1`,
      items: [
        createRectItem({ id: 'rect-1', text: 'Launch checklist' }),
        createRectItem({ id: 'rect-2', text: 'Risk review' }),
      ],
      provider: createCanvasAppAiLabsSampleSummaryProvider(),
      selection: ['rect-1', 'rect-2'],
      viewport: createViewport(),
    })

    expect(draft).toMatchObject({
      operationId: CANVAS_APP_AI_LABS_SUMMARIZE_SELECTION_OPERATION_ID,
      provenance: {
        model: 'sample-rule-based',
        providerId: 'sample-ai-labs-summary',
      },
      title: 'Summarize selected text',
    })
    expect(draft?.changes).toEqual([{
      type: 'add',
      items: [
        expect.objectContaining({
          id: 'ai-summary-1',
          text: 'Launch checklist\nRisk review',
          type: 'rect',
          x: 252,
          y: 20,
        }),
      ],
    }])
  })

  it('requires review before applying or canceling a draft', () => {
    const commits: CanvasAppItemsChange[] = []
    const draft: CanvasAppAiAutomationDraft = {
      changes: [{
        type: 'add',
        items: [createRectItem({ id: 'summary-1', text: 'Summary' })],
      }],
      operationId: CANVAS_APP_AI_LABS_SUMMARIZE_SELECTION_OPERATION_ID,
      provenance: {
        instruction: 'Summarize selected text',
        providerId: 'test-provider',
      },
      title: 'Summarize selected text',
    }
    const commitItemsChange = (change: CanvasAppItemsChange) => {
      commits.push(change)
      return true
    }

    expect(commitCanvasAppAiAutomationDraft({
      commitItemsChange,
      decision: { kind: 'cancel', reason: 'needs edit' },
      draft,
    })).toEqual({
      applied: false,
      committedChanges: 0,
    })
    expect(commits).toEqual([])

    expect(commitCanvasAppAiAutomationDraft({
      commitItemsChange,
      decision: { kind: 'apply' },
      draft,
    })).toEqual({
      applied: true,
      committedChanges: 1,
    })
    expect(commits).toHaveLength(1)
  })

  it('runs the sample command only after the review callback applies the draft', async () => {
    const commits: CanvasAppItemsChange[] = []
    const context = createCustomCommandContext({
      commitItemsChange: (change) => {
        commits.push(change)
        return true
      },
      items: [createRectItem({ id: 'rect-1', text: 'Summarize me' })],
      selection: ['rect-1'],
    })
    const requestReview = vi.fn((draft) => {
      expect(commits).toEqual([])
      expect(draft.changes[0]?.type).toBe('add')
      return { kind: 'apply' } as const
    })

    const result = await runCanvasAppAiLabsSummarizeSelectionCommand({
      context,
      provider: createCanvasAppAiLabsSampleSummaryProvider(),
      requestReview,
    })

    expect(result).toEqual({
      applied: true,
      committedChanges: 1,
    })
    expect(requestReview).toHaveBeenCalledOnce()
    expect(commits).toHaveLength(1)
  })

  it('specifies a labs-only summarize command without auto-apply behavior', () => {
    const command = createCanvasAppAiLabsSummarizeSelectionCommand({
      provider: createCanvasAppAiLabsSampleSummaryProvider(),
      requestReview: () => ({ kind: 'cancel' }),
    })

    expect(command.id).toBe(CANVAS_APP_AI_LABS_SUMMARIZE_SELECTION_COMMAND_ID)
    expect(command.label).toBe('Summarize')
    expect(command.isEnabled?.(createCustomCommandContext({
      items: [createRectItem({ id: 'rect-1', text: 'Text' })],
      selection: ['rect-1'],
    }))).toBe(true)
    expect(command.isEnabled?.(createCustomCommandContext({
      items: [createImageItem()],
      selection: ['image-1'],
    }))).toBe(false)
  })
})

function createCustomCommandContext(
  overrides: Partial<CanvasAppCustomCommandContext> = {},
): CanvasAppCustomCommandContext {
  return {
    commitItemsChange: () => true,
    commitSelection: () => true,
    createId: (prefix) => `${prefix}-1`,
    items: [],
    selection: [],
    setEditing: () => undefined,
    viewport: createViewport(),
    ...overrides,
  }
}

function createViewport(): Viewport {
  return {
    scale: 1,
    x: 0,
    y: 0,
  }
}

function createRectItem(
  overrides: Partial<Extract<CanvasItem, { type: 'rect' }>> = {},
): Extract<CanvasItem, { type: 'rect' }> {
  return {
    fill: '#ffffff',
    h: 80,
    id: 'rect-1',
    stroke: '#111111',
    text: '',
    type: 'rect',
    w: 120,
    x: 100,
    y: 20,
    ...overrides,
  }
}

function createComponentItem(
  overrides: Partial<Extract<CanvasItem, { type: 'component' }>> = {},
): Extract<CanvasItem, { type: 'component' }> {
  return {
    accent: '#2563eb',
    component: 'sticky',
    fill: '#ffffff',
    h: 120,
    id: 'component-1',
    stroke: '#111111',
    title: 'Component',
    type: 'component',
    w: 160,
    x: 0,
    y: 0,
    ...overrides,
  }
}

function createCustomItem(): Extract<CanvasItem, { type: 'custom' }> {
  return {
    data: { secret: 'do not send' },
    h: 80,
    id: 'custom-1',
    kind: 'private-widget',
    presentation: 'private-widget',
    title: 'Custom title only',
    type: 'custom',
    w: 120,
    x: 0,
    y: 0,
  }
}

function createImageItem(): Extract<CanvasItem, { type: 'image' }> {
  return {
    h: 80,
    id: 'image-1',
    mimeType: 'image/png',
    src: 'data:image/png;base64,secret',
    type: 'image',
    w: 120,
    x: 0,
    y: 0,
  }
}
