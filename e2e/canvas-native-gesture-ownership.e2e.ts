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

    const textEntry = await openTextEntry(page, target.route, stage)

    await textEntry.fill('IME draft')
    const scaleBeforeTextEntryZoom = await readCanvasScale(root)
    const textEntryResult = await dispatchComposingKeyboardZoom(textEntry)

    expect(textEntryResult).toEqual({
      active: true,
      continued: false,
      value: 'IME draft',
    })
    await expect.poll(() => readCanvasScale(root)).toBe(
      scaleBeforeTextEntryZoom,
    )

    if (target.route !== '/figma') {
      await page.keyboard.press('Escape')
      await expect(page.locator('[aria-label="Command palette"]')).toHaveCount(0)
    }

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

    expect(await page.evaluate(() => window.visualViewport?.scale ?? 1)).toBe(1)

    await expect(root).toHaveCSS('overscroll-behavior-x', 'none')
    await expect(root).toHaveCSS('overscroll-behavior-y', 'none')
    await expect(root).toHaveCSS('touch-action', 'manipulation')
    await expect(stage).toHaveCSS('touch-action', 'none')
    expect(passiveListenerErrors).toEqual([])
  })
}

test('Figma authored scroll frames keep native scroll before canvas pan', async ({
  page,
}) => {
  await page.goto('/figma')

  const root = page.locator('.figma-clone')
  const frame = page.locator('[data-design-node-id="workspacePage"]')
  const layers = page.getByRole('complementary', { name: 'Layers' })
  const inspector = page.getByRole('complementary', {
    name: 'CSS Inspector',
  })

  await layers.getByRole('button', {
    name: 'Select Workspace page section',
  }).click()
  await inspector.getByRole('button', { name: 'Mock', exact: true }).click()
  const viewportSection = inspector.locator('section').filter({
    hasText: 'Viewport',
  })
  const overflowSection = inspector.locator('section').filter({
    hasText: 'Overflow',
  })

  await viewportSection.getByLabel('H', { exact: true }).fill('240')
  await overflowSection.getByRole('button', {
    name: 'Scroll',
    exact: true,
  }).click()
  await expect(frame).toHaveAttribute('data-canvas-wheel-passthrough', 'scroll')

  const maxScrollTop = await frame.evaluate((element) =>
    element.scrollHeight - element.clientHeight
  )

  expect(maxScrollTop).toBeGreaterThan(0)
  await frame.evaluate((element, max) => {
    element.scrollTop = Math.floor(max / 3)
  }, maxScrollTop)

  const scrollTopBefore = await frame.evaluate((element) => element.scrollTop)
  const viewportBefore = await readCanvasViewport(root)

  await frame.hover()
  await page.mouse.wheel(0, 80)
  await expect.poll(() => frame.evaluate((element) => element.scrollTop))
    .toBeGreaterThan(scrollTopBefore)
  expect(await readCanvasViewport(root)).toEqual(viewportBefore)

  await frame.evaluate((element) => {
    element.scrollTop = element.scrollHeight - element.clientHeight
  })

  const viewportAtEdge = await readCanvasViewport(root)

  await frame.hover()
  await page.mouse.wheel(0, 80)
  await expect.poll(() => readCanvasViewport(root)).not.toEqual(
    viewportAtEdge,
  )

  const scaleBeforeZoom = await readCanvasScale(root)
  const scrollTopBeforeZoom = await frame.evaluate(
    (element) => element.scrollTop,
  )

  await frame.hover()
  await page.keyboard.down('Control')
  await page.mouse.wheel(0, -80)
  await page.keyboard.up('Control')
  await expect.poll(() => readCanvasScale(root)).toBeGreaterThan(
    scaleBeforeZoom,
  )
  expect(await frame.evaluate((element) => element.scrollTop)).toBe(
    scrollTopBeforeZoom,
  )
})

async function openTextEntry(
  page: Page,
  route: typeof CANVAS_ROUTES[number]['route'],
  stage: Locator,
) {
  if (route === '/figma') {
    const search = page.locator('[aria-label="Search layers"]')

    await expect(search).toBeVisible()
    return search
  }

  await stage.focus()
  await page.keyboard.down('Control')
  await page.keyboard.press('k')
  await page.keyboard.up('Control')

  const search = page.locator('[aria-label="Search commands"]')

  await expect(search).toBeVisible()
  return search
}

async function dispatchComposingKeyboardZoom(locator: Locator) {
  return locator.evaluate((element) => {
    const event = new KeyboardEvent('keydown', {
      bubbles: true,
      cancelable: true,
      ctrlKey: true,
      key: '=',
    })

    Object.defineProperty(event, 'isComposing', { value: true })

    return {
      active: document.activeElement === element,
      continued: element.dispatchEvent(event),
      value: (element as HTMLInputElement).value,
    }
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

async function readCanvasViewport(root: Locator) {
  return root.evaluate((element) => ({
    scale: element.getAttribute('data-viewport-scale'),
    x: element.getAttribute('data-viewport-x'),
    y: element.getAttribute('data-viewport-y'),
  }))
}
