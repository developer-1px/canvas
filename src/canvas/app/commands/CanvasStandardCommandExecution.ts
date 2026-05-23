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
  applyCanvasStandardHistoryEffect,
  applyCanvasStandardItemsChangeEffect,
  applyCanvasStandardSelectionEffect,
  type CanvasStandardCommandDocumentEffectContext,
} from './CanvasStandardCommandDocumentEffects'

export type { CanvasEditingUpdate } from './CanvasStandardCommandDocumentEffects'

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

export type CanvasStandardCommandExecutionContext =
  CanvasStandardCommandDocumentEffectContext & {
    commandAdapter: CanvasCommandAdapter<CanvasItem>
    config: CanvasAffordanceConfig
    createId: (prefix: string) => string
    items: CanvasItem[]
    selection: string[]
  }

export function executeCanvasStandardCommand({
  command,
  context,
}: {
  command: CanvasStandardCommand
  context: CanvasStandardCommandExecutionContext
}) {
  switch (command.kind) {
    case 'align':
      return executeCanvasAlignCommand(command.mode, context)
    case 'distribute':
      return executeCanvasDistributeCommand(command.mode, context)
    case 'delete':
      return executeCanvasDeleteCommand(context)
    case 'group':
      return executeCanvasGroupCommand(context)
    case 'ungroup':
      return executeCanvasUngroupCommand(context)
    case 'lock':
      return executeCanvasLockCommand(context)
    case 'unlock-all':
      return executeCanvasUnlockAllCommand(context)
    case 'undo':
      return executeCanvasUndoCommand(context)
    case 'redo':
      return executeCanvasRedoCommand(context)
    case 'nudge':
      return executeCanvasNudgeCommand(command, context)
    case 'reorder':
      return executeCanvasReorderCommand(command.mode, context)
    case 'select-all':
      return executeCanvasSelectAllCommand(context)
  }

  return assertUnhandledCanvasStandardCommand(command)
}

function executeCanvasAlignCommand(
  mode: CanvasAlignMode,
  context: CanvasStandardCommandExecutionContext,
) {
  const result = alignCanvasCommand({
    adapter: context.commandAdapter,
    config: context.config,
    items: context.items,
    mode,
    selection: context.selection,
  })

  if (!result) {
    return false
  }

  return applyCanvasStandardItemsChangeEffect({
    afterSelection: result.selection,
    change: { type: 'replace-changed', items: result.items },
    context,
  })
}

function executeCanvasDistributeCommand(
  mode: CanvasDistributeMode,
  context: CanvasStandardCommandExecutionContext,
) {
  const result = distributeCanvasCommand({
    adapter: context.commandAdapter,
    config: context.config,
    items: context.items,
    mode,
    selection: context.selection,
  })

  if (!result) {
    return false
  }

  return applyCanvasStandardItemsChangeEffect({
    afterSelection: result.selection,
    change: { type: 'replace-changed', items: result.items },
    context,
  })
}

function executeCanvasDeleteCommand(
  context: CanvasStandardCommandExecutionContext,
) {
  const result = deleteCanvasCommand({
    adapter: context.commandAdapter,
    config: context.config,
    items: context.items,
    selection: context.selection,
  })

  if (!result) {
    return false
  }

  return applyCanvasStandardItemsChangeEffect({
    afterSelection: result.selection,
    change: { type: 'remove-selection', selection: context.selection },
    clearEditingIds: result.clearEditingIds,
    context,
    fallbackSelection: result.selection,
  })
}

function executeCanvasGroupCommand(
  context: CanvasStandardCommandExecutionContext,
) {
  const groupId = context.createId('group')
  const result = groupCanvasCommand({
    adapter: context.commandAdapter,
    config: context.config,
    createId: () => groupId,
    items: context.items,
    selection: context.selection,
  })

  if (!result) {
    return false
  }

  return applyCanvasStandardItemsChangeEffect({
    afterSelection: result.selection,
    change: { type: 'group-selection', groupId, selection: context.selection },
    context,
    fallbackSelection: result.selection,
  })
}

function executeCanvasUngroupCommand(
  context: CanvasStandardCommandExecutionContext,
) {
  const result = ungroupCanvasCommand({
    adapter: context.commandAdapter,
    config: context.config,
    items: context.items,
    selection: context.selection,
  })

  if (!result) {
    return false
  }

  return applyCanvasStandardItemsChangeEffect({
    afterSelection: result.selection,
    change: { type: 'ungroup-selection', selection: context.selection },
    context,
    fallbackSelection: result.selection,
  })
}

function executeCanvasLockCommand(
  context: CanvasStandardCommandExecutionContext,
) {
  const result = lockCanvasCommand({
    adapter: context.commandAdapter,
    config: context.config,
    items: context.items,
    selection: context.selection,
  })

  if (!result) {
    return false
  }

  return applyCanvasStandardItemsChangeEffect({
    afterSelection: result.selection,
    change: { type: 'replace-changed', items: result.items },
    context,
    fallbackSelection: result.selection,
  })
}

function executeCanvasUnlockAllCommand(
  context: CanvasStandardCommandExecutionContext,
) {
  const result = unlockAllCanvasCommand({
    adapter: context.commandAdapter,
    config: context.config,
    items: context.items,
    selection: context.selection,
  })

  if (!result) {
    return false
  }

  return applyCanvasStandardItemsChangeEffect({
    afterSelection: result.selection,
    change: { type: 'replace-changed', items: result.items },
    context,
    fallbackSelection: result.selection,
  })
}

function executeCanvasUndoCommand(
  context: CanvasStandardCommandExecutionContext,
) {
  if (!context.config.commands.undo) {
    return false
  }

  return applyCanvasStandardHistoryEffect({
    context,
    direction: 'undo',
  })
}

function executeCanvasRedoCommand(
  context: CanvasStandardCommandExecutionContext,
) {
  if (!context.config.commands.redo) {
    return false
  }

  return applyCanvasStandardHistoryEffect({
    context,
    direction: 'redo',
  })
}

function executeCanvasNudgeCommand(
  command: Extract<CanvasStandardCommand, { kind: 'nudge' }>,
  context: CanvasStandardCommandExecutionContext,
) {
  const result = nudgeCanvasCommand({
    adapter: context.commandAdapter,
    config: context.config,
    dx: command.dx,
    dy: command.dy,
    items: context.items,
    selection: context.selection,
  })

  if (!result) {
    return false
  }

  return applyCanvasStandardItemsChangeEffect({
    change: { type: 'replace-changed', items: result },
    context,
  })
}

function executeCanvasReorderCommand(
  mode: CanvasReorderMode,
  context: CanvasStandardCommandExecutionContext,
) {
  const result = reorderCanvasCommand({
    adapter: context.commandAdapter,
    config: context.config,
    items: context.items,
    mode,
    selection: context.selection,
  })

  if (!result) {
    return false
  }

  return applyCanvasStandardItemsChangeEffect({
    afterSelection: result.selection,
    change: { type: 'reorder-selection', mode, selection: context.selection },
    context,
  })
}

function executeCanvasSelectAllCommand(
  context: CanvasStandardCommandExecutionContext,
) {
  const nextSelection = selectAllCanvasCommand({
    adapter: context.commandAdapter,
    config: context.config,
    items: context.items,
  })

  if (!nextSelection) {
    return false
  }

  return applyCanvasStandardSelectionEffect({
    context,
    selection: nextSelection,
  })
}

function assertUnhandledCanvasStandardCommand(
  command: never,
): never {
  throw new Error(`Unhandled canvas standard command: ${String(command)}`)
}
