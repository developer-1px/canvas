import { describe, expect, it, vi } from 'vitest'
import type { CanvasCustomItem } from '../../entities'
import type { CommitCanvasItemsChange } from '../workflow/CanvasWorkflowContract'
import {
  commitCanvasCustomCreation,
  type CanvasCustomCreationCommitInput,
} from './CanvasCustomCreationCommit'

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

describe('commitCanvasCustomCreation', () => {
  it('commits an item from the selected custom creation tool', () => {
    const commitItemsChange = vi.fn<CommitCanvasItemsChange>(() => true)

    expect(
      commitCanvasCustomCreation(
        createInput({
          commitItemsChange,
        }),
      ),
    ).toBe(true)
    expect(commitItemsChange).toHaveBeenCalledWith(
      { type: 'add', items: [customItem] },
      { before: ['selected-1'], after: ['risk-1'] },
    )
  })

  it('returns false when the selected custom creation tool is missing', () => {
    const commitItemsChange = vi.fn<CommitCanvasItemsChange>(() => true)

    expect(
      commitCanvasCustomCreation(
        createInput({
          commitItemsChange,
          customCreationTools: [],
        }),
      ),
    ).toBe(false)
    expect(commitItemsChange).not.toHaveBeenCalled()
  })

  it('returns false when the custom creation tool declines creation', () => {
    const commitItemsChange = vi.fn<CommitCanvasItemsChange>(() => true)

    expect(
      commitCanvasCustomCreation(
        createInput({
          commitItemsChange,
          customCreationTools: [
            {
              id: 'risk',
              label: '!',
              title: 'Risk',
              createItem: () => null,
            },
          ],
        }),
      ),
    ).toBe(false)
    expect(commitItemsChange).not.toHaveBeenCalled()
  })

  it('rejects non-custom items returned by custom creation tools', () => {
    const commitItemsChange = vi.fn<CommitCanvasItemsChange>(() => true)
    const rectItem = {
      id: 'rect-1',
      type: 'rect',
      x: 80,
      y: 120,
      w: 120,
      h: 80,
      fill: '#ffffff',
      stroke: '#111827',
    } as unknown as CanvasCustomItem

    expect(
      commitCanvasCustomCreation(
        createInput({
          commitItemsChange,
          customCreationTools: [
            {
              id: 'risk',
              label: '!',
              title: 'Risk',
              createItem: () => rectItem,
            },
          ],
        }),
      ),
    ).toBe(false)
    expect(commitItemsChange).not.toHaveBeenCalled()
  })

  it('contains custom creation tool and validation failures', () => {
    const throwingTool = createInput({
      customCreationTools: [
        {
          id: 'risk',
          label: '!',
          title: 'Risk',
          createItem: () => {
            throw new Error('bad custom module')
          },
        },
      ],
    })
    const throwingCommit = createInput({
      commitItemsChange: () => {
        throw new Error('invalid custom item')
      },
    })

    expect(commitCanvasCustomCreation(throwingTool)).toBe(false)
    expect(commitCanvasCustomCreation(throwingCommit)).toBe(false)
  })
})

function createInput(
  overrides: Partial<CanvasCustomCreationCommitInput> = {},
): CanvasCustomCreationCommitInput {
  return {
    commitItemsChange: () => true,
    createId: () => 'risk-1',
    currentWorld: { x: 160, y: 180 },
    customCreationTools: [
      {
        id: 'risk',
        label: '!',
        title: 'Risk',
        createItem: () => customItem,
      },
    ],
    moved: true,
    selection: ['selected-1'],
    startWorld: { x: 80, y: 120 },
    tool: 'custom:risk',
    ...overrides,
  }
}
