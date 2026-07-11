import {
  createDesignDocument,
  type DesignDocument,
  type DesignDocumentSnapshot,
  type DesignJSONObject,
  type DesignNode,
  type DesignNodeComponentBinding,
} from '../../../../src/canvas/design-document'
import {
  FIGMA_WORKSPACE_COMPONENT_METADATA,
  type FigmaWorkspaceDesignNodeId,
} from './FigmaWorkspaceComponentMetadata'
import {
  normalizeFigmaDesignNodeState,
  type FigmaDesignNodeState,
} from './FigmaDesignDocumentSeedTypes'
import {
  FIGMA_HOME_DESIGN_DOCUMENT_NODES,
  type FigmaHomeDesignNodeId,
} from './FigmaHomeDesignDocumentSeed'
import {
  FIGMA_WIDGET_DESIGN_DOCUMENT_NODE,
  type FigmaWidgetDesignNodeId,
} from './FigmaWidgetDesignDocumentSeed'

export type FigmaDesignNodeId =
  | FigmaWorkspaceDesignNodeId
  | FigmaHomeDesignNodeId
  | FigmaWidgetDesignNodeId

type FigmaWorkspaceNodeSeed = {
  readonly children?: readonly FigmaWorkspaceNodeSeed[]
  readonly id: FigmaWorkspaceDesignNodeId
  readonly intrinsic: string
  readonly label: string
}

const WORKSPACE_TREE: readonly FigmaWorkspaceNodeSeed[] = [
  {
    id: 'workspacePage',
    intrinsic: 'section',
    label: 'Workspace page',
    children: [
      {
        id: 'workspaceSidebar',
        intrinsic: 'aside',
        label: 'Sidebar',
        children: [
          {
            id: 'workspaceBrand',
            intrinsic: 'div',
            label: 'Brand row',
            children: [
              {
                id: 'workspaceBrandMark',
                intrinsic: 'div',
                label: 'Brand mark',
              },
              {
                id: 'workspaceBrandText',
                intrinsic: 'strong',
                label: 'Brand text',
              },
            ],
          },
          {
            id: 'workspaceNav',
            intrinsic: 'nav',
            label: 'Navigation',
            children: [
              {
                id: 'workspaceNavOverview',
                intrinsic: 'button',
                label: 'Overview item',
              },
              {
                id: 'workspaceNavRoadmap',
                intrinsic: 'button',
                label: 'Roadmap item',
              },
              {
                id: 'workspaceNavCustomers',
                intrinsic: 'button',
                label: 'Customers item',
              },
            ],
          },
          {
            id: 'workspaceUpgrade',
            intrinsic: 'div',
            label: 'Usage card',
            children: [
              {
                id: 'workspaceUpgradeTitle',
                intrinsic: 'strong',
                label: 'Usage title',
              },
              {
                id: 'workspaceUpgradeText',
                intrinsic: 'span',
                label: 'Usage text',
              },
            ],
          },
        ],
      },
      {
        id: 'workspaceMain',
        intrinsic: 'main',
        label: 'Main area',
        children: [
          {
            id: 'workspaceTopbar',
            intrinsic: 'header',
            label: 'Top bar',
            children: [
              {
                id: 'workspaceBreadcrumb',
                intrinsic: 'span',
                label: 'Breadcrumb',
              },
              {
                id: 'workspaceSearch',
                intrinsic: 'div',
                label: 'Search input',
              },
              {
                id: 'workspaceProfile',
                intrinsic: 'button',
                label: 'Profile chip',
              },
            ],
          },
          {
            id: 'workspaceHero',
            intrinsic: 'section',
            label: 'Hero panel',
            children: [
              {
                id: 'workspaceFloatingNote',
                intrinsic: 'span',
                label: 'Floating note',
              },
              {
                id: 'workspaceHeroCopy',
                intrinsic: 'div',
                label: 'Hero copy',
                children: [
                  {
                    id: 'workspaceHeroTitle',
                    intrinsic: 'h2',
                    label: 'Hero title',
                  },
                  {
                    id: 'workspaceHeroText',
                    intrinsic: 'p',
                    label: 'Hero text',
                  },
                  {
                    id: 'workspaceAudienceTags',
                    intrinsic: 'div',
                    label: 'Audience tags',
                    children: [
                      {
                        id: 'workspaceAudienceTagEnterprise',
                        intrinsic: 'span',
                        label: 'Enterprise tag',
                      },
                      {
                        id: 'workspaceAudienceTagRenewal',
                        intrinsic: 'span',
                        label: 'Renewal tag',
                      },
                      {
                        id: 'workspaceAudienceTagExpansion',
                        intrinsic: 'span',
                        label: 'Expansion tag',
                      },
                      {
                        id: 'workspaceAudienceTagRisk',
                        intrinsic: 'span',
                        label: 'Risk tag',
                      },
                    ],
                  },
                ],
              },
              {
                id: 'workspaceHeroActions',
                intrinsic: 'div',
                label: 'Hero actions',
                children: [
                  {
                    id: 'workspacePrimaryAction',
                    intrinsic: 'button',
                    label: 'Primary action',
                  },
                  {
                    id: 'workspaceSecondaryAction',
                    intrinsic: 'button',
                    label: 'Secondary action',
                  },
                ],
              },
            ],
          },
          {
            id: 'workspaceStats',
            intrinsic: 'section',
            label: 'Stats row',
            children: [
              {
                id: 'workspaceStatRevenue',
                intrinsic: 'div',
                label: 'Revenue stat',
                children: [
                  {
                    id: 'workspaceStatRevenueLabel',
                    intrinsic: 'span',
                    label: 'Revenue label',
                  },
                  {
                    id: 'workspaceStatRevenueValue',
                    intrinsic: 'strong',
                    label: 'Revenue value',
                  },
                  {
                    id: 'workspaceStatRevenueDelta',
                    intrinsic: 'em',
                    label: 'Revenue delta',
                  },
                ],
              },
              {
                id: 'workspaceStatConversion',
                intrinsic: 'div',
                label: 'Conversion stat',
                children: [
                  {
                    id: 'workspaceStatConversionLabel',
                    intrinsic: 'span',
                    label: 'Conversion label',
                  },
                  {
                    id: 'workspaceStatConversionValue',
                    intrinsic: 'strong',
                    label: 'Conversion value',
                  },
                  {
                    id: 'workspaceStatConversionDelta',
                    intrinsic: 'em',
                    label: 'Conversion delta',
                  },
                ],
              },
              {
                id: 'workspaceStatTickets',
                intrinsic: 'div',
                label: 'Tickets stat',
                children: [
                  {
                    id: 'workspaceStatTicketsLabel',
                    intrinsic: 'span',
                    label: 'Tickets label',
                  },
                  {
                    id: 'workspaceStatTicketsValue',
                    intrinsic: 'strong',
                    label: 'Tickets value',
                  },
                  {
                    id: 'workspaceStatTicketsDelta',
                    intrinsic: 'em',
                    label: 'Tickets delta',
                  },
                ],
              },
            ],
          },
          {
            id: 'workspaceContent',
            intrinsic: 'section',
            label: 'Content grid',
            children: [
              {
                id: 'workspacePipeline',
                intrinsic: 'section',
                label: 'Pipeline panel',
                children: [
                  {
                    id: 'workspacePipelineHeader',
                    intrinsic: 'header',
                    label: 'Pipeline header',
                  },
                  {
                    id: 'workspacePipelineList',
                    intrinsic: 'div',
                    label: 'Pipeline list',
                    children: [
                      {
                        id: 'workspaceDealOne',
                        intrinsic: 'article',
                        label: 'Deal row 1',
                        children: [
                          {
                            id: 'workspaceDealOneTitle',
                            intrinsic: 'strong',
                            label: 'Deal title 1',
                          },
                          {
                            id: 'workspaceDealOneValue',
                            intrinsic: 'span',
                            label: 'Deal value 1',
                          },
                        ],
                      },
                      {
                        id: 'workspaceDealTwo',
                        intrinsic: 'article',
                        label: 'Deal row 2',
                        children: [
                          {
                            id: 'workspaceDealTwoTitle',
                            intrinsic: 'strong',
                            label: 'Deal title 2',
                          },
                          {
                            id: 'workspaceDealTwoValue',
                            intrinsic: 'span',
                            label: 'Deal value 2',
                          },
                        ],
                      },
                      {
                        id: 'workspaceDealThree',
                        intrinsic: 'article',
                        label: 'Deal row 3',
                        children: [
                          {
                            id: 'workspaceDealThreeTitle',
                            intrinsic: 'strong',
                            label: 'Deal title 3',
                          },
                          {
                            id: 'workspaceDealThreeValue',
                            intrinsic: 'span',
                            label: 'Deal value 3',
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
              {
                id: 'workspaceActivity',
                intrinsic: 'section',
                label: 'Activity panel',
                children: [
                  {
                    id: 'workspaceActivityHeader',
                    intrinsic: 'header',
                    label: 'Activity header',
                  },
                  {
                    id: 'workspaceActivityList',
                    intrinsic: 'div',
                    label: 'Activity list',
                    children: [
                      {
                        id: 'workspaceActivityOne',
                        intrinsic: 'article',
                        label: 'Activity item 1',
                        children: [
                          {
                            id: 'workspaceActivityOneText',
                            intrinsic: 'span',
                            label: 'Activity text 1',
                          },
                        ],
                      },
                      {
                        id: 'workspaceActivityTwo',
                        intrinsic: 'article',
                        label: 'Activity item 2',
                        children: [
                          {
                            id: 'workspaceActivityTwoText',
                            intrinsic: 'span',
                            label: 'Activity text 2',
                          },
                        ],
                      },
                      {
                        id: 'workspaceActivityThree',
                        intrinsic: 'article',
                        label: 'Activity item 3',
                        children: [
                          {
                            id: 'workspaceActivityThreeText',
                            intrinsic: 'span',
                            label: 'Activity text 3',
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
]

const WORKSPACE_AUTHORED_PROPS: Partial<Record<
  FigmaWorkspaceDesignNodeId,
  DesignJSONObject
>> = {
  workspaceActivity: {
    className:
      'figma-dom-workspace__panel figma-dom-workspace__panel--activity',
  },
  workspaceActivityList: { className: 'figma-dom-workspace__activity-list' },
  workspaceActivityOne: { className: 'figma-dom-workspace__activity' },
  workspaceActivityThree: { className: 'figma-dom-workspace__activity' },
  workspaceActivityTwo: { className: 'figma-dom-workspace__activity' },
  workspaceAudienceTagEnterprise: { className: 'figma-dom-workspace__tag' },
  workspaceAudienceTagExpansion: { className: 'figma-dom-workspace__tag' },
  workspaceAudienceTagRenewal: { className: 'figma-dom-workspace__tag' },
  workspaceAudienceTagRisk: { className: 'figma-dom-workspace__tag' },
  workspaceAudienceTags: {
    className: 'figma-dom-workspace__tags',
    flexWrap: 'wrap',
  },
  workspaceBrand: { className: 'figma-dom-workspace__brand' },
  workspaceBrandMark: { className: 'figma-dom-workspace__brand-mark' },
  workspaceBrandText: { className: 'figma-dom-workspace__brand-text' },
  workspaceContent: {
    className: 'figma-dom-workspace__content',
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) max-content',
  },
  workspaceDealOne: { className: 'figma-dom-workspace__deal' },
  workspaceDealThree: { className: 'figma-dom-workspace__deal' },
  workspaceDealTwo: { className: 'figma-dom-workspace__deal' },
  workspaceFloatingNote: {
    className: 'figma-dom-workspace__floating-note',
    position: 'absolute',
  },
  workspaceHero: { className: 'figma-dom-workspace__hero' },
  workspaceHeroActions: { className: 'figma-dom-workspace__hero-actions' },
  workspaceHeroCopy: { className: 'figma-dom-workspace__hero-copy' },
  workspaceMain: { className: 'figma-dom-workspace__main' },
  workspaceNav: { className: 'figma-dom-workspace__nav' },
  workspaceNavCustomers: { className: 'figma-dom-workspace__nav-item' },
  workspaceNavOverview: {
    className:
      'figma-dom-workspace__nav-item figma-dom-workspace__nav-item--active',
  },
  workspaceNavRoadmap: { className: 'figma-dom-workspace__nav-item' },
  workspacePage: { className: 'figma-dom-workspace' },
  workspacePipeline: {
    className:
      'figma-dom-workspace__panel figma-dom-workspace__panel--pipeline',
  },
  workspacePipelineList: { className: 'figma-dom-workspace__list' },
  workspacePrimaryAction: { className: 'figma-dom-workspace__primary' },
  workspaceProfile: { className: 'figma-dom-workspace__profile' },
  workspaceSearch: { className: 'figma-dom-workspace__search' },
  workspaceSecondaryAction: { className: 'figma-dom-workspace__secondary' },
  workspaceSidebar: { className: 'figma-dom-workspace__sidebar' },
  workspaceStatConversion: {
    className: 'figma-dom-workspace__stat',
    display: 'grid',
    gridTemplateRows: 'auto auto auto',
  },
  workspaceStats: { className: 'figma-dom-workspace__stats' },
  workspaceStatRevenue: {
    className: 'figma-dom-workspace__stat',
    display: 'grid',
    gridTemplateRows: 'auto auto auto',
  },
  workspaceStatTickets: {
    className: 'figma-dom-workspace__stat',
    display: 'grid',
    gridTemplateRows: 'auto auto auto',
  },
  workspaceTopbar: { className: 'figma-dom-workspace__topbar' },
  workspaceUpgrade: { className: 'figma-dom-workspace__usage' },
}

const EMPTY_STYLE: FigmaDesignNodeState = {
  align: 'stretch',
  alignSelf: 'auto',
  direction: 'column',
  distribution: 'packed',
  gap: 0,
  h: 0,
  heightMode: 'fixed',
  margin: 0,
  opacity: 100,
  order: 0,
  padding: 0,
  paddingBottom: 0,
  paddingLeft: 0,
  paddingRight: 0,
  paddingTop: 0,
  radius: 0,
  rotation: 0,
  w: 0,
  widthMode: 'fixed',
  x: 0,
  y: 0,
}

const FIXED_BOX_LAYOUT = {
  align: 'stretch',
  alignSelf: 'auto',
  direction: 'column',
  distribution: 'packed',
  heightMode: 'fixed',
  widthMode: 'fixed',
} as const

const HUG_AUTO_LAYOUT_FRAME = {
  align: 'stretch',
  alignSelf: 'auto',
  direction: 'column',
  distribution: 'packed',
  heightMode: 'hug',
  widthMode: 'hug',
} as const

const HUG_BOX_LAYOUT = HUG_AUTO_LAYOUT_FRAME

const TEXT_LEAF_STYLE: FigmaDesignNodeState = {
  ...EMPTY_STYLE,
  ...HUG_BOX_LAYOUT,
  h: 18,
  w: 80,
}

const WORKSPACE_NODE_STATES = mapWorkspaceNodeStates({
  workspacePage: {
    ...EMPTY_STYLE,
    ...HUG_AUTO_LAYOUT_FRAME,
    align: 'stretch',
    direction: 'row',
    gap: 14,
    h: 636,
    padding: 14,
    radius: 0,
    w: 912,
    widthMode: 'fill',
  },
  workspaceSidebar: {
    ...EMPTY_STYLE,
    ...HUG_AUTO_LAYOUT_FRAME,
    align: 'stretch',
    direction: 'column',
    distribution: 'space-between',
    gap: 18,
    h: 604,
    padding: 14,
    radius: 16,
    w: 174,
  },
  workspaceBrand: {
    ...EMPTY_STYLE,
    ...HUG_AUTO_LAYOUT_FRAME,
    align: 'center',
    direction: 'row',
    gap: 10,
    h: 38,
    w: 146,
    widthMode: 'fill',
  },
  workspaceBrandMark: {
    ...EMPTY_STYLE,
    ...FIXED_BOX_LAYOUT,
    h: 30,
    radius: 9,
    w: 30,
  },
  workspaceBrandText: {
    ...EMPTY_STYLE,
    ...HUG_BOX_LAYOUT,
    h: 22,
    w: 88,
  },
  workspaceNav: {
    ...EMPTY_STYLE,
    ...HUG_AUTO_LAYOUT_FRAME,
    direction: 'column',
    gap: 6,
    h: 132,
    w: 146,
    widthMode: 'fill',
  },
  workspaceNavOverview: {
    ...EMPTY_STYLE,
    ...HUG_BOX_LAYOUT,
    h: 34,
    padding: 10,
    radius: 10,
    w: 146,
    widthMode: 'fill',
  },
  workspaceNavRoadmap: {
    ...EMPTY_STYLE,
    ...HUG_BOX_LAYOUT,
    h: 34,
    padding: 10,
    radius: 10,
    w: 146,
    widthMode: 'fill',
  },
  workspaceNavCustomers: {
    ...EMPTY_STYLE,
    ...HUG_BOX_LAYOUT,
    h: 34,
    padding: 10,
    radius: 10,
    w: 146,
    widthMode: 'fill',
  },
  workspaceUpgrade: {
    ...EMPTY_STYLE,
    ...HUG_AUTO_LAYOUT_FRAME,
    direction: 'column',
    gap: 6,
    h: 112,
    padding: 12,
    radius: 14,
    w: 146,
    widthMode: 'fill',
  },
  workspaceUpgradeTitle: {
    ...EMPTY_STYLE,
    ...HUG_BOX_LAYOUT,
    h: 20,
    w: 110,
  },
  workspaceUpgradeText: {
    ...EMPTY_STYLE,
    ...HUG_BOX_LAYOUT,
    h: 44,
    w: 118,
    widthMode: 'fill',
  },
  workspaceMain: {
    ...EMPTY_STYLE,
    ...HUG_AUTO_LAYOUT_FRAME,
    direction: 'column',
    gap: 18,
    h: 596,
    padding: 20,
    radius: 18,
    w: 668,
    widthMode: 'fill',
  },
  workspaceTopbar: {
    ...EMPTY_STYLE,
    ...HUG_AUTO_LAYOUT_FRAME,
    align: 'center',
    direction: 'row',
    distribution: 'space-between',
    gap: 12,
    h: 44,
    w: 628,
    widthMode: 'fill',
  },
  workspaceBreadcrumb: {
    ...EMPTY_STYLE,
    ...HUG_BOX_LAYOUT,
    h: 22,
    w: 164,
  },
  workspaceSearch: {
    ...EMPTY_STYLE,
    ...HUG_BOX_LAYOUT,
    h: 34,
    padding: 10,
    radius: 11,
    w: 220,
    widthMode: 'fill',
  },
  workspaceProfile: {
    ...EMPTY_STYLE,
    ...HUG_BOX_LAYOUT,
    h: 34,
    padding: 9,
    radius: 17,
    w: 88,
  },
  workspaceHero: {
    ...EMPTY_STYLE,
    ...HUG_AUTO_LAYOUT_FRAME,
    align: 'center',
    direction: 'row',
    distribution: 'space-between',
    gap: 24,
    h: 106,
    padding: 18,
    radius: 18,
    w: 628,
    widthMode: 'fill',
  },
  workspaceFloatingNote: {
    ...EMPTY_STYLE,
    ...FIXED_BOX_LAYOUT,
    h: 32,
    padding: 10,
    radius: 10,
    w: 124,
    x: 484,
    y: 14,
  },
  workspaceHeroCopy: {
    ...EMPTY_STYLE,
    ...HUG_AUTO_LAYOUT_FRAME,
    direction: 'column',
    gap: 6,
    h: 132,
    w: 320,
    widthMode: 'fill',
  },
  workspaceHeroTitle: {
    ...EMPTY_STYLE,
    ...HUG_BOX_LAYOUT,
    h: 28,
    w: 286,
    widthMode: 'fill',
  },
  workspaceHeroText: {
    ...EMPTY_STYLE,
    ...HUG_BOX_LAYOUT,
    h: 36,
    w: 318,
    widthMode: 'fill',
  },
  workspaceAudienceTags: {
    ...EMPTY_STYLE,
    ...HUG_AUTO_LAYOUT_FRAME,
    direction: 'row',
    gap: 8,
    h: 60,
    w: 220,
  },
  workspaceAudienceTagEnterprise: {
    ...EMPTY_STYLE,
    ...HUG_BOX_LAYOUT,
    h: 26,
    padding: 8,
    radius: 13,
    w: 102,
  },
  workspaceAudienceTagRenewal: {
    ...EMPTY_STYLE,
    ...HUG_BOX_LAYOUT,
    h: 26,
    padding: 8,
    radius: 13,
    w: 94,
  },
  workspaceAudienceTagExpansion: {
    ...EMPTY_STYLE,
    ...HUG_BOX_LAYOUT,
    h: 26,
    padding: 8,
    radius: 13,
    w: 108,
  },
  workspaceAudienceTagRisk: {
    ...EMPTY_STYLE,
    ...HUG_BOX_LAYOUT,
    h: 26,
    padding: 8,
    radius: 13,
    w: 82,
  },
  workspaceHeroActions: {
    ...EMPTY_STYLE,
    ...HUG_AUTO_LAYOUT_FRAME,
    align: 'center',
    direction: 'row',
    gap: 8,
    h: 36,
    w: 210,
  },
  workspacePrimaryAction: {
    ...EMPTY_STYLE,
    ...HUG_BOX_LAYOUT,
    h: 34,
    padding: 10,
    radius: 10,
    w: 104,
  },
  workspaceSecondaryAction: {
    ...EMPTY_STYLE,
    ...HUG_BOX_LAYOUT,
    h: 34,
    margin: 6,
    padding: 10,
    radius: 10,
    w: 92,
  },
  workspaceStats: {
    ...EMPTY_STYLE,
    ...HUG_AUTO_LAYOUT_FRAME,
    direction: 'row',
    gap: 12,
    h: 92,
    w: 628,
    widthMode: 'fill',
  },
  workspaceStatRevenue: {
    ...EMPTY_STYLE,
    ...HUG_BOX_LAYOUT,
    h: 92,
    padding: 14,
    radius: 14,
    w: 201,
    widthMode: 'fill',
  },
  workspaceStatRevenueLabel: TEXT_LEAF_STYLE,
  workspaceStatRevenueValue: {
    ...TEXT_LEAF_STYLE,
    h: 28,
    w: 104,
  },
  workspaceStatRevenueDelta: TEXT_LEAF_STYLE,
  workspaceStatConversion: {
    ...EMPTY_STYLE,
    ...HUG_BOX_LAYOUT,
    h: 92,
    padding: 14,
    radius: 14,
    w: 201,
    widthMode: 'fill',
  },
  workspaceStatConversionLabel: TEXT_LEAF_STYLE,
  workspaceStatConversionValue: {
    ...TEXT_LEAF_STYLE,
    h: 28,
    w: 104,
  },
  workspaceStatConversionDelta: TEXT_LEAF_STYLE,
  workspaceStatTickets: {
    ...EMPTY_STYLE,
    ...HUG_BOX_LAYOUT,
    h: 92,
    padding: 14,
    radius: 14,
    w: 202,
    widthMode: 'fill',
  },
  workspaceStatTicketsLabel: TEXT_LEAF_STYLE,
  workspaceStatTicketsValue: {
    ...TEXT_LEAF_STYLE,
    h: 28,
    w: 80,
  },
  workspaceStatTicketsDelta: TEXT_LEAF_STYLE,
  workspaceContent: {
    ...EMPTY_STYLE,
    ...HUG_AUTO_LAYOUT_FRAME,
    align: 'stretch',
    direction: 'row',
    gap: 12,
    h: 270,
    w: 628,
    widthMode: 'fill',
  },
  workspacePipeline: {
    ...EMPTY_STYLE,
    ...HUG_AUTO_LAYOUT_FRAME,
    direction: 'column',
    gap: 12,
    h: 270,
    padding: 14,
    radius: 16,
    w: 386,
    widthMode: 'fill',
  },
  workspacePipelineHeader: {
    ...EMPTY_STYLE,
    ...HUG_BOX_LAYOUT,
    h: 28,
    w: 344,
    widthMode: 'fill',
  },
  workspacePipelineList: {
    ...EMPTY_STYLE,
    ...HUG_AUTO_LAYOUT_FRAME,
    direction: 'column',
    gap: 8,
    h: 190,
    w: 344,
    widthMode: 'fill',
  },
  workspaceDealOne: {
    ...EMPTY_STYLE,
    ...HUG_AUTO_LAYOUT_FRAME,
    align: 'center',
    direction: 'row',
    distribution: 'space-between',
    gap: 12,
    h: 54,
    padding: 12,
    radius: 12,
    w: 344,
    widthMode: 'fill',
  },
  workspaceDealOneTitle: {
    ...TEXT_LEAF_STYLE,
    w: 180,
  },
  workspaceDealOneValue: TEXT_LEAF_STYLE,
  workspaceDealTwo: {
    ...EMPTY_STYLE,
    ...HUG_AUTO_LAYOUT_FRAME,
    align: 'center',
    direction: 'row',
    distribution: 'space-between',
    gap: 12,
    h: 54,
    padding: 12,
    radius: 12,
    w: 344,
    widthMode: 'fill',
  },
  workspaceDealTwoTitle: {
    ...TEXT_LEAF_STYLE,
    w: 180,
  },
  workspaceDealTwoValue: TEXT_LEAF_STYLE,
  workspaceDealThree: {
    ...EMPTY_STYLE,
    ...HUG_AUTO_LAYOUT_FRAME,
    align: 'center',
    direction: 'row',
    distribution: 'space-between',
    gap: 12,
    h: 54,
    padding: 12,
    radius: 12,
    w: 344,
    widthMode: 'fill',
  },
  workspaceDealThreeTitle: {
    ...TEXT_LEAF_STYLE,
    w: 180,
  },
  workspaceDealThreeValue: TEXT_LEAF_STYLE,
  workspaceActivity: {
    ...EMPTY_STYLE,
    ...HUG_AUTO_LAYOUT_FRAME,
    direction: 'column',
    gap: 12,
    h: 270,
    padding: 14,
    radius: 16,
    w: 230,
    widthMode: 'hug',
  },
  workspaceActivityHeader: {
    ...EMPTY_STYLE,
    ...HUG_BOX_LAYOUT,
    h: 28,
    w: 188,
    widthMode: 'fill',
  },
  workspaceActivityList: {
    ...EMPTY_STYLE,
    ...HUG_AUTO_LAYOUT_FRAME,
    direction: 'column',
    gap: 8,
    h: 190,
    w: 188,
    widthMode: 'fill',
  },
  workspaceActivityOne: {
    ...EMPTY_STYLE,
    ...HUG_AUTO_LAYOUT_FRAME,
    align: 'center',
    direction: 'row',
    h: 50,
    padding: 10,
    radius: 12,
    w: 188,
    widthMode: 'fill',
  },
  workspaceActivityOneText: {
    ...TEXT_LEAF_STYLE,
    widthMode: 'fill',
  },
  workspaceActivityTwo: {
    ...EMPTY_STYLE,
    ...HUG_AUTO_LAYOUT_FRAME,
    align: 'center',
    direction: 'row',
    h: 50,
    padding: 10,
    radius: 12,
    w: 188,
    widthMode: 'fill',
  },
  workspaceActivityTwoText: {
    ...TEXT_LEAF_STYLE,
    widthMode: 'fill',
  },
  workspaceActivityThree: {
    ...EMPTY_STYLE,
    ...HUG_AUTO_LAYOUT_FRAME,
    align: 'center',
    direction: 'row',
    h: 50,
    padding: 10,
    radius: 12,
    w: 188,
    widthMode: 'fill',
  },
  workspaceActivityThreeText: {
    ...TEXT_LEAF_STYLE,
    widthMode: 'fill',
  },
} satisfies Record<FigmaWorkspaceDesignNodeId, FigmaDesignNodeState>)

const WORKSPACE_TEXT = {
  workspaceActivityHeader: 'Activity',
  workspaceActivityOneText: 'Mina updated forecast',
  workspaceActivityThreeText: 'Lina shared notes',
  workspaceActivityTwoText: 'Jae flagged churn risk',
  workspaceAudienceTagEnterprise: 'Enterprise',
  workspaceAudienceTagExpansion: 'Expansion',
  workspaceAudienceTagRenewal: 'Renewal',
  workspaceAudienceTagRisk: 'Risk',
  workspaceBrandMark: 'C',
  workspaceBrandText: 'CoreOS',
  workspaceBreadcrumb: 'Workspace / Growth',
  workspaceFloatingNote: 'Absolute',
  workspaceDealOneTitle: 'Acme rollout',
  workspaceDealOneValue: '$84k',
  workspaceDealThreeTitle: 'Helio expansion',
  workspaceDealThreeValue: '$38k',
  workspaceDealTwoTitle: 'Northstar renewal',
  workspaceDealTwoValue: '$62k',
  workspaceHeroText: 'Review pipeline health, expansion risk, and activation blockers.',
  workspaceHeroTitle: 'Revenue operations',
  workspaceNavCustomers: 'Customers',
  workspaceNavOverview: 'Overview',
  workspaceNavRoadmap: 'Roadmap',
  workspacePipelineHeader: 'Pipeline review',
  workspacePrimaryAction: 'New report',
  workspaceProfile: 'MK',
  workspaceSearch: 'Search accounts',
  workspaceSecondaryAction: 'Export',
  workspaceStatConversionDelta: '+4.1%',
  workspaceStatConversionLabel: 'Conversion',
  workspaceStatConversionValue: '32.8%',
  workspaceStatRevenueDelta: '+18.2%',
  workspaceStatRevenueLabel: 'Revenue',
  workspaceStatRevenueValue: '$482k',
  workspaceStatTicketsDelta: '-12',
  workspaceStatTicketsLabel: 'Open tickets',
  workspaceStatTicketsValue: '124',
  workspaceUpgradeText: "68% of this quarter's workspace budget is allocated.",
  workspaceUpgradeTitle: 'Capacity',
} as const satisfies Partial<Record<FigmaWorkspaceDesignNodeId, string>>

export const FIGMA_WORKSPACE_DESIGN_DOCUMENT_SNAPSHOT = deepFreeze({
  schemaVersion: 1,
  roots: ['workspacePage'],
  nodes: flattenWorkspaceNodes(WORKSPACE_TREE),
} satisfies DesignDocumentSnapshot)

export const FIGMA_DESIGN_DOCUMENT_SNAPSHOT = deepFreeze({
  schemaVersion: 1,
  roots: [
    FIGMA_WIDGET_DESIGN_DOCUMENT_NODE.id,
    'workspacePage',
    'homePage',
  ],
  nodes: [
    FIGMA_WIDGET_DESIGN_DOCUMENT_NODE,
    ...FIGMA_WORKSPACE_DESIGN_DOCUMENT_SNAPSHOT.nodes,
    ...FIGMA_HOME_DESIGN_DOCUMENT_NODES,
  ],
} satisfies DesignDocumentSnapshot)

export function createFigmaDesignDocument(): DesignDocument {
  return createDesignDocument(FIGMA_DESIGN_DOCUMENT_SNAPSHOT)
}

function flattenWorkspaceNodes(
  seeds: readonly FigmaWorkspaceNodeSeed[],
): DesignNode[] {
  return seeds.flatMap((seed) => {
    const component = getWorkspaceComponentBinding(seed.id)
    const state = WORKSPACE_NODE_STATES[seed.id]
    const node: DesignNode = {
      id: seed.id,
      label: seed.label,
      definition: component?.slotId === 'root'
        ? { kind: 'component', id: component.definitionId }
        : { kind: 'intrinsic', id: seed.intrinsic },
      children: seed.children?.map((child) => child.id) ?? [],
      props: {
        ...WORKSPACE_AUTHORED_PROPS[seed.id],
        ...(seed.intrinsic === 'button' ? { type: 'button' } : {}),
      },
      text: (WORKSPACE_TEXT as Partial<
        Record<FigmaWorkspaceDesignNodeId, string>
      >)[seed.id] ?? null,
      layout: {
        align: state.align,
        alignSelf: state.alignSelf,
        direction: state.direction,
        distribution: state.distribution,
        gap: state.gap,
        h: state.h,
        heightMode: state.heightMode,
        margin: state.margin,
        order: state.order,
        padding: state.padding,
        paddingBottom: state.paddingBottom,
        paddingLeft: state.paddingLeft,
        paddingRight: state.paddingRight,
        paddingTop: state.paddingTop,
        w: state.w,
        widthMode: state.widthMode,
        x: state.x,
        y: state.y,
      },
      style: {
        opacity: state.opacity,
        radius: state.radius,
        rotation: state.rotation,
      },
      frame: seed.id === 'workspacePage'
        ? {
            x: 40,
            y: 76,
            width: 1280,
            height: 800,
            rotation: 0,
            widthMode: 'fixed',
            heightMode: 'content',
            overflow: 'scroll',
          }
        : null,
      component,
    }

    return [node, ...flattenWorkspaceNodes(seed.children ?? [])]
  })
}

function getWorkspaceComponentBinding(
  nodeId: FigmaWorkspaceDesignNodeId,
): DesignNodeComponentBinding | null {
  for (const definition of FIGMA_WORKSPACE_COMPONENT_METADATA) {
    for (const instance of definition.instances) {
      for (const [slotId, slotNodeId] of Object.entries(instance.slots)) {
        if (slotNodeId === nodeId) {
          return {
            definitionId: definition.id,
            instanceId: instance.id,
            slotId,
          }
        }
      }
    }
  }

  return null
}

function mapWorkspaceNodeStates(
  states: Record<FigmaWorkspaceDesignNodeId, FigmaDesignNodeState>,
): Record<FigmaWorkspaceDesignNodeId, FigmaDesignNodeState> {
  return Object.fromEntries(
    Object.entries(states).map(([nodeId, state]) => [
      nodeId,
      normalizeFigmaDesignNodeState(state),
    ]),
  ) as Record<FigmaWorkspaceDesignNodeId, FigmaDesignNodeState>
}

function deepFreeze<T>(value: T): T {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) {
    return value
  }

  Object.freeze(value)

  for (const child of Object.values(value)) {
    deepFreeze(child)
  }

  return value
}
