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
} from '../rendering'
import { assertCanvasAppCustomCreationTools } from '../tools/CanvasAppCustomCreationTools'
import { assertCanvasAppAssemblyAdapters } from './CanvasAppAdapterContracts'
import type { CanvasAppAssembly } from './CanvasAppAssembly'

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
  assertCanvasAppAssemblyAdapters(assembly)

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
