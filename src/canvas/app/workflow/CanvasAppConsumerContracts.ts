import type {
  Dispatch,
  MutableRefObject,
  SetStateAction,
} from 'react'
import type {
  CanvasAffordanceConfig,
  CanvasAlignMode,
  CanvasCommandAdapter,
  CanvasCreationAdapter,
  CanvasDistributeMode,
  CanvasDraftArrowOverlay,
  CanvasDraftStrokeOverlay,
  CanvasOverlayState,
  CanvasReorderMode,
  CanvasSceneAdapter,
  CanvasSnapGuides,
  CanvasTransformAdapter,
} from '../../engine'
import type {
  Bounds,
  CanvasComponentKind,
  CanvasInteractionKind,
  CanvasItem,
  EditingText,
  Point,
  ResizeHandle,
  Tool,
  Viewport,
} from '../../entities'
import type {
  CanvasComponentLibrary,
  CanvasComponentTemplate,
  CanvasEditableTextItem,
  CanvasItemReadModel,
} from '../../host'
import type { CanvasAppCustomCommand } from '../commands/CanvasAppCustomCommands'
import type {
  CanvasAppCustomCommandState,
  CanvasAppCustomCreationToolState,
} from '../extensions/CanvasAppExtensionStateContracts'
import type { CanvasAppInspectorPanel } from '../inspector/CanvasAppInspectorPanels'
import type { CanvasAppPointerInput } from '../pointer/CanvasAppPointerInput'
import type {
  CanvasAppStageElement,
  CanvasAppStageElementController,
} from '../stage/CanvasAppStageElement'
import type {
  CanvasAppItemLayerAdapter,
} from '../rendering/CanvasAppItemLayerAdapter'
import type {
  CanvasAppComponentPresentationRenderers,
  CanvasAppCustomItemRenderers,
} from '../rendering/CanvasAppRenderingContracts'
import type {
  CanvasAppStageAdapter,
  CanvasAppStageMount,
} from '../rendering/CanvasAppStageAdapter'
import type { CanvasAppCustomCreationTool } from '../tools/CanvasAppCustomCreationTools'
import type { Interaction } from '../pointer/CanvasInteractionState'
import type { CanvasAppControlCommandHandlers } from './CanvasAppControlCommandContracts'
import type {
  CanvasDocumentClipboard,
  CanvasDocumentTextSearch,
  CommitCanvasItemsChange,
  CommitCanvasSelection,
} from './CanvasWorkflowContract'

export type CanvasAppCommandRuntime = {
  alignSelection: (mode: CanvasAlignMode) => void
  cloneItems: (ids: string[], offset: Point) => CanvasItem[]
  copySelection: () => void
  cutSelection: () => void
  deleteSelection: () => void
  distributeSelection: (mode: CanvasDistributeMode) => void
  duplicateSelection: (sourceIds?: string[], offset?: Point) => CanvasItem[]
  groupSelection: () => void
  lockSelection: () => void
  moveSelection: (dx: number, dy: number) => void
  pasteSelection: () => void
  redoHistory: () => void
  reorderSelection: (mode: CanvasReorderMode) => void
  selectAll: () => void
  undoHistory: () => void
  ungroupSelection: () => void
  unlockAll: () => void
}

export type CanvasAppCommandControlContext = {
  commandHandlers: CanvasAppControlCommandHandlers
}

export type CanvasAppCommandKeyboardContext = {
  copySelection: () => void
  cutSelection: () => void
  deleteSelection: () => void
  duplicateSelection: (sourceIds?: string[], offset?: Point) => CanvasItem[]
  groupSelection: () => void
  lockSelection: () => void
  moveSelection: (dx: number, dy: number) => void
  pasteSelection: () => void
  redoHistory: () => void
  reorderSelection: (mode: CanvasReorderMode) => void
  selectAll: () => void
  undoHistory: () => void
  ungroupSelection: () => void
  unlockAll: () => void
}

export type CanvasAppCommandPointerContext = {
  cloneItems: (ids: string[], offset: Point) => CanvasItem[]
}

export type CanvasAppCommandConsumerModel = {
  control: CanvasAppCommandControlContext
  keyboard: CanvasAppCommandKeyboardContext
  pointer: CanvasAppCommandPointerContext
}

export type CanvasAppCommandDocumentModel = {
  commitItemsChange: CommitCanvasItemsChange
  commitSelection: CommitCanvasSelection
  copyItemsToClipboard: CanvasDocumentClipboard['copyItemsToClipboard']
  getClipboardItems: CanvasDocumentClipboard['getClipboardItems']
  redo: () => string[] | undefined
  setClipboardItems: CanvasDocumentClipboard['setClipboardItems']
  undo: () => string[] | undefined
}

export type CanvasAppCommandWorkspaceModel = {
  items: CanvasItem[]
  selection: string[]
  setSelection: Dispatch<SetStateAction<string[]>>
  viewport: Viewport
}

export type CanvasAppCommandModelInput = {
  commandAdapter: CanvasCommandAdapter<CanvasItem>
  config: CanvasAffordanceConfig
  createId: (prefix: string) => string
  document: CanvasAppCommandDocumentModel
  setEditing: Dispatch<SetStateAction<EditingText | null>>
  stageElement: CanvasAppStageElement
  workspace: CanvasAppCommandWorkspaceModel
}

export type CanvasAppComponentCommandModel = {
  commitItemsChange: CommitCanvasItemsChange
}

export type CanvasAppComponentInteractionModel = {
  setEditing: Dispatch<SetStateAction<EditingText | null>>
  setTool: Dispatch<SetStateAction<Tool>>
}

export type CanvasAppComponentWorkspaceModel = {
  selection: string[]
  viewport: Viewport
}

export type CanvasAppComponentModelInput = {
  command: CanvasAppComponentCommandModel
  componentLibrary: CanvasComponentLibrary
  createId: (prefix: string) => string
  interaction: CanvasAppComponentInteractionModel
  stageElement: CanvasAppStageElement
  workspace: CanvasAppComponentWorkspaceModel
}

export type CanvasAppComponentControlContext = {
  onInsertComponent: (component: CanvasComponentKind) => void
}

export type CanvasAppComponentModel = {
  control: CanvasAppComponentControlContext
}

export type CanvasAppControlModelInput = {
  canRedo: boolean
  canUndo: boolean
  commandHandlers: CanvasAppControlCommandHandlers
  components: readonly CanvasComponentTemplate[]
  config: CanvasAffordanceConfig
  customCommands: readonly CanvasAppCustomCommandState[]
  customTools: readonly CanvasAppCustomCreationToolState[]
  gesture: CanvasInteractionKind
  onFitItems: (ids?: string[]) => void
  onInsertComponent: (component: CanvasComponentKind) => void
  onRunCustomCommand: (commandId: string) => void
  onToolChange: (tool: Tool) => void
  onViewportReset: () => void
  onZoomBy: (multiplier: number) => void
  scene: CanvasSceneAdapter
  selection: string[]
  tool: Tool
  viewport: Viewport
}

export type CanvasAppExtensionRuntime = {
  customCommandStates: CanvasAppCustomCommandState[]
  customCreationToolStates: CanvasAppCustomCreationToolState[]
  customCreationTools: readonly CanvasAppCustomCreationTool[]
  runCustomCommand: (commandId: string) => boolean
}

export type CanvasAppExtensionModelInput = {
  commitItemsChange: CommitCanvasItemsChange
  commitSelection: CommitCanvasSelection
  createId: (prefix: string) => string
  customCommands: readonly CanvasAppCustomCommand[]
  customCreationTools: readonly CanvasAppCustomCreationTool[]
  items: CanvasItem[]
  selection: string[]
  setEditing: Dispatch<SetStateAction<EditingText | null>>
  viewport: Viewport
}

export type CanvasAppExtensionControlContext = {
  customCommands: readonly CanvasAppCustomCommandState[]
  customTools: readonly CanvasAppCustomCreationToolState[]
  onRunCustomCommand: (commandId: string) => boolean
}

export type CanvasAppExtensionKeyboardContext = {
  customCreationTools: readonly CanvasAppCustomCreationToolState[]
}

export type CanvasAppExtensionPointerContext = {
  customCreationTools: readonly CanvasAppCustomCreationTool[]
}

export type CanvasAppExtensionModel = {
  control: CanvasAppExtensionControlContext
  keyboard: CanvasAppExtensionKeyboardContext
  pointer: CanvasAppExtensionPointerContext
}

export type CanvasAppInspectorModelInput = {
  commitItemsChange: CommitCanvasItemsChange
  config: CanvasAffordanceConfig
  inspectorPanels: readonly CanvasAppInspectorPanel[]
  itemReadModel: CanvasItemReadModel
  selected: Set<string>
  selection: string[]
}

export type CanvasAppKeyboardCommandContext = {
  commitSelection: CommitCanvasSelection
  copySelection: () => void
  cutSelection: () => void
  deleteSelection: () => void
  duplicateSelection: () => void
  groupSelection: () => void
  lockSelection: () => void
  moveSelection: (dx: number, dy: number) => void
  pasteSelection: () => void
  redoHistory: () => void
  reorderSelection: (mode: CanvasReorderMode) => void
  selectAll: () => void
  undoHistory: () => void
  ungroupSelection: () => void
  unlockAll: () => void
}

export type CanvasAppKeyboardInteractionContext = {
  interactionRef: MutableRefObject<Interaction>
  setDraftArrow: Dispatch<SetStateAction<CanvasDraftArrowOverlay | null>>
  setDraftRect: Dispatch<SetStateAction<Bounds | null>>
  setDraftStroke: Dispatch<SetStateAction<CanvasDraftStrokeOverlay | null>>
  setEditing: Dispatch<SetStateAction<EditingText | null>>
  setGesture: Dispatch<SetStateAction<Interaction['kind']>>
  setMarquee: Dispatch<SetStateAction<Bounds | null>>
  setSpaceDown: Dispatch<SetStateAction<boolean>>
  setTool: Dispatch<SetStateAction<Tool>>
}

export type CanvasAppKeyboardViewportContext = {
  fitToItems: (ids?: string[]) => void
  resetViewport: () => void
  zoomBy: (multiplier: number) => void
}

export type CanvasAppViewportModelInput = {
  config: CanvasAffordanceConfig
  itemReadModel: CanvasItemReadModel
  setViewport: Dispatch<SetStateAction<Viewport>>
  stageElement: CanvasAppStageElement
}

export type CanvasAppViewportRuntime = {
  fitToItems: (ids?: string[]) => void
  resetViewport: () => void
  zoomBy: (multiplier: number) => void
}

export type CanvasAppViewportControlContext = {
  onFitItems: (ids?: string[]) => void
  onViewportReset: () => void
  onZoomBy: (multiplier: number) => void
}

export type CanvasAppViewportConsumerModel = {
  control: CanvasAppViewportControlContext
  keyboard: CanvasAppKeyboardViewportContext
}

export type CanvasAppKeyboardModelInput = {
  command: CanvasAppKeyboardCommandContext
  config: CanvasAffordanceConfig
  customCreationTools: readonly CanvasAppCustomCreationToolState[]
  interaction: CanvasAppKeyboardInteractionContext
  openFindReplace: () => void
  selection: string[]
  viewport: CanvasAppKeyboardViewportContext
}

export type CanvasAppTextDocumentModel = {
  commitItemsChange: CommitCanvasItemsChange
  findDocumentText: CanvasDocumentTextSearch['findDocumentText']
  replaceDocumentText: CanvasDocumentTextSearch['replaceDocumentText']
}

export type CanvasAppTextModelInput = {
  config: CanvasAffordanceConfig
  document: CanvasAppTextDocumentModel
  itemReadModel: CanvasItemReadModel
  selection: string[]
  viewport: Viewport
}

export type CanvasAppTextRuntime<TFindReplace, TTextEditor> = {
  blurTextEditor: () => void
  findReplace: TFindReplace
  openFindReplace: () => void
  setEditing: Dispatch<SetStateAction<EditingText | null>>
  textEditor: TTextEditor
}

export type CanvasInteractionDraftWriters = {
  setDraftArrow: Dispatch<SetStateAction<CanvasDraftArrowOverlay | null>>
  setDraftRect: Dispatch<SetStateAction<Bounds | null>>
  setDraftStroke: Dispatch<SetStateAction<CanvasDraftStrokeOverlay | null>>
}

export type CanvasInteractionMarqueeWriters = {
  setMarquee: Dispatch<SetStateAction<Bounds | null>>
}

export type CanvasInteractionConsumerModelInput = {
  draft: CanvasInteractionDraftWriters
  gesture: Interaction['kind']
  marquee: CanvasInteractionMarqueeWriters
  overlays: CanvasOverlayState
  setGesture: Dispatch<SetStateAction<Interaction['kind']>>
  setSnapGuides: Dispatch<SetStateAction<CanvasSnapGuides>>
  setSpaceDown: Dispatch<SetStateAction<boolean>>
  setTool: Dispatch<SetStateAction<Tool>>
  spaceDown: boolean
  tool: Tool
}

export type CanvasInteractionComponentContext = {
  setTool: Dispatch<SetStateAction<Tool>>
}

export type CanvasInteractionControlContext = {
  gesture: Interaction['kind']
  onToolChange: Dispatch<SetStateAction<Tool>>
  tool: Tool
}

export type CanvasInteractionKeyboardContext =
  CanvasInteractionDraftWriters &
  CanvasInteractionMarqueeWriters & {
    setGesture: Dispatch<SetStateAction<Interaction['kind']>>
    setSpaceDown: Dispatch<SetStateAction<boolean>>
    setTool: Dispatch<SetStateAction<Tool>>
  }

export type CanvasInteractionPointerContext =
  CanvasInteractionDraftWriters &
  CanvasInteractionMarqueeWriters & {
    setGesture: Dispatch<SetStateAction<Interaction['kind']>>
    setSnapGuides: Dispatch<SetStateAction<CanvasSnapGuides>>
    setTool: Dispatch<SetStateAction<Tool>>
    spaceDown: boolean
    tool: Tool
  }

export type CanvasInteractionStageContext = {
  activeMode: Tool
  gesture: Interaction['kind']
  overlays: CanvasOverlayState
}

export type CanvasInteractionConsumerModel = {
  component: CanvasInteractionComponentContext
  control: CanvasInteractionControlContext
  keyboard: CanvasInteractionKeyboardContext
  pointer: CanvasInteractionPointerContext
  stage: CanvasInteractionStageContext
}

export type CanvasAppPointerItemLayerHandlers = {
  onItemPointerDown: (
    event: CanvasAppPointerInput,
    itemId: string,
  ) => void
  onTextDoubleClick: (item: CanvasEditableTextItem) => void
}

export type CanvasAppPointerStageHandlers = {
  onCanvasPointerDown: (event: CanvasAppPointerInput) => void
  onPointerCancel: (event: CanvasAppPointerInput) => void
  onPointerMove: (event: CanvasAppPointerInput) => void
  onPointerUp: (event: CanvasAppPointerInput) => void
  onResizePointerDown: (
    event: CanvasAppPointerInput,
    handle: ResizeHandle,
  ) => void
}

export type CanvasAppPointerConsumerModel = {
  itemLayerHandlers: CanvasAppPointerItemLayerHandlers
  stageHandlers: CanvasAppPointerStageHandlers
}

export type CanvasAppPointerDownRuntime = {
  handleCanvasPointerDown: (event: CanvasAppPointerInput) => void
  handleItemPointerDown: (
    event: CanvasAppPointerInput,
    itemId: string,
  ) => void
  handleResizePointerDown: (
    event: CanvasAppPointerInput,
    handle: ResizeHandle,
  ) => void
  handleTextDoubleClick: (item: CanvasEditableTextItem) => void
}

export type CanvasAppPointerDragRuntime = {
  handlePointerCancel: (event: CanvasAppPointerInput) => void
  handlePointerMove: (event: CanvasAppPointerInput) => void
  handlePointerUp: (event: CanvasAppPointerInput) => void
}

export type CanvasAppPointerConsumerModelInput = {
  downHandlers: CanvasAppPointerDownRuntime
  dragHandlers: CanvasAppPointerDragRuntime
}

export type CanvasAppPointerCommandModel = {
  cloneItems: (ids: string[], offset: Point) => CanvasItem[]
  commitItemsChange: CommitCanvasItemsChange
  commitSelection: CommitCanvasSelection
}

export type CanvasAppPointerInteractionModel = {
  interactionRef: MutableRefObject<Interaction>
  setDraftArrow: Dispatch<SetStateAction<CanvasDraftArrowOverlay | null>>
  setDraftRect: Dispatch<SetStateAction<Bounds | null>>
  setDraftStroke: Dispatch<SetStateAction<CanvasDraftStrokeOverlay | null>>
  setGesture: Dispatch<SetStateAction<Interaction['kind']>>
  setMarquee: Dispatch<SetStateAction<Bounds | null>>
  setSnapGuides: Dispatch<SetStateAction<CanvasSnapGuides>>
  setTool: Dispatch<SetStateAction<Tool>>
  spaceDown: boolean
  tool: Tool
}

export type CanvasAppPointerItemAdapters = {
  creation: CanvasCreationAdapter<CanvasItem>
  transform: CanvasTransformAdapter<CanvasItem>
}

export type CanvasAppPointerWorkspaceModel = {
  itemReadModel: CanvasItemReadModel
  items: CanvasItem[]
  scene: CanvasSceneAdapter
  selectedBounds: Bounds | null
  selection: string[]
  setEditing: Dispatch<SetStateAction<EditingText | null>>
  setLiveItems: Dispatch<SetStateAction<CanvasItem[]>>
  setSelection: Dispatch<SetStateAction<string[]>>
  setViewport: Dispatch<SetStateAction<Viewport>>
  viewport: Viewport
}

export type CanvasAppPointerModelInput = {
  command: CanvasAppPointerCommandModel
  config: CanvasAffordanceConfig
  createId: (prefix: string) => string
  customCreationTools: readonly CanvasAppCustomCreationTool[]
  interaction: CanvasAppPointerInteractionModel
  itemAdapters: CanvasAppPointerItemAdapters
  stageElement: CanvasAppStageElement
  workspace: CanvasAppPointerWorkspaceModel
}

export type CanvasAppStageItemLayerContext = {
  items: CanvasItem[]
  selected: Set<string>
}

export type CanvasAppStageRenderingContext = {
  componentPresentationRenderers: CanvasAppComponentPresentationRenderers
  customItemRenderers: CanvasAppCustomItemRenderers
  getComponentPresentation: (component: string) => string
  itemLayerAdapter: CanvasAppItemLayerAdapter
  stageAdapter: CanvasAppStageAdapter
}

export type CanvasAppStageContext = {
  activeMode: Tool
  gesture: CanvasInteractionKind
  overlays: CanvasOverlayState
  stageElement: CanvasAppStageMount
  viewport: Viewport
}

export type CanvasAppStageModelInput = {
  blurTextEditor: () => void
  itemLayer: CanvasAppStageItemLayerContext
  pointer: CanvasAppPointerConsumerModel
  rendering: CanvasAppStageRenderingContext
  stage: CanvasAppStageContext
}

export type CanvasAppStageElementConsumerModelInput = {
  stageElement: CanvasAppStageElementController
}

export type CanvasAppStageElementControllerContext = {
  stageElement: CanvasAppStageElementController
}

export type CanvasAppStageElementStageContext = {
  stageElement: CanvasAppStageElementController['mount']
}

export type CanvasAppStageElementConsumerModel = {
  command: CanvasAppStageElementControllerContext
  component: CanvasAppStageElementControllerContext
  pointer: CanvasAppStageElementControllerContext
  stage: CanvasAppStageElementStageContext
  viewport: CanvasAppStageElementControllerContext
}
