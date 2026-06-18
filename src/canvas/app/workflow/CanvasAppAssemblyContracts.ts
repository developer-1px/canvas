import { assertCanvasAffordanceConfig } from '../../engine'
import { assertCanvasAppCustomCommands } from '../extensions/custom-commands'
import { assertCanvasAppDescriptorObject } from '../extensions/CanvasAppDescriptorContracts'
import { assertCanvasAppInspectorPanels } from '../extensions/inspector-panels'
import {
  assertCanvasAppItemsChangeTransformers,
} from '../extensions/items-change-transformers'
import { assertCanvasAppCustomItemValidators } from '../extensions/custom-item-modules/CanvasAppCustomItemValidatorContracts'
import { assertCanvasAppFoundationExtensions } from '../extensions/foundation-extensions'
import { assertCanvasAppCustomItemRenderers } from '../rendering/CanvasAppRendererRegistries'
import { assertCanvasAppCustomCreationTools } from '../extensions/custom-tools/CanvasAppCustomCreationToolContracts'
import {
  assertCanvasAppFeaturePackIds,
  assertCanvasAppFeaturePackViewRenderers,
  assertCanvasMediaImporters,
  assertCanvasTextPasteImporters,
} from '../feature-packs'
import { assertCanvasAppAssemblyAdapters } from './CanvasAppAdapterContracts'
import type { CanvasAppAssembly } from './CanvasAppAssemblyTypes'
import {
  assertCanvasAppCapabilityAssembly,
} from './CanvasAppCapabilityAssembly'
import {
  assertCanvasAppCollaborationAssembly,
} from './CanvasAppCollaborationAssembly'
import { assertCanvasAppComponentAssembly } from './CanvasAppComponentAssemblyContracts'
import { assertCanvasAppWorkspaceAssembly } from './CanvasAppWorkspaceAssemblyContracts'

export function assertCanvasAppAssembly(assembly: CanvasAppAssembly) {
  assertCanvasAppDescriptorObject(assembly, 'assembly')
  assertCanvasAffordanceConfig(assembly.affordanceConfig)
  assertCanvasAppCapabilityAssembly(assembly)
  assertCanvasAppComponentAssembly(assembly)
  assertCanvasAppCustomCommands(assembly.customCommands)
  assertCanvasAppCustomCreationTools(assembly.customCreationTools)
  assertCanvasAppCustomItemRenderers(assembly.customItemRenderers)
  assertCanvasAppCustomItemValidators(assembly.customItemValidators)
  assertCanvasAppFeaturePackViewRenderers(assembly.featurePackViewRenderers)
  assertCanvasAppFeaturePackIds(assembly.enabledFeaturePackIds)
  assertCanvasAppFeaturePackIds(assembly.installedFeaturePackIds)
  assertCanvasAppFoundationExtensions(assembly.foundationExtensions)
  assertCanvasAppInspectorPanels(assembly.inspectorPanels)
  assertCanvasAppItemsChangeTransformers(assembly.itemsChangeTransformers)
  assertCanvasMediaImporters(assembly.mediaImporters)
  assertCanvasTextPasteImporters(assembly.textPasteImporters)
  assertCanvasAppCollaborationAssembly(assembly)
  assertCanvasAppWorkspaceAssembly(assembly)
  assertCanvasAppAssemblyAdapters(assembly)

  return assembly
}
