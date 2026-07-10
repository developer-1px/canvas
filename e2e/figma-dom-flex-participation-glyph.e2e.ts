import { expect, test, type Page } from '@playwright/test'

test('shows flex participation glyphs next to size mode badges', async ({
  page,
}) => {
  await page.goto('/?demo=figma')
  await page.getByRole('button', { name: 'Select layer Workspace page' })
    .click()

  await selectLayer(page, 'Select layer Hero copy', 'workspaceHeroCopy')
  await expect(page.locator('.figma-size-mode-capsule')).toHaveCount(1)
  await expect(widthModeBadge(page)).toHaveAttribute(
    'aria-label',
    /W \d+ Fill/,
  )
  await expect(flexParticipationGlyph(page)).toHaveCount(1)
  await expect(flexParticipationGlyph(page)).toHaveClass(
    /figma-flex-participation-glyph--width/,
  )
  await expect(flexParticipationGlyph(page)).toHaveAttribute(
    'aria-label',
    'W Fill grow 1 / shrink 1',
  )

  await selectLayer(page, 'Select layer Pipeline panel', 'workspacePipeline')
  await expect(page.locator('.figma-size-mode-capsule')).toHaveCount(1)
  await expect(widthModeBadge(page)).toHaveAttribute(
    'aria-label',
    /W \d+ Fill/,
  )
  await expect(flexParticipationGlyph(page)).toHaveCount(0)

  await selectLayer(page, 'Select layer Activity panel', 'workspaceActivity')
  await expect(page.locator('.figma-size-mode-capsule')).toHaveCount(1)
  await expect(widthModeBadge(page)).toHaveAttribute(
    'aria-label',
    /W \d+ Hug/,
  )
  await expect(flexParticipationGlyph(page)).toHaveCount(0)
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

function flexParticipationGlyph(page: Page) {
  return page.locator('.figma-flex-participation-glyph')
}

function widthModeBadge(page: Page) {
  return page.locator('.figma-size-mode-capsule .figma-size-mode-control')
    .first()
}
