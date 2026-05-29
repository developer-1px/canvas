import type { CanvasTextPasteImporter } from '../../../canvas'
import { createHtmlSpecimenItemFromPastedText } from './HtmlSpecimenPasteItem'

export const htmlSpecimenTextPasteImporter: CanvasTextPasteImporter = {
  id: 'html-specimen',
  createItems: ({ createId, position, text }) => {
    const item = createHtmlSpecimenItemFromPastedText({
      createId,
      position,
      text,
    })

    if (!item) {
      return null
    }

    return [{
      ...item,
      x: Math.round(position.x - item.w / 2),
      y: Math.round(position.y - item.h / 2),
    }]
  },
}
