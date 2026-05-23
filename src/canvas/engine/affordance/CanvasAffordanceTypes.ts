import type { CanvasBuiltinTool } from '../../core'

export type CanvasCommandId =
  | 'alignBottom'
  | 'alignCenter'
  | 'alignLeft'
  | 'alignMiddle'
  | 'alignRight'
  | 'alignTop'
  | 'bringForward'
  | 'bringToFront'
  | 'copy'
  | 'cut'
  | 'delete'
  | 'duplicate'
  | 'distributeHorizontal'
  | 'distributeVertical'
  | 'fitView'
  | 'group'
  | 'lockSelection'
  | 'nudge'
  | 'paste'
  | 'redo'
  | 'selectAll'
  | 'sendBackward'
  | 'sendToBack'
  | 'undo'
  | 'ungroup'
  | 'unlockAll'
  | 'zoomIn'
  | 'zoomOut'
  | 'zoomReset'

export type CanvasGestureId =
  | 'altDragDuplicate'
  | 'createArrow'
  | 'createCustom'
  | 'drawHighlight'
  | 'drawMarker'
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
  | 'componentPalette'
  | 'draftArrow'
  | 'draftRect'
  | 'draftStroke'
  | 'findReplace'
  | 'grid'
  | 'inspector'
  | 'itemOutline'
  | 'marquee'
  | 'resizeHandles'
  | 'selectionBounds'
  | 'spacingGuides'
  | 'status'
  | 'textEditor'
  | 'toolbar'
  | 'zoomControls'

export type CanvasShortcutId =
  | 'arrowTool'
  | 'bringForward'
  | 'bringToFront'
  | 'copy'
  | 'cut'
  | 'delete'
  | 'duplicate'
  | 'escape'
  | 'fitAll'
  | 'fitSelection'
  | 'findReplace'
  | 'group'
  | 'highlighterTool'
  | 'lockSelection'
  | 'markerTool'
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
  | 'unlockAll'
  | 'zoomIn'
  | 'zoomOut'
  | 'zoomReset'

export type CanvasAffordanceConfig = {
  commands: Record<CanvasCommandId, boolean>
  gestures: Record<CanvasGestureId, boolean>
  overlays: Record<CanvasOverlayId, boolean>
  shortcuts: Record<CanvasShortcutId, boolean>
  tools: Record<CanvasBuiltinTool, boolean>
}

export type CanvasAffordanceConfigInput = {
  commands?: Partial<Record<CanvasCommandId, boolean>>
  gestures?: Partial<Record<CanvasGestureId, boolean>>
  overlays?: Partial<Record<CanvasOverlayId, boolean>>
  shortcuts?: Partial<Record<CanvasShortcutId, boolean>>
  tools?: Partial<Record<CanvasBuiltinTool, boolean>>
}
