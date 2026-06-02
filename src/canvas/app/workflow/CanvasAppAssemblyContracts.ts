import { assertCanvasAffordanceConfig } from '../../engine'
import { assertCanvasAppCustomCommands } from '../affordances/commands/CanvasAppCustomCommandContracts'
import { assertCanvasAppDescriptorObject } from '../extensions/CanvasAppDescriptorContracts'
import { assertCanvasAppInspectorPanels } from '../affordances/editing/inspector/CanvasAppInspectorPanelContracts'
import { assertCanvasAppCustomItemValidators } from '../extensions/custom-item-modules/CanvasAppCustomItemValidatorContracts'
import { assertCanvasAppCustomItemRenderers } from '../rendering/CanvasAppRendererRegistries'
import { assertCanvasAppCustomCreationTools } from '../extensions/custom-tools/CanvasAppCustomCreationToolContracts'
import { assertCanvasMediaImporters } from '../affordances/io/media/CanvasMediaImporters'
import { assertCanvasTextPasteImporters } from '../affordances/io/text-paste/CanvasTextPasteImporters'
import { assertCanvasAppAssemblyAdapters } from './CanvasAppAdapterContracts'
import type { CanvasAppAssembly } from './CanvasAppAssemblyTypes'
import {
  assertCanvasAppCollaborationAssembly,
} from './CanvasAppCollaborationAssembly'
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
  assertCanvasMediaImporters(assembly.mediaImporters)
  assertCanvasTextPasteImporters(assembly.textPasteImporters)
  assertCanvasAppCollaborationAssembly(assembly)
  assertCanvasAppWorkspaceAssembly(assembly)
  assertCanvasAppAssemblyAdapters(assembly)

  return assembly
}
