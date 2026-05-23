import type { CanvasCustomItemValidators } from '../../host'
import type { CanvasAppCustomCommand } from '../commands/CanvasAppCustomCommands'
import {
  appendUniqueCanvasAppExtensionEntries,
  mergeUniqueCanvasAppExtensionRecord,
} from '../extensions/CanvasAppExtensionRegistries'
import type { CanvasAppInspectorPanel } from '../inspector/CanvasAppInspectorPanels'
import {
  createCanvasAppCustomItemModuleAssembly,
  type CanvasAppCustomItemModule,
  type CanvasAppCustomItemModuleAssemblyOptions,
} from '../modules/CanvasAppCustomItemModules'
import type { CanvasAppCustomItemRenderers } from '../rendering/CanvasAppRendererRegistries'
import type { CanvasAppCustomCreationTool } from '../tools/CanvasAppCustomCreationTools'

export type CanvasAppExtensionAssembly = {
  customCommands: readonly CanvasAppCustomCommand[]
  customCreationTools: readonly CanvasAppCustomCreationTool[]
  customItemRenderers: CanvasAppCustomItemRenderers
  customItemValidators: CanvasCustomItemValidators
  inspectorPanels: readonly CanvasAppInspectorPanel[]
}

export type CanvasAppExtensionAssemblyInput = {
  customCommands?: readonly CanvasAppCustomCommand[]
  customItemModules?: readonly CanvasAppCustomItemModule[]
  disabledCustomItemModuleIds?: CanvasAppCustomItemModuleAssemblyOptions['disabledModuleIds']
  inspectorPanels?: readonly CanvasAppInspectorPanel[]
}

export function createCanvasAppExtensionAssembly(
  input: CanvasAppExtensionAssemblyInput,
  defaults: CanvasAppExtensionAssembly,
): CanvasAppExtensionAssembly {
  const customItemModuleAssembly = createCanvasAppCustomItemModuleAssembly(
    input.customItemModules,
    { disabledModuleIds: input.disabledCustomItemModuleIds },
  )
  const customItemValidators = mergeUniqueCanvasAppExtensionRecord({
    current: defaults.customItemValidators,
    entries: customItemModuleAssembly.customItemValidators,
    label: 'custom item validator',
    owner: 'app assembly',
  })

  return {
    customCommands: appendUniqueCanvasAppExtensionEntries({
      current: [
        ...defaults.customCommands,
        ...customItemModuleAssembly.customCommands,
      ],
      entries: input.customCommands ?? [],
      label: 'custom command',
      owner: 'app assembly',
    }),
    customCreationTools: appendUniqueCanvasAppExtensionEntries({
      current: defaults.customCreationTools,
      entries: customItemModuleAssembly.customCreationTools,
      label: 'custom creation tool',
      owner: 'app assembly',
    }),
    customItemRenderers: mergeUniqueCanvasAppExtensionRecord({
      current: defaults.customItemRenderers,
      entries: customItemModuleAssembly.customItemRenderers,
      label: 'custom item renderer',
      owner: 'app assembly',
    }),
    customItemValidators,
    inspectorPanels: appendUniqueCanvasAppExtensionEntries({
      current: [
        ...defaults.inspectorPanels,
        ...customItemModuleAssembly.inspectorPanels,
      ],
      entries: input.inspectorPanels ?? [],
      label: 'inspector panel',
      owner: 'app assembly',
    }),
  }
}
