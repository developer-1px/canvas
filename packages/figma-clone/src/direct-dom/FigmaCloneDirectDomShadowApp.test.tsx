// @vitest-environment jsdom

import { StrictMode, act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { FigmaCloneDirectDomShadowApp } from './FigmaCloneDirectDomShadowApp'

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true

describe('FigmaCloneDirectDomShadowApp', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('keeps the projection alive through StrictMode replay and disposes it on unmount', async () => {
    let observers = 0
    let disconnects = 0

    class FakeResizeObserver {
      constructor() {
        observers += 1
      }

      observe() {}
      unobserve() {}
      disconnect() {
        disconnects += 1
      }
    }

    vi.stubGlobal('ResizeObserver', FakeResizeObserver)
    vi.spyOn(window, 'requestAnimationFrame').mockReturnValue(1)
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {})

    const container = document.createElement('div')
    document.body.append(container)
    const root = createRoot(container)

    await act(async () => root.render(
      <StrictMode>
        <FigmaCloneDirectDomShadowApp />
      </StrictMode>,
    ))
    await Promise.resolve()

    expect(observers).toBe(1)
    expect(disconnects).toBe(0)
    expect(container.querySelector('[data-design-node-id="workspacePage"]'))
      .not.toBeNull()

    await act(async () => root.unmount())
    await Promise.resolve()

    expect(disconnects).toBe(1)
    container.remove()
  })
})
