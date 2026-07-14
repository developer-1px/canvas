import { expect, test } from '@playwright/test'

test('renders three realistic editable mobile travel website frames', async ({
  page,
}) => {
  await page.goto('/?demo=figma')

  const explore = page.locator('[data-design-node-id="mobileExplorePage"]')
  const stay = page.locator('[data-design-node-id="mobileStayPage"]')
  const booking = page.locator('[data-design-node-id="mobileBookingPage"]')

  await expect(explore).toBeAttached()
  await expect(stay).toBeAttached()
  await expect(booking).toBeAttached()
  await expect.poll(() => explore.evaluate((element) => ({
    height: (element as HTMLElement).offsetHeight,
    width: (element as HTMLElement).offsetWidth,
  }))).toEqual({ height: 844, width: 390 })
  for (const frame of [explore, stay, booking]) {
    await expect.poll(() => frame.evaluate((element) => ({
      clientHeight: element.clientHeight,
      clientWidth: element.clientWidth,
      scrollHeight: element.scrollHeight,
      scrollWidth: element.scrollWidth,
    }))).toEqual({
      clientHeight: 844,
      clientWidth: 390,
      scrollHeight: 844,
      scrollWidth: 390,
    })
  }
  await expect.poll(() => page.locator(
    '.figma-dom-mobile [data-design-node-id]',
  ).evaluateAll((elements) => elements.flatMap((element) => {
    const horizontalOverflow = element.scrollWidth > element.clientWidth + 1
    const verticalOverflow = element.scrollHeight > element.clientHeight + 1

    return horizontalOverflow || verticalOverflow
      ? [{
          clientHeight: element.clientHeight,
          clientWidth: element.clientWidth,
          nodeId: element.getAttribute('data-design-node-id'),
          scrollHeight: element.scrollHeight,
          scrollWidth: element.scrollWidth,
        }]
      : []
  }))).toEqual([])

  await page.getByRole('button', {
    name: 'Select Mobile travel explore section',
  }).click()
  await page.getByRole('button', {
    name: 'Select layer Mobile travel explore',
  }).click()
  await page.getByRole('button', { name: 'Fit selection' }).click()

  await expect(explore).toBeVisible()
  await expect(explore.locator('h1')).toHaveText(
    'Stay somewhere worth remembering',
  )
  await expect(explore.locator('.figma-dom-mobile__search')).toContainText(
    '19–21 Jul · 2 guests',
  )
  await expect.poll(() => explore.evaluate((element) => {
    const style = getComputedStyle(element)

    return {
      backgroundColor: style.backgroundColor,
      display: style.display,
      fontFamily: style.fontFamily,
    }
  })).toEqual({
    backgroundColor: 'rgb(247, 246, 242)',
    display: 'flex',
    fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
  })
  await expect.poll(() => page.locator(
    '[data-design-node-id="mobileExploreFeaturedImage"]',
  ).evaluate((element) => getComputedStyle(element).backgroundImage))
    .toContain('images.unsplash.com')

  await expect(stay.locator('h1')).toHaveText('Slow House, Jeju')
  await expect(booking).toContainText('₩504,000')
  await expect(booking.locator('.figma-dom-mobile__primary-action'))
    .toHaveText('Confirm · ₩504k')
})
