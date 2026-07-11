// @vitest-environment jsdom

import { StrictMode, act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { FigmaCloneApp } from './FigmaCloneApp'

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true

describe('FigmaCloneApp', () => {
  afterEach(() => {
    document.body.replaceChildren()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('renders the canonical design document as direct DOM inside the Figma chrome', async () => {
    class FakeResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    }

    vi.stubGlobal('ResizeObserver', FakeResizeObserver)
    vi.spyOn(window, 'requestAnimationFrame').mockReturnValue(1)
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {})

    const container = document.createElement('div')
    document.body.append(container)
    const root = createRoot(container)

    await act(async () => root.render(
      <StrictMode>
        <FigmaCloneApp />
      </StrictMode>,
    ))

    expect(container.querySelector('aside[aria-label="Layers"]')).not.toBeNull()
    expect(container.querySelector('section[aria-label="Canvas"]')).not.toBeNull()
    expect(container.querySelector('aside[aria-label="CSS Inspector"]'))
      .not.toBeNull()
    expect(container.querySelector('[data-design-node-id="workspacePage"]'))
      .not.toBeNull()
    expect(container.querySelector('svg foreignObject')).toBeNull()
    expect(container.querySelector('[data-canvas-item-id]')).toBeNull()
    expect(getButton(container, 'Select tool')).not.toBeNull()
    expect(getButton(container, 'Measure tool')).not.toBeNull()
    expect(getButton(container, 'Toggle box model X-ray')).not.toBeNull()
    expect(getToolbar(container, 'Viewport')).not.toBeNull()
    expect(getButton(container, 'Fit selection')).not.toBeNull()
    expect(getButton(container, 'Fit all')).not.toBeNull()

    await act(async () => root.unmount())
  })
})

function getButton(container: HTMLElement, label: string) {
  return container.querySelector<HTMLButtonElement>(
    `button[aria-label="${label}"]`,
  )
}

function getToolbar(container: HTMLElement, label: string) {
  return container.querySelector<HTMLElement>(
    `[role="toolbar"][aria-label="${label}"]`,
  )
}
