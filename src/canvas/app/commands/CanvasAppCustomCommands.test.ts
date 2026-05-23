import { describe, expect, it, vi } from 'vitest'
import type { CanvasAppCustomCommandContext } from './CanvasAppCustomCommands'
import {
  assertCanvasAppCustomCommands,
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

  it('contains custom command availability and run failures', () => {
    const throwingAvailability = vi.fn(() => {
      throw new Error('bad custom availability')
    })
    const throwingRun = vi.fn(() => {
      throw new Error('bad custom command')
    })
    const commands: CanvasAppCustomCommand[] = [
      {
        id: 'throwing-availability',
        label: 'A',
        title: 'Throwing availability',
        isEnabled: throwingAvailability,
        run: vi.fn(),
      },
      {
        id: 'throwing-run',
        label: 'R',
        title: 'Throwing run',
        run: throwingRun,
      },
    ]

    expect(getCanvasAppCustomCommandStates({ commands, context })).toEqual([
      {
        ariaLabel: 'Throwing availability',
        disabled: true,
        id: 'throwing-availability',
        label: 'A',
        title: 'Throwing availability',
      },
      {
        ariaLabel: 'Throwing run',
        disabled: false,
        id: 'throwing-run',
        label: 'R',
        title: 'Throwing run',
      },
    ])
    expect(
      runCanvasAppCustomCommand({
        commandId: 'throwing-availability',
        commands,
        context,
      }),
    ).toBe(false)
    expect(
      runCanvasAppCustomCommand({
        commandId: 'throwing-run',
        commands,
        context,
      }),
    ).toBe(false)
    expect(throwingRun).toHaveBeenCalledTimes(1)
  })

  it('rejects malformed custom command descriptors before registration', () => {
    expect(() =>
      assertCanvasAppCustomCommands({} as unknown as CanvasAppCustomCommand[]),
    ).toThrow('Canvas app custom command descriptors must be an array')

    expect(() =>
      assertCanvasAppCustomCommands([
        {
          id: 'publish',
          title: 'Publish selection',
          run: vi.fn(),
        } as unknown as CanvasAppCustomCommand,
      ]),
    ).toThrow('Canvas app custom command publish requires label')

    expect(() =>
      assertCanvasAppCustomCommands([
        {
          id: 'publish',
          label: 'Pub',
          run: vi.fn(),
        } as unknown as CanvasAppCustomCommand,
      ]),
    ).toThrow('Canvas app custom command publish requires title')

    expect(() =>
      assertCanvasAppCustomCommands([
        {
          id: 'publish',
          ariaLabel: true,
          label: 'Pub',
          title: 'Publish selection',
          run: vi.fn(),
        } as unknown as CanvasAppCustomCommand,
      ]),
    ).toThrow('Canvas app custom command publish requires ariaLabel')

    expect(() =>
      assertCanvasAppCustomCommands([
        {
          id: 'publish',
          label: 'Pub',
          title: 'Publish selection',
        } as unknown as CanvasAppCustomCommand,
      ]),
    ).toThrow('Canvas app custom command publish requires run')

    expect(() =>
      assertCanvasAppCustomCommands([
        {
          id: 'publish',
          label: 'Pub',
          title: 'Publish selection',
          isEnabled: true,
          run: vi.fn(),
        } as unknown as CanvasAppCustomCommand,
      ]),
    ).toThrow('Canvas app custom command publish requires isEnabled')
  })
})
