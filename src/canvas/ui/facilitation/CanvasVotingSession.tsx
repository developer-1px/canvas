type CanvasVotingSessionStatus = 'idle' | 'active' | 'ended'

type CanvasVotingSessionProps = {
  canCastVote: boolean
  prompt: string
  status: CanvasVotingSessionStatus
  visible: boolean
  votesCast: number
  votesPerParticipant: number
  onEnd: () => void
  onPromptChange: (prompt: string) => void
  onReset: () => void
  onStart: () => void
  onVotesPerParticipantChange: (votes: number) => void
}

export function CanvasVotingSession({
  canCastVote,
  prompt,
  status,
  visible,
  votesCast,
  votesPerParticipant,
  onEnd,
  onPromptChange,
  onReset,
  onStart,
  onVotesPerParticipantChange,
}: CanvasVotingSessionProps) {
  if (!visible) {
    return null
  }

  const isActive = status === 'active'

  return (
    <section
      className="voting-session"
      data-status={status}
      aria-label="Voting session"
    >
      <input
        aria-label="Voting prompt"
        disabled={isActive}
        maxLength={80}
        value={prompt}
        onChange={(event) => onPromptChange(event.currentTarget.value)}
      />
      <div className="voting-session-stepper">
        <button
          type="button"
          disabled={isActive}
          aria-label="Decrease votes"
          onClick={() => onVotesPerParticipantChange(votesPerParticipant - 1)}
        >
          -
        </button>
        <span aria-label="Votes per person">{votesPerParticipant}</span>
        <button
          type="button"
          disabled={isActive}
          aria-label="Increase votes"
          onClick={() => onVotesPerParticipantChange(votesPerParticipant + 1)}
        >
          +
        </button>
      </div>
      <span className="voting-session-count">
        {votesCast}/{votesPerParticipant}
      </span>
      {isActive ? (
        <button type="button" onClick={onEnd}>
          End
        </button>
      ) : (
        <button type="button" onClick={onStart}>
          Start
        </button>
      )}
      {status === 'ended' ? (
        <button type="button" onClick={onReset}>
          Clear
        </button>
      ) : null}
      {isActive && !canCastVote ? (
        <span className="voting-session-done">Done</span>
      ) : null}
    </section>
  )
}
