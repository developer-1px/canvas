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

  await expect(inspector.getByLabel('CSS padding')).toBeVisible()
  await expect(inspector).toContainText('display')
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

  await expect(inspector).toContainText('Stat card')
  await expect(inspector).toContainText(
    'Layout and style edits sync across stat instances.',
  )

  const initialPadding = await readStatCardPadding(page)
  await inspector.getByLabel('CSS padding').fill('20')
  await expect.poll(() => readStatCardPadding(page)).toEqual([20, 20, 20])

  await search.fill('stat card conversion')
  await page.getByRole('button', {
    name: 'Select layer Conversion stat',
  }).click()

  await expect(inspector.getByLabel('CSS padding')).toHaveValue('20')

  await page.keyboard.press(`${primaryModifier()}+Z`)
  await expect.poll(() => readStatCardPadding(page)).toEqual(initialPadding)
  await expect(inspector.getByLabel('CSS padding'))
    .toHaveValue(String(initialPadding[1]))

  await page.keyboard.press(`${primaryModifier()}+Shift+Z`)
  await expect.poll(() => readStatCardPadding(page)).toEqual([20, 20, 20])
  await expect(inspector.getByLabel('CSS padding')).toHaveValue('20')
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

  await expect(inspector.getByLabel('CSS text content'))
    .toHaveValue('Revenue')
  await inspector.getByLabel('CSS text content').fill('Annual revenue')

  await expect(page.locator('[data-figma-dom-node="workspaceStatRevenueLabel"]'))
    .toContainText('Annual revenue')

  await page.getByRole('button', { name: 'Select layer Revenue label' })
    .click()
  await page.keyboard.press(`${primaryModifier()}+Z`)
  await expect(inspector.getByLabel('CSS text content')).toHaveValue('Revenue')
  await expect(page.locator('[data-figma-dom-node="workspaceStatRevenueLabel"]'))
    .toContainText('Revenue')

  await page.keyboard.press(`${primaryModifier()}+Shift+Z`)
  await expect(inspector.getByLabel('CSS text content'))
    .toHaveValue('Annual revenue')
  await expect(page.locator('[data-figma-dom-node="workspaceStatRevenueLabel"]'))
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

  await expect(inspector).toContainText('CSS')
  await expect(inspector.getByLabel('CSS padding')).toHaveValue('14')

  await inspector.getByLabel('CSS padding').fill('22')
  await expect(inspector.getByLabel('CSS padding')).toHaveValue('22')

  await search.fill('stat card tickets')
  await page.getByRole('button', {
    name: 'Select layer Tickets stat',
  }).click()

  await expect(inspector.getByLabel('CSS padding')).toHaveValue('22')
})

async function readStatCardPadding(page: Page) {
  return Promise.all([
    'workspaceStatRevenue',
    'workspaceStatConversion',
    'workspaceStatTickets',
  ].map((nodeId) =>
    page.locator(`[data-figma-dom-node="${nodeId}"]`).evaluate((element) =>
      Math.round(Number.parseFloat(getComputedStyle(element).paddingTop))),
  ))
}

function primaryModifier() {
  return process.platform === 'darwin' ? 'Meta' : 'Control'
}
