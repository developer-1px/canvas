import { createCanvasAppAdapterAssembly } from './CanvasAppAdapterAssembly'
import { createCanvasAppAffordanceAssembly } from './CanvasAppAffordanceAssembly'
import { assertCanvasAppAssembly } from './CanvasAppAssemblyContracts'
import type {
  CanvasAppAssembly,
  CanvasAppAssemblyInput,
} from './CanvasAppAssemblyTypes'
import { createCanvasAppComponentAssembly } from './CanvasAppComponentAssembly'
import { DEFAULT_CANVAS_APP_ASSEMBLY } from './CanvasAppDefaultAssembly'
import { createCanvasAppExtensionAssembly } from './CanvasAppExtensionAssembly'
import { createCanvasAppWorkspaceAssembly } from './CanvasAppWorkspaceAssembly'
import { snapshotCanvasAppAssembly } from './CanvasAppAssemblySnapshot'

export { assertCanvasAppAssembly } from './CanvasAppAssemblyContracts'
export { DEFAULT_CANVAS_APP_ASSEMBLY } from './CanvasAppDefaultAssembly'
export type { CanvasAppItemAdapters } from './CanvasAppAdapterContracts'
export type {
  CanvasAppAssembly,
  CanvasAppAssemblyInput,
} from './CanvasAppAssemblyTypes'

export function createCanvasAppAssembly(
  input: CanvasAppAssemblyInput = {},
): CanvasAppAssembly {
  const componentAssembly = createCanvasAppComponentAssembly(
    input,
    DEFAULT_CANVAS_APP_ASSEMBLY,
  )
  const extensionAssembly = createCanvasAppExtensionAssembly(
    input,
    DEFAULT_CANVAS_APP_ASSEMBLY,
  )
  const workspaceAssembly = createCanvasAppWorkspaceAssembly(
    input,
    DEFAULT_CANVAS_APP_ASSEMBLY,
    { customItemValidators: extensionAssembly.customItemValidators },
  )
  const adapterAssembly = createCanvasAppAdapterAssembly(
    input,
    DEFAULT_CANVAS_APP_ASSEMBLY,
  )
  const affordanceAssembly = createCanvasAppAffordanceAssembly(
    input,
    DEFAULT_CANVAS_APP_ASSEMBLY,
  )

  const assembly: CanvasAppAssembly = {
    affordanceConfig: affordanceAssembly.affordanceConfig,
    componentLibrary: componentAssembly.componentLibrary,
    componentPresentationRenderers:
      componentAssembly.componentPresentationRenderers,
    customCommands: extensionAssembly.customCommands,
    customCreationTools: extensionAssembly.customCreationTools,
    customItemRenderers: extensionAssembly.customItemRenderers,
    customItemValidators: extensionAssembly.customItemValidators,
    inspectorPanels: extensionAssembly.inspectorPanels,
    initialItems: workspaceAssembly.initialItems,
    initialSelection: workspaceAssembly.initialSelection,
    itemAdapters: adapterAssembly.itemAdapters,
    itemLayerAdapter: adapterAssembly.itemLayerAdapter,
    stageAdapter: adapterAssembly.stageAdapter,
    workspaceStorageProvider: workspaceAssembly.workspaceStorageProvider,
  }

  assertCanvasAppAssembly(assembly)

  return snapshotCanvasAppAssembly(assembly)
}
