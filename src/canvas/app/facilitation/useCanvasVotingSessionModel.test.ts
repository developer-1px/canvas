import { describe, expect, it } from 'vitest'
import {
  CANVAS_VOTING_SESSION_MAX_LIMIT,
  canCastCanvasVotingSessionVote,
  castCanvasVotingSessionVote,
  createCanvasVotingSessionState,
  endCanvasVotingSession,
  setCanvasVotingSessionLimit,
  setCanvasVotingSessionPrompt,
  startCanvasVotingSession,
} from './useCanvasVotingSessionModel'

describe('CanvasVotingSessionModel', () => {
  it('starts and ends a voting session without document state', () => {
    const idle = createCanvasVotingSessionState()
    const active = startCanvasVotingSession(idle)
    const ended = endCanvasVotingSession(active)

    expect(active).toEqual({
      prompt: 'Pick favorites',
      status: 'active',
      votesCast: 0,
      votesPerParticipant: 3,
    })
    expect(ended.status).toBe('ended')
  })

  it('tracks local vote quota and refuses votes after the limit', () => {
    const active = startCanvasVotingSession(setCanvasVotingSessionLimit(
      createCanvasVotingSessionState(),
      2,
    ))
    const voteOne = castCanvasVotingSessionVote(active)
    const voteTwo = castCanvasVotingSessionVote(voteOne)
    const rejected = castCanvasVotingSessionVote(voteTwo)

    expect(canCastCanvasVotingSessionVote(voteOne)).toBe(true)
    expect(voteTwo.votesCast).toBe(2)
    expect(canCastCanvasVotingSessionVote(voteTwo)).toBe(false)
    expect(rejected).toBe(voteTwo)
  })

  it('locks prompt and vote limit while active', () => {
    const configured = setCanvasVotingSessionLimit(
      setCanvasVotingSessionPrompt(createCanvasVotingSessionState(), 'Top ideas'),
      CANVAS_VOTING_SESSION_MAX_LIMIT + 1,
    )
    const active = startCanvasVotingSession(configured)

    expect(configured.prompt).toBe('Top ideas')
    expect(configured.votesPerParticipant).toBe(
      CANVAS_VOTING_SESSION_MAX_LIMIT,
    )
    expect(setCanvasVotingSessionPrompt(active, 'Changed')).toBe(active)
    expect(setCanvasVotingSessionLimit(active, 1)).toBe(active)
  })
})
