type CanvasSpotlightProps = {
  active: boolean
  followerCount: number
  visible: boolean
  onStart: () => void
  onStop: () => void
}

export function CanvasSpotlight({
  active,
  followerCount,
  visible,
  onStart,
  onStop,
}: CanvasSpotlightProps) {
  if (!visible) {
    return null
  }

  return (
    <section
      className="spotlight"
      data-active={active}
      aria-label="Spotlight"
    >
      {active ? (
        <>
          <span className="spotlight-count" aria-live="polite">
            {followerCount}
          </span>
          <button type="button" onClick={onStop}>
            Stop
          </button>
        </>
      ) : (
        <button type="button" onClick={onStart}>
          Spotlight
        </button>
      )}
    </section>
  )
}
