import type { CanvasItem } from '../canvas'
import { createHtmlSpecimenSeedItem } from './custom-items/html-specimen/HtmlSpecimenCustomItemSeed'
import { DEMO_REPO_STORY_EVENTS } from './story/CanvasRepoStoryEvents'
import { createCanvasStoryItems } from './story/CanvasStoryGenerator'

export const DEMO_CANVAS_SEED_ITEMS: CanvasItem[] =
  [
    ...createCanvasStoryItems(DEMO_REPO_STORY_EVENTS),
    createHtmlSpecimenSeedItem(),
  ]
