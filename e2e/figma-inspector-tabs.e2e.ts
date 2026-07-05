import { expect, test } from '@playwright/test'

test('exposes figma clone inspector modes as keyboard tabs', async ({
  page,
}) => {
  await page.goto('/?demo=figma')
  await page.getByRole('button', { name: 'Select layer Workspace page' })
    .click()

  const inspector = page.getByRole('complementary', { name: 'Design' })
  const tablist = inspector.getByRole('tablist', {
    name: 'Inspector panels',
  })
  const designTab = tablist.getByRole('tab', { name: 'Design' })
  const devTab = tablist.getByRole('tab', { name: 'Dev' })

  await expect(designTab).toHaveAttribute('aria-selected', 'true')
  await expect(designTab).toHaveAttribute(
    'aria-controls',
    'figma-inspector-design-panel',
  )
  await expect(devTab).toHaveAttribute('aria-selected', 'false')
  await expect(devTab).toHaveAttribute(
    'aria-controls',
    'figma-inspector-dev-panel',
  )
  await expect(inspector.getByRole('tabpanel', { name: 'Design' }))
    .toBeVisible()

  await designTab.focus()
  await page.keyboard.press('ArrowRight')

  await expect(devTab).toBeFocused()
  await expect(devTab).toHaveAttribute('aria-selected', 'true')
  await expect(designTab).toHaveAttribute('tabindex', '-1')
  await expect(inspector.getByRole('tabpanel', { name: 'Dev' }))
    .toContainText('Workspace page')

  await page.keyboard.press('Home')

  await expect(designTab).toBeFocused()
  await expect(designTab).toHaveAttribute('aria-selected', 'true')
})

test('syncs figma clone component edits across instances', async ({
  page,
}) => {
  await page.goto('/?demo=figma')

  const layers = page.getByRole('complementary', { name: 'Layers' })
  const inspector = page.getByRole('complementary', { name: 'Design' })
  const search = layers.getByRole('searchbox', { name: 'Search layers' })

  await search.fill('stat card revenue')
  await page.getByRole('button', { name: 'Select layer Revenue stat' }).click()

  await expect(inspector).toContainText('Stat card')
  await expect(inspector).toContainText(
    'Layout and style edits sync across stat instances.',
  )

  await inspector.getByLabel('Pad').fill('20')

  await search.fill('stat card conversion')
  await page.getByRole('button', {
    name: 'Select layer Conversion stat',
  }).click()

  await expect(inspector.getByLabel('Pad')).toHaveValue('20')
})

test('stores figma clone review notes and copies source references', async ({
  context,
  page,
}) => {
  await context.grantPermissions(['clipboard-write'])
  await page.goto('/?demo=figma')

  const layers = page.getByRole('complementary', { name: 'Layers' })
  const inspector = page.getByRole('complementary', { name: 'Design' })
  const search = layers.getByRole('searchbox', { name: 'Search layers' })

  await search.fill('stat card revenue')
  await page.getByRole('button', { name: 'Select layer Revenue stat' }).click()

  const revenueNote = inspector.getByLabel('Review note for Revenue stat')
  await revenueNote.fill('Check responsive density before handoff.')

  await search.fill('stat card')
  await layers.getByRole('button', {
    name: 'Select Stat card Conversion variant',
  }).click()
  await expect(
    inspector.getByLabel('Review note for Conversion stat'),
  ).toHaveValue('')

  await layers.getByRole('button', {
    name: 'Select Stat card Revenue variant',
  }).click()
  await expect(revenueNote).toHaveValue(
    'Check responsive density before handoff.',
  )

  await inspector.getByRole('tab', { name: 'Dev' }).click()

  await expect(inspector).toContainText(
    'FigmaCloneDomEditSurface.tsx#workspaceStatRevenue',
  )
  await inspector.getByRole('button', { name: 'Copy source reference' }).click()
  await expect(inspector).toContainText('Copied source')
})

test('edits figma clone CSS declarations in the dev inspector', async ({
  page,
}) => {
  await page.goto('/?demo=figma')

  const layers = page.getByRole('complementary', { name: 'Layers' })
  const inspector = page.getByRole('complementary', { name: 'Design' })
  const search = layers.getByRole('searchbox', { name: 'Search layers' })

  await search.fill('stat card')
  await layers.getByRole('button', {
    name: 'Select Stat card Revenue variant',
  }).click()
  await inspector.getByRole('tab', { name: 'Dev' }).click()

  await expect(inspector).toContainText('CSS')
  await expect(inspector.getByLabel('CSS padding')).toHaveValue('14')

  await inspector.getByLabel('CSS padding').fill('22')
  await expect(inspector.getByLabel('CSS padding')).toHaveValue('22')

  await layers.getByRole('button', {
    name: 'Select Stat card Tickets variant',
  }).click()

  await expect(inspector.getByLabel('CSS padding')).toHaveValue('22')
})
