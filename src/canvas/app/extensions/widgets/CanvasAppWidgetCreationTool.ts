import type { CanvasJsonObject } from '../../../entities'
import type {
  CanvasAppCustomItemModuleCreationTool,
} from '../custom-item-modules/CanvasAppCustomItemModules'
import type {
  CanvasAppWidgetCreationOptions,
} from './CanvasAppWidgetModuleTypes'

export function createCanvasAppWidgetCreationTool<
  TData extends CanvasJsonObject,
>({
  defaultSize,
  getDefaultData,
  id,
  label,
  title,
  tool,
}: {
  defaultSize: {
    h: number
    w: number
  }
  getDefaultData: () => TData
  id: string
  label: string
  title: string
  tool: CanvasAppWidgetCreationOptions
}): CanvasAppCustomItemModuleCreationTool {
  return {
    ariaLabel: tool.ariaLabel ?? `${title} tool`,
    id,
    label,
    shortcut: tool.shortcut,
    statusLabel: tool.statusLabel ?? title,
    title: tool.title ?? title,
    createItem: ({ currentWorld, moved, startWorld }) => {
      const bounds = moved
        ? {
            h: Math.max(defaultSize.h, Math.abs(currentWorld.y - startWorld.y)),
            w: Math.max(defaultSize.w, Math.abs(currentWorld.x - startWorld.x)),
            x: Math.min(startWorld.x, currentWorld.x),
            y: Math.min(startWorld.y, currentWorld.y),
          }
        : {
            ...defaultSize,
            x: startWorld.x,
            y: startWorld.y,
          }

      return {
        ...bounds,
        data: getDefaultData(),
        title,
      }
    },
  }
}
