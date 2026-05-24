import type {
  CanvasCustomItem,
  CanvasCustomItemValidator,
  CanvasCustomItemValidators,
} from '../../host'
import { normalizeCanvasItems } from '../../host'
import {
  createCanvasAppExtensionBundle,
  type CanvasAppExtensionBundle,
} from '../extensions/CanvasAppExtensionBundle'
import type { CanvasAppCustomItemRenderers } from '../rendering/CanvasAppRenderingContracts'
import type { CanvasAppCustomCreationTool } from '../tools/CanvasAppCustomCreationTools'
import type {
  CanvasAppCustomItemModule,
  CanvasAppCustomItemModuleCreationItem,
} from './CanvasAppCustomItemModules'

type CanvasAppCustomItemModuleValidatorContext = {
  id: string
  presentation: string
  validateItem: CanvasCustomItemValidator
}

export function getCanvasAppCustomItemModuleCreationTools({
  customCreationTools = [],
  id,
  presentation,
  validateItem,
}: CanvasAppCustomItemModule): readonly CanvasAppCustomCreationTool[] {
  return customCreationTools.map((tool) => {
    const createModuleItem = tool.createItem

    return {
      ...tool,
      createItem: (context) => {
        let item: CanvasAppCustomItemModuleCreationItem | null

        try {
          item = createModuleItem(context)
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
    }
  })
}

export function getCanvasAppCustomItemModuleExtensionBundle(
  module: CanvasAppCustomItemModule,
): CanvasAppExtensionBundle {
  return createCanvasAppExtensionBundle({
    customCommands: module.customCommands,
    customCreationTools: getCanvasAppCustomItemModuleCreationTools(module),
    customItemRenderers: getCanvasAppCustomItemModuleRenderers(module),
    customItemValidators: getCanvasAppCustomItemModuleValidators(module),
    inspectorPanels: module.inspectorPanels,
  })
}

export function getCanvasAppCustomItemModuleRenderers({
  presentation,
  renderItem,
}: CanvasAppCustomItemModule): CanvasAppCustomItemRenderers {
  return {
    [presentation]: renderItem,
  }
}

export function getCanvasAppCustomItemModuleValidators({
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

export function getCanvasAppCustomItemModuleValidator({
  id,
  presentation,
  validateItem,
}: CanvasAppCustomItemModuleValidatorContext): CanvasCustomItemValidator {
  return (item: CanvasCustomItem) => {
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
