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

export type CanvasAlignMode =
  | 'alignBottom'
  | 'alignCenter'
  | 'alignLeft'
  | 'alignMiddle'
  | 'alignRight'
  | 'alignTop'

export type CanvasDistributeMode =
  | 'distributeHorizontal'
  | 'distributeVertical'

export type CanvasReorderMode =
  | 'bringForward'
  | 'bringToFront'
  | 'sendBackward'
  | 'sendToBack'

export type CanvasCommandAdapter<TItem extends CanvasCommandItem> = {
  alignSelection: (input: {
    items: TItem[]
    mode: CanvasAlignMode
    selection: string[]
  }) => TItem[]
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
  distributeSelection: (input: {
    items: TItem[]
    mode: CanvasDistributeMode
    selection: string[]
  }) => TItem[]
  lockSelection: (input: {
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
  selectAll: (input: { items: TItem[] }) => string[]
  ungroupSelection: (input: {
    items: TItem[]
    selection: string[]
  }) => CanvasCommandItemsResult<TItem>
  unlockAll: (input: {
    items: TItem[]
    selection: string[]
  }) => CanvasCommandItemsResult<TItem>
}

export type CanvasCommandAvailability = {
  alignBottom: boolean
  alignCenter: boolean
  alignLeft: boolean
  alignMiddle: boolean
  alignRight: boolean
  alignTop: boolean
  bringForward: boolean
  bringToFront: boolean
  delete: boolean
  duplicate: boolean
  distributeHorizontal: boolean
  distributeVertical: boolean
  group: boolean
  lockSelection: boolean
  redo: boolean
  selectAll: boolean
  sendBackward: boolean
  sendToBack: boolean
  undo: boolean
  ungroup: boolean
  unlockAll: boolean
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
