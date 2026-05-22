import { useEffect } from 'react'
import {
  handleCanvasKeyboardShortcut,
  type CanvasKeyboardShortcutHandlers,
} from './CanvasKeyboardShortcutRouter'

export function useCanvasKeyboardShortcuts({
  config,
  copySelection,
  cutSelection,
  deleteSelection,
  duplicateSelection,
  fitToItems,
  groupSelection,
  interactionRef,
  lockSelection,
  moveSelection,
  pasteSelection,
  redoHistory,
  resetViewport,
  reorderSelection,
  selectAll,
  selection,
  setDraftRect,
  setEditing,
  setGesture,
  setMarquee,
  setSelection,
  setSpaceDown,
  setTool,
  undoHistory,
  ungroupSelection,
  unlockAll,
  zoomBy,
}: CanvasKeyboardShortcutHandlers) {
  useEffect(() => {
    const handlers: CanvasKeyboardShortcutHandlers = {
      config,
      copySelection,
      cutSelection,
      deleteSelection,
      duplicateSelection,
      fitToItems,
      groupSelection,
      interactionRef,
      lockSelection,
      moveSelection,
      pasteSelection,
      redoHistory,
      resetViewport,
      reorderSelection,
      selectAll,
      selection,
      setDraftRect,
      setEditing,
      setGesture,
      setMarquee,
      setSelection,
      setSpaceDown,
      setTool,
      undoHistory,
      ungroupSelection,
      unlockAll,
      zoomBy,
    }

    function handleKeyDown(event: globalThis.KeyboardEvent) {
      handleCanvasKeyboardShortcut(event, handlers)
    }

    function handleKeyUp(event: globalThis.KeyboardEvent) {
      if (config.shortcuts.temporaryPan && event.code === 'Space') {
        setSpaceDown(false)
      }
    }

    function handleWindowBlur() {
      setSpaceDown(false)
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('blur', handleWindowBlur)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('blur', handleWindowBlur)
    }
  }, [
    copySelection,
    config,
    cutSelection,
    deleteSelection,
    duplicateSelection,
    fitToItems,
    groupSelection,
    interactionRef,
    lockSelection,
    moveSelection,
    pasteSelection,
    redoHistory,
    resetViewport,
    reorderSelection,
    selectAll,
    selection,
    setDraftRect,
    setEditing,
    setGesture,
    setMarquee,
    setSelection,
    setSpaceDown,
    setTool,
    undoHistory,
    ungroupSelection,
    unlockAll,
    zoomBy,
  ])
}
