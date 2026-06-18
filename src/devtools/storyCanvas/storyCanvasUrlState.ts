import type { LayerElementLocator } from './elementSelection';
import type { StoryCanvasViewport } from './storyBoard';

const STORY_PARAM = 'story';
const NODE_PARAM = 'node';
const VIEW_PARAM = 'view';

export type StoryCanvasUrlView = {
  page: string;
  v: 1;
  viewport: StoryCanvasViewport;
};

export type StoryCanvasUrlState = {
  node: LayerElementLocator | null;
  storyId: string | null;
  view: StoryCanvasUrlView | null;
};

export function readStoryCanvasUrlState(): StoryCanvasUrlState {
  if (typeof window === 'undefined') return emptyStoryCanvasUrlState();
  const params = new URLSearchParams(window.location.search);
  return {
    node: decodeJsonParam(params.get(NODE_PARAM), isLayerElementLocator),
    storyId: stringParam(params.get(STORY_PARAM)),
    view: decodeJsonParam(params.get(VIEW_PARAM), isStoryCanvasUrlView),
  };
}

export function replaceStoryCanvasUrlState(state: StoryCanvasUrlState) {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  setStringParam(url.searchParams, STORY_PARAM, state.storyId);
  setEncodedParam(url.searchParams, NODE_PARAM, state.node);
  setEncodedParam(url.searchParams, VIEW_PARAM, state.view);
  window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
}

function emptyStoryCanvasUrlState(): StoryCanvasUrlState {
  return {
    node: null,
    storyId: null,
    view: null,
  };
}

function stringParam(value: string | null) {
  const trimmed = value?.trim() ?? '';
  return trimmed || null;
}

function setStringParam(params: URLSearchParams, key: string, value: string | null) {
  if (value) {
    params.set(key, value);
    return;
  }
  params.delete(key);
}

function setEncodedParam(params: URLSearchParams, key: string, value: unknown) {
  if (value) {
    params.set(key, encodeJsonParam(value));
    return;
  }
  params.delete(key);
}

function encodeJsonParam(value: unknown) {
  return encodeBase64Url(JSON.stringify(value));
}

function decodeJsonParam<TValue>(value: string | null, guard: (candidate: unknown) => candidate is TValue): TValue | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(decodeBase64Url(value)) as unknown;
    return guard(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function encodeBase64Url(value: string) {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return window.btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  const binary = window.atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return new TextDecoder().decode(bytes);
}

function isStoryCanvasUrlView(value: unknown): value is StoryCanvasUrlView {
  if (!isRecord(value)) return false;
  return value.v === 1
    && typeof value.page === 'string'
    && isViewport(value.viewport);
}

function isLayerElementLocator(value: unknown): value is LayerElementLocator {
  if (!isRecord(value)) return false;
  return value.v === 1
    && Array.isArray(value.path)
    && value.path.every((entry) => Number.isInteger(entry) && entry >= 0)
    && typeof value.source === 'string'
    && typeof value.component === 'string'
    && typeof value.tag === 'string';
}

function isViewport(value: unknown): value is StoryCanvasViewport {
  if (!isRecord(value)) return false;
  return isFiniteNumber(value.scale)
    && isFiniteNumber(value.x)
    && isFiniteNumber(value.y);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
