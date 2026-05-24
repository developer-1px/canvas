import type { CanvasAppCustomCommand } from '../commands/CanvasAppCustomCommands'
import type { CanvasAppInspectorPanel } from '../inspector/CanvasAppInspectorPanels'
import type {
  CanvasAppCustomItemModuleAssemblyOptions,
} from '../modules/CanvasAppCustomItemModuleAssembly'
import type { CanvasAppCustomItemModule } from '../modules/CanvasAppCustomItemModules'

export type CanvasAppExtensionAssemblyInput = {
  customCommands?: readonly CanvasAppCustomCommand[]
  customItemModules?: readonly CanvasAppCustomItemModule[]
  disabledCustomItemModuleIds?: CanvasAppCustomItemModuleAssemblyOptions['disabledModuleIds']
  inspectorPanels?: readonly CanvasAppInspectorPanel[]
}
