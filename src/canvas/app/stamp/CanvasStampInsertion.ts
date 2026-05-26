import type { Viewport } from '../../entities'
import {
  CANVAS_STAMP_ITEM_SIZE,
  createCanvasStampItem,
  isCanvasStampItem,
} from '../../host'
import type { CanvasAppStageElement } from '../stage/CanvasAppStageElement'
import type { CanvasAppItemReadModel } from '../workflow/CanvasAppItemReadModelContracts'
import type { CommitCanvasItemsChange } from '../workflow/CanvasWorkflowContract'
import type { CanvasStampDefinition } from './CanvasStampCatalog'

const CANVAS_STAMP_STACK_GAP = 6

export type CanvasStampInsertPlacement = {
  x: number
  y: number
}

export type CanvasStampInsertionContext = {
  commitItemsChange: CommitCanvasItemsChange
  createId: (prefix: string) => string
  selection: string[]
}

export type CanvasStampInsertPlacementInput = {
  itemReadModel: CanvasAppItemReadModel
  stageElement: CanvasAppStageElement
  viewport: Viewport
}

export function insertCanvasStamp({
  context,
  placement,
  stamp,
}: {
  context: CanvasStampInsertionContext
  placement: CanvasStampInsertPlacement
  stamp: CanvasStampDefinition
}) {
  const item = createCanvasStampItem({
    id: context.createId('stamp'),
    label: stamp.label,
    stamp: stamp.stamp,
    x: placement.x,
    y: placement.y,
  })

  return context.commitItemsChange(
    { type: 'add', items: [item] },
    {
      before: context.selection,
      after: [item.id],
    },
  )
}

export function getCanvasStampInsertPlacement({
  itemReadModel,
  stageElement,
  viewport,
}: CanvasStampInsertPlacementInput): CanvasStampInsertPlacement {
  const center = stageElement.getViewportCenter(viewport) ?? { x: 0, y: 0 }
  const y = center.y - CANVAS_STAMP_ITEM_SIZE / 2
  const detachedStampCount = getCanvasDetachedStampCountAtRow({
    itemReadModel,
    y,
  })

  return {
    x: center.x - CANVAS_STAMP_ITEM_SIZE / 2 +
      detachedStampCount *
        (CANVAS_STAMP_ITEM_SIZE + CANVAS_STAMP_STACK_GAP),
    y,
  }
}

function getCanvasDetachedStampCountAtRow({
  itemReadModel,
  y,
}: {
  itemReadModel: CanvasAppItemReadModel
  y: number
}) {
  return itemReadModel
    .getAllItems()
    .filter((item) =>
      isCanvasStampItem(item) &&
      Math.abs(item.y - y) < 0.5,
    )
    .length
}
