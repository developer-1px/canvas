import { expect, test } from '@playwright/test'

test('settles local and remote DOM before restoring a stable selection', async ({
  page,
}) => {
  await page.goto('/e2e/fixtures/react-design-dom-settle.html')

  const tracer = page.locator('main')

  await page.getByRole('button', { name: 'Start edit' }).click()
  const editor = page.getByRole('textbox', { name: 'Note A editor' })

  await editor.fill('Local A')
  await page.getByRole('button', { name: 'Queue remote' }).click()

  await expect(tracer).toHaveAttribute('data-status', 'host_not_ready')
  await expect(tracer).toHaveAttribute('data-note-b', 'Draft B')

  await editor.focus()
  await editor.evaluate((element) => {
    element.setSelectionRange(2, 5, 'backward')
  })
  await editor.press('Control+Enter')

  await expect(tracer).toHaveAttribute('data-status', 'selection-restored')
  await expect(tracer).toHaveAttribute('data-note-a', 'Local A')
  await expect(tracer).toHaveAttribute('data-note-b', 'Remote B')
  await expect(editor).toBeFocused()
  await expect.poll(() => editor.evaluate((element) => ({
    direction: element.selectionDirection,
    end: element.selectionEnd,
    start: element.selectionStart,
  }))).toEqual({ direction: 'backward', end: 5, start: 2 })
})
