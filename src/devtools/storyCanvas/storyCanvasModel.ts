import type { CanvasItem } from '../../canvas';
import type { CanvasViewportLayerSnapshot } from './CanvasViewportBridge';
import {
  elementDescriptor,
  sourceFilePath,
  type LayerElement,
} from './elementSelection';
import { STORY_GROUP_KIND, STORY_WIDGET_KIND } from './storyBoard';
import type { StoryElementInstanceInfo } from './StoryElementPanel';
import type { StoryCanvasPageEntry } from './storyCanvasPages';
import type { StoryRecord } from './storyData';

export type StoryMeasuredSize = { h: number; w: number };
export type StoryMeasurement = { size: StoryMeasuredSize; storyId: string };

export type StoryElementSelection = {
  element: LayerElement;
  snapshot: CanvasViewportLayerSnapshot | null;
  storyId: string;
  version: number;
};

export type CanvasBounds = {
  h: number;
  w: number;
  x: number;
  y: number;
};

export type CameraFocusTarget =
  | { kind: 'page' }
  | { kind: 'story'; storyId: string };

export type CameraFocusRequest = CameraFocusTarget & {
  sequence: number;
};

export type ElementInstanceTarget = StoryElementInstanceInfo & {
  targetPagePath: string | null;
  targetStoryId: string | null;
};

export type StoryTreeHover = {
  element: LayerElement | null;
  storyId: string;
  version: number;
};

export function canvasItemsBounds(items: CanvasItem[]): CanvasBounds | null {
  if (items.length === 0) return null;
  const minX = Math.min(...items.map((item) => item.x));
  const minY = Math.min(...items.map((item) => item.y));
  const maxX = Math.max(...items.map((item) => item.x + item.w));
  const maxY = Math.max(...items.map((item) => item.y + item.h));
  return { h: maxY - minY, w: maxX - minX, x: minX, y: minY };
}

export function isStoryCanvasContentItem(item: CanvasItem) {
  return 'kind' in item && (
    item.kind === STORY_GROUP_KIND ||
    item.kind === STORY_WIDGET_KIND
  );
}

export function paddedCanvasBounds(bounds: CanvasBounds, padding: number): CanvasBounds {
  return {
    h: bounds.h + padding * 2,
    w: bounds.w + padding * 2,
    x: bounds.x - padding,
    y: bounds.y - padding,
  };
}

export function elementInstanceTarget(
  element: LayerElement | null,
  currentStory: StoryRecord | undefined,
  storyRecords: StoryRecord[],
  storyCanvasPages: StoryCanvasPageEntry[],
): ElementInstanceTarget | null {
  if (!element?.isConnected || !currentStory) return null;
  const sourcePath = sourceFilePath(elementDescriptor(element).source);
  const storyPath = sourceFilePath(currentStory.path);
  if (!sourcePath || !storyPath || sourcePath === storyPath) return null;

  const targetStory = findStoryBySourcePath(sourcePath, storyRecords);
  const targetPage = targetStory
    ? storyCanvasPages.find((page) => page.storyIds.has(targetStory.id))
    : null;

  return {
    canGoToTarget: Boolean(targetStory && targetPage),
    sourcePath,
    targetLabel: targetStory?.name ?? sourcePath,
    targetPagePath: targetPage?.path ?? null,
    targetStoryId: targetStory?.id ?? null,
  };
}

export function sourceReferenceForSelection(element: LayerElement | null, story: StoryRecord | undefined) {
  if (element?.isConnected) return sourceReferenceFromSource(elementDescriptor(element).source);
  return story ? sourceReferenceFromSource(story.path) : '';
}

export function sourceReferenceFromSource(source: string) {
  const normalized = source.replace(/\\/g, '/');
  const match = normalized.match(/^(.+?):(\d+)(?::\d+)?$/);
  const path = sourceReferencePath(match ? match[1] : normalized);
  const line = match?.[2] ?? '';
  return line ? `@${path}:${line}` : `@${path}`;
}

function findStoryBySourcePath(sourcePath: string, storyRecords: StoryRecord[]) {
  return storyRecords
    .filter((story) => sourceFilePath(story.path) === sourcePath)
    .sort((a, b) => storySourceOrder(a) - storySourceOrder(b) || a.name.localeCompare(b.name))[0] ?? null;
}

function storySourceOrder(story: StoryRecord) {
  if (story.storyExport === 'Default') return -1;
  if (story.responsiveViewport) return story.responsiveViewport.order;
  return 999;
}

function sourceReferencePath(path: string) {
  const normalized = path.replace(/\\/g, '/').replace(/^\//, '');
  const reactSrcIndex = normalized.lastIndexOf('react/src/');
  if (reactSrcIndex >= 0) return normalized.slice(reactSrcIndex);
  const srcIndex = normalized.lastIndexOf('/src/');
  if (srcIndex >= 0) return `react/src/${normalized.slice(srcIndex + 5)}`;
  if (normalized.startsWith('src/')) return `react/${normalized}`;
  if (normalized.startsWith('react/')) return normalized;
  return `react/src/${normalized}`;
}
