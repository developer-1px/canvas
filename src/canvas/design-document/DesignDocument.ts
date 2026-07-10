import {
  createJSONDocument,
  type JSONDocument,
} from '@interactive-os/json-document'
import { applyDesignDocumentChanges } from './DesignDocumentChanges'
import {
  DesignDocumentSnapshotSchema,
  parseDesignDocumentSnapshot,
} from './DesignDocumentSchema'
import { validateAndIndexDesignDocument } from './DesignDocumentValidation'
import type {
  DesignDocument,
  DesignDocumentCommand,
  DesignDocumentCommandResult,
  DesignDocumentRead,
  DesignDocumentSnapshot,
  DesignNode,
  DesignNodeId,
} from './DesignDocumentTypes'

export function createDesignDocument(
  initialSnapshot: unknown,
): DesignDocument {
  const initial = parseDesignDocumentSnapshot(initialSnapshot)
  let snapshot = freezeSnapshot(initial)
  let graph = validateAndIndexDesignDocument(snapshot)
  const listeners = new Set<() => void>()
  const store = createJSONDocument(
    DesignDocumentSnapshotSchema as never,
    initial as never,
    {
      history: 100,
      strict: false,
      trustedInitial: true,
    },
  ) as JSONDocument<DesignDocumentSnapshot>

  function synchronizeSnapshot() {
    const nextSnapshot = freezeSnapshot(
      parseDesignDocumentSnapshot(store.value),
    )

    graph = validateAndIndexDesignDocument(nextSnapshot)
    snapshot = nextSnapshot

    notifyListeners(listeners)
  }

  function execute(
    command: DesignDocumentCommand,
  ): DesignDocumentCommandResult {
    let nextSnapshot: DesignDocumentSnapshot

    try {
      nextSnapshot = freezeSnapshot(parseDesignDocumentSnapshot(
        applyDesignDocumentChanges(snapshot, command.changes),
      ))
      validateAndIndexDesignDocument(nextSnapshot)
    } catch (error) {
      return {
        ok: false,
        code: 'invalid-command',
        reason: getErrorMessage(error),
      }
    }

    if (areJSONValuesEqual(nextSnapshot, snapshot)) {
      return { ok: true, changed: false }
    }

    const result = store.commit(
      [{ op: 'replace', path: '', value: nextSnapshot }],
      { label: command.label, origin: 'design-document' },
    )

    if (!result.ok) {
      return {
        ok: false,
        code: 'invalid-command',
        reason: result.reason ?? result.code,
      }
    }

    synchronizeSnapshot()

    return { ok: true, changed: true }
  }

  function restoreHistory(direction: 'redo' | 'undo') {
    const result = direction === 'undo' ? store.undo() : store.redo()

    if (!result.ok) {
      return false
    }

    synchronizeSnapshot()

    return true
  }

  const read: DesignDocumentRead = {
    node(nodeId) {
      return graph.nodeById.get(nodeId) ?? null
    },
    roots() {
      return snapshot.roots.map((nodeId) =>
        requireNode(graph.nodeById, nodeId))
    },
    children(nodeId) {
      const node = graph.nodeById.get(nodeId)

      return node?.children.map((childId) =>
        requireNode(graph.nodeById, childId)) ?? []
    },
    ancestry(nodeId) {
      const ancestry: DesignNode[] = []
      let currentId: DesignNodeId | undefined = nodeId

      while (currentId) {
        ancestry.unshift(requireNode(graph.nodeById, currentId))
        currentId = graph.parentById.get(currentId)
      }

      return ancestry
    },
    componentPeers(nodeId) {
      const binding = graph.nodeById.get(nodeId)?.component

      if (!binding) {
        return []
      }

      return snapshot.nodes.filter((node) =>
        node.component?.definitionId === binding.definitionId &&
        node.component.slotId === binding.slotId)
    },
  }

  return {
    get snapshot() {
      return snapshot
    },
    read,
    execute,
    undo: () => restoreHistory('undo'),
    redo: () => restoreHistory('redo'),
    subscribe(listener) {
      listeners.add(listener)

      return () => listeners.delete(listener)
    },
    serialize() {
      return JSON.stringify(snapshot)
    },
  }
}

export function restoreDesignDocument(serialized: string): DesignDocument {
  return createDesignDocument(JSON.parse(serialized) as unknown)
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error)
}

function requireNode(
  nodeById: ReadonlyMap<DesignNodeId, DesignNode>,
  nodeId: DesignNodeId,
) {
  const node = nodeById.get(nodeId)

  if (!node) {
    throw new Error(`Unknown design node: ${nodeId}`)
  }

  return node
}

function freezeSnapshot(snapshot: DesignDocumentSnapshot) {
  return deepFreeze(
    JSON.parse(JSON.stringify(snapshot)) as DesignDocumentSnapshot,
  )
}

function deepFreeze<T>(value: T): T {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) {
    return value
  }

  Object.freeze(value)

  for (const child of Object.values(value)) {
    deepFreeze(child)
  }

  return value
}

function notifyListeners(listeners: ReadonlySet<() => void>) {
  for (const listener of listeners) {
    try {
      listener()
    } catch {
      // Observers cannot invalidate an authored commit or starve later observers.
    }
  }
}

function areJSONValuesEqual(left: unknown, right: unknown): boolean {
  if (Object.is(left, right)) {
    return true
  }

  if (Array.isArray(left) || Array.isArray(right)) {
    return Array.isArray(left) &&
      Array.isArray(right) &&
      left.length === right.length &&
      left.every((value, index) =>
        areJSONValuesEqual(value, right[index]))
  }

  if (
    left === null ||
    right === null ||
    typeof left !== 'object' ||
    typeof right !== 'object'
  ) {
    return false
  }

  const leftRecord = left as Record<string, unknown>
  const rightRecord = right as Record<string, unknown>
  const leftKeys = Object.keys(leftRecord)
  const rightKeys = Object.keys(rightRecord)

  return leftKeys.length === rightKeys.length &&
    leftKeys.every((key) =>
      Object.prototype.hasOwnProperty.call(rightRecord, key) &&
      areJSONValuesEqual(leftRecord[key], rightRecord[key]))
}
