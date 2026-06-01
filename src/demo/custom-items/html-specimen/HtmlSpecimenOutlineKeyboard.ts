import type { KeyboardEvent } from 'react'
import {
  deleteHtmlSpecimenOutlineNode,
  demoteHtmlSpecimenOutlineNode,
  duplicateHtmlSpecimenOutlineNode,
  moveHtmlSpecimenOutlineNode,
  promoteHtmlSpecimenOutlineNode,
  type HtmlSpecimenOutline,
  type HtmlSpecimenOutlineEditResult,
} from './HtmlSpecimenOutline'
import {
  dispatchHtmlSpecimenPreviewFocusRequest,
} from './HtmlSpecimenPreviewFocusRequest'
import type { HtmlSpecimenOutlineRow } from './HtmlSpecimenOutlineRows'

export type HtmlSpecimenOutlineCommand =
  | 'copy'
  | 'cut'
  | 'delete'
  | 'demote'
  | 'duplicate'
  | 'edit'
  | 'focus-child'
  | 'focus-first'
  | 'focus-last'
  | 'focus-next'
  | 'focus-parent'
  | 'focus-prev'
  | 'move-down'
  | 'move-up'
  | 'paste-child'
  | 'paste-sibling'
  | 'promote'

type HtmlSpecimenOutlineFocusCommand = Extract<
  HtmlSpecimenOutlineCommand,
  | 'focus-child'
  | 'focus-first'
  | 'focus-last'
  | 'focus-next'
  | 'focus-parent'
  | 'focus-prev'
>

export function runHtmlSpecimenOutlineCommand({
  command,
  nodeId,
  outline,
}: {
  command: HtmlSpecimenOutlineCommand
  nodeId: string
  outline: HtmlSpecimenOutline
}): HtmlSpecimenOutlineEditResult {
  if (command === 'delete') {
    return deleteHtmlSpecimenOutlineNode({ nodeId, outline })
  }

  if (command === 'demote') {
    return demoteHtmlSpecimenOutlineNode({ nodeId, outline })
  }

  if (command === 'duplicate') {
    return duplicateHtmlSpecimenOutlineNode({ nodeId, outline })
  }

  if (command === 'move-down') {
    return moveHtmlSpecimenOutlineNode({
      direction: 'down',
      nodeId,
      outline,
    })
  }

  if (command === 'move-up') {
    return moveHtmlSpecimenOutlineNode({
      direction: 'up',
      nodeId,
      outline,
    })
  }

  if (command === 'promote') {
    return promoteHtmlSpecimenOutlineNode({ nodeId, outline })
  }

  return { ok: false, reason: 'invalid-target' }
}

export function focusHtmlSpecimenOutlineKeyboardRow({
  command,
  focusNodeId,
  rows,
  targetItemId,
}: {
  command: HtmlSpecimenOutlineFocusCommand
  focusNodeId: string
  rows: readonly HtmlSpecimenOutlineRow[]
  targetItemId: string
}) {
  const currentIndex = rows.findIndex((row) => row.id === focusNodeId)
  const current = rows[currentIndex] ?? null
  let next: HtmlSpecimenOutlineRow | null = null

  if (command === 'focus-first') {
    next = rows[0] ?? null
  }

  if (command === 'focus-last') {
    next = rows.at(-1) ?? null
  }

  if (command === 'focus-prev') {
    next = rows[currentIndex - 1] ?? null
  }

  if (command === 'focus-next') {
    next = rows[currentIndex + 1] ?? null
  }

  if (command === 'focus-parent' && current) {
    next = rows.find((row) =>
      isSameHtmlSpecimenOutlinePath(
        row.path,
        current.path.slice(0, -1),
      )
    ) ?? null
  }

  if (command === 'focus-child' && current) {
    next = rows.find((row) =>
      isDirectHtmlSpecimenOutlineChildPath({
        childPath: row.path,
        parentPath: current.path,
      })
    ) ?? null
  }

  if (!next) {
    return false
  }

  dispatchHtmlSpecimenPreviewFocusRequest(window, {
    itemId: targetItemId,
    nodeId: next.id,
  })

  return true
}

export function getHtmlSpecimenOutlineKeyboardCommand(
  event: KeyboardEvent,
): HtmlSpecimenOutlineCommand | null {
  const isMod = event.metaKey || event.ctrlKey

  if (event.key === 'Enter' && !event.shiftKey && !isMod) {
    return 'edit'
  }

  if (event.key === 'Tab') {
    return event.shiftKey ? 'promote' : 'demote'
  }

  if (event.key === 'Backspace' || event.key === 'Delete') {
    return 'delete'
  }

  if (event.key === 'ArrowUp' && isMod) {
    return 'move-up'
  }

  if (event.key === 'ArrowDown' && isMod) {
    return 'move-down'
  }

  if (event.key === 'Home' && !event.shiftKey && !isMod) {
    return 'focus-first'
  }

  if (event.key === 'End' && !event.shiftKey && !isMod) {
    return 'focus-last'
  }

  if (event.key === 'ArrowLeft' && !event.shiftKey && !isMod) {
    return 'focus-parent'
  }

  if (event.key === 'ArrowRight' && !event.shiftKey && !isMod) {
    return 'focus-child'
  }

  if (event.key === 'ArrowUp' && !event.shiftKey && !isMod) {
    return 'focus-prev'
  }

  if (event.key === 'ArrowDown' && !event.shiftKey && !isMod) {
    return 'focus-next'
  }

  if (!isMod) {
    return null
  }

  const key = event.key.toLowerCase()

  if (key === 'c') {
    return 'copy'
  }

  if (key === 'x') {
    return 'cut'
  }

  if (key === 'v') {
    return event.shiftKey ? 'paste-child' : 'paste-sibling'
  }

  if (key === 'd') {
    return 'duplicate'
  }

  return null
}

export function isHtmlSpecimenOutlineFocusCommand(
  command: HtmlSpecimenOutlineCommand,
): command is HtmlSpecimenOutlineFocusCommand {
  return command === 'focus-child' ||
    command === 'focus-first' ||
    command === 'focus-last' ||
    command === 'focus-next' ||
    command === 'focus-parent' ||
    command === 'focus-prev'
}

export function isHtmlSpecimenOutlineTextEntryTarget(
  target: EventTarget | null,
) {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  return target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target.isContentEditable
}

export function getHtmlSpecimenOutlineRowElementId(nodeId: string) {
  return `html-specimen-outline-row-${nodeId}`
}

function isSameHtmlSpecimenOutlinePath(
  left: readonly number[],
  right: readonly number[],
) {
  return left.length === right.length &&
    left.every((value, index) => value === right[index])
}

function isDirectHtmlSpecimenOutlineChildPath({
  childPath,
  parentPath,
}: {
  childPath: readonly number[]
  parentPath: readonly number[]
}) {
  return childPath.length === parentPath.length + 1 &&
    parentPath.every((value, index) => childPath[index] === value)
}
