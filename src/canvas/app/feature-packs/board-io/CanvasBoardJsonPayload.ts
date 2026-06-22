import {
  CANVAS_WORKSPACE_VERSION,
  createCanvasWorkspaceSnapshot,
  parseCanvasWorkspaceSnapshot,
} from '../../workspace/document/CanvasWorkspaceSnapshot'
import type {
  CanvasItemValidationOptions,
} from '../../../host'
import {
  CANVAS_BOARD_EXPORT_KIND,
  CANVAS_BOARD_EXPORT_VERSION,
  type CanvasBoardExportInput,
  type CanvasBoardExportPayload,
} from './CanvasBoardIoContracts'

export function createCanvasBoardExportPayload({
  items,
  selection,
  validation,
  viewport,
}: CanvasBoardExportInput): CanvasBoardExportPayload {
  const snapshot = createCanvasWorkspaceSnapshot({
    items,
    selection,
    validation,
    viewport,
  })

  return {
    items: snapshot.items,
    kind: CANVAS_BOARD_EXPORT_KIND,
    metadata: {
      itemCount: snapshot.items.length,
      selectedItemCount: snapshot.selection.length,
    },
    selection: snapshot.selection,
    selectionPolicy: 'preserve',
    version: CANVAS_BOARD_EXPORT_VERSION,
    viewport: snapshot.viewport,
  }
}

export function stringifyCanvasBoardExportPayload(
  payload: CanvasBoardExportPayload,
) {
  return JSON.stringify(payload, null, 2)
}

export function parseCanvasBoardExportPayload(
  value: string | null,
  validation: CanvasItemValidationOptions = {},
): CanvasBoardExportPayload | null {
  if (!value) {
    return null
  }

  try {
    return normalizeCanvasBoardExportPayload(JSON.parse(value), validation)
  } catch {
    return null
  }
}

function normalizeCanvasBoardExportPayload(
  value: unknown,
  validation: CanvasItemValidationOptions,
): CanvasBoardExportPayload | null {
  if (!isRecord(value)) {
    return null
  }

  if (
    value.kind !== CANVAS_BOARD_EXPORT_KIND ||
    value.version !== CANVAS_BOARD_EXPORT_VERSION ||
    value.selectionPolicy !== 'preserve'
  ) {
    return null
  }

  const snapshot = parseCanvasWorkspaceSnapshot(
    JSON.stringify({
      items: value.items,
      selection: value.selection,
      version: CANVAS_WORKSPACE_VERSION,
      viewport: value.viewport,
    }),
    validation,
  )

  if (!snapshot) {
    return null
  }

  return createCanvasBoardExportPayload({
    items: snapshot.items,
    selection: snapshot.selection,
    validation,
    viewport: snapshot.viewport,
  })
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
