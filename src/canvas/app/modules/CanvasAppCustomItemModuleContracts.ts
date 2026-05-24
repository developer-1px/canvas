import { assertCanvasAppCustomCommands } from '../commands/CanvasAppCustomCommandContracts'
import {
  assertCanvasAppArray,
  assertCanvasAppDescriptorObject,
} from '../extensions/CanvasAppDescriptorContracts'
import { assertCanvasAppExtensionId } from '../extensions/CanvasAppExtensionIds'
import { assertCanvasAppInspectorPanels } from '../inspector/CanvasAppInspectorPanelContracts'
import { assertCanvasAppCustomCreationTools } from '../tools/CanvasAppCustomCreationToolContracts'
import type { CanvasAppCustomItemModuleAssembly } from './CanvasAppCustomItemModuleAssembly'
import type {
  CanvasAppCustomItemModule,
} from './CanvasAppCustomItemModules'

export function assertCanvasAppCustomItemModuleAssemblyInput({
  disabledModuleIds,
  modules,
}: {
  disabledModuleIds: readonly string[]
  modules: readonly CanvasAppCustomItemModule[]
}) {
  assertCanvasAppArray(modules, 'custom item modules')
  assertCanvasAppArray(disabledModuleIds, 'disabled custom item module ids')

  for (const module of modules) {
    assertCanvasAppCustomItemModule(module)
  }

  for (const disabledModuleId of disabledModuleIds) {
    assertCanvasAppExtensionId({
      id: disabledModuleId,
      label: 'disabled custom item module',
    })
  }

  assertUniqueCanvasAppCustomItemModuleIds(modules)
  assertKnownDisabledCanvasAppCustomItemModuleIds(modules, disabledModuleIds)

  return disabledModuleIds
}

export function assertCanvasAppCustomItemModule(
  module: CanvasAppCustomItemModule,
) {
  assertCanvasAppDescriptorObject(module, 'custom item module')
  assertCanvasAppExtensionId({
    id: module.id,
    label: 'custom item module',
  })
  assertCanvasAppCustomCommands(module.customCommands ?? [])
  assertCanvasAppCustomItemModuleCreationTools(module)
  assertCanvasAppExtensionId({
    id: module.presentation,
    label: 'custom item presentation',
  })
  assertCanvasAppCustomItemModuleFunction({
    fn: module.renderItem,
    label: 'renderer',
    moduleId: module.id,
  })
  assertCanvasAppCustomItemModuleFunction({
    fn: module.validateItem,
    label: 'validator',
    moduleId: module.id,
  })
  assertCanvasAppInspectorPanels(module.inspectorPanels ?? [])
}

export function assertCanvasAppCustomItemModuleAssembly(
  assembly: CanvasAppCustomItemModuleAssembly,
) {
  assertCanvasAppCustomCreationTools(assembly.customCreationTools)
}

function assertCanvasAppCustomItemModuleFunction({
  fn,
  label,
  moduleId,
}: {
  fn: unknown
  label: string
  moduleId: string
}) {
  if (typeof fn !== 'function') {
    throw new Error(`Canvas custom item module ${moduleId} requires ${label}`)
  }
}

function assertCanvasAppCustomItemModuleCreationTools(
  module: CanvasAppCustomItemModule,
) {
  assertCanvasAppCustomCreationTools(module.customCreationTools ?? [])

  for (const tool of module.customCreationTools ?? []) {
    assertCanvasAppCustomItemModuleFunction({
      fn: tool.createItem,
      label: `creation tool ${tool.id}`,
      moduleId: module.id,
    })
  }
}

function assertUniqueCanvasAppCustomItemModuleIds(
  modules: readonly CanvasAppCustomItemModule[],
) {
  const ids = new Set<string>()

  for (const module of modules) {
    if (ids.has(module.id)) {
      throw new Error(`Duplicate canvas custom item module: ${module.id}`)
    }

    ids.add(module.id)
  }
}

function assertKnownDisabledCanvasAppCustomItemModuleIds(
  modules: readonly CanvasAppCustomItemModule[],
  disabledModuleIds: readonly string[],
) {
  const ids = new Set(modules.map((module) => module.id))

  for (const disabledModuleId of disabledModuleIds) {
    if (!ids.has(disabledModuleId)) {
      throw new Error(
        `Unknown disabled canvas custom item module: ${disabledModuleId}`,
      )
    }
  }
}
