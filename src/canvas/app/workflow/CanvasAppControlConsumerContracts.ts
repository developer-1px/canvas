import type {
  CanvasAffordanceConfig,
  CanvasSceneAdapter,
} from '../../engine'
import type {
  CanvasComponentKind,
  CanvasInteractionKind,
  Tool,
  Viewport,
} from '../../entities'
import type { CanvasAppComponentTemplate } from './CanvasAppComponentAssemblyContracts'
import type {
  CanvasAppCustomCommandState,
  CanvasAppCustomCreationToolState,
} from '../extensions/CanvasAppExtensionStateContracts'
import type { CanvasAppControlCommandHandlers } from './CanvasAppControlCommandContracts'

export type CanvasAppControlModelInput = {
  canRedo: boolean
  canUndo: boolean
  commandHandlers: CanvasAppControlCommandHandlers
  components: readonly CanvasAppComponentTemplate[]
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
