import {
  CANVAS_COMMAND_INSERT_OFFSET,
  cloneCanvasCommandItems,
  deleteCanvasCommand,
  duplicateCanvasCommand,
  type CanvasAffordanceConfig,
  type CanvasCommandAdapter,
} from '../../engine'
import type {
  CanvasItem,
  Viewport,
} from '../../entities'
import type { CanvasAppStageElement } from '../stage/CanvasAppStageElement'
import type { CanvasDocumentClipboard } from '../workflow/CanvasWorkflowContract'
import type { CanvasClipboardCommand } from './CanvasClipboardCommandContracts'
import type { CanvasClipboardCommandEffect } from './CanvasClipboardCommandEffects'
import {
  createCanvasClipboardCloneResultEffect,
  createCanvasClipboardCopySelectionEffect,
  createCanvasClipboardCutCopyOnlyResultEffect,
  createCanvasClipboardCutSelectionResultEffect,
  createCanvasClipboardDuplicateResultEffect,
  createCanvasClipboardPasteResultEffect,
} from './CanvasClipboardCommandResultEffects'
import { getCanvasPasteOffset } from './CanvasPastePosition'

export type CanvasClipboardCommandEffectPlanContext = {
  commandAdapter: CanvasCommandAdapter<CanvasItem>
  config: CanvasAffordanceConfig
  createId: (prefix: string) => string
  getClipboardItems: CanvasDocumentClipboard['getClipboardItems']
  items: CanvasItem[]
  selection: string[]
  stageElement: CanvasAppStageElement
  viewport: Viewport
}

type CanvasClipboardCommandEffectPlanner<
  TKind extends CanvasClipboardCommand['kind'],
> = (args: {
  command: Extract<CanvasClipboardCommand, { kind: TKind }>
  context: CanvasClipboardCommandEffectPlanContext
}) => CanvasClipboardCommandEffect | null

type CanvasClipboardCommandEffectPlanners = {
  [TKind in CanvasClipboardCommand['kind']]:
    CanvasClipboardCommandEffectPlanner<TKind>
}

type CanvasClipboardCommandAnyEffectPlanner = (args: {
  command: CanvasClipboardCommand
  context: CanvasClipboardCommandEffectPlanContext
}) => CanvasClipboardCommandEffect | null

const CANVAS_CLIPBOARD_COMMAND_EFFECT_PLANNERS = Object.freeze({
  clone: ({ command, context }) => planCanvasCloneCommand(command, context),
  copy: ({ context }) => planCanvasCopyCommand(context),
  cut: ({ context }) => planCanvasCutCommand(context),
  duplicate: ({ command, context }) =>
    planCanvasDuplicateCommand(command, context),
  paste: ({ command, context }) => planCanvasPasteCommand(command, context),
} satisfies CanvasClipboardCommandEffectPlanners)

export function createCanvasClipboardCommandEffectPlan({
  command,
  context,
}: {
  command: CanvasClipboardCommand
  context: CanvasClipboardCommandEffectPlanContext
}): CanvasClipboardCommandEffect | null {
  const planner = CANVAS_CLIPBOARD_COMMAND_EFFECT_PLANNERS[
    command.kind
  ] as CanvasClipboardCommandAnyEffectPlanner

  return planner({ command, context })
}

function planCanvasCloneCommand(
  command: Extract<CanvasClipboardCommand, { kind: 'clone' }>,
  context: CanvasClipboardCommandEffectPlanContext,
): CanvasClipboardCommandEffect {
  return createCanvasClipboardCloneResultEffect({
    clonedItems: cloneCanvasCommandItems({
      adapter: context.commandAdapter,
      createId: context.createId,
      ids: command.ids,
      items: context.items,
      offset: command.offset,
    }),
  })
}

function planCanvasDuplicateCommand(
  command: Extract<CanvasClipboardCommand, { kind: 'duplicate' }>,
  context: CanvasClipboardCommandEffectPlanContext,
): CanvasClipboardCommandEffect | null {
  const result = duplicateCanvasCommand({
    adapter: context.commandAdapter,
    config: context.config,
    createId: context.createId,
    items: context.items,
    offset: command.offset ?? CANVAS_COMMAND_INSERT_OFFSET,
    selection: context.selection,
    sourceIds: command.sourceIds ?? context.selection,
  })

  return result
    ? createCanvasClipboardDuplicateResultEffect({ result })
    : null
}

function planCanvasCopyCommand(
  context: CanvasClipboardCommandEffectPlanContext,
): CanvasClipboardCommandEffect | null {
  return context.config.commands.copy
    ? createCanvasClipboardCopySelectionEffect()
    : null
}

function planCanvasPasteCommand(
  command: Extract<CanvasClipboardCommand, { kind: 'paste' }>,
  context: CanvasClipboardCommandEffectPlanContext,
): CanvasClipboardCommandEffect | null {
  if (!context.config.commands.paste) {
    return null
  }

  const clipboard = context.getClipboardItems()
  const offset = getCanvasPasteOffset({
    clipboard,
    pasteIndex: command.pasteIndex,
    viewportCenter: context.stageElement.getViewportCenter(context.viewport),
  })
  const clones = context.commandAdapter.pasteItems({
    clipboard,
    createId: context.createId,
    offset,
  })

  return clones.length > 0
    ? createCanvasClipboardPasteResultEffect({
        items: clones,
        pasteIndex: command.pasteIndex,
      })
    : null
}

function planCanvasCutCommand(
  context: CanvasClipboardCommandEffectPlanContext,
): CanvasClipboardCommandEffect | null {
  if (!context.config.commands.cut) {
    return null
  }

  const deletion = deleteCanvasCommand({
    adapter: context.commandAdapter,
    config: context.config,
    items: context.items,
    selection: context.selection,
  })
  const copyBeforeDelete = context.config.commands.copy

  return deletion
    ? createCanvasClipboardCutSelectionResultEffect({
        copyBeforeDelete,
        deletion,
      })
    : createCanvasClipboardCutCopyOnlyResultEffect({ copyBeforeDelete })
}
