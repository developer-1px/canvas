import { expect, test, type Locator, type Page } from '@playwright/test'

const CANVAS_ROUTES = [
  {
    control: '.engine-demo-controls',
    name: 'engine canvas',
    root: '.engine-demo-app',
    route: '/engine',
    stage: '.canvas-stage',
  },
  {
    control: '.engine-demo-controls',
    name: 'FigJam canvas',
    root: '.figjam-react-app',
    route: '/figjam',
    stage: '.figjam-react-stage',
  },
  {
    control: '.figma-viewport-controls',
    name: 'Figma canvas',
    root: '.figma-clone',
    route: '/figma',
    stage: '.figma-direct-dom__stage',
  },
] as const

for (const target of CANVAS_ROUTES) {
  test(`${target.name} owns native pan and zoom gestures`, async ({ page }) => {
    const passiveListenerErrors: string[] = []

    page.on('console', (message) => {
      if (message.text().includes('passive event listener')) {
        passiveListenerErrors.push(message.text())
      }
    })

    await page.goto(target.route)

    const root = page.locator(target.root)
    const stage = page.locator(target.stage)
    const control = page.locator(target.control)

    await expect(root).toBeVisible()
    await expect(stage).toBeVisible()
    await expect(control).toBeVisible()

    expect(await dispatchWheel(stage, { deltaY: 24 })).toBe(false)
    expect(await dispatchWheel(control, { deltaY: 24 })).toBe(true)
    expect(await dispatchCancelableEvent(stage, 'contextmenu')).toBe(false)
    expect(await dispatchCancelableEvent(control, 'contextmenu')).toBe(true)
    expect(await dispatchWheel(control, { ctrlKey: true, deltaY: -24 }))
      .toBe(false)
    expect(await dispatchCancelableEvent(control, 'gesturestart')).toBe(false)
    expect(await dispatchCancelableEvent(control, 'gesturechange')).toBe(false)
    expect(await dispatchMultiTouchMove(control)).toBe(false)
    expect(await dispatchKeyboardZoom(control)).toBe(false)

    const scaleBeforeZoom = await readCanvasScale(root)
    const stageBox = await stage.boundingBox()

    if (!stageBox) {
      throw new Error(`expected ${target.name} stage bounds`)
    }

    await page.evaluate(() => {
      window.addEventListener('wheel', (event) => {
        document.documentElement.dataset.lastWheelDefaultPrevented =
          `${event.defaultPrevented}`
      }, { once: true })
    })
    await page.mouse.move(
      stageBox.x + stageBox.width / 2,
      stageBox.y + stageBox.height / 2,
    )
    await page.keyboard.down('Control')
    await page.mouse.wheel(0, -80)
    await page.keyboard.up('Control')

    await expect.poll(() => readCanvasScale(root)).toBeGreaterThan(
      scaleBeforeZoom,
    )
    const scaleAfterWheelZoom = await readCanvasScale(root)

    expect(scaleAfterWheelZoom / scaleBeforeZoom).toBeGreaterThan(1.08)
    expect(scaleAfterWheelZoom / scaleBeforeZoom).toBeLessThan(1.13)
    await expect(page.locator('html')).toHaveAttribute(
      'data-last-wheel-default-prevented',
      'true',
    )

    const scaleBeforeKeyboardZoom = await readCanvasScale(root)

    await stage.focus()
    await page.keyboard.down('Control')
    await page.keyboard.press('=')
    await page.keyboard.up('Control')

    await expect.poll(() => readCanvasScale(root)).toBeGreaterThan(
      scaleBeforeKeyboardZoom,
    )

    const scaleBeforeGestureZoom = await readCanvasScale(root)

    expect(await dispatchGestureZoom(stage, 1.15)).toBe(false)
    await expect.poll(() => readCanvasScale(root)).toBeGreaterThan(
      scaleBeforeGestureZoom,
    )

    const scaleBeforePointerPinch = await readCanvasScale(root)

    await pinchStageWithTouchPointers(page, stageBox)
    await expect.poll(() => readCanvasScale(root)).toBeGreaterThan(
      scaleBeforePointerPinch,
    )
    expect(await page.evaluate(() => window.visualViewport?.scale ?? 1)).toBe(1)
    expect([null, 'none']).toContain(await stage.getAttribute('data-gesture'))
    await expect(stage).not.toHaveAttribute('data-panning', 'true')
    await expect(page.locator('.marquee, .figjam-react-marquee')).toHaveCount(0)

    await expect(root).toHaveCSS('overscroll-behavior-x', 'none')
    await expect(root).toHaveCSS('overscroll-behavior-y', 'none')
    await expect(root).toHaveCSS('touch-action', 'manipulation')
    await expect(stage).toHaveCSS('touch-action', 'none')
    expect(passiveListenerErrors).toEqual([])
  })
}

async function dispatchWheel(
  locator: Locator,
  init: Pick<WheelEventInit, 'ctrlKey' | 'deltaY'>,
) {
  return locator.evaluate((element, eventInit) =>
    element.dispatchEvent(new WheelEvent('wheel', {
      bubbles: true,
      cancelable: true,
      deltaMode: WheelEvent.DOM_DELTA_PIXEL,
      ...eventInit,
    })), init)
}

async function dispatchCancelableEvent(locator: Locator, type: string) {
  return locator.evaluate((element, eventType) =>
    element.dispatchEvent(new Event(eventType, {
      bubbles: true,
      cancelable: true,
    })), type)
}

async function dispatchMultiTouchMove(locator: Locator) {
  return locator.evaluate((element) => {
    const event = new Event('touchmove', {
      bubbles: true,
      cancelable: true,
    })

    Object.defineProperty(event, 'touches', { value: [{}, {}] })

    return element.dispatchEvent(event)
  })
}

async function dispatchKeyboardZoom(locator: Locator) {
  return locator.evaluate((element) =>
    element.dispatchEvent(new KeyboardEvent('keydown', {
      bubbles: true,
      cancelable: true,
      ctrlKey: true,
      key: '=',
    })))
}

async function dispatchGestureZoom(locator: Locator, scale: number) {
  return locator.evaluate((element, nextScale) => {
    function createGestureEvent(type: string, gestureScale: number) {
      const event = new Event(type, {
        bubbles: true,
        cancelable: true,
      })
      const rect = element.getBoundingClientRect()

      Object.defineProperties(event, {
        clientX: { value: rect.left + rect.width / 2 },
        clientY: { value: rect.top + rect.height / 2 },
        scale: { value: gestureScale },
      })

      return event
    }

    element.dispatchEvent(createGestureEvent('gesturestart', 1))
    const didContinue = element.dispatchEvent(
      createGestureEvent('gesturechange', nextScale),
    )
    element.dispatchEvent(createGestureEvent('gestureend', nextScale))

    return didContinue
  }, scale)
}

async function pinchStageWithTouchPointers(
  page: Page,
  stageBox: { height: number; width: number; x: number; y: number },
) {
  const client = await page.context().newCDPSession(page)
  const centerX = Math.round(stageBox.x + stageBox.width / 2)
  const centerY = Math.round(stageBox.y + stageBox.height / 2)

  try {
    await client.send('Emulation.setTouchEmulationEnabled', {
      enabled: true,
      maxTouchPoints: 2,
    })
    await client.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [
        { id: 1, x: centerX - 40, y: centerY },
        { id: 2, x: centerX + 40, y: centerY },
      ],
    })
    await client.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [
        { id: 1, x: centerX - 80, y: centerY },
        { id: 2, x: centerX + 80, y: centerY },
      ],
    })
    await client.send('Input.dispatchTouchEvent', {
      type: 'touchEnd',
      touchPoints: [],
    })
  } finally {
    await client.send('Emulation.setTouchEmulationEnabled', {
      enabled: false,
    })
    await client.detach()
  }
}

async function readCanvasScale(root: Locator) {
  return root.evaluate((element) => {
    const scale = element.getAttribute('data-viewport-scale')

    if (scale !== null) {
      return Number(scale)
    }

    const scaleLabel = element.querySelector('[aria-label="Canvas scale"]')
      ?.textContent ?? ''

    return Number.parseFloat(scaleLabel) / 100
  })
}
