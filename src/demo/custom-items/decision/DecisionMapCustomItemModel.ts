import type {
  CanvasCustomItem,
  CanvasItem,
} from '../../../canvas'

export const DECISION_STATUSES = ['proposed', 'decided', 'blocked'] as const

export type DecisionStatus = (typeof DECISION_STATUSES)[number]

export function findDecisionItem(
  items: readonly CanvasItem[],
  id: string,
): CanvasCustomItem | null {
  for (const item of items) {
    if (isDecisionItem(item) && item.id === id) {
      return item
    }

    if (item.type === 'group') {
      const match = findDecisionItem(item.children, id)

      if (match) {
        return match
      }
    }
  }

  return null
}

export function replaceDecisionItem(
  items: readonly CanvasItem[],
  id: string,
  update: (decision: CanvasCustomItem) => CanvasCustomItem,
): {
  changed: boolean
  items: CanvasItem[]
} {
  let changed = false

  const nextItems = items.map((item): CanvasItem => {
    if (isDecisionItem(item) && item.id === id) {
      changed = true
      return update(item)
    }

    if (item.type === 'group') {
      const result = replaceDecisionItem(item.children, id, update)

      if (result.changed) {
        changed = true

        return {
          ...item,
          children: result.items,
        }
      }
    }

    return item
  })

  return {
    changed,
    items: nextItems,
  }
}

export function isDecisionItem(item: unknown): item is CanvasCustomItem {
  return (
    typeof item === 'object' &&
    item !== null &&
    'type' in item &&
    item.type === 'custom' &&
    'kind' in item &&
    item.kind === 'decision'
  )
}

export function isDecisionStatus(value: unknown): value is DecisionStatus {
  return (
    typeof value === 'string' &&
    (DECISION_STATUSES as readonly string[]).includes(value)
  )
}

export function getDecisionStatus(value: unknown): DecisionStatus {
  return isDecisionStatus(value) ? value : 'proposed'
}

export function getDecisionText(value: unknown, fallback: string) {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}
