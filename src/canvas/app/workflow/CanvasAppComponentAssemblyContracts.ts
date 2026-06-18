import {
  createCanvasComponentDefinitionRegistry,
  createCanvasComponentLibrary,
  type CanvasComponentDefinition,
  type CanvasComponentDefinitionRegistry,
} from '../../host'
import type {
  CanvasComponentItem,
  CanvasComponentKind,
  Point,
} from '../../entities'
import {
  assertCanvasAppArray,
  assertCanvasAppDescriptorFunctionField,
  assertCanvasAppDescriptorObject,
} from '../extensions/CanvasAppDescriptorContracts'
import {
  assertCanvasAppComponentPresentationRenderers,
} from '../rendering/CanvasAppRendererRegistries'
import type {
  CanvasAppComponentPresentationRenderers,
} from '../rendering/CanvasAppRenderingContracts'

export type CanvasAppComponentAssemblyContract = {
  componentDefinitionRegistry: CanvasAppComponentDefinitionRegistry
  componentLibrary: CanvasAppComponentLibrary
  componentPresentationRenderers: CanvasAppComponentPresentationRenderers
}

type CanvasComponentPresentationRendererCoverageInput = {
  componentLibrary: CanvasAppComponentLibrary
  componentPresentationRenderers: CanvasAppComponentPresentationRenderers
}

export type CanvasAppComponentDefinition = CanvasComponentDefinition
export type CanvasAppComponentDefinitionRegistry =
  CanvasComponentDefinitionRegistry
export type CanvasAppComponentPresentation = string

export type CanvasAppComponentTemplate = {
  accent: string
  body?: string
  columns?: string[]
  fill: string
  h: number
  id: CanvasComponentKind
  items?: string[]
  label: string
  presentation: CanvasAppComponentPresentation
  stroke: string
  title: string
  w: number
}

export type CanvasAppCreateComponentItemInput = {
  id: string
  point: Point
  templateId: CanvasComponentKind
}

export type CanvasAppComponentLibrary = {
  createItem: (
    input: CanvasAppCreateComponentItemInput,
  ) => CanvasComponentItem
  getPresentation: (
    id: CanvasComponentKind,
  ) => CanvasAppComponentPresentation
  getTemplate: (id: CanvasComponentKind) => CanvasAppComponentTemplate
  templates: readonly CanvasAppComponentTemplate[]
}

export function assertCanvasAppComponentAssembly({
  componentDefinitionRegistry,
  componentLibrary,
  componentPresentationRenderers,
}: CanvasAppComponentAssemblyContract) {
  assertCanvasAppComponentDefinitionRegistry(componentDefinitionRegistry)
  assertCanvasAppComponentLibrary(componentLibrary)
  assertCanvasAppComponentPresentationRenderers(componentPresentationRenderers)
  assertCanvasComponentPresentationRendererCoverage({
    componentLibrary,
    componentPresentationRenderers,
  })
}

function assertCanvasComponentPresentationRendererCoverage({
  componentLibrary,
  componentPresentationRenderers,
}: CanvasComponentPresentationRendererCoverageInput) {
  for (const template of componentLibrary.templates) {
    if (!Object.hasOwn(componentPresentationRenderers, template.presentation)) {
      throw new Error(
        `Missing canvas app component presentation renderer: ${template.presentation}`,
      )
    }
  }
}

function assertCanvasAppComponentDefinitionRegistry(
  componentDefinitionRegistry: CanvasAppComponentDefinitionRegistry,
) {
  assertCanvasAppDescriptorObject(
    componentDefinitionRegistry,
    'component definition registry',
  )
  assertCanvasAppArray(
    componentDefinitionRegistry.definitions,
    'component definition registry definitions',
  )
  assertCanvasAppDescriptorFunctionField({
    field: 'getBinding',
    owner: 'component definition registry',
    value: componentDefinitionRegistry.getBinding,
  })
  assertCanvasAppDescriptorFunctionField({
    field: 'getSyncItemIds',
    owner: 'component definition registry',
    value: componentDefinitionRegistry.getSyncItemIds,
  })
  assertCanvasAppDescriptorFunctionField({
    field: 'isRootItem',
    owner: 'component definition registry',
    value: componentDefinitionRegistry.isRootItem,
  })
  assertCanvasAppDescriptorFunctionField({
    field: 'listSets',
    owner: 'component definition registry',
    value: componentDefinitionRegistry.listSets,
  })
  assertCanvasAppDescriptorFunctionField({
    field: 'syncItems',
    owner: 'component definition registry',
    value: componentDefinitionRegistry.syncItems,
  })
  createCanvasComponentDefinitionRegistry({
    definitions: componentDefinitionRegistry.definitions,
  })
}

function assertCanvasAppComponentLibrary(
  componentLibrary: CanvasAppComponentLibrary,
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
  componentLibrary: CanvasAppComponentLibrary,
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
