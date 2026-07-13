import { expect, test, type Page } from '@playwright/test'

test('fits the initial Figma root without refitting later layer selections', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/figma')
  await expect(page.locator('.figma-clone')).toBeVisible()

  await page.getByRole('button', { name: 'Select layer Workspace page' })
    .click()
  await expectSelectedGuideInsideCanvas(page, 'workspacePage')
  const viewportBeforeSelection = await readViewport(page)

  await page.locator('[data-figma-layer-tree-id="section:homePage"]')
    .click()
  await expect(page.locator('.figma-clone')).toHaveAttribute(
    'data-selected-node-id',
    'homePage',
  )
  expect(await readViewport(page)).toEqual(viewportBeforeSelection)
})

test('does not render the generic canvas devtools panel in Figma mode', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1960, height: 1040 })
  await page.goto('/figma')
  await expect(page.locator('.figma-clone')).toBeVisible()

  await expect(
    page.getByRole('region', { name: 'Canvas devtools' }),
  ).toHaveCount(0)
  await expect(page.locator('.canvas-devtools__panel')).toHaveCount(0)
})

test('surfaces Figma component context inside the CSS inspector', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/figma')
  await expect(page.locator('.figma-clone')).toBeVisible()

  const layers = page.getByRole('complementary', { name: 'Layers' })
  const inspector = page.getByRole('complementary', {
    name: 'CSS Inspector',
  })

  await layers.getByRole('searchbox', { name: 'Search layers' })
    .fill('stat card revenue')
  await page.getByRole('button', { name: 'Select layer Revenue stat' })
    .click()

  await expect(inspector).toContainText('Revenue stat')
  await expect(inspector).toContainText('Stat card')
  await expect(inspector).toContainText('root')
  await expect(inspector).toContainText(
    'Layout and style edits sync across stat instances.',
  )
})

async function expectSelectedGuideInsideCanvas(page: Page, nodeId: string) {
  const app = page.locator('.figma-clone')

  await expect(app).toHaveAttribute('data-selected-node-id', nodeId)
  await expect(app).toHaveAttribute('data-viewport-focus-node-id', nodeId)
  await expect.poll(() => readSelectedGuideFit(page)).toEqual({
    bottomInside: true,
    leftInside: true,
    rightInside: true,
    topInside: true,
  })
}

async function readViewport(page: Page) {
  return page.locator('.figma-clone').evaluate((element) => ({
    scale: element.getAttribute('data-viewport-scale'),
    x: element.getAttribute('data-viewport-x'),
    y: element.getAttribute('data-viewport-y'),
  }))
}

async function readSelectedGuideFit(page: Page) {
  return page.evaluate(() => {
    const stage = document.querySelector('.figma-direct-dom__stage')
    const selected = document.querySelector('.figma-guide-selected')

    if (!stage || !selected) {
      return {
        bottomInside: false,
        leftInside: false,
        rightInside: false,
        topInside: false,
      }
    }

    const stageRect = stage.getBoundingClientRect()
    const selectedRect = selected.getBoundingClientRect()

    return {
      bottomInside: selectedRect.bottom <= stageRect.bottom - 8,
      leftInside: selectedRect.left >= stageRect.left + 8,
      rightInside: selectedRect.right <= stageRect.right - 8,
      topInside: selectedRect.top >= stageRect.top + 8,
    }
  })
}
