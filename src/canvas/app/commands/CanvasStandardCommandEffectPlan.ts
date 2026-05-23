import {
  alignCanvasCommand,
  deleteCanvasCommand,
  distributeCanvasCommand,
  groupCanvasCommand,
  lockCanvasCommand,
  nudgeCanvasCommand,
  reorderCanvasCommand,
  selectAllCanvasCommand,
  ungroupCanvasCommand,
  unlockAllCanvasCommand,
  type CanvasAffordanceConfig,
  type CanvasAlignMode,
  type CanvasCommandAdapter,
  type CanvasDistributeMode,
  type CanvasReorderMode,
} from '../../engine'
import type { CanvasItem } from '../../entities'
import {
  createCanvasStandardHistoryEffect,
  type CanvasStandardCommandDocumentEffect,
} from './CanvasStandardCommandDocumentEffects'
import {
  createCanvasStandardChangedItemsResultEffect,
  createCanvasStandardGroupSelectionResultEffect,
  createCanvasStandardNudgeResultEffect,
  createCanvasStandardRemoveSelectionResultEffect,
  createCanvasStandardReorderSelectionResultEffect,
  createCanvasStandardSelectAllResultEffect,
  createCanvasStandardUngroupSelectionResultEffect,
} from './CanvasStandardCommandResultEffects'

export type CanvasStandardCommand =
  | { kind: 'align'; mode: CanvasAlignMode }
  | { kind: 'distribute'; mode: CanvasDistributeMode }
  | { kind: 'delete' }
  | { kind: 'group' }
  | { kind: 'ungroup' }
  | { kind: 'lock' }
  | { kind: 'unlock-all' }
  | { kind: 'undo' }
  | { kind: 'redo' }
  | { dx: number; dy: number; kind: 'nudge' }
  | { kind: 'reorder'; mode: CanvasReorderMode }
  | { kind: 'select-all' }

export type CanvasStandardCommandEffectPlanContext = {
  commandAdapter: CanvasCommandAdapter<CanvasItem>
  config: CanvasAffordanceConfig
  createId: (prefix: string) => string
  items: CanvasItem[]
  selection: string[]
}

export function createCanvasStandardCommandEffectPlan({
  command,
  context,
}: {
  command: CanvasStandardCommand
  context: CanvasStandardCommandEffectPlanContext
}): CanvasStandardCommandDocumentEffect | null {
  switch (command.kind) {
    case 'align':
      return planCanvasAlignCommand(command.mode, context)
    case 'distribute':
      return planCanvasDistributeCommand(command.mode, context)
    case 'delete':
      return planCanvasDeleteCommand(context)
    case 'group':
      return planCanvasGroupCommand(context)
    case 'ungroup':
      return planCanvasUngroupCommand(context)
    case 'lock':
      return planCanvasLockCommand(context)
    case 'unlock-all':
      return planCanvasUnlockAllCommand(context)
    case 'undo':
      return planCanvasUndoCommand(context)
    case 'redo':
      return planCanvasRedoCommand(context)
    case 'nudge':
      return planCanvasNudgeCommand(command, context)
    case 'reorder':
      return planCanvasReorderCommand(command.mode, context)
    case 'select-all':
      return planCanvasSelectAllCommand(context)
  }

  return assertUnhandledCanvasStandardCommand(command)
}

function planCanvasAlignCommand(
  mode: CanvasAlignMode,
  context: CanvasStandardCommandEffectPlanContext,
): CanvasStandardCommandDocumentEffect | null {
  const result = alignCanvasCommand({
    adapter: context.commandAdapter,
    config: context.config,
    items: context.items,
    mode,
    selection: context.selection,
  })

  return result
    ? createCanvasStandardChangedItemsResultEffect({ result })
    : null
}

function planCanvasDistributeCommand(
  mode: CanvasDistributeMode,
  context: CanvasStandardCommandEffectPlanContext,
): CanvasStandardCommandDocumentEffect | null {
  const result = distributeCanvasCommand({
    adapter: context.commandAdapter,
    config: context.config,
    items: context.items,
    mode,
    selection: context.selection,
  })

  return result
    ? createCanvasStandardChangedItemsResultEffect({ result })
    : null
}

function planCanvasDeleteCommand(
  context: CanvasStandardCommandEffectPlanContext,
): CanvasStandardCommandDocumentEffect | null {
  const result = deleteCanvasCommand({
    adapter: context.commandAdapter,
    config: context.config,
    items: context.items,
    selection: context.selection,
  })

  return result
    ? createCanvasStandardRemoveSelectionResultEffect({
        result,
        selection: context.selection,
      })
    : null
}

function planCanvasGroupCommand(
  context: CanvasStandardCommandEffectPlanContext,
): CanvasStandardCommandDocumentEffect | null {
  const groupId = context.createId('group')
  const result = groupCanvasCommand({
    adapter: context.commandAdapter,
    config: context.config,
    createId: () => groupId,
    items: context.items,
    selection: context.selection,
  })

  return result
    ? createCanvasStandardGroupSelectionResultEffect({
        groupId,
        result,
        selection: context.selection,
      })
    : null
}

function planCanvasUngroupCommand(
  context: CanvasStandardCommandEffectPlanContext,
): CanvasStandardCommandDocumentEffect | null {
  const result = ungroupCanvasCommand({
    adapter: context.commandAdapter,
    config: context.config,
    items: context.items,
    selection: context.selection,
  })

  return result
    ? createCanvasStandardUngroupSelectionResultEffect({
        result,
        selection: context.selection,
      })
    : null
}

function planCanvasLockCommand(
  context: CanvasStandardCommandEffectPlanContext,
): CanvasStandardCommandDocumentEffect | null {
  const result = lockCanvasCommand({
    adapter: context.commandAdapter,
    config: context.config,
    items: context.items,
    selection: context.selection,
  })

  return result
    ? createCanvasStandardChangedItemsResultEffect({
        fallbackSelection: result.selection,
        result,
      })
    : null
}

function planCanvasUnlockAllCommand(
  context: CanvasStandardCommandEffectPlanContext,
): CanvasStandardCommandDocumentEffect | null {
  const result = unlockAllCanvasCommand({
    adapter: context.commandAdapter,
    config: context.config,
    items: context.items,
    selection: context.selection,
  })

  return result
    ? createCanvasStandardChangedItemsResultEffect({
        fallbackSelection: result.selection,
        result,
      })
    : null
}

function planCanvasUndoCommand(
  context: CanvasStandardCommandEffectPlanContext,
): CanvasStandardCommandDocumentEffect | null {
  return context.config.commands.undo
    ? createCanvasStandardHistoryEffect({ direction: 'undo' })
    : null
}

function planCanvasRedoCommand(
  context: CanvasStandardCommandEffectPlanContext,
): CanvasStandardCommandDocumentEffect | null {
  return context.config.commands.redo
    ? createCanvasStandardHistoryEffect({ direction: 'redo' })
    : null
}

function planCanvasNudgeCommand(
  command: Extract<CanvasStandardCommand, { kind: 'nudge' }>,
  context: CanvasStandardCommandEffectPlanContext,
): CanvasStandardCommandDocumentEffect | null {
  const result = nudgeCanvasCommand({
    adapter: context.commandAdapter,
    config: context.config,
    dx: command.dx,
    dy: command.dy,
    items: context.items,
    selection: context.selection,
  })

  return result
    ? createCanvasStandardNudgeResultEffect({ items: result })
    : null
}

function planCanvasReorderCommand(
  mode: CanvasReorderMode,
  context: CanvasStandardCommandEffectPlanContext,
): CanvasStandardCommandDocumentEffect | null {
  const result = reorderCanvasCommand({
    adapter: context.commandAdapter,
    config: context.config,
    items: context.items,
    mode,
    selection: context.selection,
  })

  return result
    ? createCanvasStandardReorderSelectionResultEffect({
        mode,
        result,
        selection: context.selection,
      })
    : null
}

function planCanvasSelectAllCommand(
  context: CanvasStandardCommandEffectPlanContext,
): CanvasStandardCommandDocumentEffect | null {
  const nextSelection = selectAllCanvasCommand({
    adapter: context.commandAdapter,
    config: context.config,
    items: context.items,
  })

  return nextSelection
    ? createCanvasStandardSelectAllResultEffect({ selection: nextSelection })
    : null
}

function assertUnhandledCanvasStandardCommand(
  command: never,
): never {
  throw new Error(`Unhandled canvas standard command: ${String(command)}`)
}
