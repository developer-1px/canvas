import type {
  CanvasSelectionIds,
  Viewport,
} from '../core'

export type CanvasExtensionId = string

export type CanvasExtensionAdapterSlot =
  | 'capability'
  | 'command'
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

export type CanvasExtensionCommandDescriptor<
  TCommandId extends CanvasExtensionId = CanvasExtensionId,
  TInput = unknown,
  TEffect extends CanvasExtensionEffect = CanvasExtensionEffect,
> = {
  id: TCommandId
  plan: CanvasExtensionPlanner<TInput, TEffect>
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
}

export function defineCanvasExtension<
  const TDescriptor extends CanvasExtensionDescriptor,
>(descriptor: TDescriptor): TDescriptor {
  return descriptor
}
