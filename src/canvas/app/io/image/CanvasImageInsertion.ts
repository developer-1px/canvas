import type {
  Point,
  Viewport,
} from '../../../entities'
import type { CanvasAppStageElement } from '../../rendering/stage/CanvasAppStageElement'
import type { CommitCanvasItemsChange } from '../../workflow/CanvasWorkflowContract'
import {
  createCanvasImportedImageItem,
  type CanvasImageImportSource,
} from './CanvasImageImport'

export type CanvasImageInsertionContext = {
  commitItemsChange: CommitCanvasItemsChange
  createId: (prefix: string) => string
  selection: string[]
}

export type CanvasImageInsertCenterInput = {
  event?: { clientX: number; clientY: number }
  stageElement: CanvasAppStageElement
  viewport: Viewport
}

export function insertCanvasImageSource({
  center,
  context,
  source,
}: {
  center: Point
  context: CanvasImageInsertionContext
  source: CanvasImageImportSource
}) {
  const item = createCanvasImportedImageItem({
    center,
    createId: context.createId,
    source,
  })

  return context.commitItemsChange(
    { type: 'add', items: [item] },
    {
      before: context.selection,
      after: [item.id],
    },
  )
}

export function getCanvasImageInsertCenter({
  event,
  stageElement,
  viewport,
}: CanvasImageInsertCenterInput): Point {
  if (event) {
    const point = stageElement.getScreenPoint(event)

    return {
      x: (point.x - viewport.x) / viewport.scale,
      y: (point.y - viewport.y) / viewport.scale,
    }
  }

  return stageElement.getViewportCenter(viewport) ?? { x: 0, y: 0 }
}
