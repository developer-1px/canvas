import { useEffect } from 'react'
import type { Viewport } from '../../core'
import type { CanvasItem } from '../../host/model'
import {
  clamp,
  MAX_SCALE,
  MIN_SCALE,
} from '../../core'
import {
  flattenCanvasItems,
  normalizeCanvasItems,
  pruneNestedSelection,
} from '../../host'

export const CANVAS_WORKSPACE_STORAGE_KEY =
  'interactive-os.canvas.workspace.v1'

const CANVAS_WORKSPACE_VERSION = 1
const SAVE_DELAY_MS = 120

type CanvasWorkspaceStorage = Pick<Storage, 'getItem' | 'setItem'>

export type CanvasWorkspaceSnapshot = {
  items: CanvasItem[]
  selection: string[]
  version: typeof CANVAS_WORKSPACE_VERSION
  viewport: Viewport
}

type CanvasWorkspacePersistenceArgs = {
  items: CanvasItem[]
  selection: string[]
  viewport: Viewport
}

export function useCanvasWorkspacePersistence({
  items,
  selection,
  viewport,
}: CanvasWorkspacePersistenceArgs) {
  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined
    }

    const timeout = window.setTimeout(() => {
      writeStoredCanvasWorkspace({ items, selection, viewport })
    }, SAVE_DELAY_MS)

    return () => window.clearTimeout(timeout)
  }, [items, selection, viewport])
}

export function readStoredCanvasWorkspace(
  storage: CanvasWorkspaceStorage | null = getCanvasWorkspaceStorage(),
) {
  if (!storage) {
    return null
  }

  try {
    return parseCanvasWorkspaceSnapshot(
      storage.getItem(CANVAS_WORKSPACE_STORAGE_KEY),
    )
  } catch {
    return null
  }
}

export function writeStoredCanvasWorkspace(
  snapshot: CanvasWorkspacePersistenceArgs,
  storage: CanvasWorkspaceStorage | null = getCanvasWorkspaceStorage(),
) {
  if (!storage) {
    return
  }

  try {
    storage.setItem(
      CANVAS_WORKSPACE_STORAGE_KEY,
      JSON.stringify(createCanvasWorkspaceSnapshot(snapshot)),
    )
  } catch {
    // Storage can fail in private mode or when the quota is full.
  }
}

export function parseCanvasWorkspaceSnapshot(
  value: string | null,
): CanvasWorkspaceSnapshot | null {
  if (!value) {
    return null
  }

  try {
    return normalizeCanvasWorkspaceSnapshot(JSON.parse(value))
  } catch {
    return null
  }
}

export function createCanvasWorkspaceSnapshot({
  items,
  selection,
  viewport,
}: CanvasWorkspacePersistenceArgs): CanvasWorkspaceSnapshot {
  const normalizedItems = normalizeCanvasItems(items)
  const normalizedViewport = normalizeViewport(viewport)

  if (!normalizedViewport) {
    throw new Error('Invalid canvas viewport')
  }

  return {
    items: normalizedItems,
    selection: sanitizeCanvasSelection(normalizedItems, selection),
    version: CANVAS_WORKSPACE_VERSION,
    viewport: normalizedViewport,
  }
}

export function getCanvasItemIdSeed(items: CanvasItem[]) {
  const numericSuffixes = flattenCanvasItems(items)
    .map(({ item }) => item.id.match(/-(\d+)$/)?.[1])
    .filter((value): value is string => value !== undefined)
    .map((value) => Number.parseInt(value, 10))
    .filter(Number.isFinite)

  return Math.max(items.length, 0, ...numericSuffixes)
}

function normalizeCanvasWorkspaceSnapshot(
  value: unknown,
): CanvasWorkspaceSnapshot | null {
  if (!isRecord(value) || value.version !== CANVAS_WORKSPACE_VERSION) {
    return null
  }

  if (!Array.isArray(value.items)) {
    return null
  }

  const viewport = normalizeViewport(value.viewport)

  if (!viewport) {
    return null
  }

  const items = normalizeCanvasItems(value.items)

  return {
    items,
    selection: sanitizeCanvasSelection(items, value.selection),
    version: CANVAS_WORKSPACE_VERSION,
    viewport,
  }
}

function sanitizeCanvasSelection(items: CanvasItem[], value: unknown) {
  if (!Array.isArray(value)) {
    return []
  }

  const itemIds = new Set(flattenCanvasItems(items).map(({ item }) => item.id))
  const selection = value.filter(
    (id): id is string => typeof id === 'string' && itemIds.has(id),
  )

  return pruneNestedSelection(items, selection)
}

function normalizeViewport(value: unknown): Viewport | null {
  if (!isRecord(value)) {
    return null
  }

  const { scale, x, y } = value

  if (!isFiniteNumber(x) || !isFiniteNumber(y) || !isFiniteNumber(scale)) {
    return null
  }

  return {
    scale: clamp(scale, MIN_SCALE, MAX_SCALE),
    x,
    y,
  }
}

function getCanvasWorkspaceStorage(): CanvasWorkspaceStorage | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    return window.localStorage
  } catch {
    return null
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}
