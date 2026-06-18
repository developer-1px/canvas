import type { CanvasAppCustomCommand } from '../extensions/custom-commands'
import type { CanvasAppInspectorPanel } from '../extensions/inspector-panels'
import type {
  CanvasAppItemsChangeTransformer,
} from '../extensions/items-change-transformers'
import type {
  CanvasAppCustomItemModuleAssemblyOptions,
} from '../extensions/custom-item-modules/CanvasAppCustomItemModuleAssembly'
import type { CanvasAppCustomItemModule } from '../extensions/custom-item-modules/CanvasAppCustomItemModules'
import type { CanvasAppFoundationExtension } from '../extensions/foundation-extensions'
import type {
  CanvasMediaImporter,
  CanvasTextPasteImporter,
} from '../feature-packs'

export type CanvasAppExtensionAssemblyInput = {
  customCommands?: readonly CanvasAppCustomCommand[]
  customItemModules?: readonly CanvasAppCustomItemModule[]
  disabledCustomItemModuleIds?: CanvasAppCustomItemModuleAssemblyOptions['disabledModuleIds']
  foundationExtensions?: readonly CanvasAppFoundationExtension[]
  inspectorPanels?: readonly CanvasAppInspectorPanel[]
  itemsChangeTransformers?: readonly CanvasAppItemsChangeTransformer[]
  mediaImporters?: readonly CanvasMediaImporter[]
  textPasteImporters?: readonly CanvasTextPasteImporter[]
}
