import { describe, expect, it, vi } from 'vitest'

import {
  createCanvasDataTransferImportActionPlan,
  runCanvasDataTransferImportActionPlan,
} from './CanvasDataTransferImportActionPlan'

describe('createCanvasDataTransferImportActionPlan', () => {
  it('returns the first exclusive action plan without evaluating later resolvers', () => {
    const later = vi.fn(() => 'text')

    expect(createCanvasDataTransferImportActionPlan<string>({
      resolvers: [
        { mode: 'append', resolve: () => null },
        { mode: 'exclusive', resolve: () => 'image-file' },
        { mode: 'append', resolve: later },
      ],
    })).toEqual(['image-file'])
    expect(later).not.toHaveBeenCalled()
  })

  it('accumulates append resolver actions and skips empty values', () => {
    expect(createCanvasDataTransferImportActionPlan<string>({
      resolvers: [
        { mode: 'append', resolve: () => undefined },
        { mode: 'append', resolve: () => 'media-source' },
        { mode: 'append', resolve: () => [] },
        { mode: 'append', resolve: () => ['rich-text-source', 'text-source'] },
      ],
    })).toEqual(['media-source', 'rich-text-source', 'text-source'])
  })

  it('lets later exclusive actions override previously appended fallbacks', () => {
    expect(createCanvasDataTransferImportActionPlan<string>({
      resolvers: [
        { mode: 'append', resolve: () => 'text-source' },
        { mode: 'exclusive', resolve: () => ['table-source'] },
      ],
    })).toEqual(['table-source'])
  })
})

describe('runCanvasDataTransferImportActionPlan', () => {
  it('runs actions in order and stops after the first consumed action', () => {
    const actions = [
      { kind: 'plain-text', source: 'fallback' },
      { kind: 'html-table', source: 'table' },
      { kind: 'image-file', source: 'image' },
    ] as const
    const runAction = vi.fn((action: (typeof actions)[number]) =>
      action.kind === 'html-table',
    )
    const onConsumed = vi.fn()

    expect(runCanvasDataTransferImportActionPlan({
      actions,
      onConsumed,
      runAction,
    })).toEqual({
      attemptedActions: [actions[0], actions[1]],
      consumed: true,
      consumedAction: actions[1],
      consumedActionIndex: 1,
    })
    expect(runAction).toHaveBeenCalledTimes(2)
    expect(runAction).toHaveBeenNthCalledWith(1, actions[0], 0)
    expect(runAction).toHaveBeenNthCalledWith(2, actions[1], 1)
    expect(onConsumed).toHaveBeenCalledWith({
      attemptedActions: [actions[0], actions[1]],
      consumed: true,
      consumedAction: actions[1],
      consumedActionIndex: 1,
    })
  })

  it('returns an unconsumed result after trying every action', () => {
    const actions = ['plain-text', 'html-table']
    const runAction = vi.fn(() => false)

    expect(runCanvasDataTransferImportActionPlan({
      actions,
      runAction,
    })).toEqual({
      attemptedActions: actions,
      consumed: false,
      consumedAction: null,
      consumedActionIndex: -1,
    })
    expect(runAction).toHaveBeenCalledTimes(2)
  })
})
