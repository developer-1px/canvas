import type {
  Bounds,
  CanvasSelectionIds,
  Viewport,
} from '../core'

export type CanvasExtensionId = string

export type CanvasExtensionAdapterSlot =
  | 'capability'
  | 'command'
  | 'creation'
  | 'document'
  | 'presence'
  | 'renderer'
  | 'scene'
  | 'text-target'
  | 'transform'

export type CanvasExtensionSelectionHistory = {
  after: CanvasSelectionIds
  before: CanvasSelectionIds
}

export type CanvasExtensionDocumentPatchEffect<TPatch = unknown> = {
  patch: readonly TPatch[]
  selection?: CanvasExtensionSelectionHistory
  type: 'document-patch'
}

export type CanvasExtensionSelectionEffect = {
  selection: CanvasSelectionIds
  type: 'selection'
}

export type CanvasExtensionViewportEffect = {
  type: 'viewport'
  viewport: Viewport
}

export type CanvasExtensionEffect<TPatch = unknown> =
  | CanvasExtensionDocumentPatchEffect<TPatch>
  | CanvasExtensionSelectionEffect
  | CanvasExtensionViewportEffect

export type CanvasExtensionPlanner<
  TInput = unknown,
  TEffect extends CanvasExtensionEffect = CanvasExtensionEffect,
> = (input: TInput) => readonly TEffect[]

export type CanvasExtensionTextPatchUpdate = {
  field: string
  operation: 'add' | 'replace'
  value: unknown
}

export type CanvasExtensionTextTargetContract<TItem = unknown> = {
  canEdit: (item: TItem) => boolean
  commitsOnEnter: (item: TItem) => boolean
  getCommittedValue: (input: { item: TItem; value: string }) => string
  getEditorBounds: (item: TItem) => Bounds | null
  getValue: (item: TItem) => string
  planCommitUpdates: (
    item: TItem,
    text: string,
  ) => readonly CanvasExtensionTextPatchUpdate[]
}

export type CanvasExtensionCommandDescriptor<
  TCommandId extends CanvasExtensionId = CanvasExtensionId,
  TInput = unknown,
  TEffect extends CanvasExtensionEffect = CanvasExtensionEffect,
> = {
  id: TCommandId
  plan: CanvasExtensionPlanner<TInput, TEffect>
  requiredAdapters?: readonly CanvasExtensionAdapterSlot[]
}

export type CanvasExtensionToolKind =
  | 'creation'
  | 'drawing'
  | 'navigation'
  | 'selection'

export type CanvasExtensionToolDescriptor<
  TToolId extends CanvasExtensionId = CanvasExtensionId,
> = {
  id: TToolId
  kind: CanvasExtensionToolKind
  requiredAdapters?: readonly CanvasExtensionAdapterSlot[]
}

export type CanvasExtensionRendererSlot<
  TSlotId extends CanvasExtensionId = CanvasExtensionId,
> = {
  id: TSlotId
  surface: 'item-layer' | 'overlay' | 'stage'
}

export type CanvasExtensionDescriptor<
  TExtensionId extends CanvasExtensionId = CanvasExtensionId,
> = {
  commands?: readonly CanvasExtensionCommandDescriptor<
    CanvasExtensionId,
    never,
    CanvasExtensionEffect
  >[]
  id: TExtensionId
  rendererSlots?: readonly CanvasExtensionRendererSlot[]
  requiredAdapters?: readonly CanvasExtensionAdapterSlot[]
  tools?: readonly CanvasExtensionToolDescriptor[]
}

export function defineCanvasExtension<
  const TDescriptor extends CanvasExtensionDescriptor,
>(descriptor: TDescriptor): TDescriptor {
  return descriptor
}
