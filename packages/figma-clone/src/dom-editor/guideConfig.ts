import type {
  DomEditFrameGuideConfig,
} from '@interactive-os/dom-edit-affordance/react'
import type {
  FigmaCloneDomNodeId,
} from '../dom-edit/FigmaCloneDomEditModel'
import type {
  FigmaCloneDomSectionRootId,
  FigmaCloneSectionViewport,
} from './section'

export type FigmaCloneResponsiveGuidePreset =
  | 'desktop'
  | 'laptop'
  | 'mobile'
  | 'tablet'

type FigmaCloneResponsiveLayoutGuide = {
  count: number
  gutter: number
  margin: number
}

const FIGMA_CLONE_RESPONSIVE_LAYOUT_GUIDES = {
  desktop: { count: 12, gutter: 24, margin: 80 },
  laptop: { count: 12, gutter: 20, margin: 64 },
  tablet: { count: 8, gutter: 16, margin: 40 },
  mobile: { count: 4, gutter: 12, margin: 24 },
} satisfies Record<
  FigmaCloneResponsiveGuidePreset,
  FigmaCloneResponsiveLayoutGuide
>

export function getFigmaCloneDomFrameGuides({
  rootId,
  sectionViewport,
}: {
  rootId: FigmaCloneDomSectionRootId
  sectionViewport: FigmaCloneSectionViewport
}): DomEditFrameGuideConfig<FigmaCloneDomNodeId> {
  const preset = getFigmaCloneResponsiveGuidePreset(sectionViewport)
  const layoutColumns = FIGMA_CLONE_RESPONSIVE_LAYOUT_GUIDES[preset]
  const baselineOffset = getFigmaCloneResponsiveBaselineOffset({
    preset,
    rootId,
  })

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
        offset: sectionViewport.w - layoutColumns.margin,
      },
      {
        axis: 'y',
        id: `${rootId}-${preset}-content-start`,
        offset: baselineOffset,
      },
    ],
  }
}

export function getFigmaCloneResponsiveGuidePreset(
  sectionViewport: Pick<FigmaCloneSectionViewport, 'w'>,
): FigmaCloneResponsiveGuidePreset {
  if (sectionViewport.w <= 480) {
    return 'mobile'
  }

  if (sectionViewport.w <= 900) {
    return 'tablet'
  }

  if (sectionViewport.w <= 1320) {
    return 'laptop'
  }

  return 'desktop'
}

function getFigmaCloneResponsiveBaselineOffset({
  preset,
  rootId,
}: {
  preset: FigmaCloneResponsiveGuidePreset
  rootId: FigmaCloneDomSectionRootId
}) {
  if (preset === 'mobile') {
    return rootId === 'homePage' ? 132 : 96
  }

  if (preset === 'tablet') {
    return rootId === 'homePage' ? 156 : 112
  }

  return rootId === 'homePage' ? 180 : 132
}
