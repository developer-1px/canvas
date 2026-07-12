import type { CanvasAppCustomCommand } from '../extensions/custom-commands'
import type { CanvasAppInspectorPanel } from '../extensions/inspector-panels'
import type {
  CanvasAppCustomItemModuleAssemblyOptions,
} from '../extensions/custom-item-modules/CanvasAppCustomItemModuleAssembly'
import type { CanvasAppCustomItemModule } from '../extensions/custom-item-modules/CanvasAppCustomItemModules'
import type { CanvasAppFoundationExtension } from '../extensions/foundation-extensions'
import type {
  CanvasAppFoundationExtensionCapabilityAdapter,
} from '../extensions/foundation-extensions'
import type {
  CanvasMediaImporter,
  CanvasTextPasteImporter,
} from '../feature-packs'

export type CanvasAppExtensionAssemblyInput = {
  customCommands?: readonly CanvasAppCustomCommand[]
  customItemModules?: readonly CanvasAppCustomItemModule[]
  disabledCustomItemModuleIds?: CanvasAppCustomItemModuleAssemblyOptions['disabledModuleIds']
  foundationExtensions?: readonly CanvasAppFoundationExtension[]
  foundationExtensionAdapters?:
    readonly CanvasAppFoundationExtensionCapabilityAdapter[]
  inspectorPanels?: readonly CanvasAppInspectorPanel[]
  mediaImporters?: readonly CanvasMediaImporter[]
  textPasteImporters?: readonly CanvasTextPasteImporter[]
}
