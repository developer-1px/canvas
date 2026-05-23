import type { CanvasAffordanceConfig } from '../../engine'
import type { Tool } from '../../entities'
import {
  matchesCanvasAppCustomToolShortcut,
  type CanvasAppCustomCreationToolState,
} from '../tools/CanvasAppCustomCreationToolRuntime'

export type CanvasKeyboardReorderMode =
  | 'bringForward'
  | 'bringToFront'
  | 'sendBackward'
  | 'sendToBack'

export type CanvasKeyboardShortcutIntent =
  | { kind: 'none'; preventDefault: false }
  | { kind: 'open-find-replace'; preventDefault: true }
  | { kind: 'temporary-pan'; preventDefault: true }
  | { kind: 'escape'; preventDefault: false }
  | { kind: 'delete-selection'; preventDefault: true }
  | { kind: 'undo-history'; preventDefault: true }
  | { kind: 'redo-history'; preventDefault: true }
  | { kind: 'zoom-by'; multiplier: number; preventDefault: true }
  | { kind: 'reset-viewport'; preventDefault: true }
  | { kind: 'copy-selection'; preventDefault: true }
  | { kind: 'cut-selection'; preventDefault: true }
  | { kind: 'paste-selection'; preventDefault: true }
  | { kind: 'select-all'; preventDefault: true }
  | { kind: 'duplicate-selection'; preventDefault: true }
  | { kind: 'lock-selection'; preventDefault: true }
  | { kind: 'unlock-all'; preventDefault: true }
  | {
      kind: 'reorder-selection'
      mode: CanvasKeyboardReorderMode
      preventDefault: true
    }
  | { kind: 'group-selection'; preventDefault: true }
  | { kind: 'ungroup-selection'; preventDefault: true }
  | { dx: number; dy: number; kind: 'nudge-selection'; preventDefault: true }
  | { kind: 'fit-all'; preventDefault: true }
  | {
      ids: string[] | undefined
      kind: 'fit-selection'
      preventDefault: true
    }
  | { kind: 'set-tool'; preventDefault: false; tool: Tool }

export type CanvasKeyboardShortcutIntentInput = {
  config: CanvasAffordanceConfig
  customCreationTools: readonly CanvasAppCustomCreationToolState[]
  event: globalThis.KeyboardEvent
  selection: readonly string[]
}

export function getCanvasKeyboardShortcutIntent({
  config,
  customCreationTools,
  event,
  selection,
}: CanvasKeyboardShortcutIntentInput): CanvasKeyboardShortcutIntent {
  const key = event.key.toLowerCase()
  const mod = event.metaKey || event.ctrlKey

  if (mod && key === 'f') {
    return { kind: 'open-find-replace', preventDefault: true }
  }

  if (isCanvasKeyboardTypingTarget(event.target)) {
    return { kind: 'none', preventDefault: false }
  }

  if (
    config.shortcuts.temporaryPan &&
    config.gestures.temporaryPan &&
    event.code === 'Space'
  ) {
    return { kind: 'temporary-pan', preventDefault: true }
  }

  if (config.shortcuts.escape && event.key === 'Escape') {
    return { kind: 'escape', preventDefault: false }
  }

  if (
    config.shortcuts.delete &&
    config.commands.delete &&
    (event.key === 'Delete' || event.key === 'Backspace')
  ) {
    return { kind: 'delete-selection', preventDefault: true }
  }

  if (
    mod &&
    key === 'z' &&
    (event.shiftKey ? config.shortcuts.redo : config.shortcuts.undo)
  ) {
    return {
      kind: event.shiftKey ? 'redo-history' : 'undo-history',
      preventDefault: true,
    }
  }

  if (mod && key === 'y' && config.shortcuts.redo) {
    return { kind: 'redo-history', preventDefault: true }
  }

  if (
    mod &&
    (key === '=' || key === '+') &&
    config.shortcuts.zoomIn &&
    config.commands.zoomIn
  ) {
    return { kind: 'zoom-by', multiplier: 1.25, preventDefault: true }
  }

  if (
    mod &&
    key === '-' &&
    config.shortcuts.zoomOut &&
    config.commands.zoomOut
  ) {
    return { kind: 'zoom-by', multiplier: 0.8, preventDefault: true }
  }

  if (
    mod &&
    key === '0' &&
    config.shortcuts.zoomReset &&
    config.commands.zoomReset
  ) {
    return { kind: 'reset-viewport', preventDefault: true }
  }

  if (mod && key === 'c' && config.shortcuts.copy) {
    return { kind: 'copy-selection', preventDefault: true }
  }

  if (mod && key === 'x' && config.shortcuts.cut) {
    return { kind: 'cut-selection', preventDefault: true }
  }

  if (mod && key === 'v' && config.shortcuts.paste) {
    return { kind: 'paste-selection', preventDefault: true }
  }

  if (mod && key === 'a' && config.shortcuts.selectAll) {
    return { kind: 'select-all', preventDefault: true }
  }

  if (mod && key === 'd' && config.shortcuts.duplicate) {
    return { kind: 'duplicate-selection', preventDefault: true }
  }

  if (
    mod &&
    key === 'l' &&
    (event.shiftKey
      ? config.shortcuts.unlockAll
      : config.shortcuts.lockSelection)
  ) {
    return {
      kind: event.shiftKey ? 'unlock-all' : 'lock-selection',
      preventDefault: true,
    }
  }

  if (
    mod &&
    event.code === 'BracketRight' &&
    (event.shiftKey
      ? config.shortcuts.bringToFront
      : config.shortcuts.bringForward)
  ) {
    return {
      kind: 'reorder-selection',
      mode: event.shiftKey ? 'bringToFront' : 'bringForward',
      preventDefault: true,
    }
  }

  if (
    mod &&
    event.code === 'BracketLeft' &&
    (event.shiftKey ? config.shortcuts.sendToBack : config.shortcuts.sendBackward)
  ) {
    return {
      kind: 'reorder-selection',
      mode: event.shiftKey ? 'sendToBack' : 'sendBackward',
      preventDefault: true,
    }
  }

  if (
    mod &&
    key === 'g' &&
    (event.shiftKey ? config.shortcuts.ungroup : config.shortcuts.group)
  ) {
    return {
      kind: event.shiftKey ? 'ungroup-selection' : 'group-selection',
      preventDefault: true,
    }
  }

  if (
    config.shortcuts.nudge &&
    config.commands.nudge &&
    event.key.startsWith('Arrow')
  ) {
    if (selection.length === 0) {
      return { kind: 'none', preventDefault: false }
    }

    const distance = event.shiftKey ? 10 : 1
    const dx =
      event.key === 'ArrowLeft'
        ? -distance
        : event.key === 'ArrowRight'
          ? distance
          : 0
    const dy =
      event.key === 'ArrowUp'
        ? -distance
        : event.key === 'ArrowDown'
          ? distance
          : 0

    return { dx, dy, kind: 'nudge-selection', preventDefault: true }
  }

  if (config.shortcuts.fitAll && config.commands.fitView && event.key === '0') {
    return { kind: 'fit-all', preventDefault: true }
  }

  if (
    config.shortcuts.fitSelection &&
    config.commands.fitView &&
    event.key === '1'
  ) {
    return {
      ids: selection.length > 0 ? [...selection] : undefined,
      kind: 'fit-selection',
      preventDefault: true,
    }
  }

  if (event.metaKey || event.ctrlKey || event.altKey) {
    return { kind: 'none', preventDefault: false }
  }

  const tool = getCanvasKeyboardToolShortcutIntent({
    config,
    customCreationTools,
    event,
    key,
  })

  return tool
    ? { kind: 'set-tool', preventDefault: false, tool }
    : { kind: 'none', preventDefault: false }
}

export function isCanvasKeyboardTypingTarget(target: EventTarget | null) {
  return (
    (typeof HTMLInputElement !== 'undefined' &&
      target instanceof HTMLInputElement) ||
    (typeof HTMLTextAreaElement !== 'undefined' &&
      target instanceof HTMLTextAreaElement) ||
    (typeof HTMLElement !== 'undefined' &&
      target instanceof HTMLElement &&
      target.isContentEditable)
  )
}

function getCanvasKeyboardToolShortcutIntent({
  config,
  customCreationTools,
  event,
  key,
}: {
  config: CanvasAffordanceConfig
  customCreationTools: readonly CanvasAppCustomCreationToolState[]
  event: globalThis.KeyboardEvent
  key: string
}): Tool | null {
  if (config.shortcuts.selectTool && config.tools.select && key === 'v') {
    return 'select'
  }

  if (config.shortcuts.panTool && config.tools.pan && key === 'h') {
    return 'pan'
  }

  if (
    config.shortcuts.highlighterTool &&
    config.tools.highlight &&
    event.shiftKey &&
    key === 'm'
  ) {
    return 'highlight'
  }

  if (
    config.shortcuts.markerTool &&
    config.tools.marker &&
    !event.shiftKey &&
    key === 'm'
  ) {
    return 'marker'
  }

  if (config.shortcuts.arrowTool && config.tools.arrow && key === 'l') {
    return 'arrow'
  }

  if (config.shortcuts.rectTool && config.tools.rect && key === 'r') {
    return 'rect'
  }

  if (config.shortcuts.textTool && config.tools.text && key === 't') {
    return 'text'
  }

  const customTool = customCreationTools.find(
    (tool) =>
      tool.shortcut &&
      matchesCanvasAppCustomToolShortcut({
        event,
        shortcut: tool.shortcut,
      }),
  )

  return customTool?.id ?? null
}
