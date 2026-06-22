import {
  useCallback,
  useState,
} from 'react'

export function useCanvasAppShellDialogState() {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [shortcutHelpOpen, setShortcutHelpOpen] = useState(false)
  const openCommandPalette = useCallback(() => {
    setCommandPaletteOpen(true)
  }, [])
  const closeCommandPalette = useCallback(() => {
    setCommandPaletteOpen(false)
  }, [])
  const openShortcutHelp = useCallback(() => {
    setShortcutHelpOpen(true)
    setCommandPaletteOpen(false)
  }, [])
  const closeShortcutHelp = useCallback(() => {
    setShortcutHelpOpen(false)
  }, [])

  return {
    closeCommandPalette,
    closeShortcutHelp,
    commandPaletteOpen,
    openCommandPalette,
    openShortcutHelp,
    shortcutHelpOpen,
  }
}
