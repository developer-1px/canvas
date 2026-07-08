import { expect, test, type Page } from '@playwright/test'

test('keeps Figma section selections fitted inside the canvas devtools work area', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/figma')
  await expect(page.locator('.figma-clone')).toBeVisible()

  await expectSelectedFrameInsideCanvas(page)

  await page.locator('[data-figma-layer-tree-id="section:homePage"]')
    .click()

  await expectSelectedFrameInsideCanvas(page)
})

test('places the Figma devtools panel away from the fitted section frame', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1960, height: 1040 })
  await page.goto('/figma')
  await expect(page.locator('.figma-clone')).toBeVisible()

  await page.locator('[data-figma-layer-tree-id="section:homePage"]')
    .click()

  await expect.poll(() => readSelectedFrameAndPanelOverlap(page)).toBe(false)
})

test('surfaces Figma source context inside canvas devtools', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/figma')
  await expect(page.locator('.figma-clone')).toBeVisible()

  const layers = page.getByRole('complementary', { name: 'Layers' })

  await layers.getByRole('searchbox', { name: 'Search layers' })
    .fill('stat card revenue')
  await page.getByRole('button', { name: 'Select layer Revenue stat' })
    .click()
  await page.getByRole('button', { name: 'Inspect' }).click()

  const devtools = page.getByRole('region', { name: 'Canvas devtools' })

  await expect(devtools).toContainText('Revenue stat')
  await expect(devtools).toContainText(
    'packages/figma-clone/src/dom-edit/FigmaCloneDomEditSurface.tsx#workspaceStatRevenue',
  )
  await expect(devtools).toContainText('Stat card')
  await expect(devtools).toContainText('src/widgets/workspace-stat-card')
  await expect(devtools).toContainText('root')
})

async function expectSelectedFrameInsideCanvas(page: Page) {
  await expect.poll(() => readSelectedFrameFit(page)).toEqual({
    bottomInside: true,
    leftInside: true,
    rightInside: true,
    topInside: true,
  })
}

async function readSelectedFrameFit(page: Page) {
  return page.evaluate(() => {
    const canvas = document.querySelector('.figma-canvas-region')
    const selected = document.querySelector('.canvas-devtools__selection-outline')

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

async function readSelectedFrameAndPanelOverlap(page: Page) {
  return page.evaluate(() => {
    const panel = document.querySelector('.canvas-devtools__panel')
    const selected = document.querySelector('.canvas-devtools__selection-outline')

    if (!panel || !selected) {
      return true
    }

    const panelRect = panel.getBoundingClientRect()
    const selectedRect = selected.getBoundingClientRect()

    return !(
      panelRect.right <= selectedRect.left ||
      panelRect.left >= selectedRect.right ||
      panelRect.bottom <= selectedRect.top ||
      panelRect.top >= selectedRect.bottom
    )
  })
}
