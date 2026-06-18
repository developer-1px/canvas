export type CanvasViewportRect = {
  height: number;
  left: number;
  top: number;
  width: number;
};

export type CanvasViewportLayerElement = HTMLElement | SVGElement;

export type CanvasViewportLayerHandle = {
  component: string;
  frameId: string;
  layer: string;
  layerId: string;
  source: string;
  tag: string;
};

export type CanvasViewportClipSnapshot = {
  component: string;
  frameRect: CanvasViewportRect;
  overflowX: string;
  overflowY: string;
  screenRect: CanvasViewportRect;
  source: string;
  tag: string;
};

export type CanvasViewportGeometrySnapshot = {
  clippedSides: {
    bottom: boolean;
    left: boolean;
    right: boolean;
    top: boolean;
  };
  clipChain: CanvasViewportClipSnapshot[];
  frameRect: CanvasViewportRect;
  isClipped: boolean;
  screenRect: CanvasViewportRect;
  size: {
    h: number;
    w: number;
  };
  visibleFrameRect: CanvasViewportRect;
  visibleScreenRect: CanvasViewportRect;
};

export type CanvasViewportLayerSnapshot = {
  element: CanvasViewportLayerElement;
  geometry: CanvasViewportGeometrySnapshot;
  handle: CanvasViewportLayerHandle;
};

export type CanvasViewportLayerTreeNode = {
  children: CanvasViewportLayerTreeNode[];
  snapshot: CanvasViewportLayerSnapshot;
};

export type CanvasViewportHitSnapshot = {
  chain: CanvasViewportLayerSnapshot[];
  frameId: string;
  hit: CanvasViewportLayerSnapshot | null;
};

const EVENT_HITS = new WeakMap<Event, CanvasViewportHitSnapshot>();
const ELEMENT_SNAPSHOTS = new WeakMap<Element, CanvasViewportLayerSnapshot>();

export function createCanvasViewportHitSnapshot(
  frameId: string,
  frame: HTMLIFrameElement,
  event: MouseEvent,
): CanvasViewportHitSnapshot | null {
  const frameDocument = frame.contentDocument;
  if (!frameDocument?.body) return null;

  const hit = deepestAnnotatedAt(frameDocument, event.clientX, event.clientY);
  if (!hit) return { chain: [], frameId, hit: null };

  const chain = annotatedChain(hit, frameDocument.body)
    .map((element) => createLayerSnapshot(frameId, frame, element));

  return {
    chain,
    frameId,
    hit: chain.at(-1) ?? null,
  };
}

export function rememberCanvasViewportHitSnapshot(event: Event, snapshot: CanvasViewportHitSnapshot | null) {
  if (snapshot) EVENT_HITS.set(event, snapshot);
}

export function canvasViewportHitSnapshotFromEvent(event: Event) {
  return EVENT_HITS.get(event) ?? null;
}

export function canvasViewportLayerSnapshot(element: Element) {
  if (isAnnotatedLayer(element)) {
    const frame = frameForElement(element);
    if (frame) return createLayerSnapshot(frameIdFromFrame(frame), frame, element);
  }
  return ELEMENT_SNAPSHOTS.get(element) ?? null;
}

export function canvasViewportLayerTreeFromFrame(frame: HTMLIFrameElement): CanvasViewportLayerTreeNode[] {
  const frameDocument = frame.contentDocument;
  if (!frameDocument?.body) return [];
  return collectLayerTree(frameIdFromFrame(frame), frame, frameDocument.body);
}

export function canvasViewportDeepestLayerAt(
  frame: HTMLIFrameElement,
  parentClientX: number,
  parentClientY: number,
) {
  const frameDocument = frame.contentDocument;
  if (!frameDocument?.body) return null;
  const point = frameLocalPoint(frame, parentClientX, parentClientY);
  const hit = deepestAnnotatedAt(frameDocument, point.x, point.y);
  return hit ? createLayerSnapshot(frameIdFromFrame(frame), frame, hit).element : null;
}

function createLayerSnapshot(
  frameId: string,
  frame: HTMLIFrameElement,
  element: CanvasViewportLayerElement,
): CanvasViewportLayerSnapshot {
  const frameRect = domRectToRect(element.getBoundingClientRect());
  const clip = clippedGeometry(frameId, frame, element, frameRect);
  const screenRect = frameRectToScreenRect(frame, frameRect);
  const snapshot: CanvasViewportLayerSnapshot = {
    element,
    geometry: {
      clippedSides: clip.clippedSides,
      clipChain: clip.clipChain,
      frameRect,
      isClipped: clip.isClipped,
      screenRect,
      size: {
        h: Math.round(frameRect.height),
        w: Math.round(frameRect.width),
      },
      visibleFrameRect: clip.visibleFrameRect,
      visibleScreenRect: frameRectToScreenRect(frame, clip.visibleFrameRect),
    },
    handle: {
      component: element.getAttribute('data-cstar-component') ?? '',
      frameId,
      layer: element.getAttribute('data-cstar-layer') ?? '',
      layerId: layerIdFor(element),
      source: element.getAttribute('data-cstar-source') ?? '',
      tag: element.tagName.toLowerCase(),
    },
  };

  ELEMENT_SNAPSHOTS.set(element, snapshot);
  return snapshot;
}

function collectLayerTree(
  frameId: string,
  frame: HTMLIFrameElement,
  parent: Element,
): CanvasViewportLayerTreeNode[] {
  const nodes: CanvasViewportLayerTreeNode[] = [];

  for (const child of Array.from(parent.children)) {
    if (isAnnotatedLayer(child)) {
      nodes.push({
        children: collectLayerTree(frameId, frame, child),
        snapshot: createLayerSnapshot(frameId, frame, child),
      });
    } else {
      nodes.push(...collectLayerTree(frameId, frame, child));
    }
  }

  return nodes;
}

function deepestAnnotatedAt(frameDocument: Document, clientX: number, clientY: number) {
  for (const element of frameDocument.elementsFromPoint(clientX, clientY)) {
    if (isAnnotatedLayer(element)) return element;
  }
  return null;
}

function annotatedChain(element: CanvasViewportLayerElement, root: Element) {
  const chain: CanvasViewportLayerElement[] = [];
  let current: Element | null = element;

  while (current && current !== root) {
    if (isAnnotatedLayer(current)) chain.unshift(current);
    current = current.parentElement;
  }

  return current === root ? chain : [];
}

function isAnnotatedLayer(element: Element): element is CanvasViewportLayerElement {
  const view = element.ownerDocument.defaultView;
  if (!view) return false;
  if (!(element instanceof view.HTMLElement) && !(element instanceof view.SVGElement)) return false;
  return element.hasAttribute('data-cstar-source');
}

function isHtmlElement(element: Element): element is HTMLElement {
  const view = element.ownerDocument.defaultView;
  return Boolean(view && element instanceof view.HTMLElement);
}

function frameRectToScreenRect(frame: HTMLIFrameElement, rect: CanvasViewportRect): CanvasViewportRect {
  const frameRect = frame.getBoundingClientRect();
  const scaleX = frame.offsetWidth > 0 ? frameRect.width / frame.offsetWidth : 1;
  const scaleY = frame.offsetHeight > 0 ? frameRect.height / frame.offsetHeight : scaleX;

  return {
    height: rect.height * (scaleY || 1),
    left: frameRect.left + rect.left * (scaleX || 1),
    top: frameRect.top + rect.top * (scaleY || 1),
    width: rect.width * (scaleX || 1),
  };
}

function clippedGeometry(
  frameId: string,
  frame: HTMLIFrameElement,
  element: CanvasViewportLayerElement,
  frameRect: CanvasViewportRect,
) {
  let visibleFrameRect = frameRect;
  const clipChain: CanvasViewportClipSnapshot[] = [];
  const view = element.ownerDocument.defaultView;

  for (let current = element.parentElement; current; current = current.parentElement) {
    if (!isHtmlElement(current)) continue;
    const style = current.ownerDocument.defaultView?.getComputedStyle(current);
    if (!style || !clipsOverflow(style)) continue;

    const clipFrameRect = clipRectFor(current, style);
    const nextVisibleFrameRect = intersectRect(visibleFrameRect, clipFrameRect);
    if (rectDiffers(nextVisibleFrameRect, visibleFrameRect)) {
      clipChain.push(createClipSnapshot(frame, current, clipFrameRect, style));
    }
    visibleFrameRect = nextVisibleFrameRect;
  }

  const viewportFrameRect = {
    height: view?.innerHeight ?? frame.offsetHeight,
    left: 0,
    top: 0,
    width: view?.innerWidth ?? frame.offsetWidth,
  };
  const viewportVisibleFrameRect = intersectRect(visibleFrameRect, viewportFrameRect);
  if (rectDiffers(viewportVisibleFrameRect, visibleFrameRect)) {
    clipChain.push({
      component: '',
      frameRect: viewportFrameRect,
      overflowX: 'iframe',
      overflowY: 'iframe',
      screenRect: frameRectToScreenRect(frame, viewportFrameRect),
      source: frameId,
      tag: 'viewport',
    });
  }
  visibleFrameRect = viewportVisibleFrameRect;

  return {
    clippedSides: clippedSides(frameRect, visibleFrameRect),
    clipChain,
    isClipped: rectDiffers(frameRect, visibleFrameRect),
    visibleFrameRect,
  };
}

function clipsOverflow(style: CSSStyleDeclaration) {
  return isClippingOverflow(style.overflowX)
    || isClippingOverflow(style.overflowY)
    || style.contain.includes('paint');
}

function isClippingOverflow(value: string) {
  return value === 'hidden' || value === 'clip' || value === 'auto' || value === 'scroll';
}

function createClipSnapshot(
  frame: HTMLIFrameElement,
  element: HTMLElement,
  frameRect: CanvasViewportRect,
  style: CSSStyleDeclaration,
): CanvasViewportClipSnapshot {
  return {
    component: element.getAttribute('data-cstar-component') ?? '',
    frameRect,
    overflowX: style.overflowX,
    overflowY: style.overflowY,
    screenRect: frameRectToScreenRect(frame, frameRect),
    source: element.getAttribute('data-cstar-source') ?? '',
    tag: element.tagName.toLowerCase(),
  };
}

function clipRectFor(element: HTMLElement, style: CSSStyleDeclaration): CanvasViewportRect {
  const rect = element.getBoundingClientRect();
  const scale = elementClientScale(element, rect);
  const clipMargin = style.overflow === 'clip' || style.overflowX === 'clip' || style.overflowY === 'clip'
    ? pxValue(style.overflowClipMargin)
    : 0;
  const clipMarginX = clipMargin * scale.x;
  const clipMarginY = clipMargin * scale.y;
  const left = rect.left + element.clientLeft * scale.x - clipMarginX;
  const top = rect.top + element.clientTop * scale.y - clipMarginY;
  const width = (element.clientWidth ? element.clientWidth * scale.x : rect.width) + clipMarginX * 2;
  const height = (element.clientHeight ? element.clientHeight * scale.y : rect.height) + clipMarginY * 2;

  return { height, left, top, width };
}

function elementClientScale(element: HTMLElement, rect: DOMRect) {
  const scaleX = element.offsetWidth > 0 ? rect.width / element.offsetWidth : 1;
  const scaleY = element.offsetHeight > 0 ? rect.height / element.offsetHeight : scaleX;
  return {
    x: scaleX > 0 ? scaleX : 1,
    y: scaleY > 0 ? scaleY : 1,
  };
}

function pxValue(value: string) {
  const match = value.match(/-?\d+(?:\.\d+)?px/);
  return match ? Number.parseFloat(match[0]) : 0;
}

function intersectRect(a: CanvasViewportRect, b: CanvasViewportRect): CanvasViewportRect {
  const left = Math.max(a.left, b.left);
  const top = Math.max(a.top, b.top);
  const right = Math.min(a.left + a.width, b.left + b.width);
  const bottom = Math.min(a.top + a.height, b.top + b.height);

  return {
    height: Math.max(0, bottom - top),
    left,
    top,
    width: Math.max(0, right - left),
  };
}

function rectDiffers(a: CanvasViewportRect, b: CanvasViewportRect) {
  return Math.abs(a.left - b.left) > 0.5
    || Math.abs(a.top - b.top) > 0.5
    || Math.abs(a.width - b.width) > 0.5
    || Math.abs(a.height - b.height) > 0.5;
}

function clippedSides(raw: CanvasViewportRect, visible: CanvasViewportRect) {
  return {
    bottom: visible.top + visible.height < raw.top + raw.height - 0.5,
    left: visible.left > raw.left + 0.5,
    right: visible.left + visible.width < raw.left + raw.width - 0.5,
    top: visible.top > raw.top + 0.5,
  };
}

function frameLocalPoint(frame: HTMLIFrameElement, parentClientX: number, parentClientY: number) {
  const rect = frame.getBoundingClientRect();
  const scaleX = frame.offsetWidth > 0 ? rect.width / frame.offsetWidth : 1;
  const scaleY = frame.offsetHeight > 0 ? rect.height / frame.offsetHeight : scaleX;

  return {
    x: (parentClientX - rect.left) / (scaleX || 1),
    y: (parentClientY - rect.top) / (scaleY || 1),
  };
}

function frameIdFromFrame(frame: HTMLIFrameElement) {
  return frame.getAttribute('data-canvas-viewport-frame-id') ?? '';
}

function frameForElement(element: Element) {
  const frame = element.ownerDocument.defaultView?.frameElement;
  return frame instanceof HTMLIFrameElement ? frame : null;
}

function domRectToRect(rect: DOMRect): CanvasViewportRect {
  return {
    height: rect.height,
    left: rect.left,
    top: rect.top,
    width: rect.width,
  };
}

function layerIdFor(element: Element) {
  const source = element.getAttribute('data-cstar-source') ?? '';
  const component = element.getAttribute('data-cstar-component') ?? '';
  return `${source}|${component}|${domPath(element)}`;
}

function domPath(element: Element) {
  const indexes: number[] = [];
  let current: Element | null = element;

  while (current?.parentElement) {
    indexes.unshift(Array.from(current.parentElement.children).indexOf(current));
    current = current.parentElement;
  }

  return indexes.join('.');
}
