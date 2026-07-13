import type { DesignNodeId } from '../design-document'

export type ReactDesignTextSelectionBookmark = {
  readonly anchorOffset: number
  readonly direction: 'backward' | 'forward' | 'none'
  readonly focusOffset: number
  readonly kind: 'text-control'
  readonly nodeId: DesignNodeId
}

export type ReactDesignTextSelectionOwnership = {
  capture(): ReactDesignTextSelectionBookmark | null
  release(): void
  restore(bookmark: ReactDesignTextSelectionBookmark): boolean
}

export type ReactDesignTextSelection = {
  claim(input: {
    readonly nodeId: DesignNodeId
    readonly readElement: () => HTMLInputElement | HTMLTextAreaElement | null
  }): ReactDesignTextSelectionOwnership
  dispose(): void
}

export function createReactDesignTextSelection({
  document,
}: {
  readonly document: Document
}): ReactDesignTextSelection {
  let disposed = false
  let focusGeneration = 0
  let ownershipGeneration = 0
  let activeReadElement: (() => HTMLInputElement | HTMLTextAreaElement | null) |
    null = null
  let lastFocusedElement: Element | null = null
  let pendingFocusReconciliation: {
    readonly generation: number
    readonly previous: Element
    readonly target: Element
  } | null = null

  const reconcileRemountedFocus = (
    pending = pendingFocusReconciliation,
  ) => {
    if (
      !pending ||
      pendingFocusReconciliation !== pending ||
      disposed ||
      focusGeneration !== pending.generation ||
      pending.previous.isConnected ||
      activeReadElement?.() !== pending.target
    ) {
      return false
    }

    pendingFocusReconciliation = null
    focusGeneration -= 1
    return true
  }

  const advanceFocusGeneration = (event: FocusEvent) => {
    const target = event.target

    if (!(target instanceof Element) || target === document.body) {
      return
    }

    const currentElement = activeReadElement?.() ?? null
    const previousFocusedElement = lastFocusedElement

    pendingFocusReconciliation = null

    if (
      target === currentElement &&
      previousFocusedElement !== null &&
      !previousFocusedElement.isConnected
    ) {
      lastFocusedElement = target
      return
    }

    focusGeneration += 1
    const generation = focusGeneration

    lastFocusedElement = target

    if (previousFocusedElement !== null) {
      const pending = {
        generation,
        previous: previousFocusedElement,
        target,
      }

      pendingFocusReconciliation = pending
      queueMicrotask(() => reconcileRemountedFocus(pending))
    }
  }

  document.addEventListener('focusin', advanceFocusGeneration)

  return {
    claim({ nodeId, readElement }) {
      if (disposed) {
        throw new Error('ReactDesignTextSelection is disposed')
      }

      ownershipGeneration += 1
      const generation = ownershipGeneration
      activeReadElement = readElement
      pendingFocusReconciliation = null
      let pending: {
        readonly bookmark: ReactDesignTextSelectionBookmark
        readonly element: HTMLInputElement | HTMLTextAreaElement
        readonly focusGeneration: number
      } | null = null

      return {
        capture() {
          if (disposed || generation !== ownershipGeneration) {
            return null
          }

          reconcileRemountedFocus()

          const element = readElement()

          if (
            !element ||
            document.activeElement !== element ||
            element.selectionStart === null ||
            element.selectionEnd === null
          ) {
            return null
          }

          const direction = normalizeDirection(element.selectionDirection)
          const backward = direction === 'backward'
          const bookmark = Object.freeze({
            anchorOffset: backward
              ? element.selectionEnd
              : element.selectionStart,
            direction,
            focusOffset: backward
              ? element.selectionStart
              : element.selectionEnd,
            kind: 'text-control',
            nodeId,
          } satisfies ReactDesignTextSelectionBookmark)

          pendingFocusReconciliation = null
          pending = { bookmark, element, focusGeneration }
          lastFocusedElement = element
          return bookmark
        },
        release() {
          pending = null

          if (generation === ownershipGeneration) {
            ownershipGeneration += 1
            activeReadElement = null
            pendingFocusReconciliation = null
          }
        },
        restore(bookmark) {
          const captured = pending

          reconcileRemountedFocus()

          if (
            disposed ||
            generation !== ownershipGeneration ||
            captured?.bookmark !== bookmark ||
            captured.focusGeneration !== focusGeneration ||
            bookmark.nodeId !== nodeId
          ) {
            return false
          }

          pending = null
          const element = readElement()
          const activeElement = document.activeElement
          const remountedIntoBody =
            (activeElement === document.body || activeElement === null) &&
            captured.element !== element &&
            !captured.element.isConnected &&
            lastFocusedElement === captured.element

          if (
            !element ||
            !element.isConnected ||
            element.selectionStart === null ||
            element.selectionEnd === null ||
            (activeElement !== element && !remountedIntoBody)
          ) {
            return false
          }

          const length = element.value.length
          const anchorOffset = clampOffset(bookmark.anchorOffset, length)
          const focusOffset = clampOffset(bookmark.focusOffset, length)

          element.focus({ preventScroll: true })

          if (
            disposed ||
            generation !== ownershipGeneration ||
            readElement() !== element ||
            document.activeElement !== element
          ) {
            return false
          }

          element.setSelectionRange(
            Math.min(anchorOffset, focusOffset),
            Math.max(anchorOffset, focusOffset),
            bookmark.direction,
          )
          return true
        },
      }
    },
    dispose() {
      if (disposed) {
        return
      }

      disposed = true
      ownershipGeneration += 1
      activeReadElement = null
      lastFocusedElement = null
      pendingFocusReconciliation = null
      document.removeEventListener('focusin', advanceFocusGeneration)
    },
  }
}

function normalizeDirection(
  direction: string | null,
): ReactDesignTextSelectionBookmark['direction'] {
  return direction === 'backward' || direction === 'forward'
    ? direction
    : 'none'
}

function clampOffset(offset: number, length: number) {
  return Math.min(length, Math.max(0, Math.trunc(offset)))
}
