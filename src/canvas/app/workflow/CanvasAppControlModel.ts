import {
  getCanvasViewportScreenPoint,
} from '../../core'
import {
  getCanvasCommandAvailability,
} from '../../engine'
import type {
  Bounds,
  Viewport,
} from '../../entities'
import {
  getCanvasCommandPaletteItems,
} from '../feature-packs'
import {
  getCanvasShortcutHelpItems,
} from '../feature-packs'
import {
  getCanvasStatusModel,
} from '../feature-packs'
import {
  getCanvasMinimapReadModel,
} from '../feature-packs'
import type { CanvasAppControlModelInput } from './CanvasAppControlConsumerContracts'
import type {
  CanvasAppViewportFocusControls,
} from './CanvasAppViewportConsumerContracts'

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
  itemReadModel,
  scene,
  selection,
  tool,
  viewport,
  commandHandlers,
  onCenterViewportAtWorldPoint,
  onFitItems,
  onInsertComponent,
  onOpenShortcutHelp,
  onRunCustomCommand,
  onToolChange,
  onViewportReset,
  onZoom,
  viewportRect,
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
        onOpenShortcutHelp,
        onToolChange,
        onViewportReset,
        onZoom,
        selection,
      }),
      visible: config.overlays.commandPalette,
    },
    shortcutHelp: {
      items: getCanvasShortcutHelpItems({
        config,
        customTools,
      }),
      visible: config.overlays.shortcutHelp,
    },
    status: {
      ...getCanvasStatusModel({
        customTools,
        gesture,
        selectionLength: selection.length,
        tool,
      }),
      visible: config.overlays.status,
    },
    minimap: {
      model: config.overlays.minimap && viewportRect
        ? getCanvasMinimapReadModel({
          items: itemReadModel.getAllItems().map((item) => ({
            bounds: itemReadModel.getItemBounds(item),
            id: item.id,
          })),
          stageRect: viewportRect,
          viewport,
        })
        : null,
      visible: config.overlays.minimap,
      onNavigateToWorldPoint: onCenterViewportAtWorldPoint,
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
    viewportFocus: getCanvasAppViewportFocusControls({
      onCenterViewportAtWorldPoint,
      onFitItems,
      selection,
      viewportRect,
    }),
    zoomControls: {
      config,
      scale: viewport.scale,
      visible: config.overlays.zoomControls,
      onFit: () =>
        onFitItems(selection.length > 0 ? selection : undefined),
      onFitItems,
      onReset: onViewportReset,
      onZoomIn: () => onZoom('in'),
      onZoomOut: () => onZoom('out'),
    },
  }
}

function getCanvasAppViewportFocusControls({
  onCenterViewportAtWorldPoint,
  onFitItems,
  selection,
  viewportRect,
}: Pick<
  CanvasAppControlModelInput,
  'onCenterViewportAtWorldPoint' | 'onFitItems' | 'selection' | 'viewportRect'
>): CanvasAppViewportFocusControls {
  return {
    centerAtWorldPoint: onCenterViewportAtWorldPoint,
    fitAll: () => onFitItems(undefined),
    fitItems: (ids) => onFitItems([...ids]),
    fitSelection: () =>
      onFitItems(selection.length > 0 ? [...selection] : undefined),
    viewportRect,
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

  const top = getCanvasViewportScreenPoint(viewport, {
    x: bounds.x,
    y: bounds.y,
  }).y
  const bottom = getCanvasViewportScreenPoint(viewport, {
    x: bounds.x,
    y: bounds.y + bounds.h,
  }).y
  const center = getCanvasViewportScreenPoint(viewport, {
    x: bounds.x + bounds.w / 2,
    y: bounds.y + bounds.h / 2,
  })
  const placement = top < 128 ? 'below' : 'above'

  return {
    x: center.x,
    y: placement === 'below' ? bottom : top,
    placement,
  }
}
