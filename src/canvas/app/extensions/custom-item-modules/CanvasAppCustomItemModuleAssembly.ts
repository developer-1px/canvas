import {
  createEmptyCanvasAppExtensionBundle,
  type CanvasAppExtensionBundle,
  mergeCanvasAppExtensionBundle,
} from '../CanvasAppExtensionBundle'
import {
  assertCanvasAppCustomItemModuleAssembly,
  assertCanvasAppCustomItemModuleAssemblyInput,
} from './CanvasAppCustomItemModuleContracts'
import {
  getCanvasAppCustomItemModuleExtensionBundle,
} from './CanvasAppCustomItemModuleRuntime'
import {
  snapshotCanvasAppCustomItemModuleAssembly,
} from './CanvasAppCustomItemModuleSnapshot'
import type { CanvasAppCustomItemModule } from './CanvasAppCustomItemModules'

export type CanvasAppCustomItemModuleAssembly = CanvasAppExtensionBundle

export type CanvasAppCustomItemModuleAssemblyOptions = {
  disabledModuleIds?: readonly string[]
}

export function createCanvasAppCustomItemModuleAssembly(
  modules: readonly CanvasAppCustomItemModule[] = [],
  options: CanvasAppCustomItemModuleAssemblyOptions = {},
): CanvasAppCustomItemModuleAssembly {
  const disabledModuleIds = assertCanvasAppCustomItemModuleAssemblyInput({
    disabledModuleIds: options.disabledModuleIds ?? [],
    modules,
  })
  const disabledModuleIdSet = new Set(disabledModuleIds)
  const enabledModules = modules.filter(
    (module) => !disabledModuleIdSet.has(module.id),
  )

  const assembly = enabledModules.reduce<CanvasAppCustomItemModuleAssembly>(
    (assembly, module) =>
      mergeCanvasAppExtensionBundle({
        current: assembly,
        entries: getCanvasAppCustomItemModuleExtensionBundle(module),
        owner: 'custom item module',
      }),
    createEmptyCanvasAppExtensionBundle(),
  )

  assertCanvasAppCustomItemModuleAssembly(assembly)

  return snapshotCanvasAppCustomItemModuleAssembly(assembly)
}
