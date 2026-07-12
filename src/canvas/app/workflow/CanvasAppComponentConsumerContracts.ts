import type {
  Dispatch,
  SetStateAction,
} from 'react'
import type {
  CanvasAffordanceConfig,
  CanvasCreationAdapter,
} from '../../engine'
import type {
  CanvasComponentKind,
  CanvasItem,
  CanvasSide,
  EditingText,
  Point,
  Tool,
  Viewport,
} from '../../entities'
import type { CanvasAppComponentLibrary } from './CanvasAppComponentAssemblyContracts'
import type { CanvasAppItemReadModel } from './CanvasAppItemReadModelContracts'
import type { CanvasAppStageElement } from '../rendering/stage/CanvasAppStageElement'
import type { CommitCanvasItemsChange } from './CanvasWorkflowContract'
import type {
  CanvasAppFoundationExtensionRuntime,
} from '../extensions/foundation-extensions'

export type CanvasAppComponentCommandModel = {
  commitItemsChange: CommitCanvasItemsChange
}

export type CanvasAppComponentInteractionModel = {
  setEditing: Dispatch<SetStateAction<EditingText | null>>
  setTool: Dispatch<SetStateAction<Tool>>
}

export type CanvasAppComponentWorkspaceModel = {
  itemReadModel: CanvasAppItemReadModel
  selection: string[]
  viewport: Viewport
}

export type CanvasAppComponentModelInput = {
  command: CanvasAppComponentCommandModel
  componentLibrary: CanvasAppComponentLibrary
  config: CanvasAffordanceConfig
  creationAdapter: CanvasCreationAdapter<CanvasItem>
  createId: (prefix: string) => string
  foundationExtensionRuntime: CanvasAppFoundationExtensionRuntime
  interaction: CanvasAppComponentInteractionModel
  stageElement: CanvasAppStageElement
  workspace: CanvasAppComponentWorkspaceModel
}

export type CanvasAppStickyQuickCreateControlContext = {
  controls: readonly CanvasAppStickyQuickCreateControlPoint[]
  visible: boolean
  onQuickCreate: (direction: CanvasSide) => boolean
}

export type CanvasAppStickyQuickCreateControlPoint = Point & {
  direction: CanvasSide
}

export type CanvasAppComponentControlContext = {
  onInsertComponent: (component: CanvasComponentKind) => void
  stickyQuickCreate: CanvasAppStickyQuickCreateControlContext
}

export type CanvasAppComponentKeyboardContext = {
  quickCreateSticky: () => boolean
}

export type CanvasAppComponentModel = {
  control: CanvasAppComponentControlContext
  keyboard: CanvasAppComponentKeyboardContext
}
