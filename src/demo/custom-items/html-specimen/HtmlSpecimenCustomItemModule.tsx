import {
  defineCanvasAppCustomItemModule,
} from '../../../canvas'
import { htmlSpecimenItemRenderer } from './HtmlSpecimenCustomItemRenderer'
import {
  isHtmlSpecimenData,
} from './HtmlSpecimenCustomItemModel'
import { createHtmlSpecimenPasteCommand } from './HtmlSpecimenPasteCommand'
import {
  HTML_SPECIMEN_CSS_INSPECTOR_PANEL,
} from './HtmlSpecimenCssInspectorPanel'
import {
  htmlSpecimenTextPasteImporter,
} from './HtmlSpecimenTextPasteImporter'
import { htmlSpecimenTool } from './HtmlSpecimenCustomItemTool'
import './HtmlSpecimenCustomItemModule.css'

const HTML_SPECIMEN_CUSTOM_ITEM_MODULE = defineCanvasAppCustomItemModule({
  id: 'html-specimen',
  presentation: 'html-specimen',
  renderItem: htmlSpecimenItemRenderer,
  validateItem: (item) => isHtmlSpecimenData(item.data),
  customCommands: [createHtmlSpecimenPasteCommand()],
  customCreationTools: [htmlSpecimenTool],
  inspectorPanels: [HTML_SPECIMEN_CSS_INSPECTOR_PANEL],
  textPasteImporters: [htmlSpecimenTextPasteImporter],
})

export default HTML_SPECIMEN_CUSTOM_ITEM_MODULE
