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
import type {
  CanvasStandardCommandDocumentEffect,
} from './CanvasStandardCommandDocumentEffects'

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
    ? {
        afterSelection: result.selection,
        change: { type: 'replace-changed', items: result.items },
        kind: 'items-change',
      }
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
    ? {
        afterSelection: result.selection,
        change: { type: 'replace-changed', items: result.items },
        kind: 'items-change',
      }
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
    ? {
        afterSelection: result.selection,
        change: { type: 'remove-selection', selection: context.selection },
        clearEditingIds: result.clearEditingIds,
        fallbackSelection: result.selection,
        kind: 'items-change',
      }
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
    ? {
        afterSelection: result.selection,
        change: { type: 'group-selection', groupId, selection: context.selection },
        fallbackSelection: result.selection,
        kind: 'items-change',
      }
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
    ? {
        afterSelection: result.selection,
        change: { type: 'ungroup-selection', selection: context.selection },
        fallbackSelection: result.selection,
        kind: 'items-change',
      }
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
    ? {
        afterSelection: result.selection,
        change: { type: 'replace-changed', items: result.items },
        fallbackSelection: result.selection,
        kind: 'items-change',
      }
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
    ? {
        afterSelection: result.selection,
        change: { type: 'replace-changed', items: result.items },
        fallbackSelection: result.selection,
        kind: 'items-change',
      }
    : null
}

function planCanvasUndoCommand(
  context: CanvasStandardCommandEffectPlanContext,
): CanvasStandardCommandDocumentEffect | null {
  return context.config.commands.undo
    ? { direction: 'undo', kind: 'history' }
    : null
}

function planCanvasRedoCommand(
  context: CanvasStandardCommandEffectPlanContext,
): CanvasStandardCommandDocumentEffect | null {
  return context.config.commands.redo
    ? { direction: 'redo', kind: 'history' }
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
    ? {
        change: { type: 'replace-changed', items: result },
        kind: 'items-change',
      }
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
    ? {
        afterSelection: result.selection,
        change: { type: 'reorder-selection', mode, selection: context.selection },
        kind: 'items-change',
      }
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
    ? { kind: 'selection', selection: nextSelection }
    : null
}

function assertUnhandledCanvasStandardCommand(
  command: never,
): never {
  throw new Error(`Unhandled canvas standard command: ${String(command)}`)
}
