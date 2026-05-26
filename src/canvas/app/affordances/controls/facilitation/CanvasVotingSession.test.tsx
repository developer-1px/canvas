import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { CanvasVotingSession } from './CanvasVotingSession'

describe('CanvasVotingSession', () => {
  it('renders nothing when hidden', () => {
    const markup = renderToStaticMarkup(
      <CanvasVotingSession {...createVotingSessionProps({ visible: false })} />,
    )

    expect(markup).toBe('')
  })

  it('renders idle voting controls', () => {
    const markup = renderToStaticMarkup(
      <CanvasVotingSession {...createVotingSessionProps({ visible: true })} />,
    )

    expect(markup).toContain('class="voting-session"')
    expect(markup).toContain('aria-label="Voting session"')
    expect(markup).toContain('Pick favorites')
    expect(markup).toContain('0/3')
    expect(markup).toContain('Start')
  })

  it('renders ended state with results kept visible', () => {
    const markup = renderToStaticMarkup(
      <CanvasVotingSession
        {...createVotingSessionProps({
          status: 'ended',
          visible: true,
          votesCast: 3,
        })}
      />,
    )

    expect(markup).toContain('data-status="ended"')
    expect(markup).toContain('3/3')
    expect(markup).toContain('Clear')
  })
})

function createVotingSessionProps({
  status = 'idle',
  visible,
  votesCast = 0,
}: {
  status?: 'idle' | 'active' | 'ended'
  visible: boolean
  votesCast?: number
}) {
  const noop = vi.fn()

  return {
    canCastVote: votesCast < 3,
    prompt: 'Pick favorites',
    status,
    visible,
    votesCast,
    votesPerParticipant: 3,
    onEnd: noop,
    onPromptChange: noop,
    onReset: noop,
    onStart: noop,
    onVotesPerParticipantChange: noop,
  }
}
