import { createCanvasAppAdapterAssembly } from './CanvasAppAdapterAssembly'
import { createCanvasAppAffordanceAssembly } from './CanvasAppAffordanceAssembly'
import { assertCanvasAppAssembly } from './CanvasAppAssemblyContracts'
import type {
  CanvasAppAssembly,
  CanvasAppAssemblyInput,
} from './CanvasAppAssemblyTypes'
import {
  createCanvasAppCapabilityAssembly,
  withCanvasAppCapabilities,
} from './CanvasAppCapabilityAssembly'
import { createCanvasAppCollaborationAssembly } from './CanvasAppCollaborationAssembly'
import { createCanvasAppComponentAssembly } from './CanvasAppComponentAssembly'
import {
  DEFAULT_CANVAS_APP_ASSEMBLY,
  DEFAULT_CANVAS_APP_BASE_EXTENSION_BUNDLE,
} from './CanvasAppDefaultAssembly'
import { createCanvasAppExtensionAssembly } from './CanvasAppExtensionAssembly'
import {
  createCanvasAppFeaturePackAssembly,
} from './CanvasAppFeaturePackAssembly'
import {
  DEFAULT_CANVAS_APP_FEATURE_PACK_EXTENSION_BUNDLE,
} from '../feature-packs'
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
  const featurePackAssembly = createCanvasAppFeaturePackAssembly(
    input,
    {
      featurePackExtensionBundle:
        DEFAULT_CANVAS_APP_FEATURE_PACK_EXTENSION_BUNDLE,
      installedFeaturePackIds:
        DEFAULT_CANVAS_APP_ASSEMBLY.installedFeaturePackIds,
      featurePackViewRenderers:
        DEFAULT_CANVAS_APP_ASSEMBLY.featurePackViewRenderers,
    },
  )
  const extensionAssembly = createCanvasAppExtensionAssembly(
    input,
    DEFAULT_CANVAS_APP_BASE_EXTENSION_BUNDLE,
    {
      featurePackExtensionBundle:
        featurePackAssembly.featurePackExtensionBundle,
    },
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
  const capabilityAssembly = createCanvasAppCapabilityAssembly(
    input,
    DEFAULT_CANVAS_APP_ASSEMBLY,
  )
  const affordanceAssembly = createCanvasAppAffordanceAssembly(
    {
      ...input,
      affordanceConfig: withCanvasAppCapabilities(
        input.affordanceConfig,
        capabilityAssembly.capabilities,
      ),
    },
    DEFAULT_CANVAS_APP_ASSEMBLY,
  )
  const collaborationAssembly = createCanvasAppCollaborationAssembly(
    input,
    DEFAULT_CANVAS_APP_ASSEMBLY,
  )
  const assembly: CanvasAppAssembly = {
    ...extensionAssembly,
    affordanceConfig: affordanceAssembly.affordanceConfig,
    capabilities: capabilityAssembly.capabilities,
    componentDefinitionRegistry:
      componentAssembly.componentDefinitionRegistry,
    componentLibrary: componentAssembly.componentLibrary,
    componentPresentationRenderers:
      componentAssembly.componentPresentationRenderers,
    featurePackViewRenderers: featurePackAssembly.featurePackViewRenderers,
    installedFeaturePackIds: featurePackAssembly.installedFeaturePackIds,
    initialItems: workspaceAssembly.initialItems,
    initialSelection: workspaceAssembly.initialSelection,
    itemAdapters: adapterAssembly.itemAdapters,
    itemLayerAdapter: adapterAssembly.itemLayerAdapter,
    presenceProvider: collaborationAssembly.presenceProvider,
    stageAdapter: adapterAssembly.stageAdapter,
    workspaceStorageProvider: workspaceAssembly.workspaceStorageProvider,
  }

  assertCanvasAppAssembly(assembly)

  return snapshotCanvasAppAssembly(assembly)
}
