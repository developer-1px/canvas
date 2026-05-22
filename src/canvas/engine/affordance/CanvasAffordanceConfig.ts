import type {
  CanvasAffordanceConfig,
  CanvasAffordanceConfigInput,
} from './CanvasAffordanceTypes'

export const DEFAULT_CANVAS_AFFORDANCE_CONFIG = createCanvasAffordanceConfig()

export function createCanvasAffordanceConfig(
  overrides: CanvasAffordanceConfigInput = {},
): CanvasAffordanceConfig {
  return {
    commands: mergeFeatureGroup(
      {
        alignBottom: true,
        alignCenter: true,
        alignLeft: true,
        alignMiddle: true,
        alignRight: true,
        alignTop: true,
        copy: true,
        bringForward: true,
        bringToFront: true,
        cut: true,
        delete: true,
        duplicate: true,
        distributeHorizontal: true,
        distributeVertical: true,
        fitView: true,
        group: true,
        lockSelection: true,
        nudge: true,
        paste: true,
        redo: true,
        selectAll: true,
        sendBackward: true,
        sendToBack: true,
        undo: true,
        ungroup: true,
        unlockAll: true,
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
        lockSelection: true,
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
        unlockAll: true,
        zoomIn: true,
        zoomOut: true,
        zoomReset: true,
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
