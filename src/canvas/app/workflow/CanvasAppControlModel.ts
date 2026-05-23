import { isCanvasCustomToolId } from '../../core'
import {
  CANVAS_GESTURE_STATUS_LABELS,
  CANVAS_TOOL_AFFORDANCES,
  getCanvasCommandAvailability,
  type CanvasAffordanceConfig,
  type CanvasAlignMode,
  type CanvasDistributeMode,
  type CanvasSceneAdapter,
} from '../../engine'
import type {
  CanvasInteractionKind,
  Tool,
  Viewport,
} from '../../entities'
import type { CanvasComponentTemplate } from '../../host'
import type { CanvasAppCustomCommandState } from '../commands/CanvasAppCustomCommands'
import type { CanvasAppCustomCreationToolState } from '../tools/CanvasAppCustomCreationTools'

type CanvasAppControlModelInput = {
  canRedo: boolean
  canUndo: boolean
  components: readonly CanvasComponentTemplate[]
  config: CanvasAffordanceConfig
  customCommands: readonly CanvasAppCustomCommandState[]
  customTools: readonly CanvasAppCustomCreationToolState[]
  gesture: CanvasInteractionKind
  scene: CanvasSceneAdapter
  selection: string[]
  tool: Tool
  viewport: Viewport
  onAlign: (mode: CanvasAlignMode) => void
  onDelete: () => void
  onDistribute: (mode: CanvasDistributeMode) => void
  onDuplicate: () => void
  onFitItems: (ids?: string[]) => void
  onGroup: () => void
  onInsertComponent: (component: string) => void
  onLock: () => void
  onRedo: () => void
  onRunCustomCommand: (commandId: string) => void
  onToolChange: (tool: Tool) => void
  onUndo: () => void
  onUngroup: () => void
  onUnlockAll: () => void
  onViewportReset: () => void
  onZoomBy: (multiplier: number) => void
}

export function getCanvasAppControlModel({
  canRedo,
  canUndo,
  components,
  config,
  customCommands,
  customTools,
  gesture,
  scene,
  selection,
  tool,
  viewport,
  onAlign,
  onDelete,
  onDistribute,
  onDuplicate,
  onFitItems,
  onGroup,
  onInsertComponent,
  onLock,
  onRedo,
  onRunCustomCommand,
  onToolChange,
  onUndo,
  onUngroup,
  onUnlockAll,
  onViewportReset,
  onZoomBy,
}: CanvasAppControlModelInput) {
  const commandAvailability = getCanvasCommandAvailability({
    canRedo,
    canUndo,
    config,
    hasSelectedGroup: selection.some(scene.isGroup),
    selection,
  })
  return {
    componentPalette: {
      components,
      visible: config.overlays.componentPalette,
      onInsert: onInsertComponent,
    },
    status: {
      mode: getCanvasAppStatusMode({
        customTools,
        gesture,
        tool,
      }),
      scale: viewport.scale,
      selectionLength: selection.length,
      visible: config.overlays.status,
    },
    toolbar: {
      commandAvailability,
      config,
      customCommands,
      customTools,
      tool,
      visible: config.overlays.toolbar,
      onAlign,
      onDelete,
      onDistribute,
      onDuplicate,
      onGroup,
      onLock,
      onRedo,
      onToolChange,
      onCustomCommand: onRunCustomCommand,
      onUndo,
      onUngroup,
      onUnlockAll,
    },
    zoomControls: {
      config,
      scale: viewport.scale,
      visible: config.overlays.zoomControls,
      onFit: () =>
        onFitItems(selection.length > 0 ? selection : undefined),
      onReset: onViewportReset,
      onZoomIn: () => onZoomBy(1.25),
      onZoomOut: () => onZoomBy(0.8),
    },
  }
}

function getCanvasAppStatusMode({
  customTools,
  gesture,
  tool,
}: {
  customTools: readonly CanvasAppCustomCreationToolState[]
  gesture: CanvasInteractionKind
  tool: Tool
}) {
  const gestureLabel = CANVAS_GESTURE_STATUS_LABELS[gesture]

  if (gestureLabel) {
    return gestureLabel
  }

  if (isCanvasCustomToolId(tool)) {
    return (
      customTools.find((customTool) => customTool.id === tool)
        ?.statusLabel ?? 'Canvas'
    )
  }

  return CANVAS_TOOL_AFFORDANCES[tool].statusLabel
}
