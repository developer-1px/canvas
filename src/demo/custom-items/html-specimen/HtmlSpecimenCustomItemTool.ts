import type { CanvasAppCustomItemModuleCreationTool } from '../../../canvas'
import { createDesignSystemSpecimenData } from './HtmlSpecimenCustomItemModel'

export const htmlSpecimenTool: CanvasAppCustomItemModuleCreationTool = {
  id: 'html-specimen',
  ariaLabel: 'Design system specimen tool',
  label: 'DS',
  title: 'Design system specimen',
  statusLabel: 'Design system specimen',
  createItem: ({ currentWorld, moved, startWorld }) => {
    const specimen = createDesignSystemSpecimenData()
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
      title: 'Design system specimen',
      data: {
        ...specimen,
        viewportHeight: Math.round(bounds.h - 44),
        viewportWidth: Math.round(bounds.w - 20),
      },
      ...bounds,
    }
  },
}
