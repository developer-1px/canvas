import type { Tool } from '../../core'

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
  | 'lockSelection'
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
  tools: Record<Tool, boolean>
}

export type CanvasAffordanceConfigInput = {
  commands?: Partial<Record<CanvasCommandId, boolean>>
  gestures?: Partial<Record<CanvasGestureId, boolean>>
  overlays?: Partial<Record<CanvasOverlayId, boolean>>
  shortcuts?: Partial<Record<CanvasShortcutId, boolean>>
  tools?: Partial<Record<Tool, boolean>>
}
