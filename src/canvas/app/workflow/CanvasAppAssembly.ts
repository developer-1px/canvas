import { createCanvasAppAdapterAssembly } from './CanvasAppAdapterAssembly'
import { createCanvasAppAffordanceAssembly } from './CanvasAppAffordanceAssembly'
import { assertCanvasAppAssembly } from './CanvasAppAssemblyContracts'
import type {
  CanvasAppAssembly,
  CanvasAppAssemblyInput,
} from './CanvasAppAssemblyTypes'
import {
  createCanvasAppCapabilityAssembly,
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
  mergeCanvasAppAffordanceConfigInput,
} from '../feature-packs'
import { createCanvasAppWorkspaceAssembly } from './CanvasAppWorkspaceAssembly'
import { snapshotCanvasAppAssembly } from './CanvasAppAssemblySnapshot'
import {
  createCanvasAppDocumentAuthorityAffordanceConfigInput,
  createCanvasAppDocumentAuthorityRead,
} from './CanvasAppDocumentAuthority'
import { compileCanvasAppFoundationExtensions } from '../extensions/foundation-extensions'

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
  const documentAuthority = createCanvasAppDocumentAuthorityRead(
    capabilityAssembly.capabilities,
  )
  const foundationExtensionRuntime = compileCanvasAppFoundationExtensions({
    adapters: extensionAssembly.foundationExtensionAdapters,
    can: (capability) => documentAuthority.can(
      capability as Parameters<typeof documentAuthority.can>[0],
    ),
    extensions: extensionAssembly.foundationExtensions,
  })
  const componentAssembly = createCanvasAppComponentAssembly(
    input,
    DEFAULT_CANVAS_APP_ASSEMBLY,
    {
      foundationRenderers:
        foundationExtensionRuntime.componentPresentationRenderers,
    },
  )
  const affordanceAssembly = createCanvasAppAffordanceAssembly(
    {
      ...input,
      affordanceConfig: mergeCanvasAppAffordanceConfigInput(
        input.affordanceConfig ?? {},
        createCanvasAppDocumentAuthorityAffordanceConfigInput(
          documentAuthority,
        ),
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
    componentLibrary: componentAssembly.componentLibrary,
    componentPresentationRenderers:
      componentAssembly.componentPresentationRenderers,
    documentAuthority,
    featurePackViewRenderers: featurePackAssembly.featurePackViewRenderers,
    foundationExtensionRuntime,
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
