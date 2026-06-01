import type { CanvasCustomItem } from '../../../canvas'
import {
  createDesignSystemSpecimenData,
} from './HtmlSpecimenCustomItemModel'

export const HTML_SPECIMEN_SEED_ITEM_ID = 'html-specimen-design-system'

export function createHtmlSpecimenSeedItem(): CanvasCustomItem {
  const specimen = createDesignSystemSpecimenData()

  return {
    id: HTML_SPECIMEN_SEED_ITEM_ID,
    type: 'custom',
    kind: 'html-specimen',
    presentation: 'html-specimen',
    title: 'Design system specimen',
    x: 0,
    y: 0,
    w: specimen.viewportWidth,
    h: specimen.viewportHeight,
    data: specimen,
  }
}
