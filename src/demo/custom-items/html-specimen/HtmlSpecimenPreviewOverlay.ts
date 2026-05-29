import type { PreviewSurfaceNode } from '@interactive-os/preview-surface'

export const HTML_SPECIMEN_PREVIEW_HOVER_ATTRIBUTE =
  'data-html-specimen-preview-hover'
export const HTML_SPECIMEN_PREVIEW_TARGET_ATTRIBUTE =
  'data-html-specimen-preview-target'

const HTML_SPECIMEN_PREVIEW_OVERLAY_ATTRIBUTE =
  'data-html-specimen-preview-overlay'
const HTML_SPECIMEN_PREVIEW_OVERLAY_LAYER_ATTRIBUTE =
  'data-html-specimen-preview-overlay-layer'
const HTML_SPECIMEN_PREVIEW_SPACING_ATTRIBUTE =
  'data-html-specimen-preview-spacing'
const HTML_SPECIMEN_PREVIEW_TOOL_STYLE_ATTRIBUTE =
  'data-html-specimen-preview-tool-style'

type HtmlSpecimenPreviewBoundsOverlayKind = 'hover' | 'target'
type HtmlSpecimenPreviewSpacingOverlayKind = 'target-margin' | 'target-padding'
type HtmlSpecimenPreviewBox = PreviewSurfaceNode['bounds']
type HtmlSpecimenPreviewBoxSides = {
  bottom: number
  left: number
  right: number
  top: number
}

export function ensureHtmlSpecimenPreviewOverlayLayer(root: ShadowRoot) {
  const layer = root.querySelector(
    `[${HTML_SPECIMEN_PREVIEW_OVERLAY_LAYER_ATTRIBUTE}]`,
  )

  if (layer instanceof HTMLDivElement) {
    return layer
  }

  const nextLayer = root.ownerDocument.createElement('div')

  nextLayer.setAttribute(
    HTML_SPECIMEN_PREVIEW_OVERLAY_LAYER_ATTRIBUTE,
    '',
  )
  root.append(nextLayer)

  return nextLayer
}

export function markHtmlSpecimenPreviewTargetElement(
  root: ShadowRoot,
  path: readonly number[],
) {
  markHtmlSpecimenPreviewElement({
    attribute: HTML_SPECIMEN_PREVIEW_TARGET_ATTRIBUTE,
    path,
    root,
  })
}

export function markHtmlSpecimenPreviewHoverElement(
  root: ShadowRoot,
  path: readonly number[],
) {
  markHtmlSpecimenPreviewElement({
    attribute: HTML_SPECIMEN_PREVIEW_HOVER_ATTRIBUTE,
    path,
    root,
  })
}

export function clearHtmlSpecimenPreviewMarkedElement(
  root: ShadowRoot,
  attribute: string,
) {
  for (const element of root.querySelectorAll(`[${attribute}]`)) {
    element.removeAttribute(attribute)
  }
}

export function updateHtmlSpecimenPreviewBoundsOverlay({
  kind,
  node,
  root,
}: {
  kind: HtmlSpecimenPreviewBoundsOverlayKind
  node: PreviewSurfaceNode
  root: ShadowRoot
}) {
  const layer = ensureHtmlSpecimenPreviewOverlayLayer(root)
  const box = getOrCreateHtmlSpecimenPreviewBoundsOverlayBox({
    kind,
    layer,
  })

  box.dataset.previewNodeId = node.id
  box.style.transform = `translate(${node.bounds.x}px, ${node.bounds.y}px)`
  box.style.width = `${Math.max(0, node.bounds.width)}px`
  box.style.height = `${Math.max(0, node.bounds.height)}px`
}

export function clearHtmlSpecimenPreviewBoundsOverlay(
  root: ShadowRoot,
  kind: HtmlSpecimenPreviewBoundsOverlayKind,
) {
  root
    .querySelector(`[${HTML_SPECIMEN_PREVIEW_OVERLAY_ATTRIBUTE}="${kind}"]`)
    ?.remove()
}

export function updateHtmlSpecimenPreviewTargetSpacingOverlays({
  node,
  root,
}: {
  node: PreviewSurfaceNode
  root: ShadowRoot
}) {
  const margin = parseHtmlSpecimenPreviewCssBox(node.computedStyle.margin)
  const padding = parseHtmlSpecimenPreviewCssBox(node.computedStyle.padding)

  updateHtmlSpecimenPreviewSpacingOverlay({
    box: margin
      ? getHtmlSpecimenPreviewMarginBox(node.bounds, margin)
      : null,
    kind: 'target-margin',
    nodeId: node.id,
    root,
  })
  updateHtmlSpecimenPreviewSpacingOverlay({
    box: padding
      ? getHtmlSpecimenPreviewPaddingBox(node.bounds, padding)
      : null,
    kind: 'target-padding',
    nodeId: node.id,
    root,
  })
}

export function clearHtmlSpecimenPreviewTargetSpacingOverlays(
  root: ShadowRoot,
) {
  clearHtmlSpecimenPreviewSpacingOverlay(root, 'target-margin')
  clearHtmlSpecimenPreviewSpacingOverlay(root, 'target-padding')
}

export function ensureHtmlSpecimenPreviewToolStyle(root: ShadowRoot) {
  if (root.querySelector(`[${HTML_SPECIMEN_PREVIEW_TOOL_STYLE_ATTRIBUTE}]`)) {
    return
  }

  const style = root.ownerDocument.createElement('style')

  style.setAttribute(HTML_SPECIMEN_PREVIEW_TOOL_STYLE_ATTRIBUTE, '')
  style.textContent = `:host {
  position: relative;
}
[${HTML_SPECIMEN_PREVIEW_OVERLAY_LAYER_ATTRIBUTE}] {
  position: absolute;
  inset: 0;
  z-index: 2147483647;
  pointer-events: none;
}
[${HTML_SPECIMEN_PREVIEW_OVERLAY_ATTRIBUTE}] {
  position: absolute;
  top: 0;
  left: 0;
  box-sizing: border-box;
  pointer-events: none;
}
[${HTML_SPECIMEN_PREVIEW_OVERLAY_ATTRIBUTE}="hover"] {
  border: 1px solid #38bdf8;
}
[${HTML_SPECIMEN_PREVIEW_OVERLAY_ATTRIBUTE}="target"] {
  border: 2px solid #0f766e;
}
[${HTML_SPECIMEN_PREVIEW_SPACING_ATTRIBUTE}] {
  position: absolute;
  top: 0;
  left: 0;
  box-sizing: border-box;
  pointer-events: none;
}
[${HTML_SPECIMEN_PREVIEW_SPACING_ATTRIBUTE}="target-margin"] {
  background: rgba(251, 146, 60, 0.1);
  border: 1px dashed #f97316;
}
[${HTML_SPECIMEN_PREVIEW_SPACING_ATTRIBUTE}="target-padding"] {
  background: rgba(45, 212, 191, 0.08);
  border: 1px dashed #14b8a6;
}
[${HTML_SPECIMEN_PREVIEW_HOVER_ATTRIBUTE}] {
  outline: 1px solid #38bdf8 !important;
  outline-offset: 1px !important;
}
[${HTML_SPECIMEN_PREVIEW_TARGET_ATTRIBUTE}] {
  outline: 2px solid #0f766e !important;
  outline-offset: 2px !important;
}`
  root.append(style)
}

export function getHtmlSpecimenPreviewSurfaceRoot(root: ShadowRoot) {
  return root.querySelector('[data-preview-surface-root]')
}

function markHtmlSpecimenPreviewElement({
  attribute,
  path,
  root,
}: {
  attribute: string
  path: readonly number[]
  root: ShadowRoot
}) {
  clearHtmlSpecimenPreviewMarkedElement(root, attribute)
  findHtmlSpecimenPreviewElementByPath(root, path)?.setAttribute(
    attribute,
    'true',
  )
}

function findHtmlSpecimenPreviewElementByPath(
  root: ShadowRoot,
  path: readonly number[],
) {
  let element = getHtmlSpecimenPreviewSurfaceRoot(root)

  for (const index of path) {
    const child = element?.children[index]

    if (!child) {
      return null
    }

    element = child
  }

  return element
}

function getOrCreateHtmlSpecimenPreviewBoundsOverlayBox({
  kind,
  layer,
}: {
  kind: HtmlSpecimenPreviewBoundsOverlayKind
  layer: HTMLDivElement
}) {
  const selector = `[${HTML_SPECIMEN_PREVIEW_OVERLAY_ATTRIBUTE}="${kind}"]`
  const existing = layer.querySelector(selector)

  if (existing instanceof HTMLDivElement) {
    return existing
  }

  const box = layer.ownerDocument.createElement('div')

  box.setAttribute(HTML_SPECIMEN_PREVIEW_OVERLAY_ATTRIBUTE, kind)
  layer.append(box)

  return box
}

function updateHtmlSpecimenPreviewSpacingOverlay({
  box,
  kind,
  nodeId,
  root,
}: {
  box: HtmlSpecimenPreviewBox | null
  kind: HtmlSpecimenPreviewSpacingOverlayKind
  nodeId: string
  root: ShadowRoot
}) {
  if (!box) {
    clearHtmlSpecimenPreviewSpacingOverlay(root, kind)
    return
  }

  const layer = ensureHtmlSpecimenPreviewOverlayLayer(root)
  const overlay = getOrCreateHtmlSpecimenPreviewSpacingOverlay({
    kind,
    layer,
  })

  overlay.dataset.previewNodeId = nodeId
  overlay.style.transform = `translate(${box.x}px, ${box.y}px)`
  overlay.style.width = `${Math.max(0, box.width)}px`
  overlay.style.height = `${Math.max(0, box.height)}px`
}

function getOrCreateHtmlSpecimenPreviewSpacingOverlay({
  kind,
  layer,
}: {
  kind: HtmlSpecimenPreviewSpacingOverlayKind
  layer: HTMLDivElement
}) {
  const selector = `[${HTML_SPECIMEN_PREVIEW_SPACING_ATTRIBUTE}="${kind}"]`
  const existing = layer.querySelector(selector)

  if (existing instanceof HTMLDivElement) {
    return existing
  }

  const overlay = layer.ownerDocument.createElement('div')

  overlay.setAttribute(HTML_SPECIMEN_PREVIEW_SPACING_ATTRIBUTE, kind)
  layer.append(overlay)

  return overlay
}

function clearHtmlSpecimenPreviewSpacingOverlay(
  root: ShadowRoot,
  kind: HtmlSpecimenPreviewSpacingOverlayKind,
) {
  root
    .querySelector(`[${HTML_SPECIMEN_PREVIEW_SPACING_ATTRIBUTE}="${kind}"]`)
    ?.remove()
}

function getHtmlSpecimenPreviewMarginBox(
  bounds: HtmlSpecimenPreviewBox,
  margin: HtmlSpecimenPreviewBoxSides,
): HtmlSpecimenPreviewBox | null {
  const top = Math.max(0, margin.top)
  const right = Math.max(0, margin.right)
  const bottom = Math.max(0, margin.bottom)
  const left = Math.max(0, margin.left)

  if (!hasHtmlSpecimenPreviewPositiveBoxSide({ bottom, left, right, top })) {
    return null
  }

  return {
    height: Math.max(0, bounds.height + top + bottom),
    width: Math.max(0, bounds.width + left + right),
    x: bounds.x - left,
    y: bounds.y - top,
  }
}

function getHtmlSpecimenPreviewPaddingBox(
  bounds: HtmlSpecimenPreviewBox,
  padding: HtmlSpecimenPreviewBoxSides,
): HtmlSpecimenPreviewBox | null {
  const top = clampHtmlSpecimenPreviewBoxSide(padding.top, bounds.height)
  const right = clampHtmlSpecimenPreviewBoxSide(padding.right, bounds.width)
  const bottom = clampHtmlSpecimenPreviewBoxSide(
    padding.bottom,
    bounds.height,
  )
  const left = clampHtmlSpecimenPreviewBoxSide(padding.left, bounds.width)

  if (!hasHtmlSpecimenPreviewPositiveBoxSide({ bottom, left, right, top })) {
    return null
  }

  return {
    height: Math.max(0, bounds.height - top - bottom),
    width: Math.max(0, bounds.width - left - right),
    x: bounds.x + left,
    y: bounds.y + top,
  }
}

function hasHtmlSpecimenPreviewPositiveBoxSide(
  sides: HtmlSpecimenPreviewBoxSides,
) {
  return [sides.top, sides.right, sides.bottom, sides.left]
    .some((side) => side > 0)
}

function clampHtmlSpecimenPreviewBoxSide(value: number, limit: number) {
  return Math.max(0, Math.min(value, Math.max(0, limit)))
}

function parseHtmlSpecimenPreviewCssBox(value: string) {
  const parts = value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(parseHtmlSpecimenPreviewCssPixelValue)

  if (parts.length < 1 || parts.length > 4 || parts.some(isNullValue)) {
    return null
  }

  const [top, right = top, bottom = top, left = right] = parts

  if (
    top === null ||
    right === null ||
    bottom === null ||
    left === null
  ) {
    return null
  }

  return { bottom, left, right, top }
}

function parseHtmlSpecimenPreviewCssPixelValue(value: string) {
  if (value === '0') {
    return 0
  }

  const match = /^(-?\d+(?:\.\d+)?)px$/.exec(value)

  return match ? Number.parseFloat(match[1]) : null
}

function isNullValue(value: number | null): value is null {
  return value === null
}
