import type { StoryCanvasPage } from './StoryLayersPanel';
import {
  ROUTE_PAGE_INFOS,
  STORY_RECORDS,
  type PageRouteInfo,
  type StoryRecord,
} from './storyData';

export const PAGE_STORIES_PATH = '__page-stories';
export const ALL_STORIES_PATH = '__all-stories';
export const FOUNDATION_PAGE_PATH = '__foundation';
export const ENTITY_PAGE_PATH = '__entities';

export type StoryCanvasPageEntry = StoryCanvasPage & {
  storyIds: Set<string>;
};

export const INITIAL_STORY_CANVAS_PAGES = createStoryCanvasPages(STORY_RECORDS, ROUTE_PAGE_INFOS);
export const DEFAULT_STORY_PAGE_PATH = INITIAL_STORY_CANVAS_PAGES[0]?.path ?? '';

export function createStoryCanvasPages(stories: StoryRecord[], routeInfos: PageRouteInfo[]): StoryCanvasPageEntry[] {
  const allStoryIds = new Set(stories.map((story) => story.id));
  const visibleRouteInfos = routeInfos.filter(isDefaultStoryCanvasRouteInfo);
  const routePagePaths = new Set(visibleRouteInfos.map((route) => route.pagePath).filter((path): path is string => Boolean(path)));
  const pageStoryEntries = stories.filter((story) => routePagePaths.has(story.path) && isPageStoryRecord(story));
  const pageStoryIds = new Set(pageStoryEntries.map((story) => story.id));
  const pageStoriesByPath = new Map<string, StoryRecord[]>();
  const pageScopedStoriesByGroup = new Map<string, StoryRecord[]>();

  for (const story of pageStoryEntries) {
    pageStoriesByPath.set(story.path, [
      ...(pageStoriesByPath.get(story.path) ?? []),
      story,
    ]);
  }

  for (const story of stories) {
    if (!story.modulePath.startsWith('/src/pages/')) continue;
    if (pageStoryIds.has(story.id)) continue;
    const key = storyPageGroupKey(story);
    pageScopedStoriesByGroup.set(key, [...(pageScopedStoriesByGroup.get(key) ?? []), story]);
  }

  const pages: StoryCanvasPageEntry[] = stories.length > 0 ? [{
    count: stories.length,
    kind: 'overview' as const,
    label: 'All Stories',
    path: ALL_STORIES_PATH,
    storyIds: allStoryIds,
  }] : [];

  pages.push(
    ...visibleRouteInfos.map((route) => {
      const key = route.pagePath ? storyPageGroupKeyFromPath(route.pagePath) : '';
      const entries = route.pagePath ? [
        ...(pageStoriesByPath.get(route.pagePath) ?? []),
        ...(pageScopedStoriesByGroup.get(key) ?? []),
      ] : [];

      return {
        count: entries.length,
        kind: 'route' as const,
        label: routePageLabel(route),
        path: route.routePath,
        storyIds: new Set(entries.map((story) => story.id)),
      };
    }),
  );

  return pages;
}

function isDefaultStoryCanvasRouteInfo(route: PageRouteInfo) {
  return Boolean(route.pagePath)
    && !isRoutePathInPrefix(route.routePath, '/devtools')
    && !isRoutePathInPrefix(route.routePath, '/labs');
}

function isRoutePathInPrefix(routePath: string, prefix: string) {
  return routePath === prefix || routePath.startsWith(`${prefix}/`);
}

export function createFoundationStoryCanvasPages(stories: StoryRecord[]): StoryCanvasPageEntry[] {
  const foundationStories = stories.filter(isFoundationStoryRecord);
  const allStoryIds = new Set(foundationStories.map((story) => story.id));
  const pages: StoryCanvasPageEntry[] = [{
    count: foundationStories.length,
    kind: 'overview',
    label: 'Foundation',
    path: FOUNDATION_PAGE_PATH,
    storyIds: allStoryIds,
  }];
  const storiesByFolder = new Map<string, { folderLabel: string; folderPath: string; stories: StoryRecord[] }>();

  for (const story of foundationStories) {
    const folder = foundationFolderFromStoryPath(story.path);
    const current = storiesByFolder.get(folder.folderPath) ?? {
      ...folder,
      stories: [],
    };
    current.stories.push(story);
    storiesByFolder.set(folder.folderPath, current);
  }

  pages.push(
    ...Array.from(storiesByFolder.values())
      .sort((a, b) => a.folderPath.localeCompare(b.folderPath))
      .map((folder) => ({
        count: folder.stories.length,
        kind: 'route' as const,
        label: folder.folderLabel,
        path: folder.folderPath,
        storyIds: new Set(folder.stories.map((story) => story.id)),
      })),
  );

  return pages;
}

export function createEntityStoryCanvasPages(stories: StoryRecord[]): StoryCanvasPageEntry[] {
  const entityStories = stories.filter(isEntityStoryRecord);
  const allStoryIds = new Set(entityStories.map((story) => story.id));
  const pages: StoryCanvasPageEntry[] = [{
    count: entityStories.length,
    kind: 'overview',
    label: 'Entities',
    path: ENTITY_PAGE_PATH,
    storyIds: allStoryIds,
  }];
  const storiesByFolder = new Map<string, { folderLabel: string; folderPath: string; stories: StoryRecord[] }>();

  for (const story of entityStories) {
    const folder = entityFolderFromStoryPath(story.path);
    const current = storiesByFolder.get(folder.folderPath) ?? {
      ...folder,
      stories: [],
    };
    current.stories.push(story);
    storiesByFolder.set(folder.folderPath, current);
  }

  pages.push(
    ...Array.from(storiesByFolder.values())
      .sort((a, b) => a.folderPath.localeCompare(b.folderPath))
      .map((folder) => ({
        count: folder.stories.length,
        kind: 'route' as const,
        label: folder.folderLabel,
        path: folder.folderPath,
        storyIds: new Set(folder.stories.map((story) => story.id)),
      })),
  );

  return pages;
}

export function isFoundationStoryRecord(story: StoryRecord) {
  return story.path.startsWith('shared/');
}

export function isEntityStoryRecord(story: StoryRecord) {
  return story.path.startsWith('entities/') || story.path.includes('/entities/');
}

export function foundationFolderFromStoryPath(path: string) {
  const parts = path.split('/').filter(Boolean);
  const folderParts = parts[1] === 'ui'
    ? parts.slice(0, Math.min(parts.length - 1, 3))
    : parts.slice(0, Math.min(parts.length - 1, 2));
  const folderPath = folderParts.length > 0 ? folderParts.join('/') : 'shared';
  const folderName = folderParts[folderParts.length - 1] ?? 'shared';

  return {
    folderLabel: labelFromSegment(folderName),
    folderPath,
  };
}

export function entityFolderFromStoryPath(path: string) {
  const parts = path.split('/').filter(Boolean);
  const entityIndex = parts.findIndex((part) => part === 'entities');
  const folderParts = entityIndex >= 0
    ? parts.slice(0, Math.min(parts.length - 1, entityIndex + 2))
    : parts.slice(0, Math.min(parts.length - 1, 2));
  const folderPath = folderParts.length > 0 ? folderParts.join('/') : 'entities';
  const folderName = folderParts[folderParts.length - 1] ?? 'entities';

  return {
    folderLabel: labelFromSegment(folderName),
    folderPath,
  };
}

function isPageStoryRecord(story: StoryRecord) {
  return /(^|\/)Page[^/]*\.stories\.tsx$/.test(story.modulePath)
    && /(^|\/)Page[^/]*\.tsx$/.test(story.path);
}

function storyPageGroupKey(story: StoryRecord) {
  return storyPageGroupKeyFromPath(story.path);
}

function storyPageGroupKeyFromPath(path: string) {
  const parts = path.split('/');
  if (parts[0] !== 'pages') return 'pages/other';
  if (parts[1] === 'v2') {
    const segment = parts[2]?.startsWith('Page') ? 'root' : parts[2] ?? 'root';
    return `pages/v2/${segment}`;
  }
  return parts.slice(0, Math.min(parts.length - 1, 3)).join('/');
}

function routePageLabel(route: PageRouteInfo) {
  if (route.routePath === '/') return 'Root';
  const segments = route.routePath.replace(/\/$/, '').split('/').filter(Boolean);
  return labelFromSegment(segments[segments.length - 1] ?? route.routePath);
}

function labelFromSegment(value: string) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[-_]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((word) => word.toLowerCase() === 'css' ? 'CSS' : word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
