import type { CanvasAppCustomCommand } from '../commands/CanvasAppCustomCommands'
import type { CanvasAppInspectorPanel } from '../editing/inspector/CanvasAppInspectorPanels'
import type {
  CanvasAppCustomItemModuleAssemblyOptions,
} from '../extensions/custom-item-modules/CanvasAppCustomItemModuleAssembly'
import type { CanvasAppCustomItemModule } from '../extensions/custom-item-modules/CanvasAppCustomItemModules'

export type CanvasAppExtensionAssemblyInput = {
  customCommands?: readonly CanvasAppCustomCommand[]
  customItemModules?: readonly CanvasAppCustomItemModule[]
  disabledCustomItemModuleIds?: CanvasAppCustomItemModuleAssemblyOptions['disabledModuleIds']
  inspectorPanels?: readonly CanvasAppInspectorPanel[]
}
