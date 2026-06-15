import { expect, test, type Page } from '@playwright/test'

test('shows overflow clip, visible, full, and scroll extent guides', async ({
  page,
}) => {
  await page.goto('/')

  await page.getByRole('button', { name: 'Select layer Workspace page' })
    .click()
  await page.getByRole('button', { name: 'Select layer Top bar' }).click()
  await expect(page.locator('.figma-overflow-clip-boundary')).toHaveCount(0)

  await page.getByRole('button', { name: 'Select Workspace page section' })
    .click()
  await page.getByRole('button', { name: 'Mock' }).click()
  await page.getByRole('button', { name: 'Scroll' }).click()
  await page.getByRole('button', { name: 'Select layer Workspace page' })
    .click()
  await expect(page.locator('.figma-overflow-clip-boundary--scroll'))
    .toHaveCount(1)
  await expect(page.locator('.figma-overflow-scroll-extent')).toHaveCount(1)

  await page.getByRole('button', { name: 'Select Workspace page section' })
    .click()
  await page.getByRole('button', { name: 'Clip' }).click()
  await page.getByRole('button', { name: 'Select layer Workspace page' })
    .click()
  await expect(page.locator('.figma-overflow-clip-boundary--clip'))
    .toHaveCount(1)
  await page.getByRole('button', { name: 'Select layer Activity item 2' })
    .click()
  await expect(page.locator('.figma-overflow-clip-boundary--clip'))
    .toHaveCount(1)
  await expect(page.locator('.figma-overflow-selected-full')).toHaveCount(1)
  await expect(page.locator('.figma-overflow-selected-visible')).toHaveCount(1)

  const fullHeight = await readElementHeight(
    page,
    '.figma-overflow-selected-full',
  )
  const visibleHeight = await readElementHeight(
    page,
    '.figma-overflow-selected-visible',
  )

  expect(visibleHeight).toBeLessThan(fullHeight)
})

async function readElementHeight(page: Page, selector: string) {
  return page.locator(selector).evaluate((element) =>
    element.getBoundingClientRect().height)
}
