const HTML_SPECIMEN_PREVIEW_HOVER_ATTRIBUTE =
  'data-html-specimen-preview-hover'
const HTML_SPECIMEN_PREVIEW_TARGET_ATTRIBUTE =
  'data-html-specimen-preview-target'
const HTML_SPECIMEN_PREVIEW_OVERLAY_ATTRIBUTE =
  'data-html-specimen-preview-overlay'
const HTML_SPECIMEN_PREVIEW_OVERLAY_LAYER_ATTRIBUTE =
  'data-html-specimen-preview-overlay-layer'
const HTML_SPECIMEN_PREVIEW_SPACING_ATTRIBUTE =
  'data-html-specimen-preview-spacing'
const HTML_SPECIMEN_PREVIEW_TOOL_STYLE_ATTRIBUTE =
  'data-html-specimen-preview-tool-style'

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
  border: 1px solid rgba(36, 87, 197, 0.32);
  background: rgba(36, 87, 197, 0.04);
}
[${HTML_SPECIMEN_PREVIEW_OVERLAY_ATTRIBUTE}="target"] {
  border: 1px solid rgba(36, 87, 197, 0.68);
  background: rgba(36, 87, 197, 0.1);
}
[${HTML_SPECIMEN_PREVIEW_OVERLAY_ATTRIBUTE}]::before {
  content: none;
}
[${HTML_SPECIMEN_PREVIEW_SPACING_ATTRIBUTE}] {
  position: absolute;
  top: 0;
  left: 0;
  box-sizing: border-box;
  pointer-events: none;
}
[${HTML_SPECIMEN_PREVIEW_SPACING_ATTRIBUTE}="target-margin"] {
  display: none;
}
[${HTML_SPECIMEN_PREVIEW_SPACING_ATTRIBUTE}="target-padding"] {
  display: none;
}
[${HTML_SPECIMEN_PREVIEW_HOVER_ATTRIBUTE}] {
  outline: none !important;
}
[${HTML_SPECIMEN_PREVIEW_TARGET_ATTRIBUTE}] {
  outline: none !important;
}`
  root.append(style)
}
