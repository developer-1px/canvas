import {
  createCanvasComponentLibrary,
  type CanvasComponentLibrary,
} from '../../host'
import {
  assertCanvasAppArray,
  assertCanvasAppDescriptorFunctionField,
  assertCanvasAppDescriptorObject,
} from '../extensions/CanvasAppDescriptorContracts'
import {
  assertCanvasAppComponentPresentationRenderers,
  type CanvasAppComponentPresentationRenderers,
} from '../rendering/CanvasAppRendererRegistries'

export type CanvasAppComponentAssemblyContract = {
  componentLibrary: CanvasComponentLibrary
  componentPresentationRenderers: CanvasAppComponentPresentationRenderers
}

export function assertCanvasAppComponentAssembly({
  componentLibrary,
  componentPresentationRenderers,
}: CanvasAppComponentAssemblyContract) {
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
}: CanvasAppComponentAssemblyContract) {
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
