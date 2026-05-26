type CanvasEmoteControlItem = {
  emote: string
  label: string
  title: string
}

type CanvasEmoteControlsProps = {
  emotes: readonly CanvasEmoteControlItem[]
  visible: boolean
  onReleaseEmote: (emote: CanvasEmoteControlItem) => void
}

export function CanvasEmoteControls({
  emotes,
  visible,
  onReleaseEmote,
}: CanvasEmoteControlsProps) {
  if (!visible) {
    return null
  }

  return (
    <section className="emote-controls" aria-label="Emotes">
      {emotes.map((emote) => (
        <button
          key={emote.emote}
          type="button"
          className="emote-button"
          aria-label={emote.title}
          title={emote.title}
          onClick={() => onReleaseEmote(emote)}
        >
          <span className="emote-button-label">{emote.label}</span>
        </button>
      ))}
    </section>
  )
}
