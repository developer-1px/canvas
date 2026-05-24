import {
  useCallback,
  useMemo,
} from 'react'
import type { CanvasAffordanceConfig } from '../../engine'
import type { Viewport } from '../../entities'
import type { CanvasAppStageElement } from '../stage/CanvasAppStageElement'
import type { CanvasAppItemReadModel } from '../workflow/CanvasAppItemReadModelContracts'
import type { CommitCanvasItemsChange } from '../workflow/CanvasWorkflowContract'
import {
  CANVAS_STAMP_DEFINITIONS,
  type CanvasStampDefinition,
} from './CanvasStampCatalog'
import {
  getCanvasStampControlsAnchor,
  getCanvasStampInsertPlacement,
  insertCanvasStamp,
  type CanvasStampControlsAnchor,
} from './CanvasStampInsertion'

export type CanvasStampControlsModel = {
  anchor: CanvasStampControlsAnchor | null
  canInsertStamp: boolean
  stamps: readonly CanvasStampDefinition[]
  visible: boolean
  onInsertStamp: (stamp: CanvasStampDefinition) => boolean
}

export type CanvasStampControlsInput = {
  commitItemsChange: CommitCanvasItemsChange
  config: CanvasAffordanceConfig
  createId: (prefix: string) => string
  itemReadModel: CanvasAppItemReadModel
  selection: string[]
  stageElement: CanvasAppStageElement
  viewport: Viewport
}

export function useCanvasStampControls({
  commitItemsChange,
  config,
  createId,
  itemReadModel,
  selection,
  stageElement,
  viewport,
}: CanvasStampControlsInput): CanvasStampControlsModel {
  const canInsertStamp = config.overlays.stampControls
  const anchor = useMemo(
    () =>
      canInsertStamp
        ? getCanvasStampControlsAnchor({
            itemReadModel,
            selection,
            viewport,
          })
        : null,
    [
      itemReadModel,
      selection,
      viewport,
      canInsertStamp,
    ],
  )
  const visible = canInsertStamp && anchor !== null

  const onInsertStamp = useCallback(
    (stamp: CanvasStampDefinition) => {
      if (!canInsertStamp) {
        return false
      }

      return insertCanvasStamp({
        placement: getCanvasStampInsertPlacement({
          itemReadModel,
          selection,
          stageElement,
          viewport,
        }),
        context: {
          commitItemsChange,
          createId,
          selection,
        },
        stamp,
      })
    },
    [
      canInsertStamp,
      commitItemsChange,
      createId,
      itemReadModel,
      selection,
      stageElement,
      viewport,
    ],
  )

  return useMemo(
    () => ({
      anchor,
      canInsertStamp,
      stamps: CANVAS_STAMP_DEFINITIONS,
      visible,
      onInsertStamp,
    }),
    [
      anchor,
      canInsertStamp,
      onInsertStamp,
      visible,
    ],
  )
}
