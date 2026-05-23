import {
  clamp,
  MAX_SCALE,
  MIN_SCALE,
} from '../../core'
import type {
  CanvasItem,
  Viewport,
} from '../../entities'
import {
  createCanvasItemReadModel,
  normalizeCanvasItems,
  type CanvasItemValidationOptions,
} from '../../host'

export const CANVAS_WORKSPACE_VERSION = 1

export type CanvasWorkspaceSnapshot = {
  items: CanvasItem[]
  selection: string[]
  version: typeof CANVAS_WORKSPACE_VERSION
  viewport: Viewport
}

export type CanvasWorkspaceSnapshotInput = {
  items: CanvasItem[]
  selection: string[]
  validation?: CanvasItemValidationOptions
  viewport: Viewport
}

export function parseCanvasWorkspaceSnapshot(
  value: string | null,
  validation: CanvasItemValidationOptions = {},
): CanvasWorkspaceSnapshot | null {
  if (!value) {
    return null
  }

  try {
    return normalizeCanvasWorkspaceSnapshot(JSON.parse(value), validation)
  } catch {
    return null
  }
}

export function createCanvasWorkspaceSnapshot({
  items,
  selection,
  viewport,
  validation,
}: CanvasWorkspaceSnapshotInput): CanvasWorkspaceSnapshot {
  const normalizedItems = normalizeCanvasItems(items, validation)
  const normalizedViewport = normalizeCanvasViewport(viewport)

  if (!normalizedViewport) {
    throw new Error('Invalid canvas viewport')
  }

  return {
    items: normalizedItems,
    selection: sanitizeCanvasWorkspaceSelection(normalizedItems, selection),
    version: CANVAS_WORKSPACE_VERSION,
    viewport: normalizedViewport,
  }
}

export function getCanvasItemIdSeed(items: CanvasItem[]) {
  const numericSuffixes = createCanvasItemReadModel(items)
    .getAllIds()
    .map((id) => id.match(/-(\d+)$/)?.[1])
    .filter((value): value is string => value !== undefined)
    .map((value) => Number.parseInt(value, 10))
    .filter(Number.isFinite)

  return Math.max(items.length, 0, ...numericSuffixes)
}

function normalizeCanvasWorkspaceSnapshot(
  value: unknown,
  validation: CanvasItemValidationOptions,
): CanvasWorkspaceSnapshot | null {
  if (!isRecord(value) || value.version !== CANVAS_WORKSPACE_VERSION) {
    return null
  }

  if (!Array.isArray(value.items)) {
    return null
  }

  const viewport = normalizeCanvasViewport(value.viewport)

  if (!viewport) {
    return null
  }

  const items = normalizeCanvasItems(value.items, validation)

  return {
    items,
    selection: sanitizeCanvasWorkspaceSelection(items, value.selection),
    version: CANVAS_WORKSPACE_VERSION,
    viewport,
  }
}

function sanitizeCanvasWorkspaceSelection(items: CanvasItem[], value: unknown) {
  if (!Array.isArray(value)) {
    return []
  }

  const itemReadModel = createCanvasItemReadModel(items)
  const itemIds = new Set(itemReadModel.getAllIds())
  const selection = value.filter(
    (id): id is string => typeof id === 'string' && itemIds.has(id),
  )

  return itemReadModel.getSelection(selection)
}

function normalizeCanvasViewport(value: unknown): Viewport | null {
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}
