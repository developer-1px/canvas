import type { CanvasInteractionKind, Tool } from './CanvasPrimitives'

export type CanvasCommandId =
  | 'bringForward'
  | 'bringToFront'
  | 'copy'
  | 'cut'
  | 'delete'
  | 'duplicate'
  | 'fitView'
  | 'group'
  | 'nudge'
  | 'paste'
  | 'redo'
  | 'selectAll'
  | 'sendBackward'
  | 'sendToBack'
  | 'undo'
  | 'ungroup'
  | 'zoomIn'
  | 'zoomOut'
  | 'zoomReset'

export type CanvasGestureId =
  | 'altDragDuplicate'
  | 'createRect'
  | 'createText'
  | 'marquee'
  | 'move'
  | 'pan'
  | 'resize'
  | 'snapToAlignment'
  | 'snapToGrid'
  | 'snapToSpacing'
  | 'temporaryPan'
  | 'textEdit'
  | 'wheelZoom'

export type CanvasOverlayId =
  | 'alignmentGuides'
  | 'draftRect'
  | 'grid'
  | 'itemOutline'
  | 'marquee'
  | 'resizeHandles'
  | 'selectionBounds'
  | 'spacingGuides'
  | 'status'
  | 'toolbar'
  | 'zoomControls'

export type CanvasShortcutId =
  | 'bringForward'
  | 'bringToFront'
  | 'copy'
  | 'cut'
  | 'delete'
  | 'duplicate'
  | 'escape'
  | 'fitAll'
  | 'fitSelection'
  | 'group'
  | 'nudge'
  | 'panTool'
  | 'paste'
  | 'rectTool'
  | 'redo'
  | 'selectAll'
  | 'selectTool'
  | 'sendBackward'
  | 'sendToBack'
  | 'temporaryPan'
  | 'textTool'
  | 'undo'
  | 'ungroup'

export type CanvasAffordanceConfig = {
  commands: Record<CanvasCommandId, boolean>
  gestures: Record<CanvasGestureId, boolean>
  overlays: Record<CanvasOverlayId, boolean>
  shortcuts: Record<CanvasShortcutId, boolean>
  tools: Record<Tool, boolean>
}

export type CanvasAffordanceConfigInput = {
  commands?: Partial<Record<CanvasCommandId, boolean>>
  gestures?: Partial<Record<CanvasGestureId, boolean>>
  overlays?: Partial<Record<CanvasOverlayId, boolean>>
  shortcuts?: Partial<Record<CanvasShortcutId, boolean>>
  tools?: Partial<Record<Tool, boolean>>
}

export const CANVAS_TOOL_AFFORDANCES = {
  pan: {
    ariaLabel: 'Pan tool',
    shortcut: 'H',
    statusLabel: 'Pan',
    title: 'Pan (H)',
  },
  rect: {
    ariaLabel: 'Rectangle tool',
    shortcut: 'R',
    statusLabel: 'Rect',
    title: 'Rectangle (R)',
  },
  select: {
    ariaLabel: 'Select tool',
    shortcut: 'V',
    statusLabel: 'Select',
    title: 'Select (V)',
  },
  text: {
    ariaLabel: 'Text tool',
    shortcut: 'T',
    statusLabel: 'Text',
    title: 'Text (T)',
  },
} satisfies Record<
  Tool,
  {
    ariaLabel: string
    shortcut: string
    statusLabel: string
    title: string
  }
>

export const CANVAS_COMMAND_AFFORDANCES = {
  bringForward: { ariaLabel: 'Bring forward', title: 'Bring forward' },
  bringToFront: { ariaLabel: 'Bring to front', title: 'Bring to front' },
  copy: { ariaLabel: 'Copy', title: 'Copy' },
  cut: { ariaLabel: 'Cut', title: 'Cut' },
  delete: { ariaLabel: 'Delete', title: 'Delete' },
  duplicate: { ariaLabel: 'Duplicate', title: 'Duplicate' },
  fitView: { ariaLabel: 'Fit view', title: 'Fit view' },
  group: { ariaLabel: 'Group', title: 'Group' },
  nudge: { ariaLabel: 'Nudge', title: 'Nudge' },
  paste: { ariaLabel: 'Paste', title: 'Paste' },
  redo: { ariaLabel: 'Redo', title: 'Redo' },
  selectAll: { ariaLabel: 'Select all', title: 'Select all' },
  sendBackward: { ariaLabel: 'Send backward', title: 'Send backward' },
  sendToBack: { ariaLabel: 'Send to back', title: 'Send to back' },
  undo: { ariaLabel: 'Undo', title: 'Undo' },
  ungroup: { ariaLabel: 'Ungroup', title: 'Ungroup' },
  zoomIn: { ariaLabel: 'Zoom in', title: 'Zoom in' },
  zoomOut: { ariaLabel: 'Zoom out', title: 'Zoom out' },
  zoomReset: { ariaLabel: 'Reset zoom', title: 'Reset zoom' },
} satisfies Record<
  CanvasCommandId,
  {
    ariaLabel: string
    title: string
  }
>

export const CANVAS_GESTURE_STATUS_LABELS: Partial<
  Record<CanvasInteractionKind, string>
> = {
  'create-rect': 'Drawing',
  marquee: 'Selecting',
  move: 'Moving',
  pan: 'Panning',
  resize: 'Resizing',
}

export const DEFAULT_CANVAS_AFFORDANCE_CONFIG = createCanvasAffordanceConfig()

export function createCanvasAffordanceConfig(
  overrides: CanvasAffordanceConfigInput = {},
): CanvasAffordanceConfig {
  return {
    commands: mergeFeatureGroup(
      {
        copy: true,
        bringForward: true,
        bringToFront: true,
        cut: true,
        delete: true,
        duplicate: true,
        fitView: true,
        group: true,
        nudge: true,
        paste: true,
        redo: true,
        selectAll: true,
        sendBackward: true,
        sendToBack: true,
        undo: true,
        ungroup: true,
        zoomIn: true,
        zoomOut: true,
        zoomReset: true,
      },
      overrides.commands,
    ),
    gestures: mergeFeatureGroup(
      {
        altDragDuplicate: true,
        createRect: true,
        createText: true,
        marquee: true,
        move: true,
        pan: true,
        resize: true,
        snapToAlignment: true,
        snapToGrid: true,
        snapToSpacing: true,
        temporaryPan: true,
        textEdit: true,
        wheelZoom: true,
      },
      overrides.gestures,
    ),
    overlays: mergeFeatureGroup(
      {
        alignmentGuides: true,
        draftRect: true,
        grid: true,
        itemOutline: true,
        marquee: true,
        resizeHandles: true,
        selectionBounds: true,
        spacingGuides: true,
        status: true,
        toolbar: true,
        zoomControls: true,
      },
      overrides.overlays,
    ),
    shortcuts: mergeFeatureGroup(
      {
        copy: true,
        bringForward: true,
        bringToFront: true,
        cut: true,
        delete: true,
        duplicate: true,
        escape: true,
        fitAll: true,
        fitSelection: true,
        group: true,
        nudge: true,
        panTool: true,
        paste: true,
        rectTool: true,
        redo: true,
        selectAll: true,
        selectTool: true,
        sendBackward: true,
        sendToBack: true,
        temporaryPan: true,
        textTool: true,
        undo: true,
        ungroup: true,
      },
      overrides.shortcuts,
    ),
    tools: mergeFeatureGroup(
      {
        pan: true,
        rect: true,
        select: true,
        text: true,
      },
      overrides.tools,
    ),
  }
}

function mergeFeatureGroup<T extends string>(
  defaults: Record<T, boolean>,
  overrides: Partial<Record<T, boolean>> | undefined,
) {
  return {
    ...defaults,
    ...overrides,
  }
}
