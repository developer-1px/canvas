import {
  createCanvasAppExtensionBundle,
  type CanvasAppExtensionBundle,
  mergeCanvasAppExtensionBundle,
} from '../extensions/CanvasAppExtensionBundle'
import {
  createCanvasAppCustomItemModuleAssembly,
} from '../extensions/custom-item-modules/CanvasAppCustomItemModuleAssembly'
import type { CanvasAppExtensionAssemblyInput } from './CanvasAppExtensionAssemblyTypes'

export type CanvasAppExtensionAssembly = CanvasAppExtensionBundle

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
      foundationExtensions: input.foundationExtensions,
      inspectorPanels: input.inspectorPanels,
      mediaImporters: input.mediaImporters,
      textPasteImporters: input.textPasteImporters,
    }),
    owner: 'app assembly',
  })
}
