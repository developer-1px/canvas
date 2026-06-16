import { expect, test } from '@playwright/test'

test('exposes figma clone inspector modes as keyboard tabs', async ({
  page,
}) => {
  await page.goto('/')
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
