import { expect, test, type Locator, type Page } from '@playwright/test'

test('shows nearest horizontal and vertical distance labels', async ({
  page,
}) => {
  await page.goto('/?demo=figma')
  await selectLayer(page, 'Select layer Workspace page', 'workspacePage')
  await selectLayer(page, 'Select layer Hero actions', 'workspaceHeroActions')
  await page.getByRole('button', { name: 'Measure tool' }).click()

  await expect(spacingGuide(page, {
    axis: 'x',
    family: 'distance',
    kind: 'nearest',
  })).toHaveCount(1)
  await expect(spacingGuide(page, {
    axis: 'y',
    family: 'distance',
    kind: 'nearest',
  })).toHaveCount(1)
  await expect(spacingLabel(spacingGuide(page, {
    axis: 'x',
    family: 'distance',
    kind: 'nearest',
  }))).toContainText(/\d+ px/)
  await expect(spacingLabel(spacingGuide(page, {
    axis: 'y',
    family: 'distance',
    kind: 'nearest',
  }))).toContainText(/\d+ px/)
})

test('keeps equal spacing labels stable under zoom and pan', async ({
  page,
}) => {
  await page.goto('/?demo=figma')
  await selectLayer(page, 'Select layer Workspace page', 'workspacePage')
  await selectLayer(page, 'Select layer Revenue stat', 'workspaceStatRevenue')
  await page.getByRole('button', { name: 'Measure tool' }).click()

  const cssGapEqualSpacing = spacingGuide(page, {
    axis: 'x',
    family: 'equal-spacing',
    source: 'css-gap',
  })
  await expect(cssGapEqualSpacing).toHaveCount(2)
  const labelText = await readRequiredText(spacingLabel(cssGapEqualSpacing.first()))

  await page.getByRole('button', { name: 'Zoom in' }).click()
  await expect(spacingLabel(cssGapEqualSpacing.first())).toHaveText(labelText)

  await page.keyboard.press('h')
  await expect(page.locator('.figma-direct-dom__stage')).toHaveAttribute(
    'data-mode',
    'pan',
  )
  await panCanvas(page, { x: 56, y: 28 })
  await expect(spacingLabel(cssGapEqualSpacing.first())).toHaveText(labelText)
  await page.keyboard.press('v')
  await expect(page.locator('.figma-direct-dom__stage'))
    .toHaveAttribute('data-mode', 'select')
})

test('marks margin-derived equal spacing without adding margin handles', async ({
  page,
}) => {
  await page.goto('/?demo=figma')
  await selectLayer(page, 'Select layer Workspace page', 'workspacePage')
  await selectLayer(page, 'Select layer Deal row 1', 'workspaceDealOne')
  await page.getByRole('spinbutton', { name: 'Mar' }).fill('10')
  await page.getByRole('button', { name: 'Measure tool' }).click()

  const marginDistance = spacingGuide(page, {
    axis: 'y',
    family: 'equal-spacing',
    kind: 'equal',
    source: 'margin',
  })

  await expect(marginDistance).toHaveCount(2)
  await expect(spacingLabel(marginDistance.first())).toContainText(/\d+ px/)
  await expect(page.locator('[data-dom-edit-margin-kind]')).toHaveCount(0)
  await expect(page.locator('.figma-autolayout-margin')).toHaveCount(0)
})

async function selectLayer(
  page: Page,
  buttonName: string,
  nodeId: string,
) {
  await page.getByRole('button', { name: buttonName }).click()
  await expect(domNode(page, nodeId)).toHaveAttribute('data-selected', 'true')
}

async function panCanvas(
  page: Page,
  delta: { x: number; y: number },
) {
  const stageBox = await getRequiredBox(
    page.locator('.figma-direct-dom__stage'),
  )
  const x = stageBox.x + 120
  const y = stageBox.y + 120

  await page.mouse.move(x, y)
  await page.mouse.down()
  await page.mouse.move(x + delta.x, y + delta.y, { steps: 6 })
  await page.mouse.up()
}

async function getRequiredBox(locator: Locator) {
  const box = await locator.boundingBox()

  expect(box).not.toBeNull()

  return box!
}

async function readRequiredText(locator: Locator) {
  const text = await locator.textContent()

  expect(text).not.toBeNull()

  return text!
}

function domNode(page: Page, nodeId: string) {
  return page.locator(`[data-design-node-id="${nodeId}"]`)
}

function spacingGuide(
  page: Page,
  filters: {
    axis?: 'x' | 'y'
    family?: 'distance' | 'equal-spacing'
    kind?: 'equal' | 'nearest'
    source?: 'css-gap' | 'margin' | 'visual-gap'
  } = {},
) {
  const axisSelector = filters.axis
    ? `[data-smart-guide-axis="${filters.axis}"]`
    : ''
  const familySelector = filters.family
    ? `[data-smart-guide-family="${filters.family}"]`
    : ''
  const kindSelector = filters.kind
    ? `[data-smart-guide-spacing-kind="${filters.kind}"]`
    : ''
  const sourceSelector = filters.source
    ? `[data-smart-guide-spacing-source="${filters.source}"]`
    : ''

  return page.locator(
    `.figma-smart-guide${axisSelector}${familySelector}${kindSelector}${sourceSelector}`,
  )
}

function spacingLabel(guide: Locator) {
  return guide.locator('[data-smart-guide-label="true"]')
}
