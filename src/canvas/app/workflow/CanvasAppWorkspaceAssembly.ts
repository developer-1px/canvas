import {
  normalizeCanvasItems,
  type CanvasCustomItemValidators,
  type CanvasItem,
} from '../../host'
import type { CanvasWorkspaceStorageProvider } from '../document/CanvasWorkspacePersistence'

export type CanvasAppWorkspaceAssembly = {
  initialItems: CanvasItem[]
  initialSelection: readonly string[]
  workspaceStorageProvider: CanvasWorkspaceStorageProvider
}

export type CanvasAppWorkspaceAssemblyInput = {
  initialItems?: CanvasItem[]
  initialSelection?: readonly string[]
  workspaceStorageProvider?: CanvasWorkspaceStorageProvider
}

export type CanvasAppWorkspaceAssemblyOptions = {
  customItemValidators: CanvasCustomItemValidators
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
