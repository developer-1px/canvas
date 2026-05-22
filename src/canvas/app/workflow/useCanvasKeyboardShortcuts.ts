import {
  useEffect,
  type Dispatch,
  type MutableRefObject,
  type SetStateAction,
} from 'react'
import type { CanvasAffordanceConfig } from '../../engine/CanvasAffordances'
import type { Bounds, Tool } from '../../engine/CanvasPrimitives'
import type { EditingText } from '../../host/CanvasModel'
import type { Interaction } from './CanvasInteractionState'

type UseCanvasKeyboardShortcutsArgs = {
  config: CanvasAffordanceConfig
  copySelection: () => void
  cutSelection: () => void
  deleteSelection: () => void
  duplicateSelection: () => void
  fitToItems: (ids?: string[]) => void
  groupSelection: () => void
  interactionRef: MutableRefObject<Interaction>
  lockSelection: () => void
  moveSelection: (dx: number, dy: number) => void
  pasteSelection: () => void
  redoHistory: () => void
  reorderSelection: (
    mode: 'bringForward' | 'bringToFront' | 'sendBackward' | 'sendToBack',
  ) => void
  selectAll: () => void
  selection: string[]
  setDraftRect: Dispatch<SetStateAction<Bounds | null>>
  setEditing: Dispatch<SetStateAction<EditingText | null>>
  setGesture: Dispatch<SetStateAction<Interaction['kind']>>
  setMarquee: Dispatch<SetStateAction<Bounds | null>>
  setSelection: Dispatch<SetStateAction<string[]>>
  setSpaceDown: Dispatch<SetStateAction<boolean>>
  setTool: Dispatch<SetStateAction<Tool>>
  undoHistory: () => void
  ungroupSelection: () => void
  unlockAll: () => void
}

function isTypingTarget(target: EventTarget | null) {
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    (target instanceof HTMLElement && target.isContentEditable)
  )
}

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
}: UseCanvasKeyboardShortcutsArgs) {
  useEffect(() => {
    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (isTypingTarget(event.target)) {
        return
      }

      if (
        config.shortcuts.temporaryPan &&
        config.gestures.temporaryPan &&
        event.code === 'Space'
      ) {
        event.preventDefault()
        setSpaceDown(true)
        return
      }

      if (config.shortcuts.escape && event.key === 'Escape') {
        interactionRef.current = { kind: 'none' }
        setGesture('none')
        setMarquee(null)
        setDraftRect(null)
        setEditing(null)
        setSelection([])
        setTool('select')
        return
      }

      if (
        config.shortcuts.delete &&
        config.commands.delete &&
        (event.key === 'Delete' || event.key === 'Backspace')
      ) {
        event.preventDefault()
        deleteSelection()
        return
      }

      const key = event.key.toLowerCase()
      const mod = event.metaKey || event.ctrlKey

      if (
        mod &&
        key === 'z' &&
        (event.shiftKey ? config.shortcuts.redo : config.shortcuts.undo)
      ) {
        event.preventDefault()

        if (event.shiftKey) {
          redoHistory()
        } else {
          undoHistory()
        }

        return
      }

      if (mod && key === 'y' && config.shortcuts.redo) {
        event.preventDefault()
        redoHistory()
        return
      }

      if (mod && key === 'c' && config.shortcuts.copy) {
        event.preventDefault()
        copySelection()
        return
      }

      if (mod && key === 'x' && config.shortcuts.cut) {
        event.preventDefault()
        cutSelection()
        return
      }

      if (mod && key === 'v' && config.shortcuts.paste) {
        event.preventDefault()
        pasteSelection()
        return
      }

      if (mod && key === 'a' && config.shortcuts.selectAll) {
        event.preventDefault()
        selectAll()
        return
      }

      if (mod && key === 'd' && config.shortcuts.duplicate) {
        event.preventDefault()
        duplicateSelection()
        return
      }

      if (
        mod &&
        key === 'l' &&
        (event.shiftKey
          ? config.shortcuts.unlockAll
          : config.shortcuts.lockSelection)
      ) {
        event.preventDefault()

        if (event.shiftKey) {
          unlockAll()
        } else {
          lockSelection()
        }

        return
      }

      if (
        mod &&
        event.code === 'BracketRight' &&
        (event.shiftKey
          ? config.shortcuts.bringToFront
          : config.shortcuts.bringForward)
      ) {
        event.preventDefault()
        reorderSelection(event.shiftKey ? 'bringToFront' : 'bringForward')
        return
      }

      if (
        mod &&
        event.code === 'BracketLeft' &&
        (event.shiftKey
          ? config.shortcuts.sendToBack
          : config.shortcuts.sendBackward)
      ) {
        event.preventDefault()
        reorderSelection(event.shiftKey ? 'sendToBack' : 'sendBackward')
        return
      }

      if (
        mod &&
        key === 'g' &&
        (event.shiftKey ? config.shortcuts.ungroup : config.shortcuts.group)
      ) {
        event.preventDefault()

        if (event.shiftKey) {
          ungroupSelection()
        } else {
          groupSelection()
        }

        return
      }

      if (
        config.shortcuts.nudge &&
        config.commands.nudge &&
        event.key.startsWith('Arrow')
      ) {
        if (selection.length === 0) {
          return
        }

        event.preventDefault()

        const distance = event.shiftKey ? 10 : 1
        const dx =
          event.key === 'ArrowLeft' ? -distance : event.key === 'ArrowRight' ? distance : 0
        const dy =
          event.key === 'ArrowUp' ? -distance : event.key === 'ArrowDown' ? distance : 0

        moveSelection(dx, dy)
        return
      }

      if (config.shortcuts.fitAll && config.commands.fitView && event.key === '0') {
        event.preventDefault()
        fitToItems()
        return
      }

      if (
        config.shortcuts.fitSelection &&
        config.commands.fitView &&
        event.key === '1'
      ) {
        event.preventDefault()
        fitToItems(selection.length > 0 ? selection : undefined)
        return
      }

      if (event.metaKey || event.ctrlKey || event.altKey) {
        return
      }

      if (config.shortcuts.selectTool && config.tools.select && key === 'v') {
        setTool('select')
      } else if (config.shortcuts.panTool && config.tools.pan && key === 'h') {
        setTool('pan')
      } else if (config.shortcuts.rectTool && config.tools.rect && key === 'r') {
        setTool('rect')
      } else if (config.shortcuts.textTool && config.tools.text && key === 't') {
        setTool('text')
      }
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
  ])
}
