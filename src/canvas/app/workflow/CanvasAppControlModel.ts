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
import {
  getCanvasFloatingAnchorForBounds,
} from '../affordances/controls/floating-anchor/CanvasFloatingAnchor'
import type { CanvasAppControlModelInput } from './CanvasAppControlConsumerContracts'
import type {
  CanvasAppViewportFocusControls,
} from './CanvasAppViewportConsumerContracts'

type CanvasSelectionCommandAnchor = {
  placement: 'above' | 'below'
  x: number
  y: number
}

const CANVAS_SELECTION_COMMAND_ANCHOR_FLOATING_SIZE = {
  height: 40,
  width: 320,
}
const CANVAS_SELECTION_COMMAND_ANCHOR_SCREEN_MARGIN = 14

export function getCanvasAppControlModel({
  canRedo,
  canUndo,
  componentSets,
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
      componentSets,
      components,
      visible: config.overlays.componentPalette,
      onFocusItems: (itemIds: readonly string[]) => onFitItems([...itemIds]),
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
        viewport,
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
        stageRect: viewportRect,
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
  stageRect,
  viewport,
}: {
  bounds: Bounds | null
  stageRect: CanvasAppControlModelInput['viewportRect']
  viewport: Viewport
}): CanvasSelectionCommandAnchor | null {
  const anchor = getCanvasFloatingAnchorForBounds({
    bounds,
    floatingSize: CANVAS_SELECTION_COMMAND_ANCHOR_FLOATING_SIZE,
    screenGap: 0,
    screenMargin: CANVAS_SELECTION_COMMAND_ANCHOR_SCREEN_MARGIN,
    stageRect,
    viewport,
  })

  if (!anchor) {
    return null
  }

  const screenPoint = getCanvasViewportScreenPoint(viewport, {
    x: anchor.x,
    y: anchor.y,
  })

  return {
    placement: anchor.placement,
    x: screenPoint.x,
    y: screenPoint.y,
  }
}
