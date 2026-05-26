import {
  normalizeCanvasItems,
  type CanvasItem,
} from '../../host'
import type { CanvasWorkspaceStorageProvider } from '../workspace/document/CanvasWorkspacePersistence'
import type {
  CanvasAppCustomItemValidators,
} from '../extensions/custom-item-modules/CanvasAppCustomItemValidatorContracts'
import type { CanvasAppWorkspaceAssemblyInput } from './CanvasAppAssemblyInputTypes'

export type { CanvasAppWorkspaceAssemblyInput } from './CanvasAppAssemblyInputTypes'

export type CanvasAppWorkspaceAssembly = {
  initialItems: CanvasItem[]
  initialSelection: readonly string[]
  workspaceStorageProvider: CanvasWorkspaceStorageProvider
}

export type CanvasAppWorkspaceAssemblyOptions = {
  customItemValidators: CanvasAppCustomItemValidators
}

export function createCanvasAppWorkspaceAssembly(
  input: CanvasAppWorkspaceAssemblyInput,
  defaults: CanvasAppWorkspaceAssembly,
  { customItemValidators }: CanvasAppWorkspaceAssemblyOptions,
): CanvasAppWorkspaceAssembly {
  return {
    initialItems: normalizeCanvasItems(
      input.initialItems ?? defaults.initialItems,
      { customItemValidators },
    ),
    initialSelection: [
      ...(input.initialSelection ??
        (input.initialItems === undefined ? defaults.initialSelection : [])),
    ],
    workspaceStorageProvider:
      input.workspaceStorageProvider ?? defaults.workspaceStorageProvider,
  }
}
