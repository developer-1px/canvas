import type { CanvasCustomItem } from '../../../canvas'
import {
  createInternalAdminAppSpecimenData,
} from './HtmlSpecimenCustomItemModel'

export const HTML_SPECIMEN_SEED_ITEM_ID = 'html-specimen-internal-admin'

export function createHtmlSpecimenSeedItem(): CanvasCustomItem {
  return {
    id: HTML_SPECIMEN_SEED_ITEM_ID,
    type: 'custom',
    kind: 'html-specimen',
    presentation: 'html-specimen',
    title: 'Customer onboarding admin',
    x: 48,
    y: 44,
    w: 980,
    h: 660,
    data: createInternalAdminAppSpecimenData(),
  }
}
