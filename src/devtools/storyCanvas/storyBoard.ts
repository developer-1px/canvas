import type { CanvasCustomItem, CanvasItem } from '../../canvas';
import {
  CANVAS_STORY_PREVIEW_GROUP_KIND,
  CANVAS_STORY_PREVIEW_GROUP_PRESENTATION,
  CANVAS_STORY_PREVIEW_ITEM_KIND,
  CANVAS_STORY_PREVIEW_ITEM_PRESENTATION,
} from '../../canvas';
import {
  PREVIEW_INSET,
  PREVIEW_MAX_WIDTH,
  STANDARD_CARD_WIDTH,
  layerWeight,
  sectionWeight,
  storySectionKey,
  toId,
  type StoryRecord,
} from './storyData';

export const STORY_WIDGET_KIND = CANVAS_STORY_PREVIEW_ITEM_KIND;
export const STORY_WIDGET_PRESENTATION = CANVAS_STORY_PREVIEW_ITEM_PRESENTATION;
export const STORY_GROUP_KIND = CANVAS_STORY_PREVIEW_GROUP_KIND;
export const STORY_GROUP_PRESENTATION = CANVAS_STORY_PREVIEW_GROUP_PRESENTATION;

const BOARD_X = 72;
const BOARD_TOP = 72;
const CARD_GAP = 28;
// Figma component set: variants live inside a dashed container.
const GROUP_PAD = 24;
const GROUP_GAP = 24;
const GROUP_ROW_GAP = 56;
// Labels are screen-fixed, so they take MORE world space when zoomed out
// (16px/zoom). Vertical gaps reserve room for them down to ~30% zoom;
// below that the labels hide (Figma behaviour).
const ROW_GAP = 64;
const PAGE_STORY_ROW_GAP = 136;
const BOARD_WIDTH = (STANDARD_CARD_WIDTH + GROUP_PAD * 2) * 3 + CARD_GAP * 2;
const SECTION_GAP = 320;

export type StoryCanvasViewport = {
  scale: number;
  x: number;
  y: number;
};

export const INITIAL_STORY_CANVAS_VIEWPORT: StoryCanvasViewport = {
  scale: 0.28,
  x: 42,
  y: 52,
};

type ComponentBlock = {
  h: number;
  key: string;
  label: string | null;
  variants: Array<{ entry: StoryRecord; size: { h: number; w: number }; x: number; y: number }>;
  w: number;
};

type StoryVariantDraft = {
  entry: StoryRecord;
  size: { h: number; w: number };
};

type ComponentBlockRow = {
  blocks: ComponentBlock[];
  h: number;
};

type ComponentBlockOptions = {
  equalizeVariantRowHeights: boolean;
};

type StoryBoardSection = {
  key: string;
  label: string;
  order?: number;
};

type StoryBoardOptions = {
  sectionForStory?: (entry: StoryRecord) => StoryBoardSection;
};

export function createStoryBoard(
  entries: StoryRecord[],
  sizeOverrides?: Map<string, { h: number; w: number }>,
  options: StoryBoardOptions = {},
) {
  const sections = groupStoryEntries(entries, options.sectionForStory);
  const items: CanvasItem[] = [];
  let y = BOARD_TOP;
  const effectiveSize = (entry: StoryRecord) => sizeOverrides?.get(entry.id) ?? entry.size;

  for (const section of sections) {
    // Figma component sets: variants of one component stay together in a
    // dashed container; the section then places whole blocks in grid rows.
    const blocks = buildComponentBlocks(section.entries, effectiveSize, {
      equalizeVariantRowHeights: section.key !== 'pages',
    });
    const layout = layoutSectionBlocks(
      blocks,
      y + 104,
      section.key === 'pages' ? PAGE_STORY_ROW_GAP : ROW_GAP,
    );

    items.push({
      fontSize: 28,
      h: 42,
      id: `story-section-${toId(section.key)}`,
      text: `${section.label} (${section.entries.length})`,
      type: 'text',
      w: 1200,
      x: BOARD_X,
      y,
    });

    items.push(...layout.items);
    y = layout.bottom + SECTION_GAP;
  }

  return { items };
}

function buildComponentBlocks(
  entries: StoryRecord[],
  effectiveSize: (entry: StoryRecord) => { h: number; w: number },
  options: ComponentBlockOptions,
): ComponentBlock[] {
  const byComponent = new Map<string, StoryRecord[]>();
  for (const entry of entries) {
    const key = componentKey(entry);
    byComponent.set(key, [...(byComponent.get(key) ?? []), entry]);
  }

  return [...byComponent.entries()].map(([key, variants]) => {
    const ordered = [...variants].sort((a, b) =>
      Number(b.storyExport.startsWith('Default')) - Number(a.storyExport.startsWith('Default'))
      || (a.responsiveViewport?.order ?? 999) - (b.responsiveViewport?.order ?? 999)
      || a.name.localeCompare(b.name));

    const innerMax = BOARD_WIDTH - GROUP_PAD * 2;
    const rows: StoryVariantDraft[][] = [];
    let currentRow: StoryVariantDraft[] = [];
    let currentRowWidth = 0;

    for (const entry of ordered) {
      const size = effectiveSize(entry);
      const nextWidth = currentRowWidth + (currentRow.length > 0 ? GROUP_GAP : 0) + size.w;

      if (currentRow.length > 0 && nextWidth > innerMax) {
        rows.push(currentRow);
        currentRow = [];
        currentRowWidth = 0;
      }

      currentRow.push({ entry, size });
      currentRowWidth += (currentRow.length > 1 ? GROUP_GAP : 0) + size.w;
    }

    if (currentRow.length > 0) rows.push(currentRow);

    const placed: ComponentBlock['variants'] = [];
    let rowY = 0;
    let contentWidth = 0;

    for (const row of rows) {
      const rowHeight = Math.max(...row.map((variant) => variant.size.h));
      let x = 0;

      for (const variant of row) {
        placed.push({
          entry: variant.entry,
          size: {
            ...variant.size,
            h: options.equalizeVariantRowHeights ? rowHeight : variant.size.h,
          },
          x: GROUP_PAD + x,
          y: GROUP_PAD + rowY,
        });
        x += variant.size.w + GROUP_GAP;
      }

      contentWidth = Math.max(contentWidth, x - GROUP_GAP);
      rowY += rowHeight + GROUP_ROW_GAP;
    }

    return {
      h: rowY - GROUP_ROW_GAP + GROUP_PAD * 2,
      key,
      label: componentLabel(ordered[0]),
      variants: placed,
      w: contentWidth + GROUP_PAD * 2,
    };
  });
}

function componentLabel(entry: StoryRecord) {
  const base = entry.path.split('/').pop() ?? entry.path;
  return base.replace(/\.tsx$/, '');
}

function componentKey(entry: StoryRecord) {
  return `${entry.modulePath}#${entry.path}`;
}

export function getStoryPreviewMetrics(size: StoryRecord['size']) {
  const preview = {
    h: Math.max(0, size.h - PREVIEW_INSET * 2),
    w: Math.max(0, size.w - PREVIEW_INSET * 2),
  };

  return {
    contentMaxWidth: Math.min(PREVIEW_MAX_WIDTH, preview.w),
    preview,
  };
}

export function serializeStoryWorkspace(
  items: CanvasItem[],
  selection: string[],
  viewport: StoryCanvasViewport,
) {
  const itemIds = new Set(items.map((item) => item.id));

  return JSON.stringify({
    items,
    selection: selection.filter((id) => itemIds.has(id)),
    version: 1,
    viewport,
  });
}

export function parseStoryWorkspaceState(value: string): {
  selection: string[];
  viewport: StoryCanvasViewport | null;
} {
  try {
    const parsed = JSON.parse(value) as {
      selection?: unknown;
      viewport?: { scale?: unknown; x?: unknown; y?: unknown };
    };
    const viewport = parsed?.viewport;
    const hasViewport = typeof viewport?.scale === 'number'
      && typeof viewport?.x === 'number'
      && typeof viewport?.y === 'number';

    return {
      selection: Array.isArray(parsed?.selection)
        ? parsed.selection.filter((id): id is string => typeof id === 'string')
        : [],
      viewport: hasViewport
        ? { scale: viewport.scale as number, x: viewport.x as number, y: viewport.y as number }
        : null,
    };
  } catch {
    return { selection: [], viewport: null };
  }
}

function groupStoryEntries(
  entries: StoryRecord[],
  sectionForStory: (entry: StoryRecord) => StoryBoardSection = defaultSectionForStory,
) {
  const groups = new Map<string, { entries: StoryRecord[]; label: string; order: number }>();

  for (const entry of entries) {
    const section = sectionForStory(entry);
    const current = groups.get(section.key) ?? {
      entries: [],
      label: section.label,
      order: section.order ?? sectionWeight(section.key),
    };
    current.entries.push(entry);
    groups.set(section.key, current);
  }

  return [...groups.entries()]
    .map(([key, group]) => ({
      entries: group.entries.sort((a, b) => layerWeight(a.layer) - layerWeight(b.layer) || a.name.localeCompare(b.name)),
      key,
      label: group.label,
      order: group.order,
    }))
    .sort((a, b) => a.order - b.order || a.key.localeCompare(b.key));
}

function defaultSectionForStory(entry: StoryRecord) {
  const key = storySectionKey(entry.path);
  return {
    key,
    label: key,
    order: sectionWeight(key),
  };
}

function layoutSectionBlocks(blocks: ComponentBlock[], startY: number, rowGap = ROW_GAP) {
  const items: CanvasCustomItem[] = [];
  const rows: ComponentBlockRow[] = [];
  let currentRow: ComponentBlock[] = [];
  let currentRowWidth = 0;

  for (const block of blocks) {
    const nextWidth = currentRowWidth + (currentRow.length > 0 ? CARD_GAP : 0) + block.w;

    if (currentRow.length > 0 && nextWidth > BOARD_WIDTH) {
      rows.push(createComponentBlockRow(currentRow));
      currentRow = [];
      currentRowWidth = 0;
    }

    currentRow.push(block);
    currentRowWidth += (currentRow.length > 1 ? CARD_GAP : 0) + block.w;
  }

  if (currentRow.length > 0) rows.push(createComponentBlockRow(currentRow));

  let y = startY;

  for (const row of rows) {
    let x = BOARD_X;

    for (const block of row.blocks) {
      pushBlockItems(items, block, x, y, row.h);
      x += block.w + CARD_GAP;
    }

    y += row.h + rowGap;
  }

  return {
    bottom: rows.length > 0 ? y - rowGap : startY,
    items,
  };
}

function createComponentBlockRow(blocks: ComponentBlock[]): ComponentBlockRow {
  return {
    blocks,
    h: Math.max(...blocks.map((block) => block.h)),
  };
}

function pushBlockItems(
  items: CanvasCustomItem[],
  block: ComponentBlock,
  x: number,
  y: number,
  rowHeight: number,
) {
  const cellHeight = Math.max(block.h, rowHeight);

  if (block.label) {
    items.push({
      data: { count: block.variants.length, groupLabel: block.label },
      h: cellHeight,
      id: `group-${toId(block.key)}`,
      kind: STORY_GROUP_KIND,
      presentation: STORY_GROUP_PRESENTATION,
      title: block.label,
      type: 'custom',
      w: block.w,
      x,
      y,
    });
  }

  for (const variant of block.variants) {
    items.push({
      data: { storyId: variant.entry.id },
      h: block.label ? variant.size.h : cellHeight,
      id: `story-${variant.entry.id}`,
      kind: STORY_WIDGET_KIND,
      presentation: STORY_WIDGET_PRESENTATION,
      title: variant.entry.name,
      type: 'custom',
      w: variant.size.w,
      x: x + variant.x,
      y: y + variant.y,
    });
  }
}
