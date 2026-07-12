import type {
  DomEditFrameGuideConfig,
} from '@interactive-os/dom-edit-affordance/react'
import type { DesignNodeFrame } from '@interactive-os/canvas/react-design'

export type FigmaCloneResponsiveGuidePreset =
  | 'desktop'
  | 'laptop'
  | 'mobile'
  | 'tablet'

const FIGMA_RESPONSIVE_LAYOUT_GUIDES = {
  desktop: { count: 12, gutter: 24, margin: 80 },
  laptop: { count: 12, gutter: 20, margin: 64 },
  tablet: { count: 8, gutter: 16, margin: 40 },
  mobile: { count: 4, gutter: 12, margin: 24 },
} as const

export function getFigmaCloneFrameGuides({
  frame,
  rootId,
}: {
  readonly frame: DesignNodeFrame
  readonly rootId: string
}): DomEditFrameGuideConfig<string> {
  const preset = getFigmaCloneResponsiveGuidePreset(frame.width)
  const layoutColumns = FIGMA_RESPONSIVE_LAYOUT_GUIDES[preset]

  return {
    frameNodeId: rootId,
    layoutColumns,
    rulerGuides: [
      {
        axis: 'x',
        id: `${rootId}-${preset}-safe-left`,
        offset: layoutColumns.margin,
      },
      {
        axis: 'x',
        id: `${rootId}-${preset}-safe-right`,
        offset: frame.width - layoutColumns.margin,
      },
      {
        axis: 'y',
        id: `${rootId}-${preset}-content-start`,
        offset: getFigmaCloneResponsiveBaselineOffset({ preset, rootId }),
      },
    ],
  }
}

export function getFigmaCloneResponsiveGuidePreset(
  width: number,
): FigmaCloneResponsiveGuidePreset {
  if (width <= 480) {
    return 'mobile'
  }

  if (width <= 900) {
    return 'tablet'
  }

  return width <= 1320 ? 'laptop' : 'desktop'
}

function getFigmaCloneResponsiveBaselineOffset({
  preset,
  rootId,
}: {
  readonly preset: FigmaCloneResponsiveGuidePreset
  readonly rootId: string
}) {
  const isEditorialHome = rootId === 'homePage'

  if (preset === 'mobile') {
    return isEditorialHome ? 132 : 96
  }

  if (preset === 'tablet') {
    return isEditorialHome ? 156 : 112
  }

  return isEditorialHome ? 180 : 132
}
