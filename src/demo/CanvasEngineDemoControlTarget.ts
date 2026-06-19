import { isCanvasControlTarget } from '../canvas'

export const ENGINE_DEMO_CONTROL_TARGET_SELECTORS = [
  '.context-command-menu',
  '.command-palette',
  '.engine-demo-controls',
  '.engine-demo-feature-packs',
  '.engine-demo-minimap',
  '.engine-demo-viewport-controls',
  '.engine-sticky-quick-create',
  '.engine-selection-toolbar',
  '.engine-stamp-pad',
  '.engine-widget-play-overlay',
  '.shortcut-help',
  '.text-editor',
] as const

export function isCanvasEngineDemoControlTarget(target: EventTarget | null) {
  return isCanvasControlTarget({
    extraSelectors: ENGINE_DEMO_CONTROL_TARGET_SELECTORS,
    target,
  })
}
