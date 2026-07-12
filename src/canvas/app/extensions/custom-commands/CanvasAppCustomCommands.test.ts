import { describe, expect, it, vi } from 'vitest'
import {
  getCanvasAppCustomCommandStates,
  runCanvasAppCustomCommand,
} from './CanvasAppCustomCommandExecution'
import { assertCanvasAppCustomCommands } from './CanvasAppCustomCommandContracts'
import {
  CANVAS_APP_EDITOR_CAPABILITIES,
  CANVAS_APP_READ_ONLY_CAPABILITIES,
} from '../../workflow/CanvasAppCapabilityAssembly'
import {
  createCanvasAppDocumentAuthority,
  createCanvasAppDocumentAuthorityRead,
} from '../../workflow/CanvasAppDocumentAuthority'
import type {
  CanvasAppCustomCommand,
  CanvasAppCustomCommandContext,
} from './CanvasAppCustomCommands'

const context: CanvasAppCustomCommandContext = {
  commitSelection: vi.fn(),
  createId: (prefix) => `${prefix}-1`,
  document: createCanvasAppDocumentAuthority({
    commitItemsChange: vi.fn(() => true),
    readItems: () => [],
    read: createCanvasAppDocumentAuthorityRead(
      CANVAS_APP_EDITOR_CAPABILITIES,
    ),
  }),
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
        requiredCapability: 'editDocument',
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
        requiredCapability: 'editDocument',
        title: 'Publish selection',
        isEnabled: ({ selection }) => selection.length > 0,
        run,
      },
      {
        id: 'archive',
        label: 'Arc',
        requiredCapability: 'editDocument',
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

  it('denies a directly invoked view-only custom document command', () => {
    const run = vi.fn()
    const command: CanvasAppCustomCommand = {
      id: 'archive',
      label: 'Arc',
      requiredCapability: 'editDocument',
      run,
      title: 'Archive selection',
    }
    const viewOnlyContext = {
      ...context,
      document: createCanvasAppDocumentAuthority({
        commitItemsChange: vi.fn(() => true),
        readItems: () => [],
        read: createCanvasAppDocumentAuthorityRead(
          CANVAS_APP_READ_ONLY_CAPABILITIES,
        ),
      }),
    }

    expect(getCanvasAppCustomCommandStates({
      commands: [command],
      context: viewOnlyContext,
    })[0]?.disabled).toBe(true)
    expect(runCanvasAppCustomCommand({
      commandId: command.id,
      commands: [command],
      context: viewOnlyContext,
    })).toBe(false)
    expect(run).not.toHaveBeenCalled()
  })

  it('denies a mutation even when a view-capable command is invoked directly', () => {
    const commitItemsChange = vi.fn(() => true)
    const viewOnlyContext: CanvasAppCustomCommandContext = {
      ...context,
      document: createCanvasAppDocumentAuthority({
        commitItemsChange,
        readItems: () => [],
        read: createCanvasAppDocumentAuthorityRead(
          CANVAS_APP_READ_ONLY_CAPABILITIES,
        ),
      }),
    }
    let mutationResult: ReturnType<
      CanvasAppCustomCommandContext['document']['commit']
    > | null = null
    const command: CanvasAppCustomCommand = {
      id: 'view-and-attempt-edit',
      label: 'View',
      requiredCapability: 'view',
      run: ({ document }) => {
        mutationResult = document.commit({
          change: {
            items: [{
              fill: '#fff',
              h: 80,
              id: 'rect-1',
              stroke: '#111',
              type: 'rect',
              w: 120,
              x: 0,
              y: 0,
            }],
            type: 'add',
          },
        })
      },
      title: 'View and attempt edit',
    }

    expect(runCanvasAppCustomCommand({
      commandId: command.id,
      commands: [command],
      context: viewOnlyContext,
    })).toBe(true)
    expect(mutationResult).toEqual({
      code: 'capability-denied',
      ok: false,
      requiredCapability: 'editDocument',
    })
    expect(commitItemsChange).not.toHaveBeenCalled()
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
        requiredCapability: 'editDocument',
        title: 'Throwing availability',
        isEnabled: throwingAvailability,
        run: vi.fn(),
      },
      {
        id: 'throwing-run',
        label: 'R',
        requiredCapability: 'editDocument',
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
          requiredCapability: 'editDocument',
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
          requiredCapability: 'editDocument',
          title: 'Publish selection',
        } as unknown as CanvasAppCustomCommand,
      ]),
    ).toThrow('Canvas app custom command publish requires run')

    expect(() =>
      assertCanvasAppCustomCommands([
        {
          id: 'publish',
          label: 'Pub',
          requiredCapability: 'editDocument',
          title: 'Publish selection',
          isEnabled: true,
          run: vi.fn(),
        } as unknown as CanvasAppCustomCommand,
      ]),
    ).toThrow('Canvas app custom command publish requires isEnabled')

    expect(() =>
      assertCanvasAppCustomCommands([
        {
          id: 'publish',
          label: 'Pub',
          title: 'Publish selection',
          run: vi.fn(),
        } as unknown as CanvasAppCustomCommand,
      ]),
    ).toThrow(
      'Canvas app custom command publish requires requiredCapability',
    )
  })
})
