import { expect, test, type Locator, type Page } from '@playwright/test'

const CANVAS_ROUTES = [
  {
    name: 'engine canvas',
    root: '.engine-demo-app',
    route: '/engine',
    stage: '.canvas-stage',
  },
  {
    name: 'FigJam canvas',
    root: '.figjam-react-app',
    route: '/figjam',
    stage: '.figjam-react-stage',
  },
  {
    name: 'Figma canvas',
    root: '.figma-clone',
    route: '/figma',
    stage: '.figma-direct-dom__stage',
  },
] as const

for (const target of CANVAS_ROUTES) {
  test(`${target.name} turns two touch pointers into canvas pinch zoom`, async ({
    page,
  }) => {
    await page.goto(target.route)

    const root = page.locator(target.root)
    const stage = page.locator(target.stage)

    await expect(root).toBeVisible()
    await expect(stage).toBeVisible()

    const stageBox = await stage.boundingBox()

    if (!stageBox) {
      throw new Error(`expected ${target.name} stage bounds`)
    }

    const scaleBeforePointerPinch = await readCanvasScale(root)

    await pinchStageWithTouchPointers(page, stageBox)
    await expect.poll(() => readCanvasScale(root)).toBeGreaterThan(
      scaleBeforePointerPinch,
    )
    expect(await page.evaluate(() => window.visualViewport?.scale ?? 1)).toBe(1)
    expect([null, 'none']).toContain(await stage.getAttribute('data-gesture'))
    await expect(stage).not.toHaveAttribute('data-panning', 'true')
    await expect(page.locator('.marquee, .figjam-react-marquee')).toHaveCount(0)
  })
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
