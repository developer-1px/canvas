import type {
  CanvasCustomItem,
} from '../../../entities'
import { normalizeCanvasItems } from '../../../host'
import {
  createCanvasAppExtensionBundle,
  type CanvasAppExtensionBundle,
} from '../CanvasAppExtensionBundle'
import type { CanvasAppCustomItemRenderers } from '../../rendering/CanvasAppRenderingContracts'
import type { CanvasAppCustomCreationTool } from '../custom-tools/CanvasAppCustomCreationTools'
import type {
  CanvasAppCustomItemModule,
  CanvasAppCustomItemModuleCreationItem,
} from './CanvasAppCustomItemModules'
import type {
  CanvasAppCustomItemValidator,
  CanvasAppCustomItemValidators,
} from './CanvasAppCustomItemValidatorContracts'

type CanvasAppCustomItemModuleValidatorContext = {
  id: string
  presentation: string
  validateItem: CanvasAppCustomItemValidator
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
    textPasteImporters: module.textPasteImporters,
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
}: CanvasAppCustomItemModule): CanvasAppCustomItemValidators {
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
}: CanvasAppCustomItemModuleValidatorContext): CanvasAppCustomItemValidator {
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
