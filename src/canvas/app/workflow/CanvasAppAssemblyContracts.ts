import { assertCanvasAffordanceConfig } from '../../engine'
import {
  createCanvasComponentLibrary,
  normalizeCanvasItems,
  type CanvasComponentLibrary,
} from '../../host'
import { assertCanvasAppCustomCommands } from '../commands/CanvasAppCustomCommands'
import {
  assertCanvasAppArray,
  assertCanvasAppDescriptorFunctionField,
  assertCanvasAppDescriptorObject,
} from '../extensions/CanvasAppDescriptorContracts'
import { assertCanvasAppInspectorPanels } from '../inspector/CanvasAppInspectorPanels'
import { assertCanvasAppCustomItemValidators } from '../modules/CanvasAppCustomItemValidatorContracts'
import {
  assertCanvasAppComponentPresentationRenderers,
  assertCanvasAppCustomItemRenderers,
  type CanvasAppItemLayerAdapter,
  type CanvasAppStageAdapter,
} from '../rendering'
import { assertCanvasAppCustomCreationTools } from '../tools/CanvasAppCustomCreationTools'
import type {
  CanvasAppAssembly,
  CanvasAppItemAdapters,
} from './CanvasAppAssembly'

export function assertCanvasAppAssembly(assembly: CanvasAppAssembly) {
  assertCanvasAppDescriptorObject(assembly, 'assembly')
  assertCanvasAffordanceConfig(assembly.affordanceConfig)
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
