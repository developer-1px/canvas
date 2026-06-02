import type { CanvasAffordanceConfig } from '../affordance/CanvasAffordances'
import {
  CANVAS_COMMAND_INSERT_OFFSET,
  type CanvasCommandAdapter,
  type CanvasCommandItem,
  type CanvasCommandOffset,
  type DuplicateCanvasCommandResult,
} from '../../foundation/CanvasCommandTypes'

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

  if (adapter.duplicateSelection) {
    const result = adapter.duplicateSelection({
      createId,
      items,
      offset,
      selection,
      sourceIds,
    })

    return result.clones.length > 0 ? result : null
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
