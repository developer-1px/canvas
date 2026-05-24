import type {
  Bounds,
  CanvasEditableTextItem,
  CanvasItem,
} from '../../entities'

export type CanvasAppItemReadModel = {
  findEditableTextItem: (id: string) => CanvasEditableTextItem | null
  findItem: (id: string) => CanvasItem | undefined
  getAllIds: () => string[]
  getAllItems: () => CanvasItem[]
  getItemBounds: (item: CanvasItem) => Bounds
  getSelection: (ids: string[]) => string[]
  getSelectionBounds: (ids: Iterable<string>) => Bounds | null
  getSelectedItems: (ids: string[]) => CanvasItem[]
}
