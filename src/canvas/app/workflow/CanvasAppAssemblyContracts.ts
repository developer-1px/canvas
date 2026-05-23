import { assertCanvasAffordanceConfig } from '../../engine'
import { normalizeCanvasItems } from '../../host'
import { assertCanvasAppCustomCommands } from '../commands/CanvasAppCustomCommands'
import {
  assertCanvasAppArray,
  assertCanvasAppDescriptorFunctionField,
  assertCanvasAppDescriptorObject,
} from '../extensions/CanvasAppDescriptorContracts'
import { assertCanvasAppInspectorPanels } from '../inspector/CanvasAppInspectorPanels'
import { assertCanvasAppCustomItemValidators } from '../modules/CanvasAppCustomItemValidatorContracts'
import { assertCanvasAppCustomItemRenderers } from '../rendering/CanvasAppRendererRegistries'
import { assertCanvasAppCustomCreationTools } from '../tools/CanvasAppCustomCreationTools'
import { assertCanvasAppAssemblyAdapters } from './CanvasAppAdapterContracts'
import type { CanvasAppAssembly } from './CanvasAppAssembly'
import { assertCanvasAppComponentAssembly } from './CanvasAppComponentAssemblyContracts'

export function assertCanvasAppAssembly(assembly: CanvasAppAssembly) {
  assertCanvasAppDescriptorObject(assembly, 'assembly')
  assertCanvasAffordanceConfig(assembly.affordanceConfig)
  assertCanvasAppComponentAssembly(assembly)
  assertCanvasAppCustomCommands(assembly.customCommands)
  assertCanvasAppCustomCreationTools(assembly.customCreationTools)
  assertCanvasAppCustomItemRenderers(assembly.customItemRenderers)
  assertCanvasAppCustomItemValidators(assembly.customItemValidators)
  assertCanvasAppInspectorPanels(assembly.inspectorPanels)
  assertCanvasAppArray(assembly.initialItems, 'assembly initial items')
  assertCanvasAppDescriptorFunctionField({
    field: 'workspaceStorageProvider',
    owner: 'assembly',
    value: assembly.workspaceStorageProvider,
  })
  normalizeCanvasItems(assembly.initialItems, {
    customItemValidators: assembly.customItemValidators,
  })
  assertCanvasAppAssemblyAdapters(assembly)

  return assembly
}
