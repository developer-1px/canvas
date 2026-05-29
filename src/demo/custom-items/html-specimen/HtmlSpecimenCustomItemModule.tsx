import {
  defineCanvasAppCustomItemModule,
} from '../../../canvas'
import { htmlSpecimenItemRenderer } from './HtmlSpecimenCustomItemRenderer'
import {
  isHtmlSpecimenData,
} from './HtmlSpecimenCustomItemModel'
import { htmlSpecimenTool } from './HtmlSpecimenCustomItemTool'
import './HtmlSpecimenCustomItemModule.css'

const HTML_SPECIMEN_CUSTOM_ITEM_MODULE = defineCanvasAppCustomItemModule({
  id: 'html-specimen',
  presentation: 'html-specimen',
  renderItem: htmlSpecimenItemRenderer,
  validateItem: (item) => isHtmlSpecimenData(item.data),
  customCreationTools: [htmlSpecimenTool],
})

export default HTML_SPECIMEN_CUSTOM_ITEM_MODULE
