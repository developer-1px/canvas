import { expect, test, type Page } from '@playwright/test'

test('shows grid layout controls only for a display grid selection', async ({
  page,
}) => {
  await page.goto('/?demo=figma')
  await page.getByRole('button', { name: 'Select layer Workspace page' })
    .click()

  await expect(frameLayoutGrid(page)).toHaveCount(0)

  await selectLayer(page, 'Select layer Pipeline panel', 'workspacePipeline')
  await expect(gridLayoutOverlay(page)).toHaveCount(0)

  await selectLayer(page, 'Select layer Content grid', 'workspaceContent')
  await expect(frameLayoutGrid(page)).toHaveCount(0)
  await expect(page.locator('.figma-grid-line')).toHaveCount(0)
  await expect(page.locator('.figma-grid-line-label')).toHaveCount(0)
  await expect(page.locator('.figma-grid-track')).toHaveCount(0)
  await expect(page.locator('.figma-grid-gap')).not.toHaveCount(0)
  const gapCue = await page.locator('.figma-grid-gap--column').first()
    .evaluate((element) => {
      const surface = getComputedStyle(element)
      const cue = getComputedStyle(element, '::after')

      return {
        cueColor: cue.backgroundColor,
        cueHeight: Number.parseFloat(cue.height),
        cueWidth: Number.parseFloat(cue.width),
        surface: surface.backgroundColor,
      }
    })
  expect(gapCue.surface).toBe('rgba(0, 0, 0, 0)')
  expect(gapCue.cueColor).not.toBe('rgba(0, 0, 0, 0)')
  expect(gapCue.cueWidth).toBeLessThanOrEqual(3)
  expect(gapCue.cueHeight).toBeLessThanOrEqual(20)
  await expect(page.locator('.figma-autolayout-toolbar')).toHaveCount(0)
  await expect(page.locator('.figma-autolayout-gap')).toHaveCount(0)
})

test('reveals the targeted grid gap and its nearest boundary without track fill', async ({
  page,
}) => {
  await page.goto('/?demo=figma')
  await page.getByRole('button', { name: 'Select layer Workspace page' })
    .click()
  await selectLayer(page, 'Select layer Content grid', 'workspaceContent')

  const gap = page.locator('.figma-grid-gap--column').first()
  await gap.hover()

  await expect.poll(() => gap.evaluate((element) =>
    getComputedStyle(element).backgroundImage))
    .toContain('repeating-linear-gradient')
  await expect(page.locator('.figma-grid-track')).toHaveCount(0)
  await expect(page.locator('.figma-grid-line')).toHaveCount(1)
  await expect(page.locator('.figma-grid-line-label')).toHaveCount(1)
  await expect(page.locator('.figma-grid-value')).toHaveText(/Grid gap \d+/)
  await expect(page.getByRole('button', { name: 'Alignment editor' }))
    .toHaveCount(0)
  await expect(page.locator('.figma-size-mode-capsule')).toHaveCount(0)
  await expect(page.locator('.figma-autolayout-padding')).toHaveCount(0)
})

async function selectLayer(
  page: Page,
  buttonName: string,
  nodeId: string,
) {
  await page.getByRole('button', { name: buttonName }).click()
  await expect(page.locator(`[data-design-node-id="${nodeId}"]`))
    .toHaveAttribute('data-selected', 'true')
}

function frameLayoutGrid(page: Page) {
  return page.locator([
    '.figma-frame-guide--ruler',
    '.figma-layout-guide-column',
  ].join(','))
}

function gridLayoutOverlay(page: Page) {
  return page.locator([
    '.figma-grid-gap',
    '.figma-grid-line',
    '.figma-grid-line-label',
    '.figma-grid-track',
    '.figma-grid-track-hover',
    '.figma-grid-track-size',
    '.figma-grid-value',
  ].join(','))
}
