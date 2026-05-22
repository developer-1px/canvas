import type { CanvasAffordanceConfig } from '../affordance/CanvasAffordances'
import {
  type CanvasAlignMode,
  type CanvasCommandAdapter,
  type CanvasCommandItem,
  type CanvasCommandItemsResult,
  type CanvasDistributeMode,
  type CanvasReorderMode,
  type DeleteCanvasCommandResult,
} from './CanvasCommandTypes'

export function alignCanvasCommand<TItem extends CanvasCommandItem>({
  adapter,
  config,
  items,
  mode,
  selection,
}: {
  adapter: CanvasCommandAdapter<TItem>
  config: CanvasAffordanceConfig
  items: TItem[]
  mode: CanvasAlignMode
  selection: string[]
}): CanvasCommandItemsResult<TItem> | null {
  if (!config.commands[mode] || selection.length < 2) {
    return null
  }

  return {
    items: adapter.alignSelection({ items, mode, selection }),
    selection,
  }
}

export function distributeCanvasCommand<TItem extends CanvasCommandItem>({
  adapter,
  config,
  items,
  mode,
  selection,
}: {
  adapter: CanvasCommandAdapter<TItem>
  config: CanvasAffordanceConfig
  items: TItem[]
  mode: CanvasDistributeMode
  selection: string[]
}): CanvasCommandItemsResult<TItem> | null {
  if (!config.commands[mode] || selection.length < 3) {
    return null
  }

  return {
    items: adapter.distributeSelection({ items, mode, selection }),
    selection,
  }
}

export function deleteCanvasCommand<TItem extends CanvasCommandItem>({
  adapter,
  config,
  items,
  selection,
}: {
  adapter: CanvasCommandAdapter<TItem>
  config: CanvasAffordanceConfig
  items: TItem[]
  selection: string[]
}): DeleteCanvasCommandResult<TItem> | null {
  if (!config.commands.delete || selection.length === 0) {
    return null
  }

  return {
    clearEditingIds: selection,
    items: adapter.deleteSelection({ items, selection }),
    selection: [],
  }
}

export function groupCanvasCommand<TItem extends CanvasCommandItem>({
  adapter,
  config,
  createId,
  items,
  selection,
}: {
  adapter: CanvasCommandAdapter<TItem>
  config: CanvasAffordanceConfig
  createId: (prefix: string) => string
  items: TItem[]
  selection: string[]
}): CanvasCommandItemsResult<TItem> | null {
  if (!config.commands.group || selection.length < 2) {
    return null
  }

  const result = adapter.groupSelection({
    groupId: createId('group'),
    items,
    selection,
  })

  if (result.items === items) {
    return null
  }

  return result
}

export function ungroupCanvasCommand<TItem extends CanvasCommandItem>({
  adapter,
  config,
  items,
  selection,
}: {
  adapter: CanvasCommandAdapter<TItem>
  config: CanvasAffordanceConfig
  items: TItem[]
  selection: string[]
}): CanvasCommandItemsResult<TItem> | null {
  if (!config.commands.ungroup) {
    return null
  }

  const result = adapter.ungroupSelection({ items, selection })

  if (result.selection.length === 0) {
    return null
  }

  return result
}

export function lockCanvasCommand<TItem extends CanvasCommandItem>({
  adapter,
  config,
  items,
  selection,
}: {
  adapter: CanvasCommandAdapter<TItem>
  config: CanvasAffordanceConfig
  items: TItem[]
  selection: string[]
}): CanvasCommandItemsResult<TItem> | null {
  if (!config.commands.lockSelection || selection.length === 0) {
    return null
  }

  return adapter.lockSelection({ items, selection })
}

export function unlockAllCanvasCommand<TItem extends CanvasCommandItem>({
  adapter,
  config,
  items,
  selection,
}: {
  adapter: CanvasCommandAdapter<TItem>
  config: CanvasAffordanceConfig
  items: TItem[]
  selection: string[]
}): CanvasCommandItemsResult<TItem> | null {
  if (!config.commands.unlockAll) {
    return null
  }

  return adapter.unlockAll({ items, selection })
}

export function nudgeCanvasCommand<TItem extends CanvasCommandItem>({
  adapter,
  config,
  dx,
  dy,
  items,
  selection,
}: {
  adapter: CanvasCommandAdapter<TItem>
  config: CanvasAffordanceConfig
  dx: number
  dy: number
  items: TItem[]
  selection: string[]
}) {
  if (!config.commands.nudge) {
    return null
  }

  return adapter.nudgeSelection({ dx, dy, items, selection })
}

export function reorderCanvasCommand<TItem extends CanvasCommandItem>({
  adapter,
  config,
  items,
  mode,
  selection,
}: {
  adapter: CanvasCommandAdapter<TItem>
  config: CanvasAffordanceConfig
  items: TItem[]
  mode: CanvasReorderMode
  selection: string[]
}): CanvasCommandItemsResult<TItem> | null {
  if (!config.commands[mode] || selection.length === 0) {
    return null
  }

  return {
    items: adapter.reorderSelection({ items, mode, selection }),
    selection,
  }
}

export function selectAllCanvasCommand<TItem extends CanvasCommandItem>({
  adapter,
  config,
  items,
}: {
  adapter: CanvasCommandAdapter<TItem>
  config: CanvasAffordanceConfig
  items: TItem[]
}) {
  if (!config.commands.selectAll) {
    return null
  }

  return adapter.selectAll({ items })
}
