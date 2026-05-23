import type { CanvasAffordanceConfig } from '../../engine'

export type CanvasKeyboardReorderMode =
  | 'bringForward'
  | 'bringToFront'
  | 'sendBackward'
  | 'sendToBack'

export type CanvasKeyboardCommandShortcutIntent =
  | { kind: 'none'; preventDefault: false }
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

export type CanvasKeyboardCommandShortcutIntentInput = {
  config: CanvasAffordanceConfig
  event: globalThis.KeyboardEvent
  key: string
  mod: boolean
  selection: readonly string[]
}

export function getCanvasKeyboardCommandShortcutIntent({
  config,
  event,
  key,
  mod,
  selection,
}: CanvasKeyboardCommandShortcutIntentInput):
  CanvasKeyboardCommandShortcutIntent | null {
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

  return null
}
