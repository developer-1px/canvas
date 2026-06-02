import type { CanvasAppCustomCommand } from '../affordances/commands/CanvasAppCustomCommands'
import type { CanvasAppInspectorPanel } from '../affordances/editing/inspector/CanvasAppInspectorPanels'
import type {
  CanvasAppCustomItemModuleAssemblyOptions,
} from '../extensions/custom-item-modules/CanvasAppCustomItemModuleAssembly'
import type { CanvasAppCustomItemModule } from '../extensions/custom-item-modules/CanvasAppCustomItemModules'
import type { CanvasAppFoundationExtension } from '../extensions/CanvasAppFoundationExtensionDescriptors'
import type { CanvasMediaImporter } from '../affordances/io/media/CanvasMediaImporters'
import type { CanvasTextPasteImporter } from '../affordances/io/text-paste/CanvasTextPasteImporters'

export type CanvasAppExtensionAssemblyInput = {
  customCommands?: readonly CanvasAppCustomCommand[]
  customItemModules?: readonly CanvasAppCustomItemModule[]
  disabledCustomItemModuleIds?: CanvasAppCustomItemModuleAssemblyOptions['disabledModuleIds']
  foundationExtensions?: readonly CanvasAppFoundationExtension[]
  inspectorPanels?: readonly CanvasAppInspectorPanel[]
  mediaImporters?: readonly CanvasMediaImporter[]
  textPasteImporters?: readonly CanvasTextPasteImporter[]
}
