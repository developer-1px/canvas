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

export type CanvasAppExtensionAssemblyOptions = {
  featurePackExtensionBundle?: CanvasAppExtensionBundle
}

export function createCanvasAppExtensionAssembly(
  input: CanvasAppExtensionAssemblyInput,
  defaults: CanvasAppExtensionAssembly,
  options: CanvasAppExtensionAssemblyOptions = {},
): CanvasAppExtensionAssembly {
  const featurePackExtensionAssembly = options.featurePackExtensionBundle
    ? mergeCanvasAppExtensionBundle({
      current: defaults,
      entries: options.featurePackExtensionBundle,
      owner: 'app assembly',
    })
    : defaults
  const customItemModuleAssembly = createCanvasAppCustomItemModuleAssembly(
    input.customItemModules,
    { disabledModuleIds: input.disabledCustomItemModuleIds },
  )
  const moduleExtensionAssembly = mergeCanvasAppExtensionBundle({
    current: featurePackExtensionAssembly,
    entries: customItemModuleAssembly,
    owner: 'app assembly',
  })

  return mergeCanvasAppExtensionBundle({
    current: moduleExtensionAssembly,
    entries: createCanvasAppExtensionBundle({
      customCommands: input.customCommands,
      foundationExtensionAdapters: input.foundationExtensionAdapters,
      foundationExtensions: input.foundationExtensions,
      inspectorPanels: input.inspectorPanels,
      mediaImporters: input.mediaImporters,
      textPasteImporters: input.textPasteImporters,
    }),
    owner: 'app assembly',
  })
}
