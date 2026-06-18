import { Fragment, createElement, type ReactNode } from 'react';
import type { ComponentLayer, ComponentPreviewFrame } from '../componentLayerRegistry';
import type { CstarStoryParameters, StoryComponent, StoryObj } from '../componentStoryTypes';
import StoryPageViewport from './StoryPageViewport';
import { FIGMA_CLONE_DOM_STORY_MODULES } from './figmaCloneDomStories';
import { STORY_CANVAS_SEED_STORY_MODULES } from './storyCanvasSeedStories';

export type StoryFilterValue<TValue extends string> = TValue | 'all';

export type StoryReviewNotes = Record<string, string>;

export type ComponentStoryEntry = {
  area: string;
  args: Record<string, unknown>;
  category: string;
  layer: ComponentLayer;
  modulePath: string;
  name: string;
  path: string;
  preview: ReactNode;
  previewFrame?: ComponentPreviewFrame;
  responsiveViewport?: StoryResponsiveViewport;
  role: string;
  storyExport: string;
  storyTitle: string;
};

export type StoryRecord = ComponentStoryEntry & {
  id: string;
  size: {
    h: number;
    w: number;
  };
};

export type StoryResponsiveViewport = {
  h: number;
  id: 'desktop' | 'tablet' | 'mobile';
  label: string;
  order: number;
  w: number;
};

export type PageRouteInfo = {
  modulePath: string;
  pagePath: string | null;
  routePath: string;
};

type StoryModule = {
  default: {
    component: StoryComponent;
    parameters: CstarStoryParameters;
    title: string;
  };
  [key: string]: unknown;
};

function PageStoryPlaceholder() {
  return null;
}

type StoryArgs = NonNullable<StoryObj<StoryComponent>['args']>;
type StoryRender = NonNullable<StoryObj<StoryComponent>['render']>;

function StoryRenderView({ args, render }: { args: StoryArgs; render: StoryRender }) {
  return createElement(Fragment, null, render(args));
}

export const LAYER_FILTERS: Array<ComponentLayer | 'all'> = ['all', 'atom', 'primitive', 'item', 'section'];
export const FRAME_FILTERS: Array<ComponentPreviewFrame | 'all'> = ['all', 'default', 'section', 'dialog', 'table'];
const layerLabels: Record<ComponentLayer, string> = {
  atom: 'atoms',
  item: 'items',
  primitive: 'primitives',
  section: 'sections',
};

export const PREVIEW_MAX_WIDTH = 1024;
// Zero inset: the frame IS the component's footprint, so the W×H badge reads
// the component's true size (the 1px frame line is an outline, not a border).
export const PREVIEW_INSET = 0;
// Figma-style frame: the name floats above the frame at constant screen size
// (counter-scaled against canvas zoom), so the canvas item is the frame only.
export const STANDARD_CARD_WIDTH = PREVIEW_MAX_WIDTH + PREVIEW_INSET * 2;
export const ATOM_CARD_WIDTH = 512;
export const PAGE_RESPONSIVE_VIEWPORTS: StoryResponsiveViewport[] = [
  { h: 900, id: 'desktop', label: 'Desktop', order: 0, w: 1440 },
  { h: 1112, id: 'tablet', label: 'Tablet', order: 1, w: 834 },
  { h: 844, id: 'mobile', label: 'Mobile', order: 2, w: 390 },
];

const initialPageStorySources = import.meta.glob('/src/pages/**/Page*.stories.tsx', { eager: true, import: 'default', query: '?raw' }) as Record<string, string>;
const initialStoryModules = {
  ...FIGMA_CLONE_DOM_STORY_MODULES,
  ...STORY_CANVAS_SEED_STORY_MODULES,
  ...pageStoryModulesFromSources(initialPageStorySources),
};
const storyModuleLoaders = import.meta.glob([
  '/src/**/*.stories.tsx',
  '!/src/pages/**/Page*.stories.tsx',
]) as Record<string, () => Promise<StoryModule>>;
const foundationStoryModuleLoaders = import.meta.glob(
  '/src/shared/**/*.stories.tsx',
) as Record<string, () => Promise<StoryModule>>;
const entityStoryModuleLoaders = import.meta.glob([
  '/src/entities/**/*.stories.tsx',
  '/src/**/entities/**/*.stories.tsx',
]) as Record<string, () => Promise<StoryModule>>;
const routeModuleSources = import.meta.glob('/src/routes/**/*.tsx', { eager: true, import: 'default', query: '?raw' }) as Record<string, string>;
export const ROUTE_PAGE_INFOS = pageRouteInfosFromModuleSources(routeModuleSources);
const PAGE_ROUTE_BY_PATH = pageRouteByPathFromInfos(ROUTE_PAGE_INFOS);

export const STORY_RECORDS = createStoryRecords(initialStoryModules);
export const ROUTE_PAGE_PATHS = new Set(PAGE_ROUTE_BY_PATH.keys());

export async function loadStoryRecords() {
  const modules = {
    ...FIGMA_CLONE_DOM_STORY_MODULES,
    ...STORY_CANVAS_SEED_STORY_MODULES,
    ...initialStoryModules,
    ...(await loadStoryModules(storyModuleLoaders)),
  } as Record<string, StoryModule>;

  return createStoryRecords(modules);
}

export async function loadFoundationStoryRecords() {
  return createStoryRecords({
    ...FIGMA_CLONE_DOM_STORY_MODULES,
    ...STORY_CANVAS_SEED_STORY_MODULES,
    ...(await loadStoryModules(foundationStoryModuleLoaders)),
  });
}

export async function loadEntityStoryRecords() {
  return createStoryRecords({
    ...FIGMA_CLONE_DOM_STORY_MODULES,
    ...STORY_CANVAS_SEED_STORY_MODULES,
    ...(await loadStoryModules(entityStoryModuleLoaders)),
  });
}

async function loadStoryModules(loaders: Record<string, () => Promise<StoryModule>>) {
  const entries = await Promise.all(
    Object.entries(loaders).map(async ([modulePath, loadStoryModule]) => {
      try {
        return [modulePath, await loadStoryModule()] as const;
      } catch (error: unknown) {
        console.error('Story canvas story module load failed', modulePath, error);
        return null;
      }
    }),
  );

  return Object.fromEntries(entries.filter((entry): entry is readonly [string, StoryModule] => Boolean(entry)));
}

export function filterStories(
  entries: StoryRecord[],
  filters: {
    favoriteStoryIds: Set<string>;
    favoritesOnly: boolean;
    frame: StoryFilterValue<ComponentPreviewFrame>;
    layer: StoryFilterValue<ComponentLayer>;
    query: string;
  },
) {
  const query = filters.query.trim().toLowerCase();

  return entries.filter((entry) => {
    const frame = entry.previewFrame ?? 'default';
    const matchesLayer = filters.layer === 'all' || entry.layer === filters.layer;
    const matchesFrame = filters.frame === 'all' || frame === filters.frame;
    const matchesFavorite = !filters.favoritesOnly || filters.favoriteStoryIds.has(entry.id);
    const matchesQuery = !query || [
      entry.area,
      entry.category,
      entry.modulePath,
      entry.name,
      entry.path,
      entry.role,
      entry.storyExport,
      entry.storyTitle,
    ].some((value) => value.toLowerCase().includes(query));

    return matchesLayer && matchesFrame && matchesFavorite && matchesQuery;
  });
}

export function createStoryStats(entries: StoryRecord[]) {
  const layers = {
    atom: 0,
    item: 0,
    primitive: 0,
    section: 0,
  } satisfies Record<ComponentLayer, number>;
  const frames = {
    default: 0,
    dialog: 0,
    section: 0,
    table: 0,
  } satisfies Record<ComponentPreviewFrame, number>;

  for (const entry of entries) {
    layers[entry.layer] += 1;
    frames[entry.previewFrame ?? 'default'] += 1;
  }

  return {
    frames,
    layers,
  };
}

export function getLayerFilterLabel(value: StoryFilterValue<ComponentLayer>) {
  if (value === 'all') return 'All';
  return layerLabels[value];
}

export function getFrameFilterLabel(value: StoryFilterValue<ComponentPreviewFrame>) {
  if (value === 'all') return 'All';
  if (value === 'default') return 'Auto';
  return value;
}

export function storySectionKey(path: string) {
  const parts = path.split('/').filter(Boolean);
  const responsibilityLayer = parts.find((part) =>
    part === 'widgets'
    || part === 'features'
    || part === 'entities'
    || part === 'shared');

  if (responsibilityLayer) {
    return responsibilityLayer;
  }

  if (parts[0] === 'pages') return 'pages';
  return parts[0] ?? 'other';
}

export function sectionWeight(key: string) {
  if (key === 'pages') return 0;
  if (key === 'widgets') return 1;
  if (key === 'features') return 2;
  if (key === 'entities') return 3;
  if (key === 'shared') return 4;
  return 9;
}

export function layerWeight(layer: ComponentStoryEntry['layer']) {
  if (layer === 'atom') return 0;
  if (layer === 'primitive') return 1;
  if (layer === 'item') return 2;
  return 3;
}

export function toId(value: string) {
  return value.replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase();
}

function createStoryRecords(modules: Record<string, StoryModule>): StoryRecord[] {
  const usedIds = new Set<string>();

  return Object.entries(modules)
    .flatMap(([modulePath, storyModule]) => storyModuleToEntries(modulePath, storyModule))
    .map((entry) => {
      let id = storyId(entry);
      // toId can collapse distinct sources (case, separators) to the same id.
      // Disambiguate with a content hash so the result stays order-independent.
      if (usedIds.has(id)) id = `${id}-${contentHash(`${entry.modulePath}#${entry.storyExport}`)}`;
      usedIds.add(id);

      return {
        ...entry,
        id,
        size: storyCardSize(entry),
      };
    })
    .sort((a, b) => a.path.localeCompare(b.path) || a.name.localeCompare(b.name));
}

// ID must stay stable when story files are added or removed — review notes and
// bridge payloads are keyed by it. Never derive it from list positions.
function storyId(entry: ComponentStoryEntry) {
  const moduleKey = entry.modulePath.replace(/^\/src\//, '').replace(/\.stories\.tsx$/, '');
  return toId(`${moduleKey}--${entry.storyExport}`);
}

function contentHash(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) | 0;
  }
  return Math.abs(hash).toString(36);
}

// Every story hugs its rendered content like a Figma frame — the canvas
// measures them after the first paint and overrides these sizes. Width-bound
// frames (section/dialog/table) hug height only, at PREVIEW_MAX_WIDTH.
export function isHuggableStory(entry: Pick<ComponentStoryEntry, 'previewFrame' | 'responsiveViewport'>) {
  return !entry.responsiveViewport;
}

function storyCardSize(entry: ComponentStoryEntry) {
  if (entry.responsiveViewport) {
    return {
      h: entry.responsiveViewport.h,
      w: entry.responsiveViewport.w,
    };
  }

  const frame = entry.previewFrame ?? 'default';
  const sizeByFrame: Record<ComponentPreviewFrame, { h: number; w: number }> = {
    default: { h: 420, w: STANDARD_CARD_WIDTH },
    dialog: { h: 780, w: STANDARD_CARD_WIDTH },
    section: { h: 760, w: STANDARD_CARD_WIDTH },
    table: { h: 520, w: STANDARD_CARD_WIDTH },
  };

  if (entry.layer === 'atom' && frame === 'default') return { h: 260, w: ATOM_CARD_WIDTH };
  return sizeByFrame[frame];
}

function storyModuleToEntries(modulePath: string, storyModule: StoryModule): ComponentStoryEntry[] {
  const meta = storyModule.default;
  if (!isStoryMeta(meta)) return [];
  const entries: ComponentStoryEntry[] = [];

  for (const [storyName, story] of Object.entries(storyModule)) {
    if (storyName === 'default' || !isStoryObject(story)) continue;
    const cstar = {
      ...meta.parameters.cstar,
      ...story.parameters?.cstar,
    };
    const storyPath = cstar.path || modulePath.replace(/^\/src\//, '');
    const baseName = story.name ?? nameFromTitle(meta.title);
    const pageRoute = PAGE_ROUTE_BY_PATH.get(storyPath);
    const pageStory = isPageStory(storyPath, modulePath) && Boolean(pageRoute);
    const viewports = pageStory ? PAGE_RESPONSIVE_VIEWPORTS : [undefined];

    for (const viewport of viewports) {
      entries.push({
        area: cstar.area,
        args: (story.args ?? {}) as Record<string, unknown>,
        category: cstar.category,
        layer: cstar.layer,
        modulePath,
        name: viewport ? `${baseName} · ${viewport.label}` : baseName,
        path: storyPath,
        preview: renderStory(storyName, story, meta.component, storyPath, modulePath, viewport, pageRoute),
        previewFrame: cstar.previewFrame,
        responsiveViewport: viewport,
        role: cstar.role,
        storyExport: viewport ? `${storyName}-${viewport.id}` : storyName,
        storyTitle: viewport ? `${meta.title}/${storyName}/${viewport.label}` : `${meta.title}/${storyName}`,
      });
    }
  }

  return entries;
}

function isStoryMeta(value: StoryModule['default'] | undefined): value is StoryModule['default'] {
  return Boolean(value?.component && value.parameters?.cstar && value.title);
}

function isStoryObject(value: unknown): value is StoryObj<StoryComponent> {
  return typeof value === 'object' && value !== null;
}

function pageStoryModulesFromSources(sources: Record<string, string>) {
  return Object.fromEntries(
    Object.entries(sources)
      .map(([modulePath, source]) => [modulePath, pageStoryModuleFromSource(source)] as const)
      .filter((entry): entry is readonly [string, StoryModule] => Boolean(entry[1])),
  );
}

function pageStoryModuleFromSource(source: string): StoryModule | null {
  const title = sourceStringField(source, 'title');
  const area = sourceStringField(source, 'area');
  const category = sourceStringField(source, 'category');
  const layer = sourceStringField(source, 'layer');
  const path = sourceStringField(source, 'path');
  const role = sourceStringField(source, 'role');
  const previewFrame = sourceStringField(source, 'previewFrame');
  const storyExports = [...source.matchAll(/export\s+const\s+([A-Za-z_$][\w$]*)\s*=/g)].map((match) => match[1]);

  if (!title || !area || !category || !isComponentLayer(layer) || !path || !role || storyExports.length === 0) {
    return null;
  }

  const stories = Object.fromEntries(storyExports.map((storyName) => [storyName, {}]));
  return {
    default: {
      component: PageStoryPlaceholder,
      parameters: {
        cstar: {
          area,
          category,
          layer,
          path,
          ...(isComponentPreviewFrame(previewFrame) ? { previewFrame } : {}),
          role,
        },
      },
      title,
    },
    ...stories,
  };
}

function sourceStringField(source: string, field: string) {
  const match = source.match(new RegExp(`\\b${field}\\s*:\\s*(['"\`])([^'"\`]*)\\1`));
  return match?.[2] ?? '';
}

function isComponentLayer(value: string): value is ComponentLayer {
  return value === 'atom' || value === 'primitive' || value === 'item' || value === 'section';
}

function isComponentPreviewFrame(value: string): value is ComponentPreviewFrame {
  return value === 'default' || value === 'dialog' || value === 'section' || value === 'table';
}

function renderStory(
  storyName: string,
  story: StoryObj<StoryComponent>,
  component: StoryComponent,
  storyPath: string,
  modulePath: string,
  viewport?: StoryResponsiveViewport,
  pageRoute?: PageRouteInfo,
) {
  const args = (story.args ?? {}) as StoryArgs;

  try {
    if (isPageStory(storyPath, modulePath) && viewport && pageRoute) {
      return createElement(
        StoryPageViewport,
        {
          modulePath,
          routePath: pageRoute.routePath,
          storyExport: storyName,
          storyPath,
          viewport,
        },
      );
    }
    if (story.render) return createElement(StoryRenderView, { args, render: story.render });
    return createElement(component, args);
  } catch (error) {
    return createElement(
      'div',
      { className: 'story-canvas-render-failure' },
      `Story render failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

function isPageStory(storyPath: string, modulePath: string) {
  return modulePath.startsWith('/src/pages/')
    && /(^|\/)Page[^/]*\.stories\.tsx$/.test(modulePath)
    && /(^|\/)Page[^/]*\.tsx$/.test(storyPath)
    && storyPath !== 'pages/v2/index/PageIndex.tsx'
    && storyPath !== 'pages/v2/PageStoryCanvas.tsx';
}

function pageRouteInfosFromModuleSources(moduleSources: Record<string, string>) {
  return Object.entries(moduleSources)
    .map(([modulePath, source]) => pageRouteInfoFromModuleSource(modulePath, source))
    .filter((entry): entry is PageRouteInfo => Boolean(entry))
    .sort((a, b) =>
      routeSortKey(a.routePath).localeCompare(routeSortKey(b.routePath))
      || a.routePath.localeCompare(b.routePath)
      || a.modulePath.localeCompare(b.modulePath));
}

function pageRouteByPathFromInfos(routeInfos: PageRouteInfo[]) {
  const entries = routeInfos
    .filter((entry): entry is PageRouteInfo & { pagePath: string } => Boolean(entry.pagePath))
    .sort((a, b) => a.pagePath.localeCompare(b.pagePath) || a.routePath.length - b.routePath.length || a.routePath.localeCompare(b.routePath));
  const routeByPath = new Map<string, PageRouteInfo>();

  for (const entry of entries) {
    if (!routeByPath.has(entry.pagePath)) routeByPath.set(entry.pagePath, entry);
  }

  return routeByPath;
}

function pageRouteInfoFromModuleSource(modulePath: string, source: string): PageRouteInfo | null {
  const routePath = source.match(/createFileRoute\(\s*['"]([^'"]+)['"]\s*\)/)?.[1];
  if (!routePath) return null;

  const importMatches = source.matchAll(/import\s+\w+\s+from\s+['"]([^'"]+)['"]/g);
  let pagePath: string | null = null;

  for (const match of importMatches) {
    const resolvedPath = resolveRouteImportPath(modulePath, match[1] ?? '');
    if (resolvedPath.startsWith('/src/pages/')) {
      pagePath = resolvedPath.replace(/^\/src\//, '');
      break;
    }
  }

  return {
    modulePath,
    pagePath,
    routePath,
  };
}

function routeSortKey(routePath: string) {
  if (routePath === '/') return '0:/';
  if (routePath.startsWith('/v2')) return `1:${routePath}`;
  if (routePath.startsWith('/v1')) return `2:${routePath}`;
  return `3:${routePath}`;
}

function resolveRouteImportPath(modulePath: string, importPath: string) {
  if (!importPath.startsWith('.')) return importPath;

  const moduleDir = modulePath.slice(0, modulePath.lastIndexOf('/'));
  const parts = `${moduleDir}/${importPath}`.split('/');
  const normalized: string[] = [];

  for (const part of parts) {
    if (!part || part === '.') continue;
    if (part === '..') {
      normalized.pop();
      continue;
    }
    normalized.push(part);
  }

  const path = `/${normalized.join('/')}`;
  return path.endsWith('.tsx') ? path : `${path}.tsx`;
}

function nameFromTitle(title: string) {
  const parts = title.split('/');
  return parts[parts.length - 1] ?? title;
}
