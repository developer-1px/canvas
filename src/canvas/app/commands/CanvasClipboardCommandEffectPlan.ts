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
  Point,
  Viewport,
} from '../../entities'
import type { CanvasAppStageElement } from '../stage/CanvasAppStageElement'
import type { CanvasDocumentClipboard } from '../workflow/CanvasWorkflowContract'
import type { CanvasClipboardCommandEffect } from './CanvasClipboardCommandEffects'
import {
  createCanvasClipboardCloneResultEffect,
  createCanvasClipboardCutCopyOnlyResultEffect,
  createCanvasClipboardCutSelectionResultEffect,
  createCanvasClipboardDuplicateResultEffect,
  createCanvasClipboardPasteResultEffect,
} from './CanvasClipboardCommandResultEffects'
import { getCanvasPasteOffset } from './CanvasPastePosition'

export type CanvasClipboardCommand =
  | { ids: string[]; kind: 'clone'; offset: Point }
  | { kind: 'duplicate'; offset?: Point; sourceIds?: string[] }
  | { kind: 'copy'; pasteIndex: number }
  | { kind: 'paste'; pasteIndex: number }
  | { kind: 'cut'; pasteIndex: number }

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

export function createCanvasClipboardCommandEffectPlan({
  command,
  context,
}: {
  command: CanvasClipboardCommand
  context: CanvasClipboardCommandEffectPlanContext
}): CanvasClipboardCommandEffect | null {
  switch (command.kind) {
    case 'clone':
      return planCanvasCloneCommand(command, context)
    case 'duplicate':
      return planCanvasDuplicateCommand(command, context)
    case 'copy':
      return planCanvasCopyCommand(context)
    case 'paste':
      return planCanvasPasteCommand(command.pasteIndex, context)
    case 'cut':
      return planCanvasCutCommand(context)
  }

  return assertUnhandledCanvasClipboardCommand(command)
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
    ? { kind: 'copy-selection' }
    : null
}

function planCanvasPasteCommand(
  pasteIndex: number,
  context: CanvasClipboardCommandEffectPlanContext,
): CanvasClipboardCommandEffect | null {
  if (!context.config.commands.paste) {
    return null
  }

  const clipboard = context.getClipboardItems()
  const offset = getCanvasPasteOffset({
    clipboard,
    pasteIndex,
    viewportCenter: context.stageElement.getViewportCenter(context.viewport),
  })
  const clones = context.commandAdapter.pasteItems({
    clipboard,
    createId: context.createId,
    offset,
  })

  return clones.length > 0
    ? createCanvasClipboardPasteResultEffect({ items: clones, pasteIndex })
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

function assertUnhandledCanvasClipboardCommand(
  command: never,
): never {
  throw new Error(`Unhandled canvas clipboard command: ${String(command)}`)
}
