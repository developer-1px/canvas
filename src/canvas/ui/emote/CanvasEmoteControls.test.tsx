import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { CanvasEmoteControls } from './CanvasEmoteControls'

describe('CanvasEmoteControls', () => {
  it('hides emote controls when disabled', () => {
    const markup = renderToStaticMarkup(
      <CanvasEmoteControls {...createEmoteControlsProps({ visible: false })} />,
    )

    expect(markup).toBe('')
  })

  it('renders transient emote release buttons', () => {
    const markup = renderToStaticMarkup(
      <CanvasEmoteControls {...createEmoteControlsProps()} />,
    )

    expect(markup).toContain('class="emote-controls"')
    expect(markup).toContain('class="emote-button"')
    expect(markup).toContain('Thumbs up emote')
    expect(markup).toContain('+1')
  })
})

function createEmoteControlsProps(
  props: Partial<Parameters<typeof CanvasEmoteControls>[0]> = {},
): Parameters<typeof CanvasEmoteControls>[0] {
  return {
    emotes: [{
      emote: 'thumbs-up',
      label: '+1',
      title: 'Thumbs up emote',
    }],
    visible: true,
    onReleaseEmote: vi.fn(),
    ...props,
  }
}
