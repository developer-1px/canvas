import type {
  CanvasCustomItem,
  Point,
} from '../../../canvas'
import {
  createHtmlSpecimenDataFromPastedText,
} from './HtmlSpecimenPasteArtifact'

const HTML_SPECIMEN_CHROME_WIDTH = 40
const HTML_SPECIMEN_CHROME_HEIGHT = 44
const HTML_SPECIMEN_MIN_WIDTH = 340
const HTML_SPECIMEN_MIN_HEIGHT = 220

export function createHtmlSpecimenItemFromPastedText({
  createId,
  position,
  text,
  viewport,
}: {
  createId: (prefix: string) => string
  position: Point
  text: string
  viewport?: {
    height?: number
    width?: number
  }
}): CanvasCustomItem | null {
  const result = createHtmlSpecimenDataFromPastedText(text, viewport)

  if (!result) {
    return null
  }

  const { data } = result

  return {
    data,
    h: Math.max(
      HTML_SPECIMEN_MIN_HEIGHT,
      data.viewportHeight + HTML_SPECIMEN_CHROME_HEIGHT,
    ),
    id: createId('html-specimen'),
    kind: 'html-specimen',
    locked: false,
    presentation: 'html-specimen',
    title: 'HTML specimen',
    type: 'custom',
    w: Math.max(
      HTML_SPECIMEN_MIN_WIDTH,
      data.viewportWidth + HTML_SPECIMEN_CHROME_WIDTH,
    ),
    x: position.x,
    y: position.y,
  }
}
