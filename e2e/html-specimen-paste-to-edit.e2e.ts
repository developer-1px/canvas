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
  await expect(page
    .locator('.html-specimen-css-field')
    .filter({ hasText: 'Bg' })
    .getByText('Rule .primary / 1 node')).toBeVisible()

  const previewHtml = await preview.evaluate((host) =>
    host.shadowRoot?.querySelector('[data-preview-surface-root]')
      ?.innerHTML ?? '')

  expect(previewHtml).not.toContain('style=')
})
