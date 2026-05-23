import { useEffect } from 'react'
import type { CanvasItemValidationOptions } from '../../host'
import {
  createCanvasWorkspaceSnapshot,
  parseCanvasWorkspaceSnapshot,
  type CanvasWorkspaceSnapshotInput,
} from './CanvasWorkspaceSnapshot'

export const CANVAS_WORKSPACE_STORAGE_KEY =
  'interactive-os.canvas.workspace.v1'

const SAVE_DELAY_MS = 120

export type CanvasWorkspaceStorage = {
  getItem: (key: string) => string | null
  removeItem?: (key: string) => void
  setItem: (key: string, value: string) => void
}

export type CanvasWorkspaceStorageProvider = () => CanvasWorkspaceStorage | null

export const DEFAULT_CANVAS_WORKSPACE_STORAGE_PROVIDER:
  CanvasWorkspaceStorageProvider = getCanvasWorkspaceStorage

export function useCanvasWorkspacePersistence({
  items,
  selection,
  storageProvider = DEFAULT_CANVAS_WORKSPACE_STORAGE_PROVIDER,
  viewport,
  validation,
}: CanvasWorkspaceSnapshotInput & {
  storageProvider?: CanvasWorkspaceStorageProvider
}) {
  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined
    }

    const timeout = window.setTimeout(() => {
      writeStoredCanvasWorkspace(
        { items, selection, validation, viewport },
        storageProvider(),
      )
    }, SAVE_DELAY_MS)

    return () => window.clearTimeout(timeout)
  }, [items, selection, storageProvider, validation, viewport])
}

export function readStoredCanvasWorkspace(
  storage: CanvasWorkspaceStorage | null = getCanvasWorkspaceStorage(),
  validation: CanvasItemValidationOptions = {},
) {
  if (!storage) {
    return null
  }

  try {
    const value = storage.getItem(CANVAS_WORKSPACE_STORAGE_KEY)
    const snapshot = parseCanvasWorkspaceSnapshot(value, validation)

    if (!snapshot && value !== null) {
      removeStoredCanvasWorkspace(storage)
    }

    return snapshot
  } catch {
    removeStoredCanvasWorkspace(storage)
    return null
  }
}

export function writeStoredCanvasWorkspace(
  snapshot: CanvasWorkspaceSnapshotInput,
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

export function removeStoredCanvasWorkspace(
  storage: CanvasWorkspaceStorage | null = getCanvasWorkspaceStorage(),
) {
  try {
    storage?.removeItem?.(CANVAS_WORKSPACE_STORAGE_KEY)
  } catch {
    // Storage can fail in private mode or when access is denied.
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
