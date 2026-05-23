import { describe, expect, it, vi } from 'vitest'
import type { CanvasAppCustomCommandContext } from './CanvasAppCustomCommands'
import {
  getCanvasAppCustomCommandStates,
  runCanvasAppCustomCommand,
  type CanvasAppCustomCommand,
} from './CanvasAppCustomCommands'

const context: CanvasAppCustomCommandContext = {
  commitItemsChange: vi.fn(),
  commitSelection: vi.fn(),
  createId: (prefix) => `${prefix}-1`,
  items: [],
  selection: ['item-1'],
  setEditing: vi.fn(),
  viewport: { x: 0, y: 0, scale: 1 },
}

describe('CanvasAppCustomCommands', () => {
  it('derives toolbar state from externally registered commands', () => {
    const commands: CanvasAppCustomCommand[] = [
      {
        id: 'publish',
        label: 'Pub',
        title: 'Publish selection',
        isEnabled: ({ selection }) => selection.length > 0,
        run: vi.fn(),
      },
    ]

    expect(getCanvasAppCustomCommandStates({ commands, context })).toEqual([
      {
        ariaLabel: 'Publish selection',
        disabled: false,
        id: 'publish',
        label: 'Pub',
        title: 'Publish selection',
      },
    ])
  })

  it('runs enabled commands and skips disabled commands', () => {
    const run = vi.fn()
    const commands: CanvasAppCustomCommand[] = [
      {
        id: 'publish',
        label: 'Pub',
        title: 'Publish selection',
        isEnabled: ({ selection }) => selection.length > 0,
        run,
      },
      {
        id: 'archive',
        label: 'Arc',
        title: 'Archive selection',
        isEnabled: () => false,
        run,
      },
    ]

    expect(
      runCanvasAppCustomCommand({
        commandId: 'publish',
        commands,
        context,
      }),
    ).toBe(true)
    expect(
      runCanvasAppCustomCommand({
        commandId: 'archive',
        commands,
        context,
      }),
    ).toBe(false)
    expect(run).toHaveBeenCalledTimes(1)
  })
})
