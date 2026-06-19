import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const COMMAND_PALETTE = fileURLToPath(
  new URL(
    '../app/feature-packs/command-palette/CanvasCommandPalette.tsx',
    import.meta.url,
  ),
)
const SHORTCUT_HELP = fileURLToPath(
  new URL(
    '../app/feature-packs/shortcut-help/CanvasShortcutHelpOverlay.tsx',
    import.meta.url,
  ),
)

describe('Canvas modal backdrop pointer contract', () => {
  it('dismisses command modal backdrops with pointer events', () => {
    const commandPaletteSource = readFileSync(COMMAND_PALETTE, 'utf8')
    const shortcutHelpSource = readFileSync(SHORTCUT_HELP, 'utf8')

    expect(commandPaletteSource).toContain('type PointerEvent')
    expect(commandPaletteSource).toContain('handleBackdropPointerDown')
    expect(commandPaletteSource).toContain(
      'onPointerDown={handleBackdropPointerDown}',
    )
    expect(commandPaletteSource).not.toContain('onMouseDown=')
    expect(commandPaletteSource).not.toContain('type MouseEvent')

    expect(shortcutHelpSource).toContain('type PointerEvent')
    expect(shortcutHelpSource).toContain('handleBackdropPointerDown')
    expect(shortcutHelpSource).toContain(
      'onPointerDown={handleBackdropPointerDown}',
    )
    expect(shortcutHelpSource).toMatch(
      /if \(backdropPointerIntent\.kind === 'dismiss'\) \{\s*event\.preventDefault\(\)\s*onClose\(\)\s*\}/,
    )
    expect(shortcutHelpSource).not.toContain('onMouseDown=')
    expect(shortcutHelpSource).not.toContain('type MouseEvent')
  })
})
