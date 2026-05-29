import { expect, test } from '@playwright/test'

test('pastes HTML/CSS and edits preview target CSS through the inspector', async ({
  page,
}) => {
  await page.goto('/')

  const pasteWasHandled = await page.evaluate((text) => {
    const data = new DataTransfer()

    data.setData('text/plain', text)

    const event = new ClipboardEvent('paste', {
      bubbles: true,
      cancelable: true,
      clipboardData: data,
    })

    window.dispatchEvent(event)

    return event.defaultPrevented
  }, JSON.stringify({
    css: [
      '.button {',
      '  border-radius: 6px;',
      '  font-size: 14px;',
      '  margin: 0;',
      '  padding: 12px 18px;',
      '}',
      '.primary {',
      '  color: #ffffff;',
      '  background: #2563eb;',
      '}',
    ].join('\n'),
    html: [
      '<main>',
      '<button id="primary" class="button primary">Save</button>',
      '<button id="secondary" class="button secondary">Cancel</button>',
      '<span id="orphan">Loose</span>',
      '</main>',
    ].join(''),
  }))

  expect(pasteWasHandled).toBe(true)

  const preview = page.locator('.demo-html-specimen-preview').last()

  await expect(preview).toBeVisible()

  await preview.locator('button#primary').click()

  await expect(preview).toHaveAttribute('data-preview-target-node-id', /dom:/)
  await expect(page
    .locator('.html-specimen-css-field')
    .filter({ hasText: 'Radius' })
    .getByText('Rule .button / 2 nodes')).toBeVisible()
  await expect(page
    .locator('.html-specimen-css-field')
    .filter({ hasText: 'Font' })
    .locator('input')).toHaveValue('14px')

  const backgroundInput = page
    .locator('.html-specimen-css-field')
    .filter({ hasText: 'Bg' })
    .locator('input')

  await expect(backgroundInput).toBeVisible()
  await backgroundInput.fill('#111827')
  await backgroundInput.blur()

  await expect.poll(async () =>
    preview.evaluate((host) =>
      host.shadowRoot?.querySelector('style')?.textContent ?? ''),
  ).toContain('background-color: #111827;')
  await expect.poll(async () =>
    preview.locator('button#primary').evaluate((button) =>
      getComputedStyle(button).backgroundColor),
  ).toBe('rgb(17, 24, 39)')
  await expect(page
    .locator('.html-specimen-css-field')
    .filter({ hasText: 'Bg' })
    .getByText('Rule .primary / 1 node')).toBeVisible()

  const marginInput = page
    .locator('.html-specimen-css-field')
    .filter({ hasText: 'Margin' })
    .locator('input')

  await expect(marginInput).toBeVisible()
  await marginInput.fill('4px')
  await marginInput.blur()

  await expect.poll(async () =>
    preview.evaluate((host) =>
      host.shadowRoot?.querySelector('style')?.textContent ?? ''),
  ).toContain('margin: 4px;')
  await expect.poll(async () =>
    preview.locator('button#primary').evaluate((button) =>
      getComputedStyle(button).marginTop),
  ).toBe('4px')

  const previewHtml = await preview.evaluate((host) =>
    host.shadowRoot?.querySelector('[data-preview-surface-root]')
      ?.innerHTML ?? '')

  expect(previewHtml).not.toContain('style=')

  await preview.locator('span#orphan').click()

  const unresolvedTextInput = page
    .locator('.html-specimen-css-field')
    .filter({ hasText: 'Text' })
    .locator('input')

  await expect(page.locator('.html-specimen-css-target')).toHaveText('span')
  await expect(page
    .locator('.html-specimen-css-field')
    .filter({ hasText: 'Text' })
    .getByText('No matching rule')).toBeVisible()
  await expect(unresolvedTextInput).toBeDisabled()
})

test('keeps token-backed preview CSS read-only in the inspector', async ({
  page,
}) => {
  await page.goto('/')

  const pasteWasHandled = await page.evaluate((text) => {
    const data = new DataTransfer()

    data.setData('text/plain', text)

    const event = new ClipboardEvent('paste', {
      bubbles: true,
      cancelable: true,
      clipboardData: data,
    })

    window.dispatchEvent(event)

    return event.defaultPrevented
  }, JSON.stringify({
    css: [
      ':root {',
      '  --brand: #2563eb;',
      '}',
      '.primary {',
      '  color: #ffffff;',
      '  background: var(--brand);',
      '}',
    ].join('\n'),
    html: [
      '<main>',
      '<button id="primary" class="primary">Save</button>',
      '</main>',
    ].join(''),
  }))

  expect(pasteWasHandled).toBe(true)

  const preview = page.locator('.demo-html-specimen-preview').last()

  await expect(preview).toBeVisible()
  await preview.locator('button#primary').click()

  const backgroundField = page
    .locator('.html-specimen-css-field')
    .filter({ hasText: 'Bg' })
  const backgroundInput = backgroundField.locator('input')

  await expect(backgroundField.getByText('Token .primary / 1 node')).toBeVisible()
  await expect(backgroundInput).toHaveValue('var(--brand)')
  await expect(backgroundInput).toBeDisabled()
  await expect.poll(async () =>
    preview.evaluate((host) =>
      host.shadowRoot?.querySelector('style')?.textContent ?? ''),
  ).toContain('background: var(--brand);')
})

test('keeps shorthand controls read-only when longhand declarations exist', async ({
  page,
}) => {
  await page.goto('/')

  const pasteWasHandled = await page.evaluate((text) => {
    const data = new DataTransfer()

    data.setData('text/plain', text)

    const event = new ClipboardEvent('paste', {
      bubbles: true,
      cancelable: true,
      clipboardData: data,
    })

    window.dispatchEvent(event)

    return event.defaultPrevented
  }, JSON.stringify({
    css: [
      '.primary {',
      '  color: #ffffff;',
      '  margin-top: 4px;',
      '}',
    ].join('\n'),
    html: [
      '<main>',
      '<button id="primary" class="primary">Save</button>',
      '</main>',
    ].join(''),
  }))

  expect(pasteWasHandled).toBe(true)

  const preview = page.locator('.demo-html-specimen-preview').last()

  await expect(preview).toBeVisible()
  await preview.locator('button#primary').click()

  const marginField = page
    .locator('.html-specimen-css-field')
    .filter({ hasText: 'Margin' })
  const marginInput = marginField.locator('input')

  await expect(marginField.getByText('Conflict .primary / 1 node')).toBeVisible()
  await expect(marginInput).toBeDisabled()
  await expect.poll(async () =>
    preview.evaluate((host) =>
      host.shadowRoot?.querySelector('style')?.textContent ?? ''),
  ).toContain('margin-top: 4px;')
})

test('keeps scoped at-rule CSS read-only in the inspector', async ({
  page,
}) => {
  await page.goto('/')

  const pasteWasHandled = await page.evaluate((text) => {
    const data = new DataTransfer()

    data.setData('text/plain', text)

    const event = new ClipboardEvent('paste', {
      bubbles: true,
      cancelable: true,
      clipboardData: data,
    })

    window.dispatchEvent(event)

    return event.defaultPrevented
  }, JSON.stringify({
    css: [
      '@media (min-width: 1px) {',
      '  .primary {',
      '    color: #ffffff;',
      '  }',
      '}',
    ].join('\n'),
    html: [
      '<main>',
      '<button id="primary" class="primary">Save</button>',
      '</main>',
    ].join(''),
  }))

  expect(pasteWasHandled).toBe(true)

  const preview = page.locator('.demo-html-specimen-preview').last()

  await expect(preview).toBeVisible()
  await preview.locator('button#primary').click()

  const textField = page
    .locator('.html-specimen-css-field')
    .filter({ hasText: 'Text' })
  const textInput = textField.locator('input')

  await expect(textField
    .getByText('Scoped @media (min-width: 1px) / .primary / 1 node'),
  ).toBeVisible()
  await expect(textInput).toHaveValue('#ffffff')
  await expect(textInput).toBeDisabled()
  await expect.poll(async () =>
    preview.evaluate((host) =>
      host.shadowRoot?.querySelector('style')?.textContent ?? ''),
  ).toContain('@media (min-width: 1px)')
})
