import type { CanvasAffordanceConfig } from '../../engine'
import type { Viewport } from '../../entities'
import type { CanvasAppItemReadModel } from './CanvasAppItemReadModelContracts'
import type { CanvasAppStageElement } from '../stage/CanvasAppStageElement'
import type { CommitCanvasItemsChange } from './CanvasWorkflowContract'

export type CanvasAppStampModelInput = {
  commitItemsChange: CommitCanvasItemsChange
  config: CanvasAffordanceConfig
  createId: (prefix: string) => string
  itemReadModel: CanvasAppItemReadModel
  selection: string[]
  stageElement: CanvasAppStageElement
  viewport: Viewport
  votingSession?: CanvasAppStampVotingSessionContext
}

export type CanvasAppStampVotingSessionContext = {
  active: boolean
  canCastVote: boolean
  votesCast: number
  votesPerParticipant: number
  onVoteCast: () => boolean
}
