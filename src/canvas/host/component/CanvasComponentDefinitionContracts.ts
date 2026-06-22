export type CanvasComponentDefinitionId = string
export type CanvasComponentSlotId = string
export type CanvasComponentSource = Readonly<{
  exportName: string
  importPath: string
  layer: string
}>

export type CanvasComponentDefinitionInstance<
  TItemId extends string = string,
> = Readonly<{
  label: string
  slots: Readonly<Record<CanvasComponentSlotId, TItemId>>
}>

export type CanvasComponentDefinition<TItemId extends string = string> =
  Readonly<{
    id: CanvasComponentDefinitionId
    instances: readonly CanvasComponentDefinitionInstance<TItemId>[]
    label: string
    source?: CanvasComponentSource
    syncDescription?: string
  }>

export type CanvasComponentBinding<TItemId extends string = string> =
  Readonly<{
    componentId: CanvasComponentDefinitionId
    componentLabel: string
    currentItemId: TItemId
    instanceCount: number
    instanceLabel: string
    slotId: CanvasComponentSlotId
    slotItemIds: readonly TItemId[]
    syncDescription?: string
  }>

export type CanvasComponentSlotSummary<TItemId extends string = string> =
  Readonly<{
    itemId: TItemId
    label: string
    slotId: CanvasComponentSlotId
  }>

export type CanvasComponentInstanceSummary<TItemId extends string = string> =
  Readonly<{
    itemIds: readonly TItemId[]
    label: string
    rootItemId: TItemId
    slots: readonly CanvasComponentSlotSummary<TItemId>[]
  }>

export type CanvasComponentPartSummary<TItemId extends string = string> =
  Readonly<{
    itemIds: readonly TItemId[]
    label: string
    slotId: CanvasComponentSlotId
  }>

export type CanvasComponentSetSummary<TItemId extends string = string> =
  Readonly<{
    id: CanvasComponentDefinitionId
    instances: readonly CanvasComponentInstanceSummary<TItemId>[]
    label: string
    parts: readonly CanvasComponentPartSummary<TItemId>[]
    source?: CanvasComponentSource
    syncDescription?: string
  }>

export type CanvasComponentLinkedItemSyncInput<
  TItemId extends string,
  TState,
> = Readonly<{
  itemId: TItemId
  state: TState
  update: (state: TState, itemId: TItemId) => TState
}>

export type CanvasComponentDefinitionRegistry<
  TItemId extends string = string,
> = Readonly<{
  definitions: readonly CanvasComponentDefinition<TItemId>[]
  getBinding: (itemId: TItemId) => CanvasComponentBinding<TItemId> | null
  getSyncItemIds: (itemId: TItemId) => readonly TItemId[]
  isRootItem: (itemId: TItemId) => boolean
  listSets: () => readonly CanvasComponentSetSummary<TItemId>[]
  syncItems: <TState>(
    input: CanvasComponentLinkedItemSyncInput<TItemId, TState>,
  ) => TState
}>

export type CreateCanvasComponentDefinitionRegistryInput<
  TItemId extends string = string,
> = Readonly<{
  definitions?: readonly CanvasComponentDefinition<TItemId>[]
}>

export const CANVAS_COMPONENT_DEFINITION_ROOT_SLOT_ID = 'root'
