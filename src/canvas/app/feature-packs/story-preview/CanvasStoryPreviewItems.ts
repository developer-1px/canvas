import type { ReactNode } from 'react'
import type {
  CanvasCustomItem,
  CanvasJsonObject,
} from '../../../entities'
import {
  createCanvasAppExtensionBundle,
  mergeCanvasAppExtensionBundle,
} from '../../extensions/CanvasAppExtensionBundle'
import {
  getCanvasAppCustomItemModuleExtensionBundle,
} from '../../extensions/custom-item-modules/CanvasAppCustomItemModuleRuntime'
import {
  defineCanvasAppCustomItemModule,
  type CanvasAppCustomItemModule,
} from '../../extensions/custom-item-modules/CanvasAppCustomItemModules'
import {
  createCanvasAppFeaturePack,
  type CanvasAppFeaturePack,
} from '../CanvasAppFeaturePacks'
import {
  createCanvasAppFeaturePackManifest,
  type CanvasAppFeaturePackManifest,
} from '../CanvasAppFeaturePackManifests'

export const CANVAS_STORY_PREVIEW_ITEM_KIND = 'canvas-story-preview'
export const CANVAS_STORY_PREVIEW_ITEM_PRESENTATION = 'canvas-story-preview-card'
export const CANVAS_STORY_PREVIEW_GROUP_KIND = 'canvas-story-preview-group'
export const CANVAS_STORY_PREVIEW_GROUP_PRESENTATION = 'canvas-story-preview-group-box'
export const CANVAS_STORY_PREVIEW_ITEMS_FEATURE_PACK_ID = 'story-preview-items'

export type CanvasStoryPreviewItemData = CanvasJsonObject & {
  storyId: string
}

export type CanvasStoryPreviewGroupData = CanvasJsonObject & {
  count?: number
  groupLabel: string
}

export type CanvasStoryPreviewItemRenderInput = {
  item: CanvasCustomItem & { data: CanvasStoryPreviewItemData }
  storyId: string
}

export type CanvasStoryPreviewGroupRenderInput = {
  count?: number
  groupLabel: string
  item: CanvasCustomItem & { data: CanvasStoryPreviewGroupData }
}

export type CanvasStoryPreviewItemsFeaturePackInput = {
  label?: string
  renderGroupItem: (input: CanvasStoryPreviewGroupRenderInput) => ReactNode
  renderPreviewItem: (input: CanvasStoryPreviewItemRenderInput) => ReactNode
}

export function createCanvasStoryPreviewItemModules({
  renderGroupItem,
  renderPreviewItem,
}: CanvasStoryPreviewItemsFeaturePackInput): readonly CanvasAppCustomItemModule[] {
  return Object.freeze([
    defineCanvasAppCustomItemModule({
      id: CANVAS_STORY_PREVIEW_GROUP_KIND,
      presentation: CANVAS_STORY_PREVIEW_GROUP_PRESENTATION,
      renderItem: ({ item }) => {
        const groupItem = item as CanvasCustomItem & {
          data: CanvasStoryPreviewGroupData
        }

        return renderGroupItem({
          count: groupItem.data.count,
          groupLabel: groupItem.data.groupLabel,
          item: groupItem,
        })
      },
      validateItem: isCanvasStoryPreviewGroupItem,
    }),
    defineCanvasAppCustomItemModule({
      id: CANVAS_STORY_PREVIEW_ITEM_KIND,
      presentation: CANVAS_STORY_PREVIEW_ITEM_PRESENTATION,
      renderItem: ({ item }) => {
        const storyItem = item as CanvasCustomItem & {
          data: CanvasStoryPreviewItemData
        }

        return renderPreviewItem({
          item: storyItem,
          storyId: storyItem.data.storyId,
        })
      },
      validateItem: isCanvasStoryPreviewItem,
    }),
  ])
}

export function createCanvasStoryPreviewItemsFeaturePack(
  input: CanvasStoryPreviewItemsFeaturePackInput,
): CanvasAppFeaturePack {
  const modules = createCanvasStoryPreviewItemModules(input)
  const extensionBundle = modules.reduce(
    (current, module) => mergeCanvasAppExtensionBundle({
      current,
      entries: getCanvasAppCustomItemModuleExtensionBundle(module),
      owner: 'custom item module',
    }),
    createCanvasAppExtensionBundle(),
  )

  return createCanvasAppFeaturePack({
    extensionBundle,
    id: CANVAS_STORY_PREVIEW_ITEMS_FEATURE_PACK_ID,
    label: input.label ?? 'Story preview items',
  })
}

export function createCanvasStoryPreviewItemsFeaturePackManifest(
  input: CanvasStoryPreviewItemsFeaturePackInput,
): CanvasAppFeaturePackManifest {
  const extensionFeaturePack = createCanvasStoryPreviewItemsFeaturePack(input)

  return createCanvasAppFeaturePackManifest({
    category: 'view',
    contributes: {
      surfaces: ['item-renderer', 'item-schema'],
    },
    extensionFeaturePack,
    id: CANVAS_STORY_PREVIEW_ITEMS_FEATURE_PACK_ID,
    label: extensionFeaturePack.label,
    lifecycle: {
      partialUpdate: ['item-renderer', 'item-schema'],
      runtimeToggleable: true,
    },
  })
}

export function isCanvasStoryPreviewItem(
  item: CanvasCustomItem,
): item is CanvasCustomItem & { data: CanvasStoryPreviewItemData } {
  return item.kind === CANVAS_STORY_PREVIEW_ITEM_KIND &&
    item.presentation === CANVAS_STORY_PREVIEW_ITEM_PRESENTATION &&
    typeof item.data.storyId === 'string'
}

export function isCanvasStoryPreviewGroupItem(
  item: CanvasCustomItem,
): item is CanvasCustomItem & { data: CanvasStoryPreviewGroupData } {
  return item.kind === CANVAS_STORY_PREVIEW_GROUP_KIND &&
    item.presentation === CANVAS_STORY_PREVIEW_GROUP_PRESENTATION &&
    typeof item.data.groupLabel === 'string'
}
