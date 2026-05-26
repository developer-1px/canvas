import {
  useCallback,
  useMemo,
} from 'react'
import type { CanvasAffordanceConfig } from '../../engine'
import type { Viewport } from '../../entities'
import type { CanvasAppStageElement } from '../stage/CanvasAppStageElement'
import type { CanvasAppItemReadModel } from '../workflow/CanvasAppItemReadModelContracts'
import type { CanvasAppStampVotingSessionContext } from '../workflow/CanvasAppStampConsumerContracts'
import type { CommitCanvasItemsChange } from '../workflow/CanvasWorkflowContract'
import {
  CANVAS_STAMP_DEFINITIONS,
  type CanvasStampDefinition,
} from './CanvasStampCatalog'
import {
  getCanvasStampInsertPlacement,
  insertCanvasStamp,
} from './CanvasStampInsertion'

export type CanvasStampControlsModel = {
  anchor: null
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
  votingSession?: CanvasAppStampVotingSessionContext
}

export function useCanvasStampControls({
  commitItemsChange,
  config,
  createId,
  itemReadModel,
  selection,
  stageElement,
  viewport,
  votingSession,
}: CanvasStampControlsInput): CanvasStampControlsModel {
  const visible = config.overlays.stampControls ||
    votingSession?.active === true
  const canInsertStamp = visible &&
    (votingSession?.active !== true || votingSession.canCastVote)
  const anchor = null

  const onInsertStamp = useCallback(
    (stamp: CanvasStampDefinition) => {
      if (!canInsertStamp) {
        return false
      }

      const inserted = insertCanvasStamp({
        placement: getCanvasStampInsertPlacement({
          itemReadModel,
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

      if (inserted && votingSession?.active === true) {
        return votingSession.onVoteCast()
      }

      return inserted
    },
    [
      canInsertStamp,
      commitItemsChange,
      createId,
      itemReadModel,
      selection,
      stageElement,
      viewport,
      votingSession,
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
