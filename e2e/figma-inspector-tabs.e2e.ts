import { expect, test, type Page } from '@playwright/test'

test('presents figma clone editing as one CSS inspector surface', async ({
  page,
}) => {
  await page.goto('/figma')

  const inspector = page.getByRole('complementary', {
    name: 'CSS Inspector',
  })

  await expect(inspector.getByRole('heading', { name: 'CSS' }))
    .toBeVisible()
  await expect(inspector.getByRole('tab')).toHaveCount(0)
  await expect(
    inspector.getByRole('button', { name: 'Copy source reference' }),
  ).toHaveCount(0)
  await expect(inspector.getByLabel(/Review note/)).toHaveCount(0)

  await page.getByRole('button', { name: 'Select layer Workspace page' })
    .click()

  await expect(inspector.getByLabel('Pad')).toBeVisible()
  await expect(inspector).toContainText('Display')
})

test('syncs figma clone component edits across instances', async ({
  page,
}) => {
  await page.goto('/figma')

  const layers = page.getByRole('complementary', { name: 'Layers' })
  const inspector = page.getByRole('complementary', {
    name: 'CSS Inspector',
  })
  const search = layers.getByRole('searchbox', { name: 'Search layers' })

  await search.fill('stat card revenue')
  await page.getByRole('button', { name: 'Select layer Revenue stat' }).click()
  await inspector.getByRole('button', { name: 'Definition' }).click()

  await expect(inspector).toContainText('Stat card')
  await expect(inspector).toContainText(
    'Layout and style edits sync across stat instances.',
  )

  const initialPadding = await readStatCardPadding(page)
  await inspector.getByLabel('Pad').fill('20')
  await expect.poll(() => readStatCardPadding(page)).toEqual([20, 20, 20])

  await search.fill('stat card conversion')
  await page.getByRole('button', {
    name: 'Select layer Conversion stat',
  }).click()

  await expect(inspector.getByLabel('Pad')).toHaveValue('20')

  await page.keyboard.press(`${primaryModifier()}+Z`)
  await expect.poll(() => readStatCardPadding(page)).toEqual(initialPadding)
  await expect(inspector.getByLabel('Pad'))
    .toHaveValue(String(initialPadding[1]))

  await page.keyboard.press(`${primaryModifier()}+Shift+Z`)
  await expect.poll(() => readStatCardPadding(page)).toEqual([20, 20, 20])
  await expect(inspector.getByLabel('Pad')).toHaveValue('20')
})

test('edits text content from the CSS inspector', async ({ page }) => {
  await page.goto('/figma')

  const layers = page.getByRole('complementary', { name: 'Layers' })
  const inspector = page.getByRole('complementary', {
    name: 'CSS Inspector',
  })

  await layers.getByRole('searchbox', { name: 'Search layers' })
    .fill('revenue label')
  await page.getByRole('button', { name: 'Select layer Revenue label' })
    .click()

  await expect(inspector.getByLabel('Text'))
    .toHaveValue('Revenue')
  await inspector.getByLabel('Text').fill('Annual revenue')

  await expect(page.locator('[data-design-node-id="workspaceStatRevenueLabel"]'))
    .toContainText('Annual revenue')

  await page.getByRole('button', { name: 'Select layer Revenue label' })
    .click()
  await page.keyboard.press(`${primaryModifier()}+Z`)
  await expect(inspector.getByLabel('Text')).toHaveValue('Revenue')
  await expect(page.locator('[data-design-node-id="workspaceStatRevenueLabel"]'))
    .toContainText('Revenue')

  await page.keyboard.press(`${primaryModifier()}+Shift+Z`)
  await expect(inspector.getByLabel('Text'))
    .toHaveValue('Annual revenue')
  await expect(page.locator('[data-design-node-id="workspaceStatRevenueLabel"]'))
    .toContainText('Annual revenue')
})

test('edits figma clone CSS declarations in the inspector', async ({
  page,
}) => {
  await page.goto('/figma')

  const layers = page.getByRole('complementary', { name: 'Layers' })
  const inspector = page.getByRole('complementary', {
    name: 'CSS Inspector',
  })
  const search = layers.getByRole('searchbox', { name: 'Search layers' })

  await search.fill('stat card revenue')
  await page.getByRole('button', { name: 'Select layer Revenue stat' }).click()
  await inspector.getByRole('button', { name: 'Definition' }).click()

  await expect(inspector).toContainText('CSS')
  await expect(inspector.getByLabel('Pad')).toHaveValue('14')
  await expect(inspector.getByLabel('Pad')).toHaveAttribute('step', '4')

  await inspector.getByLabel('Pad').fill('22')
  await expect(inspector.getByLabel('Pad')).toHaveValue('24')

  await search.fill('stat card tickets')
  await page.getByRole('button', {
    name: 'Select layer Tickets stat',
  }).click()

  await expect(inspector.getByLabel('Pad')).toHaveValue('24')
})

async function readStatCardPadding(page: Page) {
  return Promise.all([
    'workspaceStatRevenue',
    'workspaceStatConversion',
    'workspaceStatTickets',
  ].map((nodeId) =>
    page.locator(`[data-design-node-id="${nodeId}"]`).evaluate((element) =>
      Math.round(Number.parseFloat(getComputedStyle(element).paddingTop))),
  ))
}

function primaryModifier() {
  return process.platform === 'darwin' ? 'Meta' : 'Control'
}
