import type { CanvasAppCustomItemModuleCreationTool } from '../../../canvas'
import {
  createInternalAdminAppSpecimenData,
} from './HtmlSpecimenCustomItemModel'

export const htmlSpecimenTool: CanvasAppCustomItemModuleCreationTool = {
  id: 'html-specimen',
  ariaLabel: 'Internal app preview tool',
  label: 'DOM',
  title: 'Internal app preview',
  statusLabel: 'Internal app preview',
  createItem: ({ currentWorld, moved, startWorld }) => {
    const specimen = createInternalAdminAppSpecimenData()
    const bounds = moved
      ? {
          x: Math.min(startWorld.x, currentWorld.x),
          y: Math.min(startWorld.y, currentWorld.y),
          w: Math.max(640, Math.abs(currentWorld.x - startWorld.x)),
          h: Math.max(420, Math.abs(currentWorld.y - startWorld.y)),
        }
      : {
          x: startWorld.x,
          y: startWorld.y,
          w: 800,
          h: 540,
        }

    return {
      title: 'Internal app preview',
      data: {
        ...specimen,
        viewportHeight: Math.round(bounds.h - 44),
        viewportWidth: Math.round(bounds.w - 20),
      },
      ...bounds,
    }
  },
}
