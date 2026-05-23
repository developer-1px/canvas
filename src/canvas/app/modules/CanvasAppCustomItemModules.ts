import type {
  Bounds,
  CanvasJsonObject,
} from '../../entities'
import {
  normalizeCanvasItems,
  type CanvasCustomItemValidator,
  type CanvasCustomItemValidators,
} from '../../host'
import {
  assertCanvasAppCustomCommands,
  type CanvasAppCustomCommand,
} from '../commands/CanvasAppCustomCommands'
import { assertCanvasAppExtensionId } from '../extensions/CanvasAppExtensionIds'
import {
  appendUniqueCanvasAppExtensionEntries,
  mergeUniqueCanvasAppExtensionRecord,
} from '../extensions/CanvasAppExtensionRegistries'
import {
  assertCanvasAppInspectorPanels,
  type CanvasAppInspectorPanel,
} from '../inspector/CanvasAppInspectorPanels'
import type {
  CanvasDemoSvgCustomItemRendererStrategy,
  CanvasDemoSvgCustomItemRenderers,
} from '../rendering'
import {
  assertCanvasAppCustomCreationTools,
  type CanvasAppCustomCreationTool,
  type CanvasAppCustomCreationToolContext,
} from '../tools/CanvasAppCustomCreationTools'

export type CanvasAppCustomItemModuleCreationItem = Bounds & {
  data: CanvasJsonObject
  locked?: boolean
  title: string
}

export type CanvasAppCustomItemModuleCreationTool = Omit<
  CanvasAppCustomCreationTool,
  'createItem'
> & {
  createItem: (
    context: CanvasAppCustomCreationToolContext,
  ) => CanvasAppCustomItemModuleCreationItem | null
}

export type CanvasAppCustomItemModule = {
  customCommands?: readonly CanvasAppCustomCommand[]
  customCreationTools?: readonly CanvasAppCustomItemModuleCreationTool[]
  id: string
  inspectorPanels?: readonly CanvasAppInspectorPanel[]
  presentation: string
  renderItem: CanvasDemoSvgCustomItemRendererStrategy
  validateItem: CanvasCustomItemValidator
}

export type CanvasAppCustomItemModuleAssembly = {
  customCommands: readonly CanvasAppCustomCommand[]
  customCreationTools: readonly CanvasAppCustomCreationTool[]
  customItemRenderers: CanvasDemoSvgCustomItemRenderers
  customItemValidators: CanvasCustomItemValidators
  inspectorPanels: readonly CanvasAppInspectorPanel[]
}

export type CanvasAppCustomItemModuleAssemblyOptions = {
  disabledModuleIds?: readonly string[]
}

export function defineCanvasAppCustomItemModule(
  module: CanvasAppCustomItemModule,
) {
  assertCanvasAppCustomItemModuleContracts(module)

  return module
}

export function createCanvasAppCustomItemModuleAssembly(
  modules: readonly CanvasAppCustomItemModule[] = [],
  options: CanvasAppCustomItemModuleAssemblyOptions = {},
): CanvasAppCustomItemModuleAssembly {
  for (const module of modules) {
    assertCanvasAppCustomItemModuleContracts(module)
  }

  for (const disabledModuleId of options.disabledModuleIds ?? []) {
    assertCanvasAppExtensionId({
      id: disabledModuleId,
      label: 'disabled custom item module',
    })
  }

  assertUniqueModuleIds(modules)
  assertKnownDisabledModuleIds(modules, options.disabledModuleIds ?? [])
  const disabledModuleIds = new Set(options.disabledModuleIds ?? [])
  const enabledModules = modules.filter(
    (module) => !disabledModuleIds.has(module.id),
  )

  const assembly = enabledModules.reduce<CanvasAppCustomItemModuleAssembly>(
    (assembly, module) => ({
      customCommands: appendUniqueCanvasAppExtensionEntries({
        current: assembly.customCommands,
        entries: module.customCommands ?? [],
        label: 'custom command',
        owner: 'custom item module',
      }),
      customCreationTools: appendUniqueCanvasAppExtensionEntries({
        current: assembly.customCreationTools,
        entries: getCanvasAppCustomItemModuleCreationTools(module),
        label: 'custom creation tool',
        owner: 'custom item module',
      }),
      customItemRenderers: mergeUniqueCanvasAppExtensionRecord({
        current: assembly.customItemRenderers,
        entries: getCanvasAppCustomItemModuleRenderers(module),
        label: 'custom item renderer',
        owner: 'custom item module',
      }),
      customItemValidators: mergeUniqueCanvasAppExtensionRecord({
        current: assembly.customItemValidators,
        entries: getCanvasAppCustomItemModuleValidators(module),
        label: 'custom item validator',
        owner: 'custom item module',
      }),
      inspectorPanels: appendUniqueCanvasAppExtensionEntries({
        current: assembly.inspectorPanels,
        entries: module.inspectorPanels ?? [],
        label: 'inspector panel',
        owner: 'custom item module',
      }),
    }),
    {
      customCommands: [],
      customCreationTools: [],
      customItemRenderers: {},
      customItemValidators: {},
      inspectorPanels: [],
    },
  )

  assertCanvasAppCustomCreationTools(assembly.customCreationTools)

  return assembly
}

function assertCanvasAppCustomItemModuleContracts(
  module: CanvasAppCustomItemModule,
) {
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
  assertCanvasAppCustomCreationTools(
    getCanvasAppCustomItemModuleCreationTools(module),
  )

  for (const tool of module.customCreationTools ?? []) {
    assertCanvasAppCustomItemModuleFunction({
      fn: tool.createItem,
      label: `creation tool ${tool.id}`,
      moduleId: module.id,
    })
  }
}

function getCanvasAppCustomItemModuleCreationTools({
  customCreationTools = [],
  id,
  presentation,
  validateItem,
}: CanvasAppCustomItemModule): readonly CanvasAppCustomCreationTool[] {
  return customCreationTools.map((tool) => ({
    ...tool,
    createItem: (context) => {
      let item: CanvasAppCustomItemModuleCreationItem | null

      try {
        item = tool.createItem(context)
      } catch {
        return null
      }

      if (!item) {
        return null
      }

      const customItem = {
        ...item,
        id: context.createId(id),
        kind: id,
        presentation,
        type: 'custom',
      } as const

      try {
        normalizeCanvasItems([customItem], {
          customItemValidators: {
            [id]: getCanvasAppCustomItemModuleValidator({
              id,
              presentation,
              validateItem,
            }),
          },
        })

        return customItem
      } catch {
        return null
      }
    },
  }))
}

function getCanvasAppCustomItemModuleRenderers({
  presentation,
  renderItem,
}: CanvasAppCustomItemModule): CanvasDemoSvgCustomItemRenderers {
  return {
    [presentation]: renderItem,
  }
}

function getCanvasAppCustomItemModuleValidators({
  id,
  presentation,
  validateItem,
}: CanvasAppCustomItemModule): CanvasCustomItemValidators {
  return {
    [id]: getCanvasAppCustomItemModuleValidator({
      id,
      presentation,
      validateItem,
    }),
  }
}

function getCanvasAppCustomItemModuleValidator({
  id,
  presentation,
  validateItem,
}: Pick<CanvasAppCustomItemModule, 'id' | 'presentation' | 'validateItem'>) {
  return (item: Parameters<CanvasCustomItemValidator>[0]) => {
    if (item.kind !== id || item.presentation !== presentation) {
      return false
    }

    try {
      return validateItem(item)
    } catch {
      return false
    }
  }
}

function assertUniqueModuleIds(modules: readonly CanvasAppCustomItemModule[]) {
  const ids = new Set<string>()

  for (const module of modules) {
    if (ids.has(module.id)) {
      throw new Error(`Duplicate canvas custom item module: ${module.id}`)
    }

    ids.add(module.id)
  }
}

function assertKnownDisabledModuleIds(
  modules: readonly CanvasAppCustomItemModule[],
  disabledModuleIds: readonly string[],
) {
  const ids = new Set(modules.map((module) => module.id))

  for (const disabledModuleId of disabledModuleIds) {
    if (!ids.has(disabledModuleId)) {
      throw new Error(`Unknown disabled canvas custom item module: ${disabledModuleId}`)
    }
  }
}
