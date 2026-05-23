import type { CanvasAppCustomCommand } from '../commands/CanvasAppCustomCommands'
import {
  createCanvasAppExtensionBundle,
  type CanvasAppExtensionBundle,
  mergeCanvasAppExtensionBundle,
} from '../extensions/CanvasAppExtensionBundle'
import type { CanvasAppInspectorPanel } from '../inspector/CanvasAppInspectorPanels'
import {
  createCanvasAppCustomItemModuleAssembly,
  type CanvasAppCustomItemModule,
  type CanvasAppCustomItemModuleAssemblyOptions,
} from '../modules/CanvasAppCustomItemModules'

export type CanvasAppExtensionAssembly = CanvasAppExtensionBundle

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
  const moduleExtensionAssembly = mergeCanvasAppExtensionBundle({
    current: defaults,
    entries: customItemModuleAssembly,
    owner: 'app assembly',
  })

  return mergeCanvasAppExtensionBundle({
    current: moduleExtensionAssembly,
    entries: createCanvasAppExtensionBundle({
      customCommands: input.customCommands,
      inspectorPanels: input.inspectorPanels,
    }),
    owner: 'app assembly',
  })
}
