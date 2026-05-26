import type { CanvasAppCustomItemModuleCreationTool } from '../../../canvas'

export const decisionTool: CanvasAppCustomItemModuleCreationTool = {
  id: 'decision',
  ariaLabel: 'Decision node tool',
  label: 'D',
  title: 'Decision',
  statusLabel: 'Decision',
  shortcut: { key: 'd', shiftKey: true },
  createItem: ({ currentWorld, moved, startWorld }) => {
    const bounds = moved
      ? {
          x: Math.min(startWorld.x, currentWorld.x),
          y: Math.min(startWorld.y, currentWorld.y),
          w: Math.max(180, Math.abs(currentWorld.x - startWorld.x)),
          h: Math.max(96, Math.abs(currentWorld.y - startWorld.y)),
        }
      : {
          x: startWorld.x,
          y: startWorld.y,
          w: 220,
          h: 112,
        }

    return {
      title: 'Decision',
      data: {
        option: 'Option A',
        status: 'proposed',
      },
      ...bounds,
    }
  },
}
