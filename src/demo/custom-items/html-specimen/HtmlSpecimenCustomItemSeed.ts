import type { CanvasCustomItem } from '../../../canvas'
import { createDesignSystemSpecimenData } from './HtmlSpecimenCustomItemModel'

export function createHtmlSpecimenSeedItem(): CanvasCustomItem {
  return {
    id: 'html-specimen-design-system',
    type: 'custom',
    kind: 'html-specimen',
    presentation: 'html-specimen',
    title: 'Design system specimen',
    x: 72,
    y: 40,
    w: 800,
    h: 540,
    data: createDesignSystemSpecimenData(),
  }
}
