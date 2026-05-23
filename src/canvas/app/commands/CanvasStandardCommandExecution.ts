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
import type {
  CanvasItem,
  EditingText,
} from '../../entities'
import type {
  CommitCanvasItemsChange,
  CommitCanvasSelection,
} from '../workflow/CanvasWorkflowContract'

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

export type CanvasEditingUpdate =
  | EditingText
  | null
  | ((current: EditingText | null) => EditingText | null)

export type CanvasStandardCommandExecutionContext = {
  commandAdapter: CanvasCommandAdapter<CanvasItem>
  commitItemsChange: CommitCanvasItemsChange
  commitSelection: CommitCanvasSelection
  config: CanvasAffordanceConfig
  createId: (prefix: string) => string
  items: CanvasItem[]
  redo: () => string[] | undefined
  selection: string[]
  setEditing: (editing: CanvasEditingUpdate) => void
  setSelection: (selection: string[]) => void
  undo: () => string[] | undefined
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

  context.commitItemsChange({ type: 'replace-changed', items: result.items }, {
    before: context.selection,
    after: result.selection,
  })
  return true
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

  context.commitItemsChange({ type: 'replace-changed', items: result.items }, {
    before: context.selection,
    after: result.selection,
  })
  return true
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

  const didCommit = context.commitItemsChange(
    { type: 'remove-selection', selection: context.selection },
    {
      before: context.selection,
      after: result.selection,
    },
  )

  if (!didCommit) {
    context.commitSelection(result.selection)
  }

  context.setEditing((current) =>
    current && result.clearEditingIds.includes(current.id) ? null : current,
  )
  return true
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

  const didCommit = context.commitItemsChange(
    { type: 'group-selection', groupId, selection: context.selection },
    {
      before: context.selection,
      after: result.selection,
    },
  )

  if (!didCommit) {
    context.commitSelection(result.selection)
  }

  return true
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

  const didCommit = context.commitItemsChange(
    { type: 'ungroup-selection', selection: context.selection },
    {
      before: context.selection,
      after: result.selection,
    },
  )

  if (!didCommit) {
    context.commitSelection(result.selection)
  }

  return true
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

  const didCommit = context.commitItemsChange(
    { type: 'replace-changed', items: result.items },
    {
      before: context.selection,
      after: result.selection,
    },
  )

  if (!didCommit) {
    context.commitSelection(result.selection)
  }

  return true
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

  const didCommit = context.commitItemsChange(
    { type: 'replace-changed', items: result.items },
    {
      before: context.selection,
      after: result.selection,
    },
  )

  if (!didCommit) {
    context.commitSelection(result.selection)
  }

  return true
}

function executeCanvasUndoCommand(
  context: CanvasStandardCommandExecutionContext,
) {
  if (!context.config.commands.undo) {
    return false
  }

  const restoredSelection = context.undo()
  context.setEditing(null)

  if (restoredSelection) {
    context.setSelection(restoredSelection)
  }

  return true
}

function executeCanvasRedoCommand(
  context: CanvasStandardCommandExecutionContext,
) {
  if (!context.config.commands.redo) {
    return false
  }

  const restoredSelection = context.redo()
  context.setEditing(null)

  if (restoredSelection) {
    context.setSelection(restoredSelection)
  }

  return true
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

  context.commitItemsChange(
    { type: 'replace-changed', items: result },
    {
      before: context.selection,
      after: context.selection,
    },
  )
  return true
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

  context.commitItemsChange(
    { type: 'reorder-selection', mode, selection: context.selection },
    {
      before: context.selection,
      after: result.selection,
    },
  )
  return true
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

  context.commitSelection(nextSelection)
  return true
}

function assertUnhandledCanvasStandardCommand(
  command: never,
): never {
  throw new Error(`Unhandled canvas standard command: ${String(command)}`)
}
