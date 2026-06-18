import {
  CANVAS_COMMAND_INSERT_OFFSET,
  cloneCanvasCommandItems,
  deleteCanvasCommand,
  duplicateCanvasCommand,
  type CanvasAffordanceConfig,
  type CanvasCommandAdapter,
  type CanvasCommandItem,
} from '../../../engine'
import type {
  CanvasItem,
  Viewport,
} from '../../../entities'
import type { CanvasAppStageElement } from '../../rendering/stage/CanvasAppStageElement'
import type { CanvasClipboardCommand } from './CanvasClipboardCommandContracts'
import type {
  CanvasClipboardCommandEffect,
  CanvasClipboardGetItemBounds,
  CanvasClipboardGetItems,
} from './CanvasClipboardCommandEffectContracts'
import {
  createCanvasClipboardCloneResultEffect,
  createCanvasClipboardCopySelectionEffect,
  createCanvasClipboardCutCopyOnlyResultEffect,
  createCanvasClipboardCutSelectionResultEffect,
  createCanvasClipboardDuplicateResultEffect,
  createCanvasClipboardPasteResultEffect,
} from './CanvasClipboardCommandResultEffects'
import {
  getCanvasPasteOffset,
  getCanvasPasteOffsetForBounds,
} from './CanvasPastePosition'

export type CanvasClipboardCommandEffectPlanContext<
  TItem extends CanvasCommandItem = CanvasItem,
> = {
  commandAdapter: CanvasCommandAdapter<TItem>
  config: CanvasAffordanceConfig
  createId: (prefix: string) => string
  getClipboardBounds?: CanvasClipboardGetItemBounds<TItem>
  getClipboardItems: CanvasClipboardGetItems<TItem>
  items: TItem[]
  selection: string[]
  stageElement: CanvasAppStageElement
  viewport: Viewport
}

type CanvasClipboardCommandEffectPlanner<
  TKind extends CanvasClipboardCommand['kind'],
> = <TItem extends CanvasCommandItem = CanvasItem>(args: {
  command: Extract<CanvasClipboardCommand, { kind: TKind }>
  context: CanvasClipboardCommandEffectPlanContext<TItem>
}) => CanvasClipboardCommandEffect<TItem> | null

type CanvasClipboardCommandEffectPlanners = {
  [TKind in CanvasClipboardCommand['kind']]:
    CanvasClipboardCommandEffectPlanner<TKind>
}

type CanvasClipboardCommandAnyEffectPlanner =
  <TItem extends CanvasCommandItem = CanvasItem>(args: {
  command: CanvasClipboardCommand
  context: CanvasClipboardCommandEffectPlanContext<TItem>
}) => CanvasClipboardCommandEffect<TItem> | null

const CANVAS_CLIPBOARD_COMMAND_EFFECT_PLANNERS = Object.freeze({
  clone: ({ command, context }) => planCanvasCloneCommand(command, context),
  copy: ({ context }) => planCanvasCopyCommand(context),
  cut: ({ context }) => planCanvasCutCommand(context),
  duplicate: ({ command, context }) =>
    planCanvasDuplicateCommand(command, context),
  paste: ({ command, context }) => planCanvasPasteCommand(command, context),
} satisfies CanvasClipboardCommandEffectPlanners)

export function createCanvasClipboardCommandEffectPlan<
  TItem extends CanvasCommandItem = CanvasItem,
>({
  command,
  context,
}: {
  command: CanvasClipboardCommand
  context: CanvasClipboardCommandEffectPlanContext<TItem>
}): CanvasClipboardCommandEffect<TItem> | null {
  const planner = CANVAS_CLIPBOARD_COMMAND_EFFECT_PLANNERS[
    command.kind
  ] as CanvasClipboardCommandAnyEffectPlanner

  return planner<TItem>({ command, context })
}

function planCanvasCloneCommand<TItem extends CanvasCommandItem = CanvasItem>(
  command: Extract<CanvasClipboardCommand, { kind: 'clone' }>,
  context: CanvasClipboardCommandEffectPlanContext<TItem>,
): CanvasClipboardCommandEffect<TItem> {
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

function planCanvasDuplicateCommand<
  TItem extends CanvasCommandItem = CanvasItem,
>(
  command: Extract<CanvasClipboardCommand, { kind: 'duplicate' }>,
  context: CanvasClipboardCommandEffectPlanContext<TItem>,
): CanvasClipboardCommandEffect<TItem> | null {
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
    ? createCanvasClipboardDuplicateResultEffect({
        beforeItems: context.items,
        result,
      })
    : null
}

function planCanvasCopyCommand<TItem extends CanvasCommandItem = CanvasItem>(
  context: CanvasClipboardCommandEffectPlanContext<TItem>,
): CanvasClipboardCommandEffect<TItem> | null {
  return context.config.commands.copy
    ? createCanvasClipboardCopySelectionEffect<TItem>()
    : null
}

function planCanvasPasteCommand<TItem extends CanvasCommandItem = CanvasItem>(
  command: Extract<CanvasClipboardCommand, { kind: 'paste' }>,
  context: CanvasClipboardCommandEffectPlanContext<TItem>,
): CanvasClipboardCommandEffect<TItem> | null {
  if (!context.config.commands.paste) {
    return null
  }

  const clipboard = context.getClipboardItems()
  const offset = getCanvasClipboardPasteOffset({
    clipboard,
    context,
    pasteIndex: command.pasteIndex,
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

function planCanvasCutCommand<TItem extends CanvasCommandItem = CanvasItem>(
  context: CanvasClipboardCommandEffectPlanContext<TItem>,
): CanvasClipboardCommandEffect<TItem> | null {
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
    ? createCanvasClipboardCutSelectionResultEffect<TItem>({
        copyBeforeDelete,
        deletion,
      })
    : createCanvasClipboardCutCopyOnlyResultEffect<TItem>({ copyBeforeDelete })
}

function getCanvasClipboardPasteOffset<
  TItem extends CanvasCommandItem = CanvasItem,
>({
  clipboard,
  context,
  pasteIndex,
}: {
  clipboard: TItem[]
  context: CanvasClipboardCommandEffectPlanContext<TItem>
  pasteIndex: number
}) {
  const viewportCenter = context.stageElement.getViewportCenter(
    context.viewport,
  )

  return context.getClipboardBounds
    ? getCanvasPasteOffsetForBounds({
        clipboardBounds: context.getClipboardBounds(clipboard),
        pasteIndex,
        viewportCenter,
      })
    : getCanvasPasteOffset({
        clipboard: clipboard as unknown as CanvasItem[],
        pasteIndex,
        viewportCenter,
      })
}
