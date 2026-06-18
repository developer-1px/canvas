import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { CanvasSpotlight } from './CanvasSpotlight'

describe('CanvasSpotlight', () => {
  it('hides spotlight when disabled', () => {
    const markup = renderToStaticMarkup(
      <CanvasSpotlight {...createSpotlightProps({ visible: false })} />,
    )

    expect(markup).toBe('')
  })

  it('renders the spotlight entry point while idle', () => {
    const markup = renderToStaticMarkup(
      <CanvasSpotlight {...createSpotlightProps({ active: false })} />,
    )

    expect(markup).toContain('class="spotlight"')
    expect(markup).toContain('data-active="false"')
    expect(markup).toContain('Spotlight')
  })

  it('renders follower count and stop control while active', () => {
    const markup = renderToStaticMarkup(
      <CanvasSpotlight
        {...createSpotlightProps({
          active: true,
          followerCount: 2,
        })}
      />,
    )

    expect(markup).toContain('data-active="true"')
    expect(markup).toContain('spotlight-count')
    expect(markup).toContain('2')
    expect(markup).toContain('Stop')
  })
})

function createSpotlightProps(
  props: Partial<Parameters<typeof CanvasSpotlight>[0]> = {},
): Parameters<typeof CanvasSpotlight>[0] {
  return {
    active: false,
    followerCount: 0,
    visible: true,
    onStart: vi.fn(),
    onStop: vi.fn(),
    ...props,
  }
}
