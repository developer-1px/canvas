import { expect, test, type Page } from '@playwright/test'

test('shows selected DOM layout context badges', async ({ page }) => {
  await page.goto('/?demo=figma')

  await selectLayer(page, 'Select layer Workspace page', 'workspacePage')
  await expect(contextBadge(page)).toHaveAttribute(
    'data-dom-layout-context-badge',
    'flex',
  )
  await expect(contextBadge(page)).toHaveText('flex row')

  await selectLayer(page, 'Select layer Hero copy', 'workspaceHeroCopy')
  await expect(contextBadge(page)).toHaveAttribute(
    'data-dom-layout-context-badge',
    'flex',
  )
  await expect(contextBadge(page)).toHaveText('flex column')

  await selectLayer(page, 'Select layer Content grid', 'workspaceContent')
  await expect(contextBadge(page)).toHaveAttribute(
    'data-dom-layout-context-badge',
    'grid',
  )
  await expect(contextBadge(page)).toHaveText('grid')
  await expect(contextBadge(page)).not.toContainText(/flex/)

  await selectLayer(page, 'Select layer Hero title', 'workspaceHeroTitle')
  await expect(contextBadge(page)).toHaveAttribute(
    'data-dom-layout-context-badge',
    'block',
  )
  await expect(contextBadge(page)).toHaveText('block')

  await page.getByRole('button', { name: 'Zoom in' }).click()
  await expect(contextBadge(page)).toBeVisible()
  await expect(contextBadge(page)).toHaveText('block')
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

function contextBadge(page: Page) {
  return page.locator('[data-dom-layout-context-badge]')
}
