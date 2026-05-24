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

export type CanvasStampInsertPlacement = {
  attachedTo?: string
  x: number
  y: number
}

export type CanvasStampControlsAnchor = Point

export type CanvasStampInsertionContext = {
  commitItemsChange: CommitCanvasItemsChange
  createId: (prefix: string) => string
  selection: string[]
}

export type CanvasStampInsertPlacementInput = {
  itemReadModel: CanvasAppItemReadModel
  selection: string[]
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
    attachedTo: placement.attachedTo,
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
  selection,
  stageElement,
  viewport,
}: CanvasStampInsertPlacementInput): CanvasStampInsertPlacement {
  const selectedBounds = selection.length > 0
    ? itemReadModel.getSelectionBounds(selection)
    : null

  if (selectedBounds) {
    if (selection.length === 1) {
      return {
        attachedTo: selection[0],
        x: selectedBounds.x + selectedBounds.w - CANVAS_STAMP_ITEM_SIZE / 2,
        y: selectedBounds.y - CANVAS_STAMP_ITEM_SIZE / 2,
      }
    }

    return {
      x: selectedBounds.x + selectedBounds.w + CANVAS_STAMP_SELECTION_GAP,
      y: selectedBounds.y + selectedBounds.h / 2 -
        CANVAS_STAMP_ITEM_SIZE / 2,
    }
  }

  const center = stageElement.getViewportCenter(viewport) ?? { x: 0, y: 0 }

  return {
    x: center.x - CANVAS_STAMP_ITEM_SIZE / 2,
    y: center.y - CANVAS_STAMP_ITEM_SIZE / 2,
  }
}

export function getCanvasStampControlsAnchor({
  itemReadModel,
  selection,
  viewport,
}: Pick<
  CanvasStampInsertPlacementInput,
  'itemReadModel' | 'selection' | 'viewport'
>): CanvasStampControlsAnchor | null {
  if (selection.length === 0) {
    return null
  }

  const selectedBounds = itemReadModel.getSelectionBounds(selection)

  return selectedBounds
    ? {
        x: viewport.x + (
          selectedBounds.x + selectedBounds.w / 2
        ) * viewport.scale,
        y: viewport.y + selectedBounds.y * viewport.scale,
      }
    : null
}
