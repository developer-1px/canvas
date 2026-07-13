import { expect, test, type Locator, type Page } from '@playwright/test'

test('targets one padding side on hover and expands affected sides on drag', async ({
  page,
}) => {
  await selectHeroPanel(page)

  const cornerCue = await cornerHandle(page, 'top-left').evaluate((element) => {
    const cue = getComputedStyle(element, '::after')

    return {
      color: cue.backgroundColor,
      height: cue.height,
      width: cue.width,
    }
  })
  expect(cornerCue).toEqual({
    color: 'rgba(180, 83, 9, 0.72)',
    height: '4px',
    width: '4px',
  })

  await sideHandle(page, 'top').hover()
  await expectActiveSides(page, ['top'])

  await sideHandle(page, 'left').hover()
  await expectActiveSides(page, ['left'])

  await cornerHandle(page, 'top-left').hover()
  await expectActiveSides(page, ['top', 'right', 'bottom', 'left'])

  await startDrag(page, sideHandle(page, 'top'), { x: 0, y: 8 })
  await expectActiveSides(page, ['top', 'bottom'])
  await page.mouse.up()

  await sideHandle(page, 'top').click()
  await expectActiveSides(page, ['top'])
  await expect(sideHandle(page, 'top')).toHaveAttribute('aria-pressed', 'true')
})

test('matches opposite padding side and merges drag history', async ({ page }) => {
  await selectHeroPanel(page)

  const initial = await readHeroPadding(page)
  await sideHandle(page, 'top').click()
  await dragHandle(page, sideHandle(page, 'top'), { x: 0, y: 24 })
  await expect.poll(() => readHeroPadding(page)).toMatchObject({
    bottom: initial.bottom,
  })
  const afterDrag = await readHeroPadding(page)
  expect(afterDrag.top).toBeGreaterThan(afterDrag.bottom)
  expect(Number.isInteger(afterDrag.top)).toBe(true)
  expect(afterDrag.top % 4).toBe(0)

  await sideHandle(page, 'top').dblclick()
  await expect.poll(() => readHeroPadding(page)).toEqual({
    ...afterDrag,
    top: afterDrag.bottom,
  })

  await sideHandle(page, 'top').click()
  await dragHandle(page, sideHandle(page, 'top'), { x: 0, y: 18 })
  await page.keyboard.press(`${primaryModifier()}+Z`)
  await expect.poll(() => readHeroPadding(page)).toEqual({
    ...initial,
    top: afterDrag.bottom,
  })
})

async function selectHeroPanel(page: Page) {
  await page.goto('/?demo=figma')
  await page.getByRole('button', { name: 'Select layer Workspace page' })
    .click()
  await page.getByRole('button', { name: 'Select layer Hero panel' }).click()
  await expect(page.locator('[data-design-node-id="workspaceHero"]'))
    .toHaveAttribute('data-selected', 'true')
}

async function dragHandle(
  page: Page,
  handle: Locator,
  delta: { x: number; y: number },
) {
  await startDrag(page, handle, delta)
  await page.mouse.up()
}

async function startDrag(
  page: Page,
  handle: Locator,
  delta: { x: number; y: number },
) {
  const box = await handle.boundingBox()
  expect(box).not.toBeNull()
  const x = box!.x + box!.width / 2
  const y = box!.y + box!.height / 2

  await page.mouse.move(x, y)
  await page.mouse.down()
  await page.mouse.move(x + delta.x, y + delta.y, { steps: 4 })
}

async function expectActiveSides(
  page: Page,
  activeSides: Array<'bottom' | 'left' | 'right' | 'top'>,
) {
  const active = new Set(activeSides)

  for (const side of ['top', 'right', 'bottom', 'left'] as const) {
    const expectation = expect(sideHandle(page, side))
    if (active.has(side)) {
      await expectation.toHaveClass(/figma-autolayout-padding--active/)
    } else {
      await expectation.not.toHaveClass(/figma-autolayout-padding--active/)
    }
  }
}

async function readHeroPadding(page: Page) {
  return page.locator('[data-design-node-id="workspaceHero"]').evaluate(
    (element) => {
      const style = getComputedStyle(element)

      return {
        bottom: Math.round(Number.parseFloat(style.paddingBottom)),
        left: Math.round(Number.parseFloat(style.paddingLeft)),
        right: Math.round(Number.parseFloat(style.paddingRight)),
        top: Math.round(Number.parseFloat(style.paddingTop)),
      }
    },
  )
}

function cornerHandle(
  page: Page,
  corner: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right',
) {
  return page.locator(`[data-dom-edit-padding-kind="padding-corner-${corner}"]`)
}

function primaryModifier() {
  return process.platform === 'darwin' ? 'Meta' : 'Control'
}

function sideHandle(
  page: Page,
  side: 'bottom' | 'left' | 'right' | 'top',
) {
  return page.locator(`[data-dom-edit-padding-kind="padding-${side}"]`)
}
