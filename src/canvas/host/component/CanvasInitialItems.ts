import type { Point } from '../../engine/primitives/CanvasPrimitives'
import { createCanvasComponentItem } from './CanvasComponentFactory'
import type { CanvasComponentKind, CanvasItem } from '../model/CanvasModel'

export const INITIAL_ITEMS: CanvasItem[] = createInitialCanvasComponents()

function createInitialCanvasComponents() {
  const layout: Array<[CanvasComponentKind, Point]> = [
    ['sticky', { x: 92, y: 88 }],
    ['label', { x: 320, y: 96 }],
    ['card', { x: 560, y: 88 }],
    ['connector', { x: 830, y: 120 }],
    ['section', { x: 92, y: 292 }],
    ['checklist', { x: 488, y: 292 }],
    ['kanban', { x: 760, y: 292 }],
    ['table', { x: 1018, y: 292 }],
    ['vote', { x: 488, y: 504 }],
    ['image', { x: 620, y: 504 }],
  ]

  return layout.map(([templateId, point]) =>
    createCanvasComponentItem({
      id: `component-${templateId}`,
      point,
      templateId,
    }),
  )
}
