import type {
  CanvasPresenceOverlay,
} from '../../engine'
import type { Viewport } from '../../entities'
import {
  assertCanvasAppDescriptorFunctionField,
} from '../extensions/CanvasAppDescriptorContracts'

export type CanvasAppPresenceProviderContext = {
  selection: readonly string[]
  viewport: Viewport
}

export type CanvasAppPresenceProvider = (
  context: CanvasAppPresenceProviderContext,
) => readonly CanvasPresenceOverlay[]

export type CanvasAppCollaborationAssemblyInput = {
  presenceProvider?: CanvasAppPresenceProvider
}

export type CanvasAppCollaborationAssembly = {
  presenceProvider: CanvasAppPresenceProvider
}

const EMPTY_CANVAS_APP_PRESENCE: readonly CanvasPresenceOverlay[] =
  Object.freeze([])

export const EMPTY_CANVAS_APP_PRESENCE_PROVIDER: CanvasAppPresenceProvider =
  () => EMPTY_CANVAS_APP_PRESENCE

export function createCanvasAppCollaborationAssembly(
  input: CanvasAppCollaborationAssemblyInput,
  defaults: CanvasAppCollaborationAssembly,
): CanvasAppCollaborationAssembly {
  return {
    presenceProvider: input.presenceProvider ?? defaults.presenceProvider,
  }
}

export function assertCanvasAppCollaborationAssembly({
  presenceProvider,
}: CanvasAppCollaborationAssembly) {
  assertCanvasAppDescriptorFunctionField({
    field: 'presenceProvider',
    owner: 'assembly collaboration',
    value: presenceProvider,
  })
}
