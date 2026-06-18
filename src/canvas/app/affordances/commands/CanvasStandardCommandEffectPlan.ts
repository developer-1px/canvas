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
  type CanvasCommandItem,
  type CanvasDistributeMode,
  type CanvasReorderMode,
} from '../../../engine'
import type { CanvasItem } from '../../../entities'
import type { CanvasStandardCommand } from './CanvasStandardCommandContracts'
import type {
  CanvasStandardCommandDocumentEffect,
} from './CanvasStandardCommandDocumentEffectContracts'
import { createCanvasStandardHistoryEffect } from './CanvasStandardCommandDocumentEffects'
import {
  createCanvasStandardChangedItemsResultEffect,
  createCanvasStandardGroupSelectionResultEffect,
  createCanvasStandardNudgeResultEffect,
  createCanvasStandardRemoveSelectionResultEffect,
  createCanvasStandardReorderSelectionResultEffect,
  createCanvasStandardSelectAllResultEffect,
  createCanvasStandardUngroupSelectionResultEffect,
} from './CanvasStandardCommandResultEffects'

export type CanvasStandardCommandEffectPlanContext<
  TItem extends CanvasCommandItem = CanvasItem,
> = {
  commandAdapter: CanvasCommandAdapter<TItem>
  config: CanvasAffordanceConfig
  createId: (prefix: string) => string
  items: TItem[]
  selection: string[]
}

type CanvasStandardCommandEffectPlanner<
  TKind extends CanvasStandardCommand['kind'],
> = <TItem extends CanvasCommandItem = CanvasItem>(args: {
  command: Extract<CanvasStandardCommand, { kind: TKind }>
  context: CanvasStandardCommandEffectPlanContext<TItem>
}) => CanvasStandardCommandDocumentEffect<TItem> | null

type CanvasStandardCommandEffectPlanners = {
  [TKind in CanvasStandardCommand['kind']]:
    CanvasStandardCommandEffectPlanner<TKind>
}

type CanvasStandardCommandAnyEffectPlanner =
  <TItem extends CanvasCommandItem = CanvasItem>(args: {
  command: CanvasStandardCommand
  context: CanvasStandardCommandEffectPlanContext<TItem>
}) => CanvasStandardCommandDocumentEffect<TItem> | null

const CANVAS_STANDARD_COMMAND_EFFECT_PLANNERS = Object.freeze({
  align: ({ command, context }) =>
    planCanvasAlignCommand(command.mode, context),
  delete: ({ context }) => planCanvasDeleteCommand(context),
  distribute: ({ command, context }) =>
    planCanvasDistributeCommand(command.mode, context),
  group: ({ context }) => planCanvasGroupCommand(context),
  lock: ({ context }) => planCanvasLockCommand(context),
  nudge: ({ command, context }) => planCanvasNudgeCommand(command, context),
  redo: ({ context }) => planCanvasRedoCommand(context),
  reorder: ({ command, context }) =>
    planCanvasReorderCommand(command.mode, context),
  'select-all': ({ context }) => planCanvasSelectAllCommand(context),
  undo: ({ context }) => planCanvasUndoCommand(context),
  ungroup: ({ context }) => planCanvasUngroupCommand(context),
  'unlock-all': ({ context }) => planCanvasUnlockAllCommand(context),
} satisfies CanvasStandardCommandEffectPlanners)

export function createCanvasStandardCommandEffectPlan<
  TItem extends CanvasCommandItem = CanvasItem,
>({
  command,
  context,
}: {
  command: CanvasStandardCommand
  context: CanvasStandardCommandEffectPlanContext<TItem>
}): CanvasStandardCommandDocumentEffect<TItem> | null {
  const planner = CANVAS_STANDARD_COMMAND_EFFECT_PLANNERS[
    command.kind
  ] as CanvasStandardCommandAnyEffectPlanner

  return planner<TItem>({ command, context })
}

function planCanvasAlignCommand<
  TItem extends CanvasCommandItem = CanvasItem,
>(
  mode: CanvasAlignMode,
  context: CanvasStandardCommandEffectPlanContext<TItem>,
): CanvasStandardCommandDocumentEffect<TItem> | null {
  const result = alignCanvasCommand({
    adapter: context.commandAdapter,
    config: context.config,
    items: context.items,
    mode,
    selection: context.selection,
  })

  return result
    ? createCanvasStandardChangedItemsResultEffect<TItem>({ result })
    : null
}

function planCanvasDistributeCommand<
  TItem extends CanvasCommandItem = CanvasItem,
>(
  mode: CanvasDistributeMode,
  context: CanvasStandardCommandEffectPlanContext<TItem>,
): CanvasStandardCommandDocumentEffect<TItem> | null {
  const result = distributeCanvasCommand({
    adapter: context.commandAdapter,
    config: context.config,
    items: context.items,
    mode,
    selection: context.selection,
  })

  return result
    ? createCanvasStandardChangedItemsResultEffect<TItem>({ result })
    : null
}

function planCanvasDeleteCommand<
  TItem extends CanvasCommandItem = CanvasItem,
>(
  context: CanvasStandardCommandEffectPlanContext<TItem>,
): CanvasStandardCommandDocumentEffect<TItem> | null {
  const result = deleteCanvasCommand({
    adapter: context.commandAdapter,
    config: context.config,
    items: context.items,
    selection: context.selection,
  })

  return result
    ? createCanvasStandardRemoveSelectionResultEffect<TItem>({
        result,
        selection: context.selection,
      })
    : null
}

function planCanvasGroupCommand<
  TItem extends CanvasCommandItem = CanvasItem,
>(
  context: CanvasStandardCommandEffectPlanContext<TItem>,
): CanvasStandardCommandDocumentEffect<TItem> | null {
  const groupId = context.createId('group')
  const result = groupCanvasCommand({
    adapter: context.commandAdapter,
    config: context.config,
    createId: () => groupId,
    items: context.items,
    selection: context.selection,
  })

  return result
    ? createCanvasStandardGroupSelectionResultEffect<TItem>({
        groupId,
        result,
        selection: context.selection,
      })
    : null
}

function planCanvasUngroupCommand<
  TItem extends CanvasCommandItem = CanvasItem,
>(
  context: CanvasStandardCommandEffectPlanContext<TItem>,
): CanvasStandardCommandDocumentEffect<TItem> | null {
  const result = ungroupCanvasCommand({
    adapter: context.commandAdapter,
    config: context.config,
    items: context.items,
    selection: context.selection,
  })

  return result
    ? createCanvasStandardUngroupSelectionResultEffect<TItem>({
        result,
        selection: context.selection,
      })
    : null
}

function planCanvasLockCommand<
  TItem extends CanvasCommandItem = CanvasItem,
>(
  context: CanvasStandardCommandEffectPlanContext<TItem>,
): CanvasStandardCommandDocumentEffect<TItem> | null {
  const result = lockCanvasCommand({
    adapter: context.commandAdapter,
    config: context.config,
    items: context.items,
    selection: context.selection,
  })

  return result
    ? createCanvasStandardChangedItemsResultEffect<TItem>({
        fallbackSelection: result.selection,
        result,
      })
    : null
}

function planCanvasUnlockAllCommand<
  TItem extends CanvasCommandItem = CanvasItem,
>(
  context: CanvasStandardCommandEffectPlanContext<TItem>,
): CanvasStandardCommandDocumentEffect<TItem> | null {
  const result = unlockAllCanvasCommand({
    adapter: context.commandAdapter,
    config: context.config,
    items: context.items,
    selection: context.selection,
  })

  return result
    ? createCanvasStandardChangedItemsResultEffect<TItem>({
        fallbackSelection: result.selection,
        result,
      })
    : null
}

function planCanvasUndoCommand<
  TItem extends CanvasCommandItem = CanvasItem,
>(
  context: CanvasStandardCommandEffectPlanContext<TItem>,
): CanvasStandardCommandDocumentEffect<TItem> | null {
  return context.config.commands.undo
    ? createCanvasStandardHistoryEffect<TItem>({ direction: 'undo' })
    : null
}

function planCanvasRedoCommand<
  TItem extends CanvasCommandItem = CanvasItem,
>(
  context: CanvasStandardCommandEffectPlanContext<TItem>,
): CanvasStandardCommandDocumentEffect<TItem> | null {
  return context.config.commands.redo
    ? createCanvasStandardHistoryEffect<TItem>({ direction: 'redo' })
    : null
}

function planCanvasNudgeCommand<
  TItem extends CanvasCommandItem = CanvasItem,
>(
  command: Extract<CanvasStandardCommand, { kind: 'nudge' }>,
  context: CanvasStandardCommandEffectPlanContext<TItem>,
): CanvasStandardCommandDocumentEffect<TItem> | null {
  const result = nudgeCanvasCommand({
    adapter: context.commandAdapter,
    config: context.config,
    dx: command.dx,
    dy: command.dy,
    items: context.items,
    selection: context.selection,
  })

  return result
    ? createCanvasStandardNudgeResultEffect<TItem>({ items: result })
    : null
}

function planCanvasReorderCommand<
  TItem extends CanvasCommandItem = CanvasItem,
>(
  mode: CanvasReorderMode,
  context: CanvasStandardCommandEffectPlanContext<TItem>,
): CanvasStandardCommandDocumentEffect<TItem> | null {
  const result = reorderCanvasCommand({
    adapter: context.commandAdapter,
    config: context.config,
    items: context.items,
    mode,
    selection: context.selection,
  })

  return result
    ? createCanvasStandardReorderSelectionResultEffect<TItem>({
        mode,
        result,
        selection: context.selection,
      })
    : null
}

function planCanvasSelectAllCommand<
  TItem extends CanvasCommandItem = CanvasItem,
>(
  context: CanvasStandardCommandEffectPlanContext<TItem>,
): CanvasStandardCommandDocumentEffect<TItem> | null {
  const nextSelection = selectAllCanvasCommand({
    adapter: context.commandAdapter,
    config: context.config,
    items: context.items,
  })

  return nextSelection
    ? createCanvasStandardSelectAllResultEffect<TItem>({
        selection: nextSelection,
      })
    : null
}
