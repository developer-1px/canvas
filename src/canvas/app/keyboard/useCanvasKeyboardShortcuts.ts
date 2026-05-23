import { useEffect } from 'react'
import {
  handleCanvasKeyboardShortcut,
  type CanvasKeyboardShortcutHandlers,
} from './CanvasKeyboardShortcutRouter'

export function useCanvasKeyboardShortcuts({
  commitSelection,
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
  openFindReplace,
  pasteSelection,
  redoHistory,
  resetViewport,
  reorderSelection,
  selectAll,
  selection,
  setDraftArrow,
  setDraftRect,
  setDraftStroke,
  setEditing,
  setGesture,
  setMarquee,
  setSpaceDown,
  setTool,
  undoHistory,
  ungroupSelection,
  unlockAll,
  zoomBy,
}: CanvasKeyboardShortcutHandlers) {
  useEffect(() => {
    const handlers: CanvasKeyboardShortcutHandlers = {
      commitSelection,
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
      openFindReplace,
      pasteSelection,
      redoHistory,
      resetViewport,
      reorderSelection,
      selectAll,
      selection,
      setDraftArrow,
      setDraftRect,
      setDraftStroke,
      setEditing,
      setGesture,
      setMarquee,
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
    commitSelection,
    config,
    cutSelection,
    deleteSelection,
    duplicateSelection,
    fitToItems,
    groupSelection,
    interactionRef,
    lockSelection,
    moveSelection,
    openFindReplace,
    pasteSelection,
    redoHistory,
    resetViewport,
    reorderSelection,
    selectAll,
    selection,
    setDraftArrow,
    setDraftRect,
    setDraftStroke,
    setEditing,
    setGesture,
    setMarquee,
    setSpaceDown,
    setTool,
    undoHistory,
    ungroupSelection,
    unlockAll,
    zoomBy,
  ])
}
