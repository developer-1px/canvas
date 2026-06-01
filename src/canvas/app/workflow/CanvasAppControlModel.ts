import { isCanvasCustomToolId } from '../../core'
import {
  CANVAS_GESTURE_STATUS_LABELS,
  CANVAS_TOOL_AFFORDANCES,
  getCanvasCommandAvailability,
} from '../../engine'
import type {
  CanvasInteractionKind,
  Bounds,
  Tool,
  Viewport,
} from '../../entities'
import type {
  CanvasAppCustomCreationToolState,
} from '../extensions/CanvasAppExtensionStateContracts'
import {
  getCanvasCommandPaletteItems,
} from '../affordances/controls/command-palette/CanvasCommandPaletteItems'
import type { CanvasAppControlModelInput } from './CanvasAppControlConsumerContracts'

type CanvasSelectionCommandAnchor = {
  placement: 'above' | 'below'
  x: number
  y: number
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
  commandHandlers,
  onFitItems,
  onInsertComponent,
  onRunCustomCommand,
  onToolChange,
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
    commandPalette: {
      items: getCanvasCommandPaletteItems({
        commandAvailability,
        commandHandlers,
        components,
        config,
        customCommands,
        customTools,
        onCustomCommand: onRunCustomCommand,
        onFitItems,
        onInsertComponent,
        onToolChange,
        onViewportReset,
        onZoomBy,
        selection,
      }),
      visible: config.overlays.commandPalette,
    },
    status: {
      mode: getCanvasAppStatusMode({
        customTools,
        gesture,
        tool,
      }),
      selectionLength: selection.length,
      visible: config.overlays.status,
    },
    toolbar: {
      commandAvailability,
      config,
      customCommands,
      customTools,
      commandHandlers,
      selectionCommandAnchor: getCanvasSelectionCommandAnchor({
        bounds: scene.getBounds(selection),
        viewport,
      }),
      tool,
      visible: config.overlays.toolbar,
      onToolChange,
      onCustomCommand: onRunCustomCommand,
    },
    zoomControls: {
      config,
      scale: viewport.scale,
      visible: config.overlays.zoomControls,
      onFit: () =>
        onFitItems(selection.length > 0 ? selection : undefined),
      onFitItems,
      onReset: onViewportReset,
      onZoomIn: () => onZoomBy(1.25),
      onZoomOut: () => onZoomBy(0.8),
    },
  }
}

function getCanvasSelectionCommandAnchor({
  bounds,
  viewport,
}: {
  bounds: Bounds | null
  viewport: Viewport
}): CanvasSelectionCommandAnchor | null {
  if (!bounds) {
    return null
  }

  const top = viewport.y + bounds.y * viewport.scale
  const bottom = viewport.y + (bounds.y + bounds.h) * viewport.scale
  const placement = top < 128 ? 'below' : 'above'

  return {
    x: viewport.x + (bounds.x + bounds.w / 2) * viewport.scale,
    y: placement === 'below' ? bottom : top,
    placement,
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
