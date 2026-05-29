import { expect, test } from '@playwright/test'

test('pastes HTML/CSS and edits preview target CSS through the inspector', async ({
  page,
}) => {
  await page.goto('/')
  await page.evaluate(() => {
    window.addEventListener('html-specimen-css:export', (event) => {
      const targetWindow = window as Window & {
        __htmlSpecimenExportedCss?: string
      }
      const detail = (event as CustomEvent<{ css?: unknown }>).detail

      targetWindow.__htmlSpecimenExportedCss =
        typeof detail.css === 'string' ? detail.css : ''
    })
  })

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
      '  border: 1px solid transparent;',
      '  border-color: transparent;',
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

  const specimenShell = page.locator('.demo-html-specimen-shell').last()
  const preview = page.locator('.demo-html-specimen-preview').last()

  await expect(preview).toBeVisible()
  await preview.locator('button#primary').hover()

  await expect(preview).toHaveAttribute('data-preview-hover-node-id', /dom:/)
  await expect.poll(async () =>
    preview.evaluate((host) => {
      const hovered = host.shadowRoot
        ?.querySelector('[data-html-specimen-preview-hover]')

      return hovered instanceof HTMLElement ? hovered.id : ''
    }),
  ).toBe('primary')
  await expect.poll(async () =>
    preview.evaluate((host) => {
      const overlay = host.shadowRoot
        ?.querySelector('[data-html-specimen-preview-overlay="hover"]')

      return overlay instanceof HTMLElement
        ? {
            height: Number.parseFloat(overlay.style.height),
            nodeId: overlay.dataset.previewNodeId ?? '',
            width: Number.parseFloat(overlay.style.width),
          }
        : null
    }),
  ).toMatchObject({
    height: expect.any(Number),
    nodeId: expect.stringMatching(/^dom:/),
    width: expect.any(Number),
  })

  await preview.locator('button#primary').click()

  await expect(preview).toHaveAttribute('data-preview-target-node-id', /dom:/)
  await expect.poll(async () =>
    preview.evaluate((host) => {
      const overlay = host.shadowRoot
        ?.querySelector('[data-html-specimen-preview-overlay="target"]')

      return overlay instanceof HTMLElement
        ? overlay.dataset.previewNodeId ?? ''
        : ''
    }),
  ).toMatch(/^dom:/)
  await expect.poll(async () =>
    preview.evaluate((host) => {
      const padding = host.shadowRoot?.querySelector(
        '[data-html-specimen-preview-spacing="target-padding"]',
      )
      const target = host.shadowRoot?.querySelector(
        '[data-html-specimen-preview-overlay="target"]',
      )

      if (
        !(padding instanceof HTMLElement) ||
        !(target instanceof HTMLElement)
      ) {
        return false
      }

      return (
        padding.dataset.previewNodeId === target.dataset.previewNodeId &&
        Number.parseFloat(padding.style.width) <
          Number.parseFloat(target.style.width) &&
        Number.parseFloat(padding.style.height) <
          Number.parseFloat(target.style.height)
      )
    }),
  ).toBe(true)
  await expect(page
    .locator('.html-specimen-css-field')
    .filter({ hasText: 'Radius' })
    .getByText('Rule .button / 2 nodes')).toBeVisible()
  await expect(page
    .locator('.html-specimen-css-field')
    .filter({ hasText: 'Font' })
    .locator('input')).toHaveValue('14px')

  const textInput = page
    .locator('.html-specimen-css-field')
    .filter({ hasText: 'Text' })
    .locator('input')

  await expect(textInput).toBeVisible()
  await textInput.fill('#facc15')
  await textInput.blur()

  await expect.poll(async () =>
    preview.evaluate((host) =>
      host.shadowRoot?.querySelector('style')?.textContent ?? ''),
  ).toContain('color: #facc15;')
  await expect.poll(async () =>
    preview.locator('button#primary').evaluate((button) =>
      getComputedStyle(button).color),
  ).toBe('rgb(250, 204, 21)')
  await expect(page
    .locator('.html-specimen-css-field')
    .filter({ hasText: 'Text' })
    .getByText('Rule .primary / 1 node')).toBeVisible()

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
  ).toContain('background: #111827;')
  await expect.poll(async () =>
    preview.evaluate((host) =>
      host.shadowRoot?.querySelector('style')?.textContent ?? ''),
  ).not.toContain('background-color: #111827;')
  await expect.poll(async () =>
    preview.locator('button#primary').evaluate((button) =>
      getComputedStyle(button).backgroundColor),
  ).toBe('rgb(17, 24, 39)')
  await expect(page
    .locator('.html-specimen-css-field')
    .filter({ hasText: 'Bg' })
    .getByText('Rule .primary / 1 node')).toBeVisible()

  const strokeInput = page
    .locator('.html-specimen-css-field')
    .filter({ hasText: 'Stroke' })
    .locator('input')

  await expect(strokeInput).toBeVisible()
  await strokeInput.fill('#f97316')
  await strokeInput.blur()

  await expect.poll(async () =>
    preview.evaluate((host) =>
      host.shadowRoot?.querySelector('style')?.textContent ?? ''),
  ).toContain('border-color: #f97316;')
  await expect.poll(async () =>
    preview.locator('button#primary').evaluate((button) =>
      getComputedStyle(button).borderTopColor),
  ).toBe('rgb(249, 115, 22)')
  await expect(page
    .locator('.html-specimen-css-field')
    .filter({ hasText: 'Stroke' })
    .getByText('Rule .button / 2 nodes')).toBeVisible()

  const fontInput = page
    .locator('.html-specimen-css-field')
    .filter({ hasText: 'Font' })
    .locator('input')

  await expect(fontInput).toBeVisible()
  await fontInput.fill('18px')
  await fontInput.blur()

  await expect.poll(async () =>
    preview.evaluate((host) =>
      host.shadowRoot?.querySelector('style')?.textContent ?? ''),
  ).toContain('font-size: 18px;')
  await expect.poll(async () =>
    preview.locator('button#primary').evaluate((button) =>
      getComputedStyle(button).fontSize),
  ).toBe('18px')
  await expect(page
    .locator('.html-specimen-css-field')
    .filter({ hasText: 'Font' })
    .getByText('Rule .button / 2 nodes')).toBeVisible()

  const radiusInput = page
    .locator('.html-specimen-css-field')
    .filter({ hasText: 'Radius' })
    .locator('input')

  await expect(radiusInput).toBeVisible()
  await radiusInput.fill('12px')
  await radiusInput.blur()

  await expect.poll(async () =>
    preview.evaluate((host) =>
      host.shadowRoot?.querySelector('style')?.textContent ?? ''),
  ).toContain('border-radius: 12px;')
  await expect.poll(async () =>
    preview.locator('button#primary').evaluate((button) =>
      getComputedStyle(button).borderTopLeftRadius),
  ).toBe('12px')
  await expect(page
    .locator('.html-specimen-css-field')
    .filter({ hasText: 'Radius' })
    .getByText('Rule .button / 2 nodes')).toBeVisible()

  const paddingInput = page
    .locator('.html-specimen-css-field')
    .filter({ hasText: 'Pad' })
    .locator('input')

  await expect(paddingInput).toBeVisible()
  await paddingInput.fill('8px 16px')
  await paddingInput.blur()

  await expect.poll(async () =>
    preview.evaluate((host) =>
      host.shadowRoot?.querySelector('style')?.textContent ?? ''),
  ).toContain('padding: 8px 16px;')
  await expect.poll(async () =>
    preview.locator('button#primary').evaluate((button) => {
      const style = getComputedStyle(button)

      return `${style.paddingTop} ${style.paddingLeft}`
    }),
  ).toBe('8px 16px')
  await expect(page
    .locator('.html-specimen-css-field')
    .filter({ hasText: 'Pad' })
    .getByText('Rule .button / 2 nodes')).toBeVisible()
  await expect.poll(async () =>
    preview.evaluate((host) => {
      const padding = host.shadowRoot?.querySelector(
        '[data-html-specimen-preview-spacing="target-padding"]',
      )
      const target = host.shadowRoot?.querySelector(
        '[data-html-specimen-preview-overlay="target"]',
      )

      return (
        padding instanceof HTMLElement &&
        target instanceof HTMLElement &&
        padding.dataset.previewNodeId === target.dataset.previewNodeId
      )
    }),
  ).toBe(true)

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
  await expect.poll(async () =>
    preview.evaluate((host) => {
      const margin = host.shadowRoot?.querySelector(
        '[data-html-specimen-preview-spacing="target-margin"]',
      )
      const target = host.shadowRoot?.querySelector(
        '[data-html-specimen-preview-overlay="target"]',
      )

      if (
        !(margin instanceof HTMLElement) ||
        !(target instanceof HTMLElement)
      ) {
        return false
      }

      return (
        margin.dataset.previewNodeId === target.dataset.previewNodeId &&
        Number.parseFloat(margin.style.width) >
          Number.parseFloat(target.style.width) &&
        Number.parseFloat(margin.style.height) >
          Number.parseFloat(target.style.height)
      )
    }),
  ).toBe(true)
  await specimenShell.getByRole('button', { name: 'Copy CSS' }).click()
  await expect.poll(async () =>
    page.evaluate(() =>
      (window as Window & {
        __htmlSpecimenExportedCss?: string
      }).__htmlSpecimenExportedCss ?? ''),
  ).toContain('background: #111827;')
  await expect.poll(async () =>
    page.evaluate(() =>
      (window as Window & {
        __htmlSpecimenExportedCss?: string
      }).__htmlSpecimenExportedCss ?? ''),
  ).not.toContain('background-color: #111827;')
  await expect.poll(async () =>
    page.evaluate(() =>
      (window as Window & {
        __htmlSpecimenExportedCss?: string
      }).__htmlSpecimenExportedCss ?? ''),
  ).toContain('color: #facc15;')
  await expect.poll(async () =>
    page.evaluate(() =>
      (window as Window & {
        __htmlSpecimenExportedCss?: string
      }).__htmlSpecimenExportedCss ?? ''),
  ).toContain('font-size: 18px;')
  await expect.poll(async () =>
    page.evaluate(() =>
      (window as Window & {
        __htmlSpecimenExportedCss?: string
      }).__htmlSpecimenExportedCss ?? ''),
  ).toContain('border-radius: 12px;')
  await expect.poll(async () =>
    page.evaluate(() =>
      (window as Window & {
        __htmlSpecimenExportedCss?: string
      }).__htmlSpecimenExportedCss ?? ''),
  ).toContain('margin: 4px;')
  await expect.poll(async () =>
    page.evaluate(() =>
      (window as Window & {
        __htmlSpecimenExportedCss?: string
      }).__htmlSpecimenExportedCss ?? ''),
  ).toContain('border-color: #f97316;')
  await expect.poll(async () =>
    page.evaluate(() =>
      (window as Window & {
        __htmlSpecimenExportedCss?: string
      }).__htmlSpecimenExportedCss ?? ''),
  ).toContain('padding: 8px 16px;')

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

test('adds missing CSS declarations to the most specific matching rule', async ({
  page,
}) => {
  await page.goto('/')
  await page.evaluate(() => {
    window.addEventListener('html-specimen-css:export', (event) => {
      const targetWindow = window as Window & {
        __htmlSpecimenExportedCss?: string
      }
      const detail = (event as CustomEvent<{ css?: unknown }>).detail

      targetWindow.__htmlSpecimenExportedCss =
        typeof detail.css === 'string' ? detail.css : ''
    })
  })

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
      '  color: #334155;',
      '}',
      '.primary {',
      '  background: #2563eb;',
      '}',
      '.button.primary {',
      '  border-radius: 6px;',
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

  const specimenShell = page.locator('.demo-html-specimen-shell').last()
  const preview = page.locator('.demo-html-specimen-preview').last()

  await expect(preview).toBeVisible()
  await preview.locator('button#primary').click()

  const fontField = page
    .locator('.html-specimen-css-field')
    .filter({ hasText: 'Font' })
  const fontInput = fontField.locator('input')

  await expect(fontField.getByText('Add .button.primary / 1 node')).toBeVisible()
  await expect(fontInput).toBeVisible()
  await fontInput.fill('18px')
  await fontInput.blur()

  await expect.poll(async () =>
    preview.evaluate((host) =>
      host.shadowRoot?.querySelector('style')?.textContent ?? ''),
  ).toContain('font-size: 18px;')
  await expect.poll(async () =>
    preview.locator('button#primary').evaluate((button) =>
      getComputedStyle(button).fontSize),
  ).toBe('18px')
  await expect(fontField.getByText('Rule .button.primary / 1 node')).toBeVisible()

  await specimenShell.getByRole('button', { name: 'Copy CSS' }).click()
  await expect.poll(async () =>
    page.evaluate(() =>
      (window as Window & {
        __htmlSpecimenExportedCss?: string
      }).__htmlSpecimenExportedCss ?? ''),
  ).toContain('font-size: 18px;')

  const previewHtml = await preview.evaluate((host) =>
    host.shadowRoot?.querySelector('[data-preview-surface-root]')
      ?.innerHTML ?? '')

  expect(previewHtml).not.toContain('style=')
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

test('edits CSS after strings and functions with separator characters', async ({
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
      '  /* note: ignore ; and } inside comments */',
      '  --asset: url("data:image/svg+xml;utf8,<svg>{}</svg>");',
      '  content: "semi; brace }";',
      '  color: #ffffff;',
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

  await expect(textField.getByText('Rule .primary / 1 node')).toBeVisible()
  await expect(textInput).toHaveValue('#ffffff')
  await textInput.fill('#111827')
  await textInput.blur()
  await expect.poll(async () =>
    preview.evaluate((host) =>
      host.shadowRoot?.querySelector('style')?.textContent ?? ''),
  ).toContain('color: #111827;')
  await expect.poll(async () =>
    preview.locator('button#primary').evaluate((button) =>
      getComputedStyle(button).color),
  ).toBe('rgb(17, 24, 39)')
})
