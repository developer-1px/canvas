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

export type CanvasStandardCommandEffectPlanContext = {
  commandAdapter: CanvasCommandAdapter<CanvasItem>
  config: CanvasAffordanceConfig
  createId: (prefix: string) => string
  items: CanvasItem[]
  selection: string[]
}

type CanvasStandardCommandEffectPlanner<
  TKind extends CanvasStandardCommand['kind'],
> = (args: {
  command: Extract<CanvasStandardCommand, { kind: TKind }>
  context: CanvasStandardCommandEffectPlanContext
}) => CanvasStandardCommandDocumentEffect | null

type CanvasStandardCommandEffectPlanners = {
  [TKind in CanvasStandardCommand['kind']]:
    CanvasStandardCommandEffectPlanner<TKind>
}

type CanvasStandardCommandAnyEffectPlanner = (args: {
  command: CanvasStandardCommand
  context: CanvasStandardCommandEffectPlanContext
}) => CanvasStandardCommandDocumentEffect | null

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

export function createCanvasStandardCommandEffectPlan({
  command,
  context,
}: {
  command: CanvasStandardCommand
  context: CanvasStandardCommandEffectPlanContext
}): CanvasStandardCommandDocumentEffect | null {
  const planner = CANVAS_STANDARD_COMMAND_EFFECT_PLANNERS[
    command.kind
  ] as CanvasStandardCommandAnyEffectPlanner

  return planner({ command, context })
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
