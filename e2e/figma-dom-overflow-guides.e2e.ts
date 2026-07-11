import { expect, test, type Locator, type Page } from '@playwright/test'

test('shows overflow clip, visible, full, and scroll extent guides', async ({
  page,
}) => {
  await page.goto('/?demo=figma')

  await page.getByRole('button', { name: 'Select layer Workspace page' })
    .click()
  await page.getByRole('button', { name: 'Select layer Top bar' }).click()
  await expect(page.locator('.figma-overflow-clip-boundary')).toHaveCount(0)

  await page.getByRole('button', { name: 'Select Workspace page section' })
    .click()
  await page.getByRole('button', { name: 'Mock' }).click()
  await page.getByRole('button', { name: 'Scroll' }).click()
  await page.getByRole('button', { name: 'Select layer Workspace page' })
    .click()
  await expect(page.locator('.figma-overflow-clip-boundary--scroll'))
    .toHaveCount(1)
  await expect(page.locator('.figma-overflow-scroll-extent')).toHaveCount(1)
  await expectOverflowClipMatchesRoot(page)

  await page.getByRole('button', { name: 'Zoom in' }).click()
  await expectOverflowClipMatchesRoot(page)

  await page.keyboard.press('h')
  await expect(page.locator('.figma-direct-dom__stage')).toHaveAttribute(
    'data-mode',
    'pan',
  )
  await panCanvas(page, { x: 56, y: 28 })
  await expectOverflowClipMatchesRoot(page)
  await page.keyboard.press('v')
  await expect(page.locator('.figma-direct-dom__stage'))
    .toHaveAttribute('data-mode', 'select')

  await page.getByRole('button', { name: 'Select Workspace page section' })
    .click()
  await page.getByRole('button', { name: 'Clip' }).click()
  await page.getByRole('button', { name: 'Select layer Workspace page' })
    .click()
  await expect(page.locator('.figma-overflow-clip-boundary--clip'))
    .toHaveCount(1)
  await page.getByRole('button', { name: 'Select layer Activity item 2' })
    .click()
  await expect(page.locator('.figma-overflow-clip-boundary--clip'))
    .toHaveCount(1)
  await expect(page.locator('.figma-overflow-selected-full')).toHaveCount(1)
  await expect(page.locator('.figma-overflow-selected-visible')).toHaveCount(1)

  const fullHeight = await readElementHeight(
    page,
    '.figma-overflow-selected-full',
  )
  const visibleHeight = await readElementHeight(
    page,
    '.figma-overflow-selected-visible',
  )

  expect(visibleHeight).toBeLessThan(fullHeight)
})

async function readElementHeight(page: Page, selector: string) {
  return page.locator(selector).evaluate((element) =>
    element.getBoundingClientRect().height)
}

async function expectOverflowClipMatchesRoot(page: Page) {
  await expectOverlayMatchesElement(
    page.locator('.figma-overflow-clip-boundary').first(),
    page.locator('[data-design-node-id="workspacePage"]'),
  )
}

async function expectOverlayMatchesElement(overlay: Locator, target: Locator) {
  const overlayBox = await getRequiredBox(overlay)
  const targetBox = await getRequiredBox(target)

  expectClose(overlayBox.x, targetBox.x)
  expectClose(overlayBox.y, targetBox.y)
  expectClose(overlayBox.width, targetBox.width)
  expectClose(overlayBox.height, targetBox.height)
}

async function panCanvas(
  page: Page,
  delta: { x: number; y: number },
) {
  const stageBox = await getRequiredBox(
    page.locator('.figma-direct-dom__stage'),
  )
  const x = stageBox.x + 120
  const y = stageBox.y + 120

  await page.mouse.move(x, y)
  await page.mouse.down()
  await page.mouse.move(x + delta.x, y + delta.y, { steps: 6 })
  await page.mouse.up()
}

async function getRequiredBox(locator: Locator) {
  const box = await locator.boundingBox()

  expect(box).not.toBeNull()

  return box!
}

function expectClose(actual: number, expected: number) {
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(1)
}
