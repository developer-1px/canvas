import type { Point } from '../../core'
import type {
  CanvasComponentItem,
  CanvasItem,
  TextItem,
  GroupItem,
} from '../model'
import { isCanvasGroupItem } from '../tree/CanvasGroupItem'
import { syncGroupBounds } from '../tree/CanvasTreeBounds'

export const CANVAS_LINK_PREVIEW_COMPONENT_KIND = 'link-preview'
export const CANVAS_LINK_PREVIEW_COMPONENT_PRESENTATION =
  'link-preview-card'

export type CanvasLinkPreviewComponentItem = CanvasComponentItem & {
  body: string
  component: typeof CANVAS_LINK_PREVIEW_COMPONENT_KIND
  url: string
}

export type CreateCanvasLinkPreviewComponentItemInput = {
  id: string
  point: Point
  title?: string
  url: string
}

const CANVAS_LINK_PREVIEW_DEFAULT_SIZE = Object.freeze({
  h: 148,
  w: 320,
})

export function createCanvasLinkPreviewComponentItem({
  id,
  point,
  title,
  url,
}: CreateCanvasLinkPreviewComponentItemInput): CanvasLinkPreviewComponentItem {
  const previewUrl = normalizeCanvasLinkPreviewUrl(url)

  if (!previewUrl) {
    throw new Error('Canvas link preview requires an http or https URL')
  }

  return {
    accent: '#2563eb',
    body: previewUrl,
    component: CANVAS_LINK_PREVIEW_COMPONENT_KIND,
    fill: '#ffffff',
    h: CANVAS_LINK_PREVIEW_DEFAULT_SIZE.h,
    id,
    stroke: '#cbd5e1',
    title: title?.trim() || getCanvasLinkPreviewDomain(previewUrl),
    type: 'component',
    url: previewUrl,
    w: CANVAS_LINK_PREVIEW_DEFAULT_SIZE.w,
    x: point.x,
    y: point.y,
  }
}

export function isCanvasLinkPreviewComponentItem(
  item: CanvasItem,
): item is CanvasLinkPreviewComponentItem {
  return item.type === 'component' &&
    item.component === CANVAS_LINK_PREVIEW_COMPONENT_KIND
}

export function createCanvasLinkPreviewSourceTextItem(
  item: CanvasLinkPreviewComponentItem,
): TextItem {
  return {
    h: 42,
    id: item.id,
    ...(item.locked === undefined ? {} : { locked: item.locked }),
    text: item.url,
    type: 'text',
    w: item.w,
    x: item.x,
    y: item.y,
  }
}

export function replaceCanvasLinkPreviewComponentsWithSourceText(
  items: readonly CanvasItem[],
  selection: readonly string[],
): CanvasItem[] {
  const selected = new Set(selection)

  return items.map((item) =>
    replaceCanvasLinkPreviewItemWithSourceText(item, selected),
  )
}

export function isCanvasLinkPreviewUrl(value: string) {
  return normalizeCanvasLinkPreviewUrl(value) !== null
}

export function normalizeCanvasLinkPreviewUrl(value: string) {
  const trimmed = value.trim()

  if (!trimmed) {
    return null
  }

  try {
    const url = new URL(trimmed)

    return url.protocol === 'http:' || url.protocol === 'https:'
      ? url.href
      : null
  } catch {
    return null
  }
}

export function getCanvasLinkPreviewDomain(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./i, '') || url
  } catch {
    return url
  }
}

function replaceCanvasLinkPreviewItemWithSourceText(
  item: CanvasItem,
  selected: Set<string>,
): CanvasItem {
  if (isCanvasLinkPreviewComponentItem(item) && selected.has(item.id)) {
    return createCanvasLinkPreviewSourceTextItem(item)
  }

  if (isCanvasGroupItem(item)) {
    return replaceCanvasLinkPreviewChildrenWithSourceText(item, selected)
  }

  return item
}

function replaceCanvasLinkPreviewChildrenWithSourceText(
  item: GroupItem,
  selected: Set<string>,
): GroupItem {
  const nextChildren = item.children.map((child) =>
    replaceCanvasLinkPreviewItemWithSourceText(child, selected),
  )

  return nextChildren.every((child, index) => child === item.children[index])
    ? item
    : syncGroupBounds({ ...item, children: nextChildren })
}
