import type { StoryRecord, StoryReviewNotes } from './storyData';

const BRIDGE_URL = '/__cstar/bridge';
const CSS_EDIT_URL = '/__cstar/css-edit';
const PUSH_DELAY_MS = 400;

export type BridgeNoteEntry = {
  modulePath: string;
  name: string;
  note: string;
  path: string;
  storyExport: string;
  storyId: string;
};

export type BridgeFavoriteEntry = Omit<BridgeNoteEntry, 'note'>;

export type BridgeSnapshot = {
  counts: {
    filtered: number;
    total: number;
  };
  filter: {
    favoritesOnly: boolean;
    frame: string;
    layer: string;
    page: string;
    query: string;
  };
  favorites: BridgeFavoriteEntry[];
  notes: BridgeNoteEntry[];
  page: string;
  selectedElement: {
    component: string;
    h: number;
    layer: string;
    source: string;
    storyId: string;
    tag: string;
    w: number;
  } | null;
  selectedStory: (ReturnType<typeof storyBridgePayload> & { favorite: boolean; reviewNote: string }) | null;
  version: 1;
};

export type CssEditRequest = {
  context?: string;
  file: string;
  newValue: string;
  oldValue: string;
  property: string;
  selector: string;
};

export type CssEditResult = {
  error?: string;
  ok: boolean;
};

export function isBridgeEnabled() {
  return import.meta.env.DEV && import.meta.env.VITE_CSTAR_STORY_BRIDGE === '1';
}

export async function readBridgeSnapshot(): Promise<Partial<BridgeSnapshot> | null> {
  if (!isBridgeEnabled()) return null;

  try {
    const response = await fetch(BRIDGE_URL);
    if (!response.ok) return null;
    const payload = await response.json();
    return payload && typeof payload === 'object' ? payload as Partial<BridgeSnapshot> : null;
  } catch {
    return null;
  }
}

let pushTimer: number | null = null;
let pendingSnapshot: BridgeSnapshot | null = null;

export function pushBridgeSnapshot(snapshot: BridgeSnapshot) {
  if (!isBridgeEnabled()) return;
  pendingSnapshot = snapshot;
  if (pushTimer !== null) window.clearTimeout(pushTimer);
  pushTimer = window.setTimeout(() => {
    pushTimer = null;
    const payload = pendingSnapshot;
    pendingSnapshot = null;
    if (!payload) return;
    void fetch(BRIDGE_URL, {
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    }).catch(() => undefined);
  }, PUSH_DELAY_MS);
}

export async function postCssEdit(edit: CssEditRequest): Promise<CssEditResult> {
  if (!isBridgeEnabled()) return { error: 'dev server only', ok: false };

  try {
    const response = await fetch(CSS_EDIT_URL, {
      body: JSON.stringify(edit),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    });
    if (response.ok) return { ok: true };
    const payload = await response.json().catch(() => null) as { error?: string } | null;
    return { error: payload?.error ?? `HTTP ${response.status}`, ok: false };
  } catch (error) {
    return { error: error instanceof Error ? error.message : String(error), ok: false };
  }
}

export function storyBridgePayload(story: StoryRecord) {
  return {
    args: serializeArgs(story.args),
    frame: story.previewFrame ?? 'default',
    id: story.id,
    layer: story.layer,
    modulePath: story.modulePath,
    name: story.name,
    path: story.path,
    size: story.size,
    storyExport: story.storyExport,
    storyTitle: story.storyTitle,
  };
}

export function bridgeNoteEntries(notes: StoryReviewNotes, recordById: Map<string, StoryRecord>): BridgeNoteEntry[] {
  return Object.entries(notes)
    .filter(([, note]) => note.trim())
    .map(([storyId, note]) => {
      const story = recordById.get(storyId);
      return {
        modulePath: story?.modulePath ?? '',
        name: story?.name ?? storyId,
        note,
        path: story?.path ?? '',
        storyExport: story?.storyExport ?? '',
        storyId,
      };
    })
    .sort((a, b) => a.path.localeCompare(b.path) || a.name.localeCompare(b.name));
}

export function bridgeFavoriteEntries(favoriteStoryIds: Set<string>, recordById: Map<string, StoryRecord>): BridgeFavoriteEntry[] {
  return Array.from(favoriteStoryIds)
    .map((storyId) => {
      const story = recordById.get(storyId);
      return {
        modulePath: story?.modulePath ?? '',
        name: story?.name ?? storyId,
        path: story?.path ?? '',
        storyExport: story?.storyExport ?? '',
        storyId,
      };
    })
    .sort((a, b) => a.path.localeCompare(b.path) || a.name.localeCompare(b.name));
}

export function notesFromBridgeSnapshot(snapshot: Partial<BridgeSnapshot> | null): StoryReviewNotes {
  if (!snapshot || !Array.isArray(snapshot.notes)) return {};

  return Object.fromEntries(snapshot.notes
    .filter((entry): entry is BridgeNoteEntry =>
      Boolean(entry) && typeof entry.storyId === 'string' && typeof entry.note === 'string' && Boolean(entry.note.trim()))
    .map((entry) => [entry.storyId, entry.note]));
}

export function favoritesFromBridgeSnapshot(snapshot: Partial<BridgeSnapshot> | null): Set<string> {
  if (!snapshot || !Array.isArray(snapshot.favorites)) return new Set();

  return new Set(snapshot.favorites
    .filter((entry): entry is BridgeFavoriteEntry =>
      Boolean(entry) && typeof entry.storyId === 'string' && Boolean(entry.storyId.trim()))
    .map((entry) => entry.storyId));
}

function serializeArgs(args: Record<string, unknown>) {
  return Object.fromEntries(Object.entries(args).map(([key, value]) => [key, serializeArgValue(value)]));
}

function serializeArgValue(value: unknown): unknown {
  if (value === null || ['boolean', 'number', 'string'].includes(typeof value)) return value;
  if (typeof value === 'function') return '[function]';
  if (Array.isArray(value)) return value.map(serializeArgValue);

  if (typeof value === 'object') {
    try {
      JSON.stringify(value);
      return value;
    } catch {
      return '[object]';
    }
  }

  return String(value);
}
