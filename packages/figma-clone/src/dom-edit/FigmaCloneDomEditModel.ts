export type FigmaCloneDomNodeId =
  | 'workspacePage'
  | 'workspaceSidebar'
  | 'workspaceBrand'
  | 'workspaceBrandMark'
  | 'workspaceBrandText'
  | 'workspaceNav'
  | 'workspaceNavOverview'
  | 'workspaceNavRoadmap'
  | 'workspaceNavCustomers'
  | 'workspaceUpgrade'
  | 'workspaceUpgradeTitle'
  | 'workspaceUpgradeText'
  | 'workspaceMain'
  | 'workspaceTopbar'
  | 'workspaceBreadcrumb'
  | 'workspaceSearch'
  | 'workspaceProfile'
  | 'workspaceHero'
  | 'workspaceHeroCopy'
  | 'workspaceHeroTitle'
  | 'workspaceHeroText'
  | 'workspaceHeroActions'
  | 'workspacePrimaryAction'
  | 'workspaceSecondaryAction'
  | 'workspaceStats'
  | 'workspaceStatRevenue'
  | 'workspaceStatConversion'
  | 'workspaceStatTickets'
  | 'workspaceContent'
  | 'workspacePipeline'
  | 'workspacePipelineHeader'
  | 'workspacePipelineList'
  | 'workspaceDealOne'
  | 'workspaceDealTwo'
  | 'workspaceDealThree'
  | 'workspaceActivity'
  | 'workspaceActivityHeader'
  | 'workspaceActivityList'
  | 'workspaceActivityOne'
  | 'workspaceActivityTwo'
  | 'workspaceActivityThree'
  | 'card'
  | 'header'
  | 'avatar'
  | 'headline'
  | 'supporting'
  | 'actions'
  | 'primaryButton'
  | 'secondaryButton'
  | 'metrics'
  | 'metricOne'
  | 'metricTwo'
  | 'notice'
  | 'noticeAction'
  | 'noticeContent'
  | 'noticeIcon'
  | 'noticeText'
  | 'noticeTitle'
  | 'searchBox'
  | 'toolbar'
  | 'toolbarButton'
  | 'toolbarTitle'

export type FigmaCloneDomNode = {
  children?: readonly FigmaCloneDomNode[]
  id: FigmaCloneDomNodeId
  label: string
}

export type FigmaCloneDomContentType = 'container' | 'control' | 'text'
export type FigmaCloneDomDisplay = 'block' | 'flex' | 'grid' | 'inline'
export type FigmaCloneDomPosition = 'absolute' | 'static'

export type FigmaCloneDomLayoutContext = {
  contentType: FigmaCloneDomContentType
  display: FigmaCloneDomDisplay
  hasChildren: boolean
  label: string
  nodeId: FigmaCloneDomNodeId
  parentDisplay: FigmaCloneDomDisplay | null
  parentId: FigmaCloneDomNodeId | null
  position: FigmaCloneDomPosition
  showBox: boolean
  showContent: boolean
  showFlexLayout: boolean
  showGeometry: boolean
  showGridLayout: boolean
  showParentParticipation: boolean
  showSelfLayout: boolean
}

export type FigmaCloneDomEditField =
  | 'gap'
  | 'h'
  | 'margin'
  | 'order'
  | 'opacity'
  | 'padding'
  | 'radius'
  | 'rotation'
  | 'w'
  | 'x'
  | 'y'

export type FigmaCloneDomAutoLayoutField =
  | 'align'
  | 'alignSelf'
  | 'direction'
  | 'distribution'
  | 'heightMode'
  | 'widthMode'

export type FigmaCloneDomAutoLayoutDirection = 'column' | 'row'
export type FigmaCloneDomAutoLayoutAlign =
  | 'auto'
  | 'center'
  | 'end'
  | 'start'
  | 'stretch'
export type FigmaCloneDomAutoLayoutDistribution =
  | 'packed'
  | 'space-between'
export type FigmaCloneDomAutoLayoutSizeMode =
  | 'fill'
  | 'fixed'
  | 'hug'

export type FigmaCloneDomEditStyle = Record<FigmaCloneDomEditField, number>
export type FigmaCloneDomAutoLayout = {
  align: FigmaCloneDomAutoLayoutAlign
  alignSelf: FigmaCloneDomAutoLayoutAlign
  direction: FigmaCloneDomAutoLayoutDirection
  distribution: FigmaCloneDomAutoLayoutDistribution
  heightMode: FigmaCloneDomAutoLayoutSizeMode
  widthMode: FigmaCloneDomAutoLayoutSizeMode
}
export type FigmaCloneDomEditNodeState =
  FigmaCloneDomEditStyle & FigmaCloneDomAutoLayout

export type FigmaCloneDomEditState =
  Record<FigmaCloneDomNodeId, FigmaCloneDomEditNodeState>

const EMPTY_STYLE: FigmaCloneDomEditStyle = {
  gap: 0,
  h: 0,
  margin: 0,
  opacity: 100,
  order: 0,
  padding: 0,
  radius: 0,
  rotation: 0,
  w: 0,
  x: 0,
  y: 0,
}

const AUTO_LAYOUT_BASE: Omit<
  FigmaCloneDomAutoLayout,
  'heightMode' | 'widthMode'
> = {
  align: 'stretch',
  alignSelf: 'auto',
  direction: 'column',
  distribution: 'packed',
}

const FIXED_BOX_LAYOUT: FigmaCloneDomAutoLayout = {
  ...AUTO_LAYOUT_BASE,
  heightMode: 'fixed',
  widthMode: 'fixed',
}

const HUG_AUTO_LAYOUT_FRAME: FigmaCloneDomAutoLayout = {
  ...AUTO_LAYOUT_BASE,
  heightMode: 'hug',
  widthMode: 'hug',
}

const HUG_BOX_LAYOUT: FigmaCloneDomAutoLayout = {
  ...AUTO_LAYOUT_BASE,
  heightMode: 'hug',
  widthMode: 'hug',
}

export const FIGMA_CLONE_DOM_TREE: readonly FigmaCloneDomNode[] = [
  {
    id: 'workspacePage',
    label: 'Workspace page',
    children: [
      {
        id: 'workspaceSidebar',
        label: 'Sidebar',
        children: [
          {
            id: 'workspaceBrand',
            label: 'Brand row',
            children: [
              { id: 'workspaceBrandMark', label: 'Brand mark' },
              { id: 'workspaceBrandText', label: 'Brand text' },
            ],
          },
          {
            id: 'workspaceNav',
            label: 'Navigation',
            children: [
              { id: 'workspaceNavOverview', label: 'Overview item' },
              { id: 'workspaceNavRoadmap', label: 'Roadmap item' },
              { id: 'workspaceNavCustomers', label: 'Customers item' },
            ],
          },
          {
            id: 'workspaceUpgrade',
            label: 'Usage card',
            children: [
              { id: 'workspaceUpgradeTitle', label: 'Usage title' },
              { id: 'workspaceUpgradeText', label: 'Usage text' },
            ],
          },
        ],
      },
      {
        id: 'workspaceMain',
        label: 'Main area',
        children: [
          {
            id: 'workspaceTopbar',
            label: 'Top bar',
            children: [
              { id: 'workspaceBreadcrumb', label: 'Breadcrumb' },
              { id: 'workspaceSearch', label: 'Search input' },
              { id: 'workspaceProfile', label: 'Profile chip' },
            ],
          },
          {
            id: 'workspaceHero',
            label: 'Hero panel',
            children: [
              {
                id: 'workspaceHeroCopy',
                label: 'Hero copy',
                children: [
                  { id: 'workspaceHeroTitle', label: 'Hero title' },
                  { id: 'workspaceHeroText', label: 'Hero text' },
                ],
              },
              {
                id: 'workspaceHeroActions',
                label: 'Hero actions',
                children: [
                  { id: 'workspacePrimaryAction', label: 'Primary action' },
                  { id: 'workspaceSecondaryAction', label: 'Secondary action' },
                ],
              },
            ],
          },
          {
            id: 'workspaceStats',
            label: 'Stats row',
            children: [
              { id: 'workspaceStatRevenue', label: 'Revenue stat' },
              { id: 'workspaceStatConversion', label: 'Conversion stat' },
              { id: 'workspaceStatTickets', label: 'Tickets stat' },
            ],
          },
          {
            id: 'workspaceContent',
            label: 'Content grid',
            children: [
              {
                id: 'workspacePipeline',
                label: 'Pipeline panel',
                children: [
                  { id: 'workspacePipelineHeader', label: 'Pipeline header' },
                  {
                    id: 'workspacePipelineList',
                    label: 'Pipeline list',
                    children: [
                      { id: 'workspaceDealOne', label: 'Deal row 1' },
                      { id: 'workspaceDealTwo', label: 'Deal row 2' },
                      { id: 'workspaceDealThree', label: 'Deal row 3' },
                    ],
                  },
                ],
              },
              {
                id: 'workspaceActivity',
                label: 'Activity panel',
                children: [
                  { id: 'workspaceActivityHeader', label: 'Activity header' },
                  {
                    id: 'workspaceActivityList',
                    label: 'Activity list',
                    children: [
                      { id: 'workspaceActivityOne', label: 'Activity item 1' },
                      { id: 'workspaceActivityTwo', label: 'Activity item 2' },
                      { id: 'workspaceActivityThree', label: 'Activity item 3' },
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
  {
    id: 'card',
    label: 'Profile card',
    children: [
      {
        id: 'header',
        label: 'Header',
        children: [
          { id: 'avatar', label: 'Avatar' },
          {
            id: 'headline',
            label: 'Headline',
            children: [
              { id: 'supporting', label: 'Supporting text' },
            ],
          },
        ],
      },
      {
        id: 'actions',
        label: 'Actions',
        children: [
          { id: 'primaryButton', label: 'Primary button' },
          { id: 'secondaryButton', label: 'Secondary button' },
        ],
      },
      {
        id: 'metrics',
        label: 'Metrics',
        children: [
          { id: 'metricOne', label: 'Metric 1' },
          { id: 'metricTwo', label: 'Metric 2' },
        ],
      },
    ],
  },
  {
    id: 'toolbar',
    label: 'Toolbar',
    children: [
      { id: 'toolbarTitle', label: 'Toolbar title' },
      { id: 'searchBox', label: 'Search box' },
      { id: 'toolbarButton', label: 'Toolbar button' },
    ],
  },
  {
    id: 'notice',
    label: 'Notice item',
    children: [
      { id: 'noticeIcon', label: 'Notice icon' },
      {
        id: 'noticeContent',
        label: 'Notice content',
        children: [
          { id: 'noticeTitle', label: 'Notice title' },
          { id: 'noticeText', label: 'Notice text' },
        ],
      },
      { id: 'noticeAction', label: 'Notice action' },
    ],
  },
]

export const FIGMA_CLONE_DOM_NODE_BY_ID =
  createFigmaCloneDomNodeMap(FIGMA_CLONE_DOM_TREE)

const DEFAULT_STYLES: FigmaCloneDomEditState = {
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
  workspaceHeroCopy: {
    ...EMPTY_STYLE,
    ...HUG_AUTO_LAYOUT_FRAME,
    direction: 'column',
    gap: 6,
    h: 66,
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
  workspaceStatConversion: {
    ...EMPTY_STYLE,
    ...HUG_BOX_LAYOUT,
    h: 92,
    padding: 14,
    radius: 14,
    w: 201,
    widthMode: 'fill',
  },
  workspaceStatTickets: {
    ...EMPTY_STYLE,
    ...HUG_BOX_LAYOUT,
    h: 92,
    padding: 14,
    radius: 14,
    w: 202,
    widthMode: 'fill',
  },
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
    ...HUG_BOX_LAYOUT,
    h: 54,
    padding: 12,
    radius: 12,
    w: 344,
    widthMode: 'fill',
  },
  workspaceDealTwo: {
    ...EMPTY_STYLE,
    ...HUG_BOX_LAYOUT,
    h: 54,
    padding: 12,
    radius: 12,
    w: 344,
    widthMode: 'fill',
  },
  workspaceDealThree: {
    ...EMPTY_STYLE,
    ...HUG_BOX_LAYOUT,
    h: 54,
    padding: 12,
    radius: 12,
    w: 344,
    widthMode: 'fill',
  },
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
    ...HUG_BOX_LAYOUT,
    h: 50,
    padding: 10,
    radius: 12,
    w: 188,
    widthMode: 'fill',
  },
  workspaceActivityTwo: {
    ...EMPTY_STYLE,
    ...HUG_BOX_LAYOUT,
    h: 50,
    padding: 10,
    radius: 12,
    w: 188,
    widthMode: 'fill',
  },
  workspaceActivityThree: {
    ...EMPTY_STYLE,
    ...HUG_BOX_LAYOUT,
    h: 50,
    padding: 10,
    radius: 12,
    w: 188,
    widthMode: 'fill',
  },
  card: {
    ...EMPTY_STYLE,
    ...HUG_AUTO_LAYOUT_FRAME,
    gap: 18,
    h: 372,
    padding: 24,
    radius: 18,
    w: 360,
  },
  header: {
    ...EMPTY_STYLE,
    ...HUG_AUTO_LAYOUT_FRAME,
    align: 'center',
    direction: 'row',
    gap: 14,
    h: 96,
    padding: 0,
    w: 312,
    widthMode: 'fill',
  },
  avatar: {
    ...EMPTY_STYLE,
    ...FIXED_BOX_LAYOUT,
    h: 64,
    radius: 18,
    w: 64,
  },
  headline: {
    ...EMPTY_STYLE,
    ...HUG_AUTO_LAYOUT_FRAME,
    gap: 5,
    h: 60,
    w: 212,
    widthMode: 'fill',
  },
  supporting: {
    ...EMPTY_STYLE,
    ...HUG_BOX_LAYOUT,
    h: 18,
    w: 196,
  },
  actions: {
    ...EMPTY_STYLE,
    ...HUG_AUTO_LAYOUT_FRAME,
    align: 'center',
    direction: 'row',
    gap: 8,
    h: 36,
    w: 312,
    widthMode: 'fill',
  },
  primaryButton: {
    ...EMPTY_STYLE,
    ...HUG_BOX_LAYOUT,
    h: 36,
    padding: 10,
    radius: 8,
    w: 142,
    widthMode: 'fill',
  },
  secondaryButton: {
    ...EMPTY_STYLE,
    ...HUG_BOX_LAYOUT,
    h: 36,
    padding: 10,
    radius: 8,
    w: 120,
  },
  metrics: {
    ...EMPTY_STYLE,
    ...HUG_AUTO_LAYOUT_FRAME,
    direction: 'row',
    gap: 10,
    h: 96,
    w: 312,
    widthMode: 'fill',
  },
  metricOne: {
    ...EMPTY_STYLE,
    ...HUG_BOX_LAYOUT,
    h: 78,
    padding: 14,
    radius: 12,
    w: 151,
    widthMode: 'fill',
  },
  metricTwo: {
    ...EMPTY_STYLE,
    ...HUG_BOX_LAYOUT,
    h: 78,
    padding: 14,
    radius: 12,
    w: 151,
    widthMode: 'fill',
  },
  toolbar: {
    ...EMPTY_STYLE,
    ...HUG_AUTO_LAYOUT_FRAME,
    align: 'center',
    direction: 'row',
    gap: 10,
    h: 64,
    padding: 12,
    radius: 14,
    w: 420,
  },
  toolbarTitle: {
    ...EMPTY_STYLE,
    ...HUG_BOX_LAYOUT,
    h: 24,
    w: 104,
  },
  searchBox: {
    ...EMPTY_STYLE,
    ...HUG_BOX_LAYOUT,
    h: 34,
    padding: 10,
    radius: 9,
    w: 180,
    widthMode: 'fill',
  },
  toolbarButton: {
    ...EMPTY_STYLE,
    ...HUG_BOX_LAYOUT,
    h: 34,
    padding: 10,
    radius: 9,
    w: 86,
  },
  notice: {
    ...EMPTY_STYLE,
    ...HUG_AUTO_LAYOUT_FRAME,
    align: 'center',
    direction: 'row',
    gap: 12,
    h: 92,
    padding: 16,
    radius: 14,
    w: 420,
  },
  noticeIcon: {
    ...EMPTY_STYLE,
    ...FIXED_BOX_LAYOUT,
    h: 42,
    radius: 12,
    w: 42,
  },
  noticeContent: {
    ...EMPTY_STYLE,
    ...HUG_AUTO_LAYOUT_FRAME,
    direction: 'column',
    gap: 4,
    h: 58,
    w: 240,
    widthMode: 'fill',
  },
  noticeTitle: {
    ...EMPTY_STYLE,
    ...HUG_BOX_LAYOUT,
    h: 22,
    w: 220,
    widthMode: 'fill',
  },
  noticeText: {
    ...EMPTY_STYLE,
    ...HUG_BOX_LAYOUT,
    h: 32,
    w: 236,
    widthMode: 'fill',
  },
  noticeAction: {
    ...EMPTY_STYLE,
    ...HUG_BOX_LAYOUT,
    h: 32,
    padding: 8,
    radius: 8,
    w: 68,
  },
}

const FIELD_LIMITS = {
  gap: { max: 80, min: 0 },
  h: { max: 720, min: 12 },
  margin: { max: 80, min: -40 },
  order: { max: 20, min: -20 },
  opacity: { max: 100, min: 0 },
  padding: { max: 96, min: 0 },
  radius: { max: 80, min: 0 },
  rotation: { max: 180, min: -180 },
  w: { max: 900, min: 12 },
  x: { max: 240, min: -240 },
  y: { max: 240, min: -240 },
} satisfies Record<FigmaCloneDomEditField, { max: number; min: number }>

export function createFigmaCloneDomEditState(): FigmaCloneDomEditState {
  return mapFigmaCloneDomEditState((style) => ({ ...style }), DEFAULT_STYLES)
}

export function getFigmaCloneDomEditStyle(
  state: FigmaCloneDomEditState,
  nodeId: FigmaCloneDomNodeId,
): FigmaCloneDomEditNodeState {
  return state[nodeId] ?? DEFAULT_STYLES[nodeId]
}

export function updateFigmaCloneDomEditField({
  field,
  nodeId,
  state,
  value,
}: {
  field: FigmaCloneDomEditField
  nodeId: FigmaCloneDomNodeId
  state: FigmaCloneDomEditState
  value: number
}): FigmaCloneDomEditState {
  const current = getFigmaCloneDomEditStyle(state, nodeId)
  const nextValue = clampFigmaCloneDomEditField(field, value)

  if (current[field] === nextValue) {
    return state
  }

  return {
    ...state,
    [nodeId]: {
      ...current,
      [field]: nextValue,
    },
  }
}

export function updateFigmaCloneDomAutoLayoutField({
  field,
  nodeId,
  state,
  value,
}: {
  field: FigmaCloneDomAutoLayoutField
  nodeId: FigmaCloneDomNodeId
  state: FigmaCloneDomEditState
  value: FigmaCloneDomEditNodeState[FigmaCloneDomAutoLayoutField]
}): FigmaCloneDomEditState {
  const current = getFigmaCloneDomEditStyle(state, nodeId)

  if (current[field] === value) {
    return state
  }

  return {
    ...state,
    [nodeId]: {
      ...current,
      [field]: value,
    },
  }
}

export function canFigmaCloneDomNodeUseAutoLayout(
  nodeId: FigmaCloneDomNodeId,
): boolean {
  return Boolean(FIGMA_CLONE_DOM_NODE_BY_ID[nodeId].children?.length)
}

export function getFigmaCloneDomLayoutContext(
  nodeId: FigmaCloneDomNodeId,
): FigmaCloneDomLayoutContext {
  const node = FIGMA_CLONE_DOM_NODE_BY_ID[nodeId]
  const parentId = getFigmaCloneDomParentId(nodeId)
  const display = getFigmaCloneDomRuntimeDisplay(nodeId) ??
    getFigmaCloneDomDisplay(nodeId)
  const parentDisplay = parentId
    ? getFigmaCloneDomRuntimeDisplay(parentId) ?? getFigmaCloneDomDisplay(parentId)
    : null
  const position = getFigmaCloneDomRuntimePosition(nodeId) ??
    getFigmaCloneDomPosition(nodeId)
  const contentType = getFigmaCloneDomContentType(nodeId)
  const hasChildren = Boolean(node.children?.length)
  const showFlexLayout = display === 'flex' && hasChildren
  const showGridLayout = display === 'grid' && hasChildren

  return {
    contentType,
    display,
    hasChildren,
    label: node.label,
    nodeId,
    parentDisplay,
    parentId,
    position,
    showBox: true,
    showContent: contentType !== 'container',
    showFlexLayout,
    showGeometry: true,
    showGridLayout,
    showParentParticipation: parentDisplay === 'flex',
    showSelfLayout: showFlexLayout,
  }
}

export function getFigmaCloneDomParentId(
  nodeId: FigmaCloneDomNodeId,
  nodes: readonly FigmaCloneDomNode[] = FIGMA_CLONE_DOM_TREE,
  parentId: FigmaCloneDomNodeId | null = null,
): FigmaCloneDomNodeId | null {
  for (const node of nodes) {
    if (node.id === nodeId) {
      return parentId
    }

    const childParentId = getFigmaCloneDomParentId(
      nodeId,
      node.children ?? [],
      node.id,
    )

    if (childParentId) {
      return childParentId
    }
  }

  return null
}

export function getFigmaCloneDomRootId(
  nodeId: FigmaCloneDomNodeId | null,
): FigmaCloneDomNodeId {
  if (!nodeId) {
    return FIGMA_CLONE_DOM_TREE[0].id
  }

  const root = FIGMA_CLONE_DOM_TREE.find((candidate) =>
    candidate.id === nodeId || containsFigmaCloneDomNode(candidate, nodeId))

  return root?.id ?? FIGMA_CLONE_DOM_TREE[0].id
}

export function getFigmaCloneDomElement(
  nodeId: FigmaCloneDomNodeId,
): HTMLElement | null {
  const element = document.querySelector(
    `[data-figma-dom-node="${nodeId}"]`,
  )

  return element instanceof HTMLElement ? element : null
}

export function resolveFigmaCloneDomClickTarget({
  exactTarget = false,
  root,
  selectedNodeId,
  target,
}: {
  exactTarget?: boolean
  root: HTMLElement
  selectedNodeId: FigmaCloneDomNodeId | null
  target: EventTarget | null
}): FigmaCloneDomNodeId | null {
  if (!(target instanceof Element)) {
    return null
  }

  const chain = getFigmaCloneDomElementChain(root, target)

  if (chain.length === 0) {
    return null
  }

  if (!selectedNodeId) {
    return readFigmaCloneDomNodeId(chain[0])
  }

  if (exactTarget) {
    return readFigmaCloneDomNodeId(chain.at(-1) ?? null)
  }

  const selectedIndex = chain.findIndex((element) =>
    element.dataset.figmaDomNode === selectedNodeId)

  if (selectedIndex >= 0 && selectedIndex < chain.length - 1) {
    return readFigmaCloneDomNodeId(chain[selectedIndex + 1])
  }

  return readFigmaCloneDomNodeId(chain.at(-1) ?? null)
}

export function getFigmaCloneDomNodeDepth(
  nodeId: FigmaCloneDomNodeId,
  nodes: readonly FigmaCloneDomNode[] = FIGMA_CLONE_DOM_TREE,
  depth = 0,
): number {
  for (const node of nodes) {
    if (node.id === nodeId) {
      return depth
    }

    const childDepth = getFigmaCloneDomNodeDepth(
      nodeId,
      node.children ?? [],
      depth + 1,
    )

    if (childDepth >= 0) {
      return childDepth
    }
  }

  return -1
}

function containsFigmaCloneDomNode(
  node: FigmaCloneDomNode,
  nodeId: FigmaCloneDomNodeId,
): boolean {
  return Boolean(node.children?.some((child) =>
    child.id === nodeId || containsFigmaCloneDomNode(child, nodeId)))
}

function getFigmaCloneDomDisplay(
  nodeId: FigmaCloneDomNodeId,
): FigmaCloneDomDisplay {
  if (isFigmaCloneDomGridContainer(nodeId)) {
    return 'grid'
  }

  if (nodeId === 'avatar' || nodeId === 'noticeIcon') {
    return 'grid'
  }

  if (nodeId === 'metricOne' || nodeId === 'metricTwo') {
    return 'flex'
  }

  if (nodeId === 'supporting') {
    return 'inline'
  }

  return canFigmaCloneDomNodeUseAutoLayout(nodeId) ? 'flex' : 'block'
}

export function isFigmaCloneDomGridContainer(
  nodeId: FigmaCloneDomNodeId,
): boolean {
  return nodeId === 'workspaceContent'
}

function getFigmaCloneDomRuntimeDisplay(
  nodeId: FigmaCloneDomNodeId,
): FigmaCloneDomDisplay | null {
  if (typeof document === 'undefined') {
    return null
  }

  const element = getFigmaCloneDomElement(nodeId)

  if (!element) {
    return null
  }

  return normalizeFigmaCloneDomDisplay(getComputedStyle(element).display)
}

function normalizeFigmaCloneDomDisplay(
  display: string,
): FigmaCloneDomDisplay {
  if (display.includes('flex')) {
    return 'flex'
  }

  if (display.includes('grid')) {
    return 'grid'
  }

  if (display.includes('inline')) {
    return 'inline'
  }

  return 'block'
}

function getFigmaCloneDomContentType(
  nodeId: FigmaCloneDomNodeId,
): FigmaCloneDomContentType {
  if (
    nodeId === 'workspaceNavOverview' ||
    nodeId === 'workspaceNavRoadmap' ||
    nodeId === 'workspaceNavCustomers' ||
    nodeId === 'workspaceSearch' ||
    nodeId === 'workspaceProfile' ||
    nodeId === 'workspacePrimaryAction' ||
    nodeId === 'workspaceSecondaryAction' ||
    nodeId === 'primaryButton' ||
    nodeId === 'secondaryButton' ||
    nodeId === 'searchBox' ||
    nodeId === 'toolbarButton' ||
    nodeId === 'noticeAction'
  ) {
    return 'control'
  }

  if (
    nodeId === 'workspaceBrandMark' ||
    nodeId === 'workspaceBrandText' ||
    nodeId === 'workspaceUpgradeTitle' ||
    nodeId === 'workspaceUpgradeText' ||
    nodeId === 'workspaceBreadcrumb' ||
    nodeId === 'workspaceHeroTitle' ||
    nodeId === 'workspaceHeroText' ||
    nodeId === 'workspacePipelineHeader' ||
    nodeId === 'workspaceDealOne' ||
    nodeId === 'workspaceDealTwo' ||
    nodeId === 'workspaceDealThree' ||
    nodeId === 'workspaceActivityHeader' ||
    nodeId === 'workspaceActivityOne' ||
    nodeId === 'workspaceActivityTwo' ||
    nodeId === 'workspaceActivityThree' ||
    nodeId === 'avatar' ||
    nodeId === 'noticeIcon' ||
    nodeId === 'noticeText' ||
    nodeId === 'noticeTitle' ||
    nodeId === 'supporting' ||
    nodeId === 'toolbarTitle'
  ) {
    return 'text'
  }

  return 'container'
}

function getFigmaCloneDomPosition(
  _nodeId: FigmaCloneDomNodeId,
): FigmaCloneDomPosition {
  return 'static'
}

function getFigmaCloneDomRuntimePosition(
  nodeId: FigmaCloneDomNodeId,
): FigmaCloneDomPosition | null {
  if (typeof document === 'undefined') {
    return null
  }

  const element = getFigmaCloneDomElement(nodeId)

  if (!element) {
    return null
  }

  return getComputedStyle(element).position === 'absolute'
    ? 'absolute'
    : 'static'
}

function getFigmaCloneDomElementChain(root: HTMLElement, target: Element) {
  const chain: HTMLElement[] = []
  let current: Element | null = target

  while (current && current !== root.parentElement) {
    if (
      current instanceof HTMLElement &&
      current.dataset.figmaDomNode &&
      root.contains(current)
    ) {
      chain.unshift(current)
    }

    if (current === root) {
      break
    }

    current = current.parentElement
  }

  return chain
}

function readFigmaCloneDomNodeId(
  element: HTMLElement | null,
): FigmaCloneDomNodeId | null {
  const nodeId = element?.dataset.figmaDomNode

  return nodeId && nodeId in FIGMA_CLONE_DOM_NODE_BY_ID
    ? nodeId as FigmaCloneDomNodeId
    : null
}

function clampFigmaCloneDomEditField(
  field: FigmaCloneDomEditField,
  value: number,
) {
  const limit = FIELD_LIMITS[field]
  const finite = Number.isFinite(value) ? value : DEFAULT_STYLES.card[field]

  return Math.min(limit.max, Math.max(limit.min, Math.round(finite)))
}

function createFigmaCloneDomNodeMap(nodes: readonly FigmaCloneDomNode[]) {
  const map: Partial<Record<FigmaCloneDomNodeId, FigmaCloneDomNode>> = {}

  for (const node of nodes) {
    map[node.id] = node

    if (node.children) {
      Object.assign(map, createFigmaCloneDomNodeMap(node.children))
    }
  }

  return map as Record<FigmaCloneDomNodeId, FigmaCloneDomNode>
}

function mapFigmaCloneDomEditState(
  mapper: (style: FigmaCloneDomEditNodeState) => FigmaCloneDomEditNodeState,
  state: FigmaCloneDomEditState,
): FigmaCloneDomEditState {
  return Object.fromEntries(
    Object.entries(state).map(([nodeId, style]) => [nodeId, mapper(style)]),
  ) as FigmaCloneDomEditState
}
