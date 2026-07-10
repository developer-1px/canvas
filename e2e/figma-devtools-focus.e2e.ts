import { expect, test, type Page } from '@playwright/test'

test('keeps selected Figma DOM nodes fitted inside the canvas work area', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/figma')
  await expect(page.locator('.figma-clone')).toBeVisible()

  await page.getByRole('button', { name: 'Select layer Workspace page' })
    .click()
  await expectSelectedGuideInsideCanvas(page)

  await page.locator('[data-figma-layer-tree-id="section:homePage"]')
    .click()
  await page.getByRole('button', { name: 'Select layer Editorial homepage' })
    .click()
  await expectSelectedGuideInsideCanvas(page)
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

async function expectSelectedGuideInsideCanvas(page: Page) {
  await expect.poll(() => readSelectedGuideFit(page)).toEqual({
    bottomInside: true,
    leftInside: true,
    rightInside: true,
    topInside: true,
  })
}

async function readSelectedGuideFit(page: Page) {
  return page.evaluate(() => {
    const canvas = document.querySelector('.figma-canvas-region')
    const selected = document.querySelector('.figma-guide-selected')

    if (!canvas || !selected) {
      return {
        bottomInside: false,
        leftInside: false,
        rightInside: false,
        topInside: false,
      }
    }

    const canvasRect = canvas.getBoundingClientRect()
    const selectedRect = selected.getBoundingClientRect()

    return {
      bottomInside: selectedRect.bottom <= canvasRect.bottom - 8,
      leftInside: selectedRect.left >= canvasRect.left + 8,
      rightInside: selectedRect.right <= canvasRect.right - 8,
      topInside: selectedRect.top >= canvasRect.top + 8,
    }
  })
}
