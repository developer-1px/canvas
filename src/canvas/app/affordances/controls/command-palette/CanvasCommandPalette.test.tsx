import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { CanvasCommandPalette } from './CanvasCommandPalette'
import type { CanvasCommandPaletteItem } from './CanvasCommandPaletteItems'

describe('CanvasCommandPalette', () => {
  it('connects the search combobox to the command listbox and active option', () => {
    const markup = renderToStaticMarkup(
      <CanvasCommandPalette
        open
        items={[
          createItem({ id: 'tool:select', title: 'Select' }),
          createItem({ disabled: true, id: 'command:delete', title: 'Delete' }),
        ]}
        onClose={vi.fn()}
      />,
    )

    const controlsMatch = markup.match(/aria-controls="([^"]+)"/)
    const activeDescendantMatch = markup.match(/aria-activedescendant="([^"]+)"/)

    expect(markup).toContain('role="combobox"')
    expect(markup).toContain('aria-autocomplete="list"')
    expect(markup).toContain('aria-expanded="true"')
    expect(controlsMatch?.[1]).toBeTruthy()
    expect(markup).toContain(`id="${controlsMatch?.[1]}"`)
    expect(markup).toContain('role="listbox"')
    expect(markup).toContain('aria-label="Command results"')
    expect(activeDescendantMatch?.[1]).toBeTruthy()
    expect(markup).toContain(`id="${activeDescendantMatch?.[1]}"`)
    expect(markup).toContain('aria-selected="true"')
    expect(markup).toContain('aria-disabled="true"')
  })
})

function createItem(
  overrides: Partial<CanvasCommandPaletteItem>,
): CanvasCommandPaletteItem {
  return {
    id: 'item',
    section: 'Commands',
    title: 'Command',
    onSelect: vi.fn(),
    ...overrides,
  }
}
