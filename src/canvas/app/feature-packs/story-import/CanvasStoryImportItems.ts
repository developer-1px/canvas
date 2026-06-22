import type {
  CanvasCustomItem,
} from '../../../entities'
import {
  CANVAS_COMPONENT_DEFINITION_ROOT_SLOT_ID,
  type CanvasComponentDefinition,
} from '../../../host'
import {
  CANVAS_STORY_PREVIEW_GROUP_KIND,
  CANVAS_STORY_PREVIEW_GROUP_PRESENTATION,
  CANVAS_STORY_PREVIEW_ITEM_KIND,
  CANVAS_STORY_PREVIEW_ITEM_PRESENTATION,
  type CanvasStoryPreviewGroupData,
  type CanvasStoryPreviewItemData,
} from '../story-preview'
import type {
  CanvasStoryImportGroup,
  CanvasStoryImportInput,
  CanvasStoryImportStory,
} from './CanvasStoryImportContracts'

export function createCanvasStoryImportItems({
  groups,
}: CanvasStoryImportInput): readonly CanvasCustomItem[] {
  const items: CanvasCustomItem[] = []
  const itemIds = new Set<string>()

  for (const group of groups) {
    if (group.label) {
      const groupItem = createCanvasStoryPreviewGroupItem(group)

      assertCanvasStoryImportUniqueItemId(itemIds, groupItem.id)
      items.push(groupItem)
    }

    for (const story of group.stories) {
      const storyItem = createCanvasStoryPreviewItem(story)

      assertCanvasStoryImportUniqueItemId(itemIds, storyItem.id)
      items.push(storyItem)
    }
  }

  return Object.freeze(items)
}

export function createCanvasStoryImportComponentDefinitions({
  groups,
}: CanvasStoryImportInput): readonly CanvasComponentDefinition[] {
  const definitions: CanvasComponentDefinition[] = []
  const definitionIds = new Set<string>()

  for (const group of groups) {
    const label = group.label ?? null

    if (!label || group.stories.length === 0) {
      continue
    }

    const definition = createCanvasStoryImportComponentDefinition(group, label)

    assertCanvasStoryImportUniqueComponentDefinitionId(
      definitionIds,
      definition.id,
    )
    definitions.push(definition)
  }

  return Object.freeze(definitions)
}

function createCanvasStoryImportComponentDefinition(
  group: CanvasStoryImportGroup,
  label: string,
): CanvasComponentDefinition {
  return {
    id: `story-import-${group.id}`,
    instances: group.stories.map((story) => ({
      label: story.title,
      slots: {
        [CANVAS_COMPONENT_DEFINITION_ROOT_SLOT_ID]: `story-${story.id}`,
      },
    })),
    label,
    source: group.source,
  }
}

function createCanvasStoryPreviewGroupItem(
  group: CanvasStoryImportGroup,
): CanvasCustomItem & { data: CanvasStoryPreviewGroupData } {
  const groupLabel = group.label ?? group.title ?? group.id

  return {
    data: {
      count: group.count ?? group.stories.length,
      groupLabel,
    },
    h: group.h,
    id: `group-${group.id}`,
    kind: CANVAS_STORY_PREVIEW_GROUP_KIND,
    presentation: CANVAS_STORY_PREVIEW_GROUP_PRESENTATION,
    title: group.title ?? groupLabel,
    type: 'custom',
    w: group.w,
    x: group.x,
    y: group.y,
  }
}

function createCanvasStoryPreviewItem(
  story: CanvasStoryImportStory,
): CanvasCustomItem & { data: CanvasStoryPreviewItemData } {
  return {
    data: {
      storyId: story.id,
    },
    h: story.h,
    id: `story-${story.id}`,
    kind: CANVAS_STORY_PREVIEW_ITEM_KIND,
    presentation: CANVAS_STORY_PREVIEW_ITEM_PRESENTATION,
    title: story.title,
    type: 'custom',
    w: story.w,
    x: story.x,
    y: story.y,
  }
}

function assertCanvasStoryImportUniqueItemId(
  itemIds: Set<string>,
  itemId: string,
) {
  if (itemIds.has(itemId)) {
    throw new Error(`Duplicate canvas story import item: ${itemId}`)
  }

  itemIds.add(itemId)
}

function assertCanvasStoryImportUniqueComponentDefinitionId(
  definitionIds: Set<string>,
  definitionId: string,
) {
  if (definitionIds.has(definitionId)) {
    throw new Error(
      `Duplicate canvas story import component definition: ${definitionId}`,
    )
  }

  definitionIds.add(definitionId)
}
