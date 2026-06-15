import { describe, expect, it } from 'vitest'
import {
  FIGMA_CLONE_DEFAULT_SECTION_VIEWPORT,
  FIGMA_CLONE_DOM_FRAME_KIND,
  createFigmaCloneDomEditorCanvasItems,
} from './index'

describe('FigmaCloneDomEditor package surface', () => {
  it('creates DOM editor frames without the demo widget frame', () => {
    const items = createFigmaCloneDomEditorCanvasItems()

    expect(items).toHaveLength(2)
    expect(items.map((item) => item.kind)).toEqual([
      FIGMA_CLONE_DOM_FRAME_KIND,
      FIGMA_CLONE_DOM_FRAME_KIND,
    ])
    expect(items.map((item) => item.data.rootId)).toEqual([
      'workspacePage',
      'homePage',
    ])
  })

  it('defaults sections to page mode', () => {
    expect(FIGMA_CLONE_DEFAULT_SECTION_VIEWPORT).toMatchObject({
      frameMode: 'page',
      overflow: 'scroll',
    })
  })
})
