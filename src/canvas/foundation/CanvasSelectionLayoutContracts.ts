import type { Bounds } from '../core'
import type {
  CanvasAlignMode,
  CanvasDistributeMode,
} from './CanvasCommandTypes'

export type CanvasSelectionLayoutAxis = 'horizontal' | 'vertical'

export type CanvasSelectionLayoutInput<
  TItem,
  TItemId extends string = string,
> = {
  getItemBounds: (item: TItem, index: number) => Bounds
  getItemId: (item: TItem, index: number) => TItemId
  isItemSelectable?: (item: TItem, index: number) => boolean
  items: readonly TItem[]
  selection: readonly TItemId[]
}

export type CanvasSelectionLayoutChangeInput<
  TItem,
  TItemId extends string = string,
> = Omit<CanvasSelectionLayoutInput<TItem, TItemId>, 'items'> & {
  items: TItem[]
  updateItemBounds: (item: TItem, bounds: Bounds, index: number) => TItem
}

export type CanvasSelectionFlipItemInput<
  TItem,
  TItemId extends string = string,
> = {
  axis: CanvasSelectionLayoutAxis
  bounds: Bounds
  id: TItemId
  index: number
  item: TItem
  pivot: number
  reflectedBounds: Bounds
  selectionBounds: Bounds
}

export type CanvasSelectionAlignInput<
  TItem,
  TItemId extends string = string,
> = CanvasSelectionLayoutChangeInput<TItem, TItemId> & {
  frame?: Bounds
  mode: CanvasAlignMode
}

export type CanvasSelectionDistributeInput<
  TItem,
  TItemId extends string = string,
> = CanvasSelectionLayoutChangeInput<TItem, TItemId> & {
  mode: CanvasDistributeMode
}

export type CanvasSelectionFlipInput<
  TItem,
  TItemId extends string = string,
> = CanvasSelectionLayoutChangeInput<TItem, TItemId> & {
  axis: CanvasSelectionLayoutAxis
  flipItem?: (input: CanvasSelectionFlipItemInput<TItem, TItemId>) => TItem
}

export type CanvasSelectionTidyInput<
  TItem,
  TItemId extends string = string,
> = CanvasSelectionLayoutChangeInput<TItem, TItemId> & {
  gap?: number
}

export type CanvasSelectionLayoutEntry<
  TItem,
  TItemId extends string = string,
> = {
  bounds: Bounds
  id: TItemId
  index: number
  item: TItem
}
