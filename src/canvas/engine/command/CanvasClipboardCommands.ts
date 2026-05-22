import type { CanvasAffordanceConfig } from '../affordance/CanvasAffordances'
import { deleteCanvasCommand } from './CanvasCommandActions'
import {
  CANVAS_COMMAND_INSERT_OFFSET,
  type CanvasCommandAdapter,
  type CanvasCommandItem,
  type CanvasCommandOffset,
  type CutCanvasCommandResult,
  type DuplicateCanvasCommandResult,
  type PasteCanvasCommandResult,
} from './CanvasCommandTypes'

export function cloneCanvasCommandItems<TItem extends CanvasCommandItem>({
  adapter,
  createId,
  ids,
  items,
  offset,
}: {
  adapter: CanvasCommandAdapter<TItem>
  createId: (prefix: string) => string
  ids: string[]
  items: TItem[]
  offset: CanvasCommandOffset
}) {
  return adapter.cloneSelection({ createId, ids, items, offset })
}

export function duplicateCanvasCommand<TItem extends CanvasCommandItem>({
  adapter,
  config,
  createId,
  items,
  offset = CANVAS_COMMAND_INSERT_OFFSET,
  selection,
  sourceIds = selection,
}: {
  adapter: CanvasCommandAdapter<TItem>
  config: CanvasAffordanceConfig
  createId: (prefix: string) => string
  items: TItem[]
  offset?: CanvasCommandOffset
  selection: string[]
  sourceIds?: string[]
}): DuplicateCanvasCommandResult<TItem> | null {
  if (!config.commands.duplicate) {
    return null
  }

  const clones = cloneCanvasCommandItems({
    adapter,
    createId,
    ids: sourceIds,
    items,
    offset,
  })

  if (clones.length === 0) {
    return null
  }

  return {
    clones,
    items: [...items, ...clones],
    selection: clones.map((item) => item.id),
  }
}

export function copyCanvasCommand<TItem extends CanvasCommandItem>({
  adapter,
  config,
  items,
  selection,
}: {
  adapter: CanvasCommandAdapter<TItem>
  config: CanvasAffordanceConfig
  items: TItem[]
  selection: string[]
}) {
  if (!config.commands.copy) {
    return null
  }

  return adapter.copySelection({ items, selection })
}

export function pasteCanvasCommand<TItem extends CanvasCommandItem>({
  adapter,
  clipboard,
  config,
  createId,
  items,
  offset = CANVAS_COMMAND_INSERT_OFFSET,
}: {
  adapter: CanvasCommandAdapter<TItem>
  clipboard: TItem[]
  config: CanvasAffordanceConfig
  createId: (prefix: string) => string
  items: TItem[]
  offset?: CanvasCommandOffset
}): PasteCanvasCommandResult<TItem> | null {
  if (!config.commands.paste) {
    return null
  }

  const clones = adapter.pasteItems({ clipboard, createId, offset })

  if (clones.length === 0) {
    return null
  }

  return {
    clipboard: clones,
    items: [...items, ...clones],
    selection: clones.map((item) => item.id),
  }
}

export function cutCanvasCommand<TItem extends CanvasCommandItem>({
  adapter,
  config,
  items,
  selection,
}: {
  adapter: CanvasCommandAdapter<TItem>
  config: CanvasAffordanceConfig
  items: TItem[]
  selection: string[]
}): CutCanvasCommandResult<TItem> | null {
  if (!config.commands.cut) {
    return null
  }

  return {
    clipboard: copyCanvasCommand({ adapter, config, items, selection }),
    deletion: deleteCanvasCommand({ adapter, config, items, selection }),
  }
}
