import {
  useCallback,
  useRef,
  useState,
} from 'react'
import type { CanvasAffordanceConfig } from '../../../../engine'

export type CanvasVotingSessionStatus = 'idle' | 'active' | 'ended'

export type CanvasVotingSessionState = Readonly<{
  prompt: string
  status: CanvasVotingSessionStatus
  votesCast: number
  votesPerParticipant: number
}>

export const CANVAS_VOTING_SESSION_DEFAULT_PROMPT = 'Pick favorites'
export const CANVAS_VOTING_SESSION_DEFAULT_LIMIT = 3
export const CANVAS_VOTING_SESSION_MIN_LIMIT = 1
export const CANVAS_VOTING_SESSION_MAX_LIMIT = 9

export function useCanvasVotingSessionModel({
  config,
}: {
  config: CanvasAffordanceConfig
}) {
  const sessionRef = useRef(createCanvasVotingSessionState())
  const [session, setSessionState] = useState<CanvasVotingSessionState>(
    createCanvasVotingSessionState,
  )
  const updateSession = useCallback((
    updater: (state: CanvasVotingSessionState) => CanvasVotingSessionState,
  ) => {
    const next = updater(sessionRef.current)

    sessionRef.current = next
    setSessionState(next)

    return next
  }, [])
  const setPrompt = useCallback((prompt: string) => {
    updateSession((current) => setCanvasVotingSessionPrompt(current, prompt))
  }, [updateSession])
  const setVotesPerParticipant = useCallback((votes: number) => {
    updateSession((current) => setCanvasVotingSessionLimit(current, votes))
  }, [updateSession])
  const start = useCallback(() => {
    updateSession(startCanvasVotingSession)
  }, [updateSession])
  const end = useCallback(() => {
    updateSession(endCanvasVotingSession)
  }, [updateSession])
  const reset = useCallback(() => {
    updateSession(resetCanvasVotingSession)
  }, [updateSession])
  const castVote = useCallback(() => {
    const current = sessionRef.current
    const next = castCanvasVotingSessionVote(current)

    if (next === current) {
      return false
    }

    sessionRef.current = next
    setSessionState(next)

    return true
  }, [])
  const visible = config.overlays.votingSession
  const canCastVote = canCastCanvasVotingSessionVote(session)

  return {
    stamp: {
      active: session.status === 'active',
      canCastVote,
      votesCast: session.votesCast,
      votesPerParticipant: session.votesPerParticipant,
      onVoteCast: castVote,
    },
    view: {
      canCastVote,
      prompt: session.prompt,
      status: session.status,
      visible,
      votesCast: session.votesCast,
      votesPerParticipant: session.votesPerParticipant,
      onEnd: end,
      onPromptChange: setPrompt,
      onReset: reset,
      onStart: start,
      onVotesPerParticipantChange: setVotesPerParticipant,
    },
  }
}

export function createCanvasVotingSessionState(): CanvasVotingSessionState {
  return {
    prompt: CANVAS_VOTING_SESSION_DEFAULT_PROMPT,
    status: 'idle',
    votesCast: 0,
    votesPerParticipant: CANVAS_VOTING_SESSION_DEFAULT_LIMIT,
  }
}

export function setCanvasVotingSessionPrompt(
  state: CanvasVotingSessionState,
  prompt: string,
): CanvasVotingSessionState {
  if (state.status === 'active') {
    return state
  }

  return {
    ...state,
    prompt: prompt.slice(0, 80),
  }
}

export function setCanvasVotingSessionLimit(
  state: CanvasVotingSessionState,
  votesPerParticipant: number,
): CanvasVotingSessionState {
  if (state.status === 'active') {
    return state
  }

  return {
    ...state,
    votesPerParticipant: clampCanvasVotingSessionLimit(votesPerParticipant),
  }
}

export function startCanvasVotingSession(
  state: CanvasVotingSessionState,
): CanvasVotingSessionState {
  return {
    ...state,
    status: 'active',
    votesCast: 0,
  }
}

export function castCanvasVotingSessionVote(
  state: CanvasVotingSessionState,
): CanvasVotingSessionState {
  if (!canCastCanvasVotingSessionVote(state)) {
    return state
  }

  return {
    ...state,
    votesCast: state.votesCast + 1,
  }
}

export function canCastCanvasVotingSessionVote(
  state: CanvasVotingSessionState,
) {
  return state.status === 'active' &&
    state.votesCast < state.votesPerParticipant
}

export function endCanvasVotingSession(
  state: CanvasVotingSessionState,
): CanvasVotingSessionState {
  return state.status === 'active'
    ? {
        ...state,
        status: 'ended',
      }
    : state
}

export function resetCanvasVotingSession(): CanvasVotingSessionState {
  return createCanvasVotingSessionState()
}

function clampCanvasVotingSessionLimit(votesPerParticipant: number) {
  return Math.min(
    CANVAS_VOTING_SESSION_MAX_LIMIT,
    Math.max(
      CANVAS_VOTING_SESSION_MIN_LIMIT,
      Math.round(votesPerParticipant),
    ),
  )
}
