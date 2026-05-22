import type { CanvasAffordanceConfig } from './CanvasAffordances'

export type CanvasCommandOffset = {
  x: number
  y: number
}

export type CanvasCommandItem = {
  id: string
}

export type CanvasCommandItemsResult<TItem extends CanvasCommandItem> = {
  items: TItem[]
  selection: string[]
}

export type CanvasReorderMode =
  | 'bringForward'
  | 'bringToFront'
  | 'sendBackward'
  | 'sendToBack'

export type CanvasCommandAdapter<TItem extends CanvasCommandItem> = {
  cloneSelection: (input: {
    createId: (prefix: string) => string
    ids: string[]
    items: TItem[]
    offset: CanvasCommandOffset
  }) => TItem[]
  copySelection: (input: { items: TItem[]; selection: string[] }) => TItem[]
  deleteSelection: (input: { items: TItem[]; selection: string[] }) => TItem[]
  groupSelection: (input: {
    groupId: string
    items: TItem[]
    selection: string[]
  }) => CanvasCommandItemsResult<TItem>
  pasteItems: (input: {
    clipboard: TItem[]
    createId: (prefix: string) => string
    offset: CanvasCommandOffset
  }) => TItem[]
  nudgeSelection: (input: {
    dx: number
    dy: number
    items: TItem[]
    selection: string[]
  }) => TItem[]
  reorderSelection: (input: {
    items: TItem[]
    mode: CanvasReorderMode
    selection: string[]
  }) => TItem[]
  ungroupSelection: (input: {
    items: TItem[]
    selection: string[]
  }) => CanvasCommandItemsResult<TItem>
}

export type CanvasCommandAvailability = {
  bringForward: boolean
  bringToFront: boolean
  delete: boolean
  duplicate: boolean
  group: boolean
  redo: boolean
  sendBackward: boolean
  sendToBack: boolean
  undo: boolean
  ungroup: boolean
}

export type DuplicateCanvasCommandResult<TItem extends CanvasCommandItem> =
  CanvasCommandItemsResult<TItem> & {
    clones: TItem[]
  }

export type DeleteCanvasCommandResult<TItem extends CanvasCommandItem> =
  CanvasCommandItemsResult<TItem> & {
    clearEditingIds: string[]
  }

export type PasteCanvasCommandResult<TItem extends CanvasCommandItem> =
  CanvasCommandItemsResult<TItem> & {
    clipboard: TItem[]
  }

export type CutCanvasCommandResult<TItem extends CanvasCommandItem> = {
  clipboard: TItem[] | null
  deletion: DeleteCanvasCommandResult<TItem> | null
}

export const CANVAS_COMMAND_INSERT_OFFSET: CanvasCommandOffset = { x: 28, y: 28 }

export function getCanvasCommandAvailability({
  canRedo,
  canUndo,
  config,
  hasSelectedGroup,
  selection,
}: {
  canRedo: boolean
  canUndo: boolean
  config: CanvasAffordanceConfig
  hasSelectedGroup: boolean
  selection: string[]
}): CanvasCommandAvailability {
  const hasSelection = selection.length > 0

  return {
    bringForward: config.commands.bringForward && hasSelection,
    bringToFront: config.commands.bringToFront && hasSelection,
    delete: config.commands.delete && hasSelection,
    duplicate: config.commands.duplicate && hasSelection,
    group: config.commands.group && selection.length > 1,
    redo: config.commands.redo && canRedo,
    sendBackward: config.commands.sendBackward && hasSelection,
    sendToBack: config.commands.sendToBack && hasSelection,
    undo: config.commands.undo && canUndo,
    ungroup: config.commands.ungroup && hasSelectedGroup,
  }
}

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
