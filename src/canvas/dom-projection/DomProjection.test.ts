import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import {
  createDomProjection,
  createIframeDomProjectionAdapter,
} from './index'

describe('DomProjection', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('registers stable node ids and publishes revision changes', () => {
    const projection = createDomProjection({
      getStageElement: () => null,
      getViewport: () => ({ scale: 1, x: 0, y: 0 }),
    })
    const revisions: number[] = []
    const unsubscribe = projection.subscribe(() => {
      revisions.push(projection.revision())
    })
    const cleanup = projection.register('hero', createElement())

    expect(projection.registeredNodeIds()).toEqual(['hero'])
    expect(projection.revision()).toBe(1)
    expect(revisions).toEqual([1])

    cleanup()
    cleanup()

    expect(projection.registeredNodeIds()).toEqual([])
    expect(projection.revision()).toBe(2)
    expect(revisions).toEqual([1, 2])

    unsubscribe()
  })

  it('keeps a replacement registered when stale cleanup runs', () => {
    const projection = createDomProjection({
      getStageElement: () => null,
      getViewport: () => ({ scale: 1, x: 0, y: 0 }),
    })
    const cleanupFirst = projection.register('z-node', createElement())
    const cleanupReplacement = projection.register('z-node', createElement())

    projection.register('a-node', createElement())
    cleanupFirst()

    expect(projection.registeredNodeIds()).toEqual(['a-node', 'z-node'])
    expect(projection.revision()).toBe(3)

    cleanupReplacement()

    expect(projection.registeredNodeIds()).toEqual(['a-node'])
    expect(projection.revision()).toBe(4)
  })

  it('returns only the currently registered element for a node id', () => {
    const projection = createDomProjection({
      getStageElement: () => null,
      getViewport: () => ({ scale: 1, x: 0, y: 0 }),
    })
    const first = createElement()
    const replacement = createElement()
    const cleanupFirst = projection.register('hero', first)

    expect(projection.element('hero')).toBe(first)
    expect(projection.element('missing')).toBeNull()

    const cleanupReplacement = projection.register('hero', replacement)

    cleanupFirst()
    expect(projection.element('hero')).toBe(replacement)

    cleanupReplacement()
    expect(projection.element('hero')).toBeNull()

    projection.register('hero', replacement)
    projection.dispose()
    expect(projection.element('hero')).toBeNull()
  })

  it('measures the current DOM rect in client and world coordinates', () => {
    const stage = createElement({ height: 600, left: 100, top: 50, width: 800 })
    let nodeRect = { height: 40, left: 140, top: 110, width: 80 }
    const node = createElement(() => nodeRect)
    const projection = createDomProjection({
      getStageElement: () => stage,
      getViewport: () => ({ scale: 2, x: 20, y: 30 }),
    })

    projection.register('hero', node)

    expect(projection.measure('hero')).toEqual({
      nodeId: 'hero',
      clientBounds: { h: 40, w: 80, x: 140, y: 110 },
      worldBounds: { h: 20, w: 40, x: 10, y: 15 },
    })
    expect(projection.clientToWorld({ x: 140, y: 110 }))
      .toEqual({ x: 10, y: 15 })
    expect(projection.worldToClient({ x: 10, y: 15 }))
      .toEqual({ x: 140, y: 110 })

    nodeRect = { height: 60, left: 180, top: 150, width: 120 }

    expect(projection.measure('hero')?.clientBounds)
      .toEqual({ h: 60, w: 120, x: 180, y: 150 })
  })

  it('projects an iframe DOM element into the host client coordinate space', () => {
    const stage = createElement({ height: 700, left: 10, top: 20, width: 900 })
    const frame = createElement({
      height: 300,
      left: 110,
      top: 80,
      width: 400,
    }) as HTMLIFrameElement
    const innerElement = createElement({
      height: 40,
      left: 20,
      top: 30,
      width: 100,
    })
    const projection = createDomProjection({
      getStageElement: () => stage,
      getViewport: () => ({ scale: 1, x: 0, y: 0 }),
    })

    projection.register(
      'iframe-card',
      innerElement,
      createIframeDomProjectionAdapter({
        getFrameElement: () => frame,
        getViewportSize: () => ({ height: 600, width: 800 }),
      }),
    )

    expect(projection.measure('iframe-card')).toEqual({
      nodeId: 'iframe-card',
      clientBounds: { h: 20, w: 50, x: 120, y: 95 },
      worldBounds: { h: 20, w: 50, x: 110, y: 75 },
    })
  })

  it('returns null when projection context is unavailable or invalid', () => {
    let stage: HTMLElement | null = null
    let scale = 1
    const projection = createDomProjection({
      getStageElement: () => stage,
      getViewport: () => ({ scale, x: 0, y: 0 }),
    })

    projection.register('hero', createElement({
      height: 40,
      left: 20,
      top: 30,
      width: 80,
    }))

    expect(projection.measure('hero')).toBeNull()
    expect(projection.clientToWorld({ x: 20, y: 30 })).toBeNull()
    expect(projection.worldToClient({ x: 20, y: 30 })).toBeNull()

    stage = createElement()

    for (const invalidScale of [0, -1, Number.NaN, Number.POSITIVE_INFINITY]) {
      scale = invalidScale
      expect(projection.measure('hero')).toBeNull()
      expect(projection.clientToWorld({ x: 20, y: 30 })).toBeNull()
      expect(projection.worldToClient({ x: 20, y: 30 })).toBeNull()
    }

    scale = 1
    expect(projection.measure('missing')).toBeNull()
  })

  it('resolves the registered hit path from an unregistered descendant', () => {
    const root = createElement()
    const child = createElement()
    const descendant = createElement()

    setParent(child, root)
    setParent(descendant, child)

    const projection = createDomProjection({
      getStageElement: () => null,
      getViewport: () => ({ scale: 1, x: 0, y: 0 }),
    })

    projection.register('root', root)
    projection.register('child', child)

    expect(projection.hitPath(descendant)).toEqual(['child', 'root'])
    expect(projection.hitPath(null)).toEqual([])
    expect(projection.hitPath(new EventTarget())).toEqual([])
  })

  it('focuses registered nodes without changing their tab index', () => {
    const focusCalls: (FocusOptions | undefined)[] = []
    const element = createElement()

    Object.assign(element, {
      focus: (options?: FocusOptions) => focusCalls.push(options),
      tabIndex: -1,
    })

    const projection = createDomProjection({
      getStageElement: () => null,
      getViewport: () => ({ scale: 1, x: 0, y: 0 }),
    })

    expect(projection.focus('missing')).toBe(false)

    projection.register('hero', element)

    expect(projection.focus('hero', { preventScroll: true })).toBe(true)
    expect(focusCalls).toEqual([{ preventScroll: true }])
    expect(element.tabIndex).toBe(-1)
  })

  it('invalidates measurements from ResizeObserver changes', () => {
    const observed: HTMLElement[] = []
    const unobserved: HTMLElement[] = []
    let resizeCallback: ResizeObserverCallback = () => undefined

    class FakeResizeObserver {
      constructor(callback: ResizeObserverCallback) {
        resizeCallback = callback
      }

      observe(element: HTMLElement) {
        observed.push(element)
      }

      unobserve(element: HTMLElement) {
        unobserved.push(element)
      }

      disconnect() {}
    }

    vi.stubGlobal('ResizeObserver', FakeResizeObserver)

    const first = createElement()
    const replacement = createElement()
    const projection = createDomProjection({
      getStageElement: () => null,
      getViewport: () => ({ scale: 1, x: 0, y: 0 }),
    })
    const cleanupFirst = projection.register('hero', first)

    projection.register('hero', replacement)
    cleanupFirst()

    expect(observed).toEqual([first, replacement])
    expect(unobserved).toEqual([first])

    const revisionBeforeResize = projection.revision()

    resizeCallback([], {} as ResizeObserver)

    expect(projection.revision()).toBe(revisionBeforeResize + 1)
  })

  it('allocates its ResizeObserver only when the first node registers', () => {
    let observers = 0

    class FakeResizeObserver {
      constructor() {
        observers += 1
      }

      observe() {}
      unobserve() {}
      disconnect() {}
    }

    vi.stubGlobal('ResizeObserver', FakeResizeObserver)

    const projection = createDomProjection({
      getStageElement: () => null,
      getViewport: () => ({ scale: 1, x: 0, y: 0 }),
    })

    expect(observers).toBe(0)

    projection.register('hero', createElement())
    projection.register('copy', createElement())

    expect(observers).toBe(1)
  })

  it('contains subscriber failures while notifying remaining listeners', () => {
    const projection = createDomProjection({
      getStageElement: () => null,
      getViewport: () => ({ scale: 1, x: 0, y: 0 }),
    })
    let notifications = 0

    projection.subscribe(() => {
      throw new Error('listener failed')
    })
    projection.subscribe(() => {
      notifications += 1
    })

    expect(() => projection.register('hero', createElement())).not.toThrow()
    expect(notifications).toBe(1)
    expect(projection.revision()).toBe(1)
  })

  it('publishes explicit measurement refreshes', () => {
    const projection = createDomProjection({
      getStageElement: () => null,
      getViewport: () => ({ scale: 1, x: 0, y: 0 }),
    })
    let notifications = 0

    projection.subscribe(() => {
      notifications += 1
    })
    projection.refresh()

    expect(projection.revision()).toBe(1)
    expect(notifications).toBe(1)
  })

  it('disconnects and becomes inert after one observable disposal', () => {
    let disconnects = 0
    let resizeCallback: ResizeObserverCallback = () => undefined

    class FakeResizeObserver {
      constructor(callback: ResizeObserverCallback) {
        resizeCallback = callback
      }

      observe() {}
      unobserve() {}
      disconnect() {
        disconnects += 1
      }
    }

    vi.stubGlobal('ResizeObserver', FakeResizeObserver)

    const stage = createElement()
    const element = createElement()
    let runtimeAvailable = true
    const projection = createDomProjection({
      getStageElement: () => {
        if (!runtimeAvailable) {
          throw new Error('stage read after disposal')
        }

        return stage
      },
      getViewport: () => {
        if (!runtimeAvailable) {
          throw new Error('viewport read after disposal')
        }

        return { scale: 1, x: 0, y: 0 }
      },
    })
    const cleanup = projection.register('hero', element)
    let notifications = 0

    projection.subscribe(() => {
      notifications += 1
    })
    projection.dispose()
    runtimeAvailable = false
    projection.dispose()
    cleanup()
    projection.refresh()
    resizeCallback([], {} as ResizeObserver)

    expect(disconnects).toBe(1)
    expect(notifications).toBe(1)
    expect(projection.revision()).toBe(2)
    expect(projection.registeredNodeIds()).toEqual([])
    expect(projection.measure('hero')).toBeNull()
    expect(projection.hitPath(element)).toEqual([])
    expect(projection.clientToWorld({ x: 0, y: 0 })).toBeNull()
    expect(projection.worldToClient({ x: 0, y: 0 })).toBeNull()
    expect(projection.focus('hero')).toBe(false)
    expect(() => projection.register('next', createElement()))
      .toThrowError('DomProjection is disposed')
  })
})

type RectInput = {
  readonly height: number
  readonly left: number
  readonly top: number
  readonly width: number
}

function createElement(
  rect: RectInput | (() => RectInput) = {
    height: 0,
    left: 0,
    top: 0,
    width: 0,
  },
) {
  return {
    getBoundingClientRect: () => toDomRect(
      typeof rect === 'function' ? rect() : rect,
    ),
  } as HTMLElement
}

function toDomRect(rect: RectInput): DOMRect {
  return {
    ...rect,
    bottom: rect.top + rect.height,
    right: rect.left + rect.width,
    x: rect.left,
    y: rect.top,
    toJSON: () => rect,
  }
}

function setParent(element: HTMLElement, parent: HTMLElement) {
  Object.defineProperty(element, 'parentElement', {
    configurable: true,
    value: parent,
  })
}
