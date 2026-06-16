import type { KeyboardEvent } from 'react'

type DomEditRadioItem = HTMLElement & {
  disabled?: boolean
}

export function handleDomEditRadioGroupKeyDown(
  event: KeyboardEvent<HTMLElement>,
) {
  const items = getDomEditRadioItems(event.currentTarget)
    .filter(isDomEditRadioItemEnabled)
  const currentIndex = items.findIndex((item) =>
    item === event.currentTarget.ownerDocument.activeElement)
  const nextIndex = getDomEditRadioKeyIndex({
    count: items.length,
    currentIndex,
    key: event.key,
  })

  if (nextIndex === null) {
    return
  }

  event.preventDefault()
  event.stopPropagation()
  items[nextIndex]?.focus()
  items[nextIndex]?.click()
}

export function getDomEditRadioTabIndex({
  checked,
  disabled = false,
}: {
  checked: boolean
  disabled?: boolean
}) {
  if (disabled) {
    return undefined
  }

  return checked ? 0 : -1
}

function getDomEditRadioItems(root: HTMLElement) {
  return Array.from(root.querySelectorAll<DomEditRadioItem>('[role="radio"]'))
}

function isDomEditRadioItemEnabled(item: DomEditRadioItem) {
  return !item.disabled && item.getAttribute('aria-disabled') !== 'true'
}

function getDomEditRadioKeyIndex({
  count,
  currentIndex,
  key,
}: {
  count: number
  currentIndex: number
  key: string
}) {
  if (count === 0 || currentIndex < 0) {
    return null
  }

  if (key === 'ArrowRight' || key === 'ArrowDown') {
    return (currentIndex + 1) % count
  }

  if (key === 'ArrowLeft' || key === 'ArrowUp') {
    return (currentIndex - 1 + count) % count
  }

  if (key === 'Home') {
    return 0
  }

  if (key === 'End') {
    return count - 1
  }

  return null
}
