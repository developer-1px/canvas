import type {
  CanvasCommandAdapter,
  CanvasCreationAdapter,
  CanvasTransformAdapter,
} from '../../engine'
import {
  CANVAS_COMPONENT_LIBRARY,
  CANVAS_ITEM_ENGINE_ADAPTERS,
  INITIAL_ITEMS,
  createCanvasComponentLibrary,
  normalizeCanvasItems,
  type CanvasComponentLibrary,
  type CanvasCustomItemValidators,
  type CanvasItem,
} from '../../host'
import {
  DEFAULT_CANVAS_APP_CUSTOM_ITEM_RENDERERS,
  DEFAULT_CANVAS_APP_COMPONENT_PRESENTATION_RENDERERS,
  DEFAULT_CANVAS_APP_ITEM_LAYER_ADAPTER,
  DEFAULT_CANVAS_APP_STAGE_ADAPTER,
  assertCanvasAppComponentPresentationRenderers,
  assertCanvasAppCustomItemRenderers,
  createCanvasAppComponentPresentationRenderers,
  type CanvasAppComponentPresentationRenderers,
  type CanvasAppCustomItemRenderers,
  type CanvasAppItemLayerAdapter,
  type CanvasAppStageAdapter,
} from '../rendering'
import {
  assertCanvasAppCustomCommands,
  type CanvasAppCustomCommand,
} from '../commands/CanvasAppCustomCommands'
import { assertCanvasAppExtensionRecordKeys } from '../extensions/CanvasAppExtensionIds'
import {
  appendUniqueCanvasAppExtensionEntries,
  mergeUniqueCanvasAppExtensionRecord,
} from '../extensions/CanvasAppExtensionRegistries'
import {
  assertCanvasAppInspectorPanels,
  type CanvasAppInspectorPanel,
} from '../inspector/CanvasAppInspectorPanels'
import {
  createCanvasAppCustomItemModuleAssembly,
  type CanvasAppCustomItemModule,
  type CanvasAppCustomItemModuleAssemblyOptions,
} from '../modules/CanvasAppCustomItemModules'
import {
  assertCanvasAppCustomCreationTools,
  type CanvasAppCustomCreationTool,
} from '../tools/CanvasAppCustomCreationTools'
import {
  assertCanvasAppArray,
  assertCanvasAppDescriptorFunctionField,
  assertCanvasAppDescriptorObject,
} from '../extensions/CanvasAppDescriptorContracts'

export type CanvasAppItemAdapters = {
  command: CanvasCommandAdapter<CanvasItem>
  creation: CanvasCreationAdapter<CanvasItem>
  transform: CanvasTransformAdapter<CanvasItem>
}

export type CanvasAppAssembly = {
  componentLibrary: CanvasComponentLibrary
  componentPresentationRenderers: CanvasAppComponentPresentationRenderers
  customCommands: readonly CanvasAppCustomCommand[]
  customCreationTools: readonly CanvasAppCustomCreationTool[]
  customItemRenderers: CanvasAppCustomItemRenderers
  customItemValidators: CanvasCustomItemValidators
  inspectorPanels: readonly CanvasAppInspectorPanel[]
  initialItems: CanvasItem[]
  itemAdapters: CanvasAppItemAdapters
  itemLayerAdapter: CanvasAppItemLayerAdapter
  stageAdapter: CanvasAppStageAdapter
}

export type CanvasAppAssemblyInput = {
  componentLibrary?: CanvasComponentLibrary
  componentPresentationRenderers?: CanvasAppComponentPresentationRenderers
  customCommands?: readonly CanvasAppCustomCommand[]
  customItemModules?: readonly CanvasAppCustomItemModule[]
  disabledCustomItemModuleIds?: CanvasAppCustomItemModuleAssemblyOptions['disabledModuleIds']
  initialItems?: CanvasItem[]
  inspectorPanels?: readonly CanvasAppInspectorPanel[]
  itemAdapters?: CanvasAppItemAdapters
  itemLayerAdapter?: CanvasAppItemLayerAdapter
  stageAdapter?: CanvasAppStageAdapter
}

export const DEFAULT_CANVAS_APP_ASSEMBLY: CanvasAppAssembly =
  snapshotCanvasAppAssembly({
    componentLibrary: CANVAS_COMPONENT_LIBRARY,
    componentPresentationRenderers:
      DEFAULT_CANVAS_APP_COMPONENT_PRESENTATION_RENDERERS,
    customCommands: [],
    customCreationTools: [],
    customItemRenderers: DEFAULT_CANVAS_APP_CUSTOM_ITEM_RENDERERS,
    customItemValidators: {},
    inspectorPanels: [],
    initialItems: INITIAL_ITEMS,
    itemAdapters: CANVAS_ITEM_ENGINE_ADAPTERS,
    itemLayerAdapter: DEFAULT_CANVAS_APP_ITEM_LAYER_ADAPTER,
    stageAdapter: DEFAULT_CANVAS_APP_STAGE_ADAPTER,
  })

export function createCanvasAppAssembly(
  input: CanvasAppAssemblyInput = {},
): CanvasAppAssembly {
  const customItemModuleAssembly = createCanvasAppCustomItemModuleAssembly(
    input.customItemModules,
    { disabledModuleIds: input.disabledCustomItemModuleIds },
  )
  const customItemValidators = mergeUniqueCanvasAppExtensionRecord({
    current: DEFAULT_CANVAS_APP_ASSEMBLY.customItemValidators,
    entries: customItemModuleAssembly.customItemValidators,
    label: 'custom item validator',
    owner: 'app assembly',
  })

  const assembly: CanvasAppAssembly = {
    componentLibrary:
      input.componentLibrary ?? DEFAULT_CANVAS_APP_ASSEMBLY.componentLibrary,
    componentPresentationRenderers: createCanvasAppComponentPresentationRenderers(
      input.componentPresentationRenderers,
    ),
    customCommands: appendUniqueCanvasAppExtensionEntries({
      current: [
        ...DEFAULT_CANVAS_APP_ASSEMBLY.customCommands,
        ...customItemModuleAssembly.customCommands,
      ],
      entries: input.customCommands ?? [],
      label: 'custom command',
      owner: 'app assembly',
    }),
    customCreationTools: appendUniqueCanvasAppExtensionEntries({
      current: DEFAULT_CANVAS_APP_ASSEMBLY.customCreationTools,
      entries: customItemModuleAssembly.customCreationTools,
      label: 'custom creation tool',
      owner: 'app assembly',
    }),
    customItemRenderers: mergeUniqueCanvasAppExtensionRecord({
      current: DEFAULT_CANVAS_APP_ASSEMBLY.customItemRenderers,
      entries: customItemModuleAssembly.customItemRenderers,
      label: 'custom item renderer',
      owner: 'app assembly',
    }),
    customItemValidators,
    inspectorPanels: appendUniqueCanvasAppExtensionEntries({
      current: [
        ...DEFAULT_CANVAS_APP_ASSEMBLY.inspectorPanels,
        ...customItemModuleAssembly.inspectorPanels,
      ],
      entries: input.inspectorPanels ?? [],
      label: 'inspector panel',
      owner: 'app assembly',
    }),
    initialItems: normalizeCanvasItems(
      input.initialItems ?? DEFAULT_CANVAS_APP_ASSEMBLY.initialItems,
      { customItemValidators },
    ),
    itemAdapters: input.itemAdapters ?? DEFAULT_CANVAS_APP_ASSEMBLY.itemAdapters,
    itemLayerAdapter:
      input.itemLayerAdapter ?? DEFAULT_CANVAS_APP_ASSEMBLY.itemLayerAdapter,
    stageAdapter: input.stageAdapter ?? DEFAULT_CANVAS_APP_ASSEMBLY.stageAdapter,
  }

  assertCanvasAppExtensionRecordKeys({
    entries: assembly.componentPresentationRenderers,
    label: 'component presentation renderer',
  })
  assertCanvasAppAssembly(assembly)

  return snapshotCanvasAppAssembly(assembly)
}

export function assertCanvasAppAssembly(assembly: CanvasAppAssembly) {
  assertCanvasAppDescriptorObject(assembly, 'assembly')
  assertCanvasAppComponentLibrary(assembly.componentLibrary)
  assertCanvasAppComponentPresentationRenderers(
    assembly.componentPresentationRenderers,
  )
  assertCanvasComponentPresentationRendererCoverage(assembly)
  assertCanvasAppCustomCommands(assembly.customCommands)
  assertCanvasAppCustomCreationTools(assembly.customCreationTools)
  assertCanvasAppCustomItemRenderers(assembly.customItemRenderers)
  assertCanvasAppCustomItemValidators(assembly.customItemValidators)
  assertCanvasAppInspectorPanels(assembly.inspectorPanels)
  assertCanvasAppArray(assembly.initialItems, 'assembly initial items')
  normalizeCanvasItems(assembly.initialItems, {
    customItemValidators: assembly.customItemValidators,
  })
  assertCanvasAppItemAdapters(assembly.itemAdapters)
  assertCanvasAppItemLayerAdapter(assembly.itemLayerAdapter)
  assertCanvasAppStageAdapter(assembly.stageAdapter)

  return assembly
}

function assertCanvasComponentPresentationRendererCoverage({
  componentLibrary,
  componentPresentationRenderers,
}: CanvasAppAssembly) {
  for (const template of componentLibrary.templates) {
    if (!Object.hasOwn(componentPresentationRenderers, template.presentation)) {
      throw new Error(
        `Missing canvas app component presentation renderer: ${template.presentation}`,
      )
    }
  }
}

function assertCanvasAppComponentLibrary(
  componentLibrary: CanvasComponentLibrary,
) {
  assertCanvasAppDescriptorObject(componentLibrary, 'component library')
  assertCanvasAppDescriptorFunctionField({
    field: 'createItem',
    owner: 'component library',
    value: componentLibrary.createItem,
  })
  assertCanvasAppDescriptorFunctionField({
    field: 'getPresentation',
    owner: 'component library',
    value: componentLibrary.getPresentation,
  })
  assertCanvasAppDescriptorFunctionField({
    field: 'getTemplate',
    owner: 'component library',
    value: componentLibrary.getTemplate,
  })
  assertCanvasAppArray(
    componentLibrary.templates,
    'component library templates',
  )
  createCanvasComponentLibrary({ templates: componentLibrary.templates })
  assertCanvasAppComponentLibraryResolvers(componentLibrary)
}

function assertCanvasAppComponentLibraryResolvers(
  componentLibrary: CanvasComponentLibrary,
) {
  for (const template of componentLibrary.templates) {
    const resolvedTemplate = componentLibrary.getTemplate(template.id)
    const presentation = componentLibrary.getPresentation(template.id)

    if (
      resolvedTemplate.id !== template.id ||
      resolvedTemplate.presentation !== template.presentation
    ) {
      throw new Error(
        `Canvas app component library getTemplate mismatch: ${template.id}`,
      )
    }

    if (presentation !== template.presentation) {
      throw new Error(
        `Canvas app component library getPresentation mismatch: ${template.id}`,
      )
    }
  }
}

function assertCanvasAppCustomItemValidators(
  customItemValidators: CanvasCustomItemValidators,
) {
  assertCanvasAppExtensionRecordKeys({
    entries: customItemValidators,
    label: 'custom item validator',
  })

  for (const [kind, validator] of Object.entries(customItemValidators)) {
    assertCanvasAppDescriptorFunctionField({
      field: 'validate strategy',
      owner: `custom item validator ${kind}`,
      value: validator,
    })
  }
}

function assertCanvasAppItemAdapters(itemAdapters: CanvasAppItemAdapters) {
  assertCanvasAppDescriptorObject(itemAdapters, 'item adapters')
  assertCanvasAppCommandAdapter(itemAdapters.command)
  assertCanvasAppCreationAdapter(itemAdapters.creation)
  assertCanvasAppTransformAdapter(itemAdapters.transform)
}

function assertCanvasAppCommandAdapter(
  adapter: CanvasAppItemAdapters['command'],
) {
  assertCanvasAppDescriptorObject(adapter, 'command adapter')

  for (const field of [
    'alignSelection',
    'cloneSelection',
    'deleteSelection',
    'distributeSelection',
    'groupSelection',
    'lockSelection',
    'nudgeSelection',
    'pasteItems',
    'reorderSelection',
    'selectAll',
    'ungroupSelection',
    'unlockAll',
  ] as const) {
    assertCanvasAppDescriptorFunctionField({
      field,
      owner: 'command adapter',
      value: adapter[field],
    })
  }
}

function assertCanvasAppCreationAdapter(
  adapter: CanvasAppItemAdapters['creation'],
) {
  assertCanvasAppDescriptorObject(adapter, 'creation adapter')

  for (const field of [
    'createArrow',
    'createHighlight',
    'createMarker',
    'createRect',
    'createText',
  ] as const) {
    assertCanvasAppDescriptorFunctionField({
      field,
      owner: 'creation adapter',
      value: adapter[field],
    })
  }
}

function assertCanvasAppTransformAdapter(
  adapter: CanvasAppItemAdapters['transform'],
) {
  assertCanvasAppDescriptorObject(adapter, 'transform adapter')

  for (const field of ['resizeSelection', 'translateSelection'] as const) {
    assertCanvasAppDescriptorFunctionField({
      field,
      owner: 'transform adapter',
      value: adapter[field],
    })
  }
}

function assertCanvasAppItemLayerAdapter(
  adapter: CanvasAppItemLayerAdapter,
) {
  assertCanvasAppDescriptorObject(adapter, 'item layer adapter')
  assertCanvasAppDescriptorFunctionField({
    field: 'renderItems',
    owner: 'item layer adapter',
    value: adapter.renderItems,
  })
}

function assertCanvasAppStageAdapter(adapter: CanvasAppStageAdapter) {
  assertCanvasAppDescriptorObject(adapter, 'stage adapter')
  assertCanvasAppDescriptorFunctionField({
    field: 'renderStage',
    owner: 'stage adapter',
    value: adapter.renderStage,
  })
}

function snapshotCanvasAppAssembly(
  assembly: CanvasAppAssembly,
): CanvasAppAssembly {
  const customItemValidators = freezeCanvasAppRecord(
    assembly.customItemValidators,
  )

  return Object.freeze({
    componentLibrary: snapshotCanvasAppComponentLibrary(
      assembly.componentLibrary,
    ),
    componentPresentationRenderers: freezeCanvasAppRecord(
      assembly.componentPresentationRenderers,
    ),
    customCommands: freezeCanvasAppArray(
      assembly.customCommands.map(snapshotCanvasAppCustomCommand),
    ),
    customCreationTools: freezeCanvasAppArray(
      assembly.customCreationTools.map(snapshotCanvasAppCustomCreationTool),
    ),
    customItemRenderers: freezeCanvasAppRecord(assembly.customItemRenderers),
    customItemValidators,
    inspectorPanels: freezeCanvasAppArray(
      assembly.inspectorPanels.map(snapshotCanvasAppInspectorPanel),
    ),
    initialItems: snapshotCanvasAppInitialItems(
      assembly.initialItems,
      customItemValidators,
    ),
    itemAdapters: snapshotCanvasAppItemAdapters(assembly.itemAdapters),
    itemLayerAdapter: snapshotCanvasAppItemLayerAdapter(
      assembly.itemLayerAdapter,
    ),
    stageAdapter: snapshotCanvasAppStageAdapter(assembly.stageAdapter),
  })
}

function snapshotCanvasAppComponentLibrary(
  componentLibrary: CanvasComponentLibrary,
): CanvasComponentLibrary {
  const templates = createCanvasComponentLibrary({
    templates: componentLibrary.templates,
  }).templates
  const createItem = componentLibrary.createItem
  const getPresentation = componentLibrary.getPresentation
  const getTemplate = componentLibrary.getTemplate

  return Object.freeze({
    createItem,
    getPresentation,
    getTemplate,
    templates,
  })
}

function snapshotCanvasAppCustomCommand(
  command: CanvasAppCustomCommand,
): CanvasAppCustomCommand {
  return Object.freeze({ ...command })
}

function snapshotCanvasAppCustomCreationTool(
  tool: CanvasAppCustomCreationTool,
): CanvasAppCustomCreationTool {
  const snapshot: CanvasAppCustomCreationTool = {
    ...tool,
  }

  if (tool.shortcut) {
    snapshot.shortcut = Object.freeze({ ...tool.shortcut })
  }

  return Object.freeze(snapshot)
}

function snapshotCanvasAppInspectorPanel(
  panel: CanvasAppInspectorPanel,
): CanvasAppInspectorPanel {
  return Object.freeze({ ...panel })
}

function snapshotCanvasAppInitialItems(
  items: CanvasItem[],
  customItemValidators: CanvasCustomItemValidators,
) {
  return freezeCanvasAppArray(
    normalizeCanvasItems(items, { customItemValidators })
      .map((item) => deepFreezeCanvasAppValue(structuredClone(item))),
  ) as CanvasItem[]
}

function snapshotCanvasAppItemAdapters(
  itemAdapters: CanvasAppItemAdapters,
): CanvasAppItemAdapters {
  return Object.freeze({
    command: Object.freeze({ ...itemAdapters.command }),
    creation: Object.freeze({ ...itemAdapters.creation }),
    transform: Object.freeze({ ...itemAdapters.transform }),
  })
}

function snapshotCanvasAppItemLayerAdapter(
  adapter: CanvasAppItemLayerAdapter,
): CanvasAppItemLayerAdapter {
  return Object.freeze({ ...adapter })
}

function snapshotCanvasAppStageAdapter(
  adapter: CanvasAppStageAdapter,
): CanvasAppStageAdapter {
  return Object.freeze({ ...adapter })
}

function freezeCanvasAppRecord<TValue>(
  record: Readonly<Record<string, TValue>>,
) {
  return Object.freeze({ ...record })
}

function freezeCanvasAppArray<TValue>(items: readonly TValue[]) {
  return Object.freeze([...items]) as readonly TValue[]
}

function deepFreezeCanvasAppValue<TValue>(value: TValue): TValue {
  if (typeof value !== 'object' || value === null || Object.isFrozen(value)) {
    return value
  }

  for (const nested of Object.values(value)) {
    deepFreezeCanvasAppValue(nested)
  }

  return Object.freeze(value)
}
