import { assertCanvasAffordanceConfig } from '../../engine'
import { assertCanvasAppCustomCommands } from '../commands/CanvasAppCustomCommandContracts'
import { assertCanvasAppDescriptorObject } from '../extensions/CanvasAppDescriptorContracts'
import { assertCanvasAppInspectorPanels } from '../inspector/CanvasAppInspectorPanelContracts'
import { assertCanvasAppCustomItemValidators } from '../modules/CanvasAppCustomItemValidatorContracts'
import { assertCanvasAppCustomItemRenderers } from '../rendering/CanvasAppRendererRegistries'
import { assertCanvasAppCustomCreationTools } from '../tools/CanvasAppCustomCreationToolContracts'
import { assertCanvasAppAssemblyAdapters } from './CanvasAppAdapterContracts'
import type { CanvasAppAssembly } from './CanvasAppAssemblyTypes'
import { assertCanvasAppComponentAssembly } from './CanvasAppComponentAssemblyContracts'
import { assertCanvasAppWorkspaceAssembly } from './CanvasAppWorkspaceAssemblyContracts'

export function assertCanvasAppAssembly(assembly: CanvasAppAssembly) {
  assertCanvasAppDescriptorObject(assembly, 'assembly')
  assertCanvasAffordanceConfig(assembly.affordanceConfig)
  assertCanvasAppComponentAssembly(assembly)
  assertCanvasAppCustomCommands(assembly.customCommands)
  assertCanvasAppCustomCreationTools(assembly.customCreationTools)
  assertCanvasAppCustomItemRenderers(assembly.customItemRenderers)
  assertCanvasAppCustomItemValidators(assembly.customItemValidators)
  assertCanvasAppInspectorPanels(assembly.inspectorPanels)
  assertCanvasAppWorkspaceAssembly(assembly)
  assertCanvasAppAssemblyAdapters(assembly)

  return assembly
}
