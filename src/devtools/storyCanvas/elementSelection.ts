// Figma-grammar element selection inside a story preview.
// Selectable "layers" are the JSX elements the dev-only babel plugin annotates
// with data-cstar-source — one annotation per authored JSX element. SVG
// elements (icons) are layers too, so everything works on Element, not
// HTMLElement.

import {
  canvasViewportDeepestLayerAt,
  canvasViewportLayerTreeFromFrame,
  type CanvasViewportLayerTreeNode,
} from './CanvasViewportBridge';
import { closestStoryCanvasElement } from './storyCanvasDomBoundary';

export type LayerElement = HTMLElement | SVGElement;

export const STORY_CANVAS_CARD_SELECTOR = '[data-story-card]';
export const STORY_CANVAS_PREVIEW_SELECTOR = '[data-story-preview]';

export type ElementDescriptor = {
  component: string;
  layer: string;
  source: string;
  tag: string;
};

export type LocalRect = {
  h: number;
  w: number;
  x: number;
  y: number;
};

export type ScreenRect = {
  height: number;
  left: number;
  top: number;
  width: number;
};

export type ElementClipSnapshot = {
  component: string;
  overflowX: string;
  overflowY: string;
  screenRect: ScreenRect;
  source: string;
  tag: string;
};

export type ElementClipGeometry = {
  clippedSides: {
    bottom: boolean;
    left: boolean;
    right: boolean;
    top: boolean;
  };
  clipChain: ElementClipSnapshot[];
  isClipped: boolean;
  screenRect: ScreenRect;
  size: {
    h: number;
    w: number;
  };
  visibleScreenRect: ScreenRect;
};

export type LayerElementLocator = {
  component: string;
  path: number[];
  source: string;
  tag: string;
  v: 1;
};

// The canvas page itself is annotated by the babel plugin too — its own
// chrome (card frame, preview wrapper) must never be selectable as a layer.
const CHROME_SOURCE_FILES = ['/PageStoryCanvas.tsx', '/StoryCanvasPage.tsx'];

export function isAnnotated(element: Element): element is LayerElement {
  if (!isLayerElement(element)) return false;
  const source = element.getAttribute('data-cstar-source');
  if (!source) return false;
  return !CHROME_SOURCE_FILES.some((file) => source.includes(file));
}

// Annotated ancestor chain from the outermost (depth 1) down to the element
// itself. Depth 0 is the preview root (= the card, Figma's frame).
export function annotatedChain(element: LayerElement, previewRoot: Element): LayerElement[] {
  const chain: LayerElement[] = [];
  const scopeRoot = elementScopeRoot(element, previewRoot);
  let current: Element | null = element;

  while (current && current !== scopeRoot) {
    if (isAnnotated(current)) chain.unshift(current);
    current = current.parentElement;
  }

  return current === scopeRoot ? chain : [];
}

export function deepestAnnotatedAt(previewRoot: Element, clientX: number, clientY: number): LayerElement | null {
  for (const element of previewRoot.ownerDocument.elementsFromPoint(clientX, clientY)) {
    if (previewRoot.contains(element) && isFrameElement(element)) {
      const frameHit = deepestAnnotatedInFrame(element, clientX, clientY);
      if (frameHit) return frameHit;
    }
    if (previewRoot.contains(element) && isAnnotated(element)) return element;
  }
  return null;
}

export function elementDepth(element: LayerElement, previewRoot: Element): number {
  return annotatedChain(element, previewRoot).length;
}

// Figma click grammar: the first click picks the top-level layer, clicking
// again inside the selection descends one level, clicking elsewhere picks the
// sibling at the current depth, Cmd/Ctrl-click deep-selects.
export function resolveFigmaClickTarget(
  previewRoot: Element,
  clientX: number,
  clientY: number,
  selectedElement: LayerElement | null,
  deep: boolean,
): LayerElement | null {
  const hit = deepestAnnotatedAt(previewRoot, clientX, clientY);
  if (!hit) return null;

  const chain = annotatedChain(hit, previewRoot);
  if (chain.length === 0) return null;
  if (deep) return chain[chain.length - 1];
  if (!selectedElement) return chain[0];

  const selectedIndex = chain.indexOf(selectedElement);
  if (selectedIndex >= 0) return chain[Math.min(selectedIndex + 1, chain.length - 1)];

  const depth = elementDepth(selectedElement, previewRoot);
  return chain[Math.min(Math.max(depth, 1), chain.length) - 1];
}

export function resolveFigmaClickTargetFromHit(
  previewRoot: Element,
  hit: LayerElement | null,
  selectedElement: LayerElement | null,
  deep: boolean,
): LayerElement | null {
  if (!hit) return null;

  const chain = annotatedChain(hit, previewRoot);
  if (chain.length === 0) return null;
  if (deep) return chain[chain.length - 1];
  if (!selectedElement) return chain[0];

  const selectedIndex = chain.indexOf(selectedElement);
  if (selectedIndex >= 0) return chain[Math.min(selectedIndex + 1, chain.length - 1)];

  const depth = elementDepth(selectedElement, previewRoot);
  return chain[Math.min(Math.max(depth, 1), chain.length) - 1];
}

export function parentAnnotated(element: LayerElement, previewRoot: Element): LayerElement | null {
  const chain = annotatedChain(element, previewRoot);
  return chain.length > 1 ? chain[chain.length - 2] : null;
}

export type LayerNode = {
  children: LayerNode[];
  element: LayerElement;
};

// Layer tree of a story preview for the Figma-style layers panel.
export function annotatedLayerTree(previewRoot: Element): LayerNode[] {
  const walk = (parent: Element): LayerNode[] => {
    const nodes: LayerNode[] = [];

    for (const child of Array.from(parent.children)) {
      if (isFrameElement(child)) {
        nodes.push(...canvasViewportLayerTreeFromFrame(child).map((node) => ({
          children: layerNodesFromCanvasViewportTree(node.children),
          element: node.snapshot.element,
        })));
        continue;
      }
      if (isAnnotated(child)) {
        nodes.push({ children: walk(child), element: child });
      } else {
        nodes.push(...walk(child));
      }
    }

    return nodes;
  };

  return walk(previewRoot);
}

export function layerElementLocator(previewRoot: Element, element: LayerElement): LayerElementLocator | null {
  const path = pathToLayerElement(annotatedLayerTree(previewRoot), element);
  if (!path) return null;
  const descriptor = elementDescriptor(element);

  return {
    component: descriptor.component,
    path,
    source: descriptor.source,
    tag: descriptor.tag,
    v: 1,
  };
}

export function findLayerElementByLocator(previewRoot: Element, locator: LayerElementLocator): LayerElement | null {
  const tree = annotatedLayerTree(previewRoot);
  const pathElement = layerElementAtPath(tree, locator.path);
  if (pathElement && descriptorMatchesLocator(pathElement, locator)) return pathElement;
  return firstLayerElementMatchingLocator(tree, locator);
}

function layerNodesFromCanvasViewportTree(nodes: CanvasViewportLayerTreeNode[]): LayerNode[] {
  return nodes.map((node) => ({
    children: layerNodesFromCanvasViewportTree(node.children),
    element: node.snapshot.element,
  }));
}

export function elementDescriptor(element: LayerElement): ElementDescriptor {
  return {
    component: element.getAttribute('data-cstar-component') ?? '',
    layer: element.getAttribute('data-cstar-layer') ?? '',
    source: element.getAttribute('data-cstar-source') ?? '',
    tag: element.tagName.toLowerCase(),
  };
}

function pathToLayerElement(nodes: LayerNode[], target: LayerElement): number[] | null {
  for (let index = 0; index < nodes.length; index += 1) {
    const node = nodes[index];
    if (node.element === target) return [index];
    const childPath = pathToLayerElement(node.children, target);
    if (childPath) return [index, ...childPath];
  }
  return null;
}

function layerElementAtPath(nodes: LayerNode[], path: number[]) {
  let currentNodes = nodes;
  let element: LayerElement | null = null;

  for (const index of path) {
    const node = currentNodes[index];
    if (!node) return null;
    element = node.element;
    currentNodes = node.children;
  }

  return element;
}

function firstLayerElementMatchingLocator(nodes: LayerNode[], locator: LayerElementLocator): LayerElement | null {
  for (const node of nodes) {
    if (descriptorMatchesLocator(node.element, locator)) return node.element;
    const child = firstLayerElementMatchingLocator(node.children, locator);
    if (child) return child;
  }
  return null;
}

function descriptorMatchesLocator(element: LayerElement, locator: LayerElementLocator) {
  const descriptor = elementDescriptor(element);
  return descriptor.source === locator.source
    && descriptor.component === locator.component
    && descriptor.tag === locator.tag;
}

export function sourceFilePath(source: string) {
  const withoutPosition = source
    .replace(/\\/g, '/')
    .replace(/:(\d+)(?::\d+)?$/, '');
  const srcIndex = withoutPosition.lastIndexOf('/src/');
  if (srcIndex >= 0) return withoutPosition.slice(srcIndex + 5);
  const reactSrcIndex = withoutPosition.indexOf('react/src/');
  if (reactSrcIndex >= 0) return withoutPosition.slice(reactSrcIndex + 'react/src/'.length);
  if (withoutPosition.startsWith('/src/')) return withoutPosition.slice(5);
  if (withoutPosition.startsWith('src/')) return withoutPosition.slice(4);
  return withoutPosition.replace(/^\//, '');
}

export function isInstanceElementForStory(element: LayerElement, storyPath: string) {
  const elementPath = sourceFilePath(elementDescriptor(element).source);
  const currentPath = sourceFilePath(storyPath);
  return Boolean(elementPath && currentPath && elementPath !== currentPath);
}

// Effective canvas-zoom scale at the element's card, derived from the card's
// screen size vs its layout size.
function cardScale(cardRoot: HTMLElement) {
  const scale = cardRoot.offsetWidth > 0 ? cardRoot.getBoundingClientRect().width / cardRoot.offsetWidth : 1;
  return scale > 0 ? scale : 1;
}

// Layout-pixel size of a layer regardless of canvas zoom. SVG elements have
// no offsetWidth, so sizes come from rects divided by the card scale.
export function elementBoxSize(element: LayerElement): { h: number; w: number } {
  const cardRoot = cardRootForElement(element);
  const rect = elementScreenRect(element);
  const scale = cardRoot ? cardScale(cardRoot) : 1;

  return {
    h: Math.round(rect.height / scale),
    w: Math.round(rect.width / scale),
  };
}

// Rect in the card's local (unscaled CSS px) coordinates. The card lives
// inside the canvas zoom transform, so screen deltas are divided by the
// card's effective scale — overlays drawn in local px stay aligned at any
// zoom because they share the same transform.
export function localRect(cardRoot: HTMLElement, element: LayerElement): LocalRect {
  const cardRect = cardRoot.getBoundingClientRect();
  const rect = elementScreenRect(element);
  const scale = cardScale(cardRoot);

  return {
    h: rect.height / scale,
    w: rect.width / scale,
    x: (rect.left - cardRect.left) / scale,
    y: (rect.top - cardRect.top) / scale,
  };
}

export function elementScreenRect(element: Element): ScreenRect {
  const rect = element.getBoundingClientRect();
  return documentRectToScreenRect(element.ownerDocument, {
    height: rect.height,
    left: rect.left,
    top: rect.top,
    width: rect.width,
  });
}

export function elementClipGeometry(element: LayerElement): ElementClipGeometry {
  const screenRect = elementScreenRect(element);
  let visibleScreenRect = screenRect;
  const clipChain: ElementClipSnapshot[] = [];
  let currentDocument: Document | null = element.ownerDocument;
  let current: Element | null = element.parentElement;
  const cardRoot = cardRootForElement(element);
  const scale = cardRoot ? cardScale(cardRoot) : 1;
  const clipEpsilon = scaledClipEpsilon(scale);

  while (currentDocument) {
    for (; current; current = current.parentElement) {
      if (!isHtmlElement(current)) continue;
      const style = current.ownerDocument.defaultView?.getComputedStyle(current);
      if (!style || !clipsOverflow(style)) continue;

      const clipScreenRect = documentRectToScreenRect(current.ownerDocument, clipRectFor(current, style));
      const nextVisibleScreenRect = intersectScreenRect(visibleScreenRect, clipScreenRect);
      if (screenRectDiffers(nextVisibleScreenRect, visibleScreenRect, clipEpsilon)) {
        clipChain.push(createClipSnapshot(current, clipScreenRect, style));
      }
      visibleScreenRect = nextVisibleScreenRect;
    }

    const frame = currentDocument.defaultView?.frameElement as HTMLIFrameElement | null;
    if (!frame) break;
    const frameScreenRect = elementScreenRect(frame);
    const nextVisibleScreenRect = intersectScreenRect(visibleScreenRect, frameScreenRect);
    if (screenRectDiffers(nextVisibleScreenRect, visibleScreenRect, clipEpsilon)) {
      clipChain.push({
        component: '',
        overflowX: 'iframe',
        overflowY: 'iframe',
        screenRect: frameScreenRect,
        source: frame.getAttribute('data-canvas-viewport-frame-id') ?? '',
        tag: 'viewport',
      });
    }
    visibleScreenRect = nextVisibleScreenRect;
    currentDocument = frame.ownerDocument;
    current = frame.parentElement;
  }

  return {
    clippedSides: clippedSides(screenRect, visibleScreenRect, clipEpsilon),
    clipChain,
    isClipped: screenRectDiffers(screenRect, visibleScreenRect, clipEpsilon),
    screenRect,
    size: {
      h: Math.round(screenRect.height / scale),
      w: Math.round(screenRect.width / scale),
    },
    visibleScreenRect,
  };
}

function scaledClipEpsilon(scale: number) {
  return Math.max(0.05, 0.5 * scale);
}

function documentRectToScreenRect(ownerDocument: Document, rect: ScreenRect): ScreenRect {
  let left = rect.left;
  let top = rect.top;
  let width = rect.width;
  let height = rect.height;
  let currentDocument: Document | null = ownerDocument;

  while (currentDocument?.defaultView?.frameElement) {
    const frame = currentDocument.defaultView.frameElement as HTMLIFrameElement;
    const frameRect = frame.getBoundingClientRect();
    const scaleX = frame.offsetWidth > 0 ? frameRect.width / frame.offsetWidth : 1;
    const scaleY = frame.offsetHeight > 0 ? frameRect.height / frame.offsetHeight : scaleX;
    left = frameRect.left + left * (scaleX || 1);
    top = frameRect.top + top * (scaleY || 1);
    width *= scaleX || 1;
    height *= scaleY || 1;
    currentDocument = frame.ownerDocument;
  }

  return { height, left, top, width };
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
  element: HTMLElement,
  screenRect: ScreenRect,
  style: CSSStyleDeclaration,
): ElementClipSnapshot {
  return {
    component: element.getAttribute('data-cstar-component') ?? '',
    overflowX: style.overflowX,
    overflowY: style.overflowY,
    screenRect,
    source: element.getAttribute('data-cstar-source') ?? '',
    tag: element.tagName.toLowerCase(),
  };
}

function clipRectFor(element: HTMLElement, style: CSSStyleDeclaration): ScreenRect {
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

function intersectScreenRect(a: ScreenRect, b: ScreenRect): ScreenRect {
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

function screenRectDiffers(a: ScreenRect, b: ScreenRect, epsilon = 0.5) {
  return Math.abs(a.left - b.left) > epsilon
    || Math.abs(a.top - b.top) > epsilon
    || Math.abs(a.width - b.width) > epsilon
    || Math.abs(a.height - b.height) > epsilon;
}

function clippedSides(raw: ScreenRect, visible: ScreenRect, epsilon = 0.5) {
  return {
    bottom: visible.top + visible.height < raw.top + raw.height - epsilon,
    left: visible.left > raw.left + epsilon,
    right: visible.left + visible.width < raw.left + raw.width - epsilon,
    top: visible.top > raw.top + epsilon,
  };
}

function isLayerElement(element: Element): element is LayerElement {
  const view = element.ownerDocument.defaultView;
  if (!view) return false;
  return element instanceof view.HTMLElement || element instanceof view.SVGElement;
}

function isFrameElement(element: Element): element is HTMLIFrameElement {
  return element.tagName.toLowerCase() === 'iframe';
}

function elementScopeRoot(element: Element, previewRoot: Element) {
  if (element.ownerDocument === previewRoot.ownerDocument) return previewRoot;
  return element.ownerDocument.body ?? element.ownerDocument.documentElement;
}

function deepestAnnotatedInFrame(frame: HTMLIFrameElement, clientX: number, clientY: number) {
  return canvasViewportDeepestLayerAt(frame, clientX, clientY);
}

function cardRootForElement(element: LayerElement) {
  const localCard = closestStoryCanvasElement(element, STORY_CANVAS_CARD_SELECTOR);
  if (localCard && isHtmlElement(localCard)) return localCard;

  let currentDocument: Document | null = element.ownerDocument;
  while (currentDocument?.defaultView?.frameElement) {
    const frame = currentDocument.defaultView.frameElement as Element;
    const frameCard = closestStoryCanvasElement(frame, STORY_CANVAS_CARD_SELECTOR);
    if (frameCard && isHtmlElement(frameCard)) return frameCard;
    currentDocument = frame.ownerDocument;
  }

  return null;
}

function isHtmlElement(element: Element): element is HTMLElement {
  const view = element.ownerDocument.defaultView;
  return Boolean(view && element instanceof view.HTMLElement);
}

export type EdgeDistance = {
  axis: 'x' | 'y';
  from: { x: number; y: number };
  length: number;
  to: { x: number; y: number };
};

// Figma's Alt-hover red measurement lines. Side-by-side rects get the two
// nearest-edge gaps; containment (element inside its parent) gets the four
// inset distances, exactly like Figma's padding readout.
export function edgeDistances(a: LocalRect, b: LocalRect): EdgeDistance[] {
  if (contains(b, a)) return insetDistances(a, b);
  if (contains(a, b)) return insetDistances(b, a);

  const distances: EdgeDistance[] = [];
  const midY = overlapMid(a.y, a.h, b.y, b.h);
  const midX = overlapMid(a.x, a.w, b.x, b.w);

  if (midY !== null) {
    const gap = horizontalGap(a, b);
    if (gap) distances.push({ axis: 'x', from: { x: gap.start, y: midY }, length: gap.length, to: { x: gap.end, y: midY } });
  }

  if (midX !== null) {
    const gap = verticalGap(a, b);
    if (gap) distances.push({ axis: 'y', from: { x: midX, y: gap.start }, length: gap.length, to: { x: midX, y: gap.end } });
  }

  return distances;
}

function contains(outer: LocalRect, inner: LocalRect) {
  return inner.x >= outer.x && inner.y >= outer.y
    && inner.x + inner.w <= outer.x + outer.w
    && inner.y + inner.h <= outer.y + outer.h;
}

function insetDistances(inner: LocalRect, outer: LocalRect): EdgeDistance[] {
  const midX = inner.x + inner.w / 2;
  const midY = inner.y + inner.h / 2;

  const distances: EdgeDistance[] = [
    { axis: 'y', from: { x: midX, y: outer.y }, length: inner.y - outer.y, to: { x: midX, y: inner.y } },
    { axis: 'y', from: { x: midX, y: inner.y + inner.h }, length: outer.y + outer.h - (inner.y + inner.h), to: { x: midX, y: outer.y + outer.h } },
    { axis: 'x', from: { x: outer.x, y: midY }, length: inner.x - outer.x, to: { x: inner.x, y: midY } },
    { axis: 'x', from: { x: inner.x + inner.w, y: midY }, length: outer.x + outer.w - (inner.x + inner.w), to: { x: outer.x + outer.w, y: midY } },
  ];

  return distances.filter((distance) => distance.length > 0.5);
}

function overlapMid(aStart: number, aSize: number, bStart: number, bSize: number): number | null {
  const start = Math.max(aStart, bStart);
  const end = Math.min(aStart + aSize, bStart + bSize);
  return end > start ? (start + end) / 2 : null;
}

function horizontalGap(a: LocalRect, b: LocalRect) {
  if (b.x >= a.x + a.w) return { end: b.x, length: b.x - (a.x + a.w), start: a.x + a.w };
  if (a.x >= b.x + b.w) return { end: a.x, length: a.x - (b.x + b.w), start: b.x + b.w };
  return null;
}

function verticalGap(a: LocalRect, b: LocalRect) {
  if (b.y >= a.y + a.h) return { end: b.y, length: b.y - (a.y + a.h), start: a.y + a.h };
  if (a.y >= b.y + b.h) return { end: a.y, length: a.y - (b.y + b.h), start: b.y + b.h };
  return null;
}
