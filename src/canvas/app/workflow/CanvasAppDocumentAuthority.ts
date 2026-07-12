import type { CanvasItem } from '../../entities'
import type {
  CanvasAppCommitItemsChange,
  CanvasAppDocumentAuthority,
  CanvasAppDocumentAuthorityRead,
  CanvasAppDocumentMutationCapability,
  CanvasAppItemsChange,
} from '../workspace/document/CanvasAppDocumentContracts'
import type { CanvasAppCapability } from '../CanvasAppCapabilityContracts'
import type { CanvasAppCapabilitySnapshot } from '../CanvasAppCapabilityContracts'
import { createCanvasAppCapabilityAffordanceConfigInput } from './CanvasAppCapabilityAssembly'

export function createCanvasAppDocumentAuthorityRead(
  capabilities: CanvasAppCapabilitySnapshot,
): CanvasAppDocumentAuthorityRead {
  const snapshot = Object.isFrozen(capabilities)
    ? capabilities
    : Object.freeze({ ...capabilities })

  return Object.freeze({
    capabilities: snapshot,
    can(capability: CanvasAppCapability) {
      return snapshot[capability]
    },
  })
}

export function createCanvasAppDocumentAuthorityAffordanceConfigInput(
  read: CanvasAppDocumentAuthorityRead,
) {
  return createCanvasAppCapabilityAffordanceConfigInput(read.capabilities)
}

export function createCanvasAppDocumentAuthority({
  commitItemsChange,
  readItems,
  read,
}: {
  readonly commitItemsChange: CanvasAppCommitItemsChange
  readonly readItems: () => readonly CanvasItem[]
  readonly read: CanvasAppDocumentAuthorityRead
}): CanvasAppDocumentAuthority {
  return Object.freeze({
    ...read,
    commit({ change, selection }) {
      try {
        const requiredCapability = getCanvasAppDocumentMutationCapability(
          change,
          readItems(),
        )

        if (!read.can(requiredCapability)) {
          return {
            code: 'capability-denied',
            ok: false,
            requiredCapability,
          }
        }

        return commitItemsChange(change, selection)
          ? { ok: true }
          : { code: 'mutation-rejected', ok: false }
      } catch {
        return { code: 'mutation-rejected', ok: false }
      }
    },
  })
}

function getCanvasAppDocumentMutationCapability(
  change: CanvasAppItemsChange,
  currentItems: readonly CanvasItem[],
): CanvasAppDocumentMutationCapability {
  return isCanvasAppCommentMutation(change, currentItems)
    ? 'comment'
    : 'editDocument'
}

function isCanvasAppCommentMutation(
  change: CanvasAppItemsChange,
  currentItems: readonly CanvasItem[],
) {
  switch (change.type) {
    case 'add':
      return change.items.length > 0 &&
        change.items.every((item) => item.type === 'comment')
    case 'replace-changed':
      return replacesOnlyCanvasComments(currentItems, change.items)
    case 'set-text':
      return findCanvasAppDocumentItem(currentItems, change.id)?.type ===
        'comment'
    default:
      return false
  }
}

function replacesOnlyCanvasComments(
  currentItems: readonly CanvasItem[],
  nextItems: readonly CanvasItem[],
) {
  const changedCommentCount = compareCanvasAppCommentMutationItems(
    currentItems,
    nextItems,
  )

  return changedCommentCount !== null && changedCommentCount > 0
}

function areCanvasAppDocumentItemsEqual(left: CanvasItem, right: CanvasItem) {
  return JSON.stringify(left) === JSON.stringify(right)
}

function compareCanvasAppCommentMutationItems(
  currentItems: readonly CanvasItem[],
  nextItems: readonly CanvasItem[],
): number | null {
  const currentNonCommentIds = currentItems
    .filter((item) => item.type !== 'comment')
    .map((item) => item.id)
  const nextNonCommentIds = nextItems
    .filter((item) => item.type !== 'comment')
    .map((item) => item.id)

  if (JSON.stringify(currentNonCommentIds) !== JSON.stringify(nextNonCommentIds)) {
    return null
  }

  const currentById = new Map(currentItems.map((item) => [item.id, item]))
  const nextById = new Map(nextItems.map((item) => [item.id, item]))
  let changedCommentCount = 0

  for (const itemId of new Set([...currentById.keys(), ...nextById.keys()])) {
    const current = currentById.get(itemId)
    const next = nextById.get(itemId)

    if (!current || !next) {
      const existing = current ?? next

      if (existing?.type !== 'comment') {
        return null
      }

      changedCommentCount += 1
      continue
    }

    if (current.type !== next.type) {
      return null
    }

    if (current.type === 'comment' && next.type === 'comment') {
      if (!areCanvasAppDocumentItemsEqual(current, next)) {
        changedCommentCount += 1
      }
      continue
    }

    if (current.type === 'group' && next.type === 'group') {
      const { children: currentChildren, ...currentGroup } = current
      const { children: nextChildren, ...nextGroup } = next

      if (JSON.stringify(currentGroup) !== JSON.stringify(nextGroup)) {
        return null
      }

      const nestedChangedCommentCount = compareCanvasAppCommentMutationItems(
        currentChildren,
        nextChildren,
      )

      if (nestedChangedCommentCount === null) {
        return null
      }

      changedCommentCount += nestedChangedCommentCount
      continue
    }

    if (!areCanvasAppDocumentItemsEqual(current, next)) {
      return null
    }
  }

  return changedCommentCount
}

function findCanvasAppDocumentItem(
  items: readonly CanvasItem[],
  itemId: string,
): CanvasItem | null {
  for (const item of items) {
    if (item.id === itemId) {
      return item
    }

    if (item.type === 'group') {
      const child = findCanvasAppDocumentItem(item.children, itemId)

      if (child) {
        return child
      }
    }
  }

  return null
}
