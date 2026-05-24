import type {
  Point,
  Viewport,
} from '../../entities'
import {
  CANVAS_STAMP_ITEM_SIZE,
  createCanvasStampItem,
} from '../../host'
import type { CanvasAppStageElement } from '../stage/CanvasAppStageElement'
import type { CanvasAppItemReadModel } from '../workflow/CanvasAppItemReadModelContracts'
import type { CommitCanvasItemsChange } from '../workflow/CanvasWorkflowContract'
import type { CanvasStampDefinition } from './CanvasStampCatalog'

const CANVAS_STAMP_SELECTION_GAP = 12

export type CanvasStampInsertionContext = {
  commitItemsChange: CommitCanvasItemsChange
  createId: (prefix: string) => string
  selection: string[]
}

export type CanvasStampInsertCenterInput = {
  itemReadModel: CanvasAppItemReadModel
  selection: string[]
  stageElement: CanvasAppStageElement
  viewport: Viewport
}

export function insertCanvasStamp({
  center,
  context,
  stamp,
}: {
  center: Point
  context: CanvasStampInsertionContext
  stamp: CanvasStampDefinition
}) {
  const item = createCanvasStampItem({
    id: context.createId('stamp'),
    label: stamp.label,
    stamp: stamp.stamp,
    x: center.x - CANVAS_STAMP_ITEM_SIZE / 2,
    y: center.y - CANVAS_STAMP_ITEM_SIZE / 2,
  })

  return context.commitItemsChange(
    { type: 'add', items: [item] },
    {
      before: context.selection,
      after: [item.id],
    },
  )
}

export function getCanvasStampInsertCenter({
  itemReadModel,
  selection,
  stageElement,
  viewport,
}: CanvasStampInsertCenterInput): Point {
  const selectedBounds = selection.length > 0
    ? itemReadModel.getSelectionBounds(selection)
    : null

  if (selectedBounds) {
    return {
      x: selectedBounds.x + selectedBounds.w +
        CANVAS_STAMP_SELECTION_GAP + CANVAS_STAMP_ITEM_SIZE / 2,
      y: selectedBounds.y + selectedBounds.h / 2,
    }
  }

  return stageElement.getViewportCenter(viewport) ?? { x: 0, y: 0 }
}
