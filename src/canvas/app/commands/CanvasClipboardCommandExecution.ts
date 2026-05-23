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
  EditingText,
  Point,
  Viewport,
} from '../../entities'
import type { CanvasAppStageElement } from '../stage/CanvasAppStageElement'
import type {
  CanvasDocumentClipboard,
  CommitCanvasItemsChange,
  CommitCanvasSelection,
} from '../workflow/CanvasWorkflowContract'
import { getCanvasPasteOffset } from './CanvasPastePosition'

export type CanvasClipboardCommand =
  | { ids: string[]; kind: 'clone'; offset: Point }
  | { kind: 'duplicate'; offset?: Point; sourceIds?: string[] }
  | { kind: 'copy'; pasteIndex: number }
  | { kind: 'paste'; pasteIndex: number }
  | { kind: 'cut'; pasteIndex: number }

export type CanvasClipboardEditingUpdate =
  | EditingText
  | null
  | ((current: EditingText | null) => EditingText | null)

export type CanvasClipboardCommandExecutionContext = {
  commandAdapter: CanvasCommandAdapter<CanvasItem>
  commitItemsChange: CommitCanvasItemsChange
  commitSelection: CommitCanvasSelection
  config: CanvasAffordanceConfig
  copyItemsToClipboard: CanvasDocumentClipboard['copyItemsToClipboard']
  createId: (prefix: string) => string
  getClipboardItems: CanvasDocumentClipboard['getClipboardItems']
  items: CanvasItem[]
  selection: string[]
  setClipboardItems: CanvasDocumentClipboard['setClipboardItems']
  setEditing: (editing: CanvasClipboardEditingUpdate) => void
  stageElement: CanvasAppStageElement
  viewport: Viewport
}

export type CanvasClipboardCommandExecutionResult = {
  clonedItems: CanvasItem[]
  executed: boolean
  nextPasteIndex?: number
}

const EMPTY_CLIPBOARD_COMMAND_RESULT: CanvasClipboardCommandExecutionResult = {
  clonedItems: [],
  executed: false,
}

export function executeCanvasClipboardCommand({
  command,
  context,
}: {
  command: CanvasClipboardCommand
  context: CanvasClipboardCommandExecutionContext
}): CanvasClipboardCommandExecutionResult {
  switch (command.kind) {
    case 'clone':
      return executeCanvasCloneCommand(command, context)
    case 'duplicate':
      return executeCanvasDuplicateCommand(command, context)
    case 'copy':
      return executeCanvasCopyCommand(context)
    case 'paste':
      return executeCanvasPasteCommand(command.pasteIndex, context)
    case 'cut':
      return executeCanvasCutCommand(context)
  }

  return assertUnhandledCanvasClipboardCommand(command)
}

function executeCanvasCloneCommand(
  command: Extract<CanvasClipboardCommand, { kind: 'clone' }>,
  context: CanvasClipboardCommandExecutionContext,
): CanvasClipboardCommandExecutionResult {
  return {
    clonedItems: cloneCanvasCommandItems({
      adapter: context.commandAdapter,
      createId: context.createId,
      ids: command.ids,
      items: context.items,
      offset: command.offset,
    }),
    executed: true,
  }
}

function executeCanvasDuplicateCommand(
  command: Extract<CanvasClipboardCommand, { kind: 'duplicate' }>,
  context: CanvasClipboardCommandExecutionContext,
): CanvasClipboardCommandExecutionResult {
  const result = duplicateCanvasCommand({
    adapter: context.commandAdapter,
    config: context.config,
    createId: context.createId,
    items: context.items,
    offset: command.offset ?? CANVAS_COMMAND_INSERT_OFFSET,
    selection: context.selection,
    sourceIds: command.sourceIds ?? context.selection,
  })

  if (!result) {
    return EMPTY_CLIPBOARD_COMMAND_RESULT
  }

  const didCommit = context.commitItemsChange(
    { type: 'add', items: result.clones },
    {
      before: context.selection,
      after: result.selection,
    },
  )

  return didCommit
    ? { clonedItems: result.clones, executed: true }
    : EMPTY_CLIPBOARD_COMMAND_RESULT
}

function executeCanvasCopyCommand(
  context: CanvasClipboardCommandExecutionContext,
): CanvasClipboardCommandExecutionResult {
  if (
    !context.config.commands.copy ||
    !context.copyItemsToClipboard(context.selection)
  ) {
    return EMPTY_CLIPBOARD_COMMAND_RESULT
  }

  return {
    clonedItems: [],
    executed: true,
    nextPasteIndex: 0,
  }
}

function executeCanvasPasteCommand(
  pasteIndex: number,
  context: CanvasClipboardCommandExecutionContext,
): CanvasClipboardCommandExecutionResult {
  if (!context.config.commands.paste) {
    return EMPTY_CLIPBOARD_COMMAND_RESULT
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

  if (clones.length === 0) {
    return EMPTY_CLIPBOARD_COMMAND_RESULT
  }

  const didCommit = context.commitItemsChange(
    { type: 'add', items: clones },
    {
      before: context.selection,
      after: clones.map((item) => item.id),
    },
  )

  if (!didCommit) {
    return EMPTY_CLIPBOARD_COMMAND_RESULT
  }

  context.setClipboardItems(clones)
  return {
    clonedItems: clones,
    executed: true,
    nextPasteIndex: pasteIndex + 1,
  }
}

function executeCanvasCutCommand(
  context: CanvasClipboardCommandExecutionContext,
): CanvasClipboardCommandExecutionResult {
  if (!context.config.commands.cut) {
    return EMPTY_CLIPBOARD_COMMAND_RESULT
  }

  const copied = executeCanvasCopyForCut(context)
  const deletion = deleteCanvasCommand({
    adapter: context.commandAdapter,
    config: context.config,
    items: context.items,
    selection: context.selection,
  })

  if (!deletion) {
    return copied.nextPasteIndex === undefined
      ? EMPTY_CLIPBOARD_COMMAND_RESULT
      : {
          clonedItems: [],
          executed: true,
          nextPasteIndex: copied.nextPasteIndex,
        }
  }

  const didCommit = context.commitItemsChange(
    { type: 'remove-selection', selection: context.selection },
    {
      before: context.selection,
      after: deletion.selection,
    },
  )

  if (!didCommit) {
    context.commitSelection(deletion.selection)
  }

  context.setEditing((current) =>
    current && deletion.clearEditingIds.includes(current.id)
      ? null
      : current,
  )

  return {
    clonedItems: [],
    executed: true,
    nextPasteIndex: copied.nextPasteIndex,
  }
}

function executeCanvasCopyForCut(
  context: CanvasClipboardCommandExecutionContext,
): { nextPasteIndex?: number } {
  return context.config.commands.copy &&
    context.copyItemsToClipboard(context.selection)
    ? { nextPasteIndex: 0 }
    : {}
}

function assertUnhandledCanvasClipboardCommand(
  command: never,
): never {
  throw new Error(`Unhandled canvas clipboard command: ${String(command)}`)
}
