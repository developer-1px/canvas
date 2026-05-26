import { describe, expect, it, vi } from 'vitest'
import type { CanvasCustomItem } from '../../../entities'
import { createCanvasAffordanceConfig } from '../../../engine'
import type { CommitCanvasItemsChange } from '../../workflow/CanvasWorkflowContract'
import type { CanvasAppPointerInput } from './CanvasAppPointerInput'
import {
  commitCanvasPointerCustomCreation,
  previewCanvasPointerCustomCreation,
  startCanvasPointerCustomCreation,
  type CanvasPointerCustomCreationCommitInput,
} from './CanvasPointerCustomCreation'

const config = createCanvasAffordanceConfig()
const customItem: CanvasCustomItem = {
  data: { severity: 'high' },
  h: 96,
  id: 'risk-1',
  kind: 'risk',
  presentation: 'risk-node',
  title: 'Risk',
  type: 'custom',
  w: 180,
  x: 80,
  y: 120,
}

describe('CanvasPointerCustomCreation', () => {
  it('starts only registered custom creation tools', () => {
    const started = startCanvasPointerCustomCreation({
      config,
      customCreationTools: [createTool()],
      input: createPointerInput(),
      pointerGesture: 'create-custom',
      startScreen: { x: 8, y: 12 },
      startWorld: { x: 80, y: 120 },
      tool: 'custom:risk',
    })
    const missing = startCanvasPointerCustomCreation({
      config,
      customCreationTools: [],
      input: createPointerInput(),
      pointerGesture: 'create-custom',
      startScreen: { x: 8, y: 12 },
      startWorld: { x: 80, y: 120 },
      tool: 'custom:risk',
    })

    expect(started).toMatchObject({
      capturePointer: true,
      gesture: 'create-custom',
      interaction: {
        currentWorld: { x: 80, y: 120 },
        kind: 'create-custom',
        moved: false,
        startWorld: { x: 80, y: 120 },
        tool: 'custom:risk',
      },
      kind: 'interaction',
    })
    expect(missing).toEqual({ kind: 'none' })
  })

  it('previews custom creation current world and disabled containment', () => {
    const preview = previewCanvasPointerCustomCreation({
      config,
      currentScreen: { x: 90, y: 90 },
      currentWorld: { x: 90, y: 90 },
      interaction: {
        currentWorld: { x: 0, y: 0 },
        kind: 'create-custom',
        moved: false,
        pointerId: 1,
        startScreen: { x: 0, y: 0 },
        startWorld: { x: 0, y: 0 },
        tool: 'custom:risk',
      },
    })
    const disabled = previewCanvasPointerCustomCreation({
      config: createCanvasAffordanceConfig({
        gestures: { createCustom: false },
      }),
      currentScreen: { x: 90, y: 90 },
      currentWorld: { x: 90, y: 90 },
      interaction: {
        currentWorld: { x: 0, y: 0 },
        kind: 'create-custom',
        moved: false,
        pointerId: 1,
        startScreen: { x: 0, y: 0 },
        startWorld: { x: 0, y: 0 },
        tool: 'custom:risk',
      },
    })

    expect(preview).toMatchObject({
      interaction: {
        currentWorld: { x: 80, y: 80 },
        kind: 'create-custom',
        moved: true,
      },
      kind: 'preview',
    })
    expect(disabled).toEqual({ kind: 'none' })
  })

  it('commits an item from the selected custom creation tool', () => {
    const commitItemsChange = vi.fn<CommitCanvasItemsChange>(() => true)

    expect(
      commitCanvasPointerCustomCreation(
        createCommitInput({
          commitItemsChange,
        }),
      ),
    ).toBe(true)
    expect(commitItemsChange).toHaveBeenCalledWith(
      { type: 'add', items: [customItem] },
      { before: ['selected-1'], after: ['risk-1'] },
    )
  })

  it('contains missing, declined, invalid, and throwing custom creation tools', () => {
    const commitItemsChange = vi.fn<CommitCanvasItemsChange>(() => true)
    const rectItem = {
      fill: '#ffffff',
      h: 80,
      id: 'rect-1',
      stroke: '#111827',
      type: 'rect',
      w: 120,
      x: 80,
      y: 120,
    } as unknown as CanvasCustomItem

    expect(
      commitCanvasPointerCustomCreation(createCommitInput({
        commitItemsChange,
        customCreationTools: [],
      })),
    ).toBe(false)
    expect(
      commitCanvasPointerCustomCreation(createCommitInput({
        commitItemsChange,
        customCreationTools: [createTool({ createItem: () => null })],
      })),
    ).toBe(false)
    expect(
      commitCanvasPointerCustomCreation(createCommitInput({
        commitItemsChange,
        customCreationTools: [createTool({ createItem: () => rectItem })],
      })),
    ).toBe(false)
    expect(
      commitCanvasPointerCustomCreation(createCommitInput({
        commitItemsChange: () => {
          throw new Error('invalid custom item')
        },
      })),
    ).toBe(false)
    expect(
      commitCanvasPointerCustomCreation(createCommitInput({
        customCreationTools: [
          createTool({
            createItem: () => {
              throw new Error('bad custom module')
            },
          }),
        ],
      })),
    ).toBe(false)
    expect(commitItemsChange).not.toHaveBeenCalled()
  })
})

function createPointerInput(
  overrides: Partial<CanvasAppPointerInput> = {},
): CanvasAppPointerInput {
  return {
    altKey: false,
    button: 0,
    clientX: 0,
    clientY: 0,
    ctrlKey: false,
    metaKey: false,
    pointerId: 1,
    preventDefault: vi.fn(),
    shiftKey: false,
    stopPropagation: vi.fn(),
    ...overrides,
  }
}

function createCommitInput(
  overrides: Partial<CanvasPointerCustomCreationCommitInput> = {},
): CanvasPointerCustomCreationCommitInput {
  return {
    commitItemsChange: () => true,
    createId: () => 'risk-1',
    customCreationTools: [createTool()],
    interaction: {
      currentWorld: { x: 160, y: 180 },
      kind: 'create-custom',
      moved: true,
      pointerId: 1,
      startScreen: { x: 80, y: 120 },
      startWorld: { x: 80, y: 120 },
      tool: 'custom:risk',
    },
    selection: ['selected-1'],
    ...overrides,
  }
}

function createTool(
  overrides: Partial<{
    createItem: () => CanvasCustomItem | null
  }> = {},
) {
  return {
    id: 'risk',
    label: '!',
    title: 'Risk',
    createItem: () => customItem,
    ...overrides,
  }
}
