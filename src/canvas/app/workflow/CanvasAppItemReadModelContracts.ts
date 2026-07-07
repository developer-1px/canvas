import type {
  Bounds,
  CanvasItem,
} from '../../entities'
import type {
  CanvasAppTextTarget,
} from '../affordances/editing/text-editor/CanvasAppTextTarget'

export type CanvasAppItemReadModel = {
  findItem: (id: string) => CanvasItem | undefined
  findTextEditTarget: (id: string) => CanvasItem | null
  getAllIds: () => string[]
  getAllItems: () => CanvasItem[]
  getItemBounds: (item: CanvasItem) => Bounds
  getSelection: (ids: string[]) => string[]
  getSelectionBounds: (ids: Iterable<string>) => Bounds | null
  getSelectedItems: (ids: string[]) => CanvasItem[]
  textTarget: CanvasAppTextTarget
}
