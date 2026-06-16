import {
  createDomEditUniformPaddingSides,
  canDomEditFillParent,
  DOM_EDIT_PADDING_SIDE_FIELDS,
  getDomEditPaddingSides,
  getDomEditToggledAxisSizeMode,
  getDomEditUniformPadding,
  type DomEditAutoLayout,
  type DomEditAutoLayoutAlign,
  type DomEditAutoLayoutDirection,
  type DomEditAutoLayoutDistribution,
  type DomEditAutoLayoutField,
  type DomEditAutoLayoutSizeMode,
  type DomEditContentType,
  type DomEditDisplay,
  type DomEditField,
  type DomEditLayoutContext,
  type DomEditModelAdapter,
  type DomEditNode,
  type DomEditNodeState,
  type DomEditPaddingSides,
  type DomEditPaddingSide,
  type DomEditPosition,
  type DomEditState,
  type DomEditStyle,
  type DomEditTextState,
} from '@interactive-os/dom-edit-affordance'

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
  | 'workspaceFloatingNote'
  | 'workspaceHeroCopy'
  | 'workspaceHeroTitle'
  | 'workspaceHeroText'
  | 'workspaceAudienceTags'
  | 'workspaceAudienceTagEnterprise'
  | 'workspaceAudienceTagRenewal'
  | 'workspaceAudienceTagExpansion'
  | 'workspaceAudienceTagRisk'
  | 'workspaceHeroActions'
  | 'workspacePrimaryAction'
  | 'workspaceSecondaryAction'
  | 'workspaceStats'
  | 'workspaceStatRevenue'
  | 'workspaceStatRevenueLabel'
  | 'workspaceStatRevenueValue'
  | 'workspaceStatRevenueDelta'
  | 'workspaceStatConversion'
  | 'workspaceStatConversionLabel'
  | 'workspaceStatConversionValue'
  | 'workspaceStatConversionDelta'
  | 'workspaceStatTickets'
  | 'workspaceStatTicketsLabel'
  | 'workspaceStatTicketsValue'
  | 'workspaceStatTicketsDelta'
  | 'workspaceContent'
  | 'workspacePipeline'
  | 'workspacePipelineHeader'
  | 'workspacePipelineList'
  | 'workspaceDealOne'
  | 'workspaceDealOneTitle'
  | 'workspaceDealOneValue'
  | 'workspaceDealTwo'
  | 'workspaceDealTwoTitle'
  | 'workspaceDealTwoValue'
  | 'workspaceDealThree'
  | 'workspaceDealThreeTitle'
  | 'workspaceDealThreeValue'
  | 'workspaceActivity'
  | 'workspaceActivityHeader'
  | 'workspaceActivityList'
  | 'workspaceActivityOne'
  | 'workspaceActivityOneText'
  | 'workspaceActivityTwo'
  | 'workspaceActivityTwoText'
  | 'workspaceActivityThree'
  | 'workspaceActivityThreeText'
  | 'homePage'
  | 'homeHeader'
  | 'homeBrand'
  | 'homeBrandMark'
  | 'homeBrandText'
  | 'homeNav'
  | 'homeNavEssays'
  | 'homeNavMethods'
  | 'homeNavArchive'
  | 'homeSubscribe'
  | 'homeSubscribeLabel'
  | 'homeSubscribeNote'
  | 'homeMain'
  | 'homeIssueRail'
  | 'homeIssueKicker'
  | 'homeIssueTitle'
  | 'homeIssueTime'
  | 'homeHero'
  | 'homeHeroCopy'
  | 'homeHeroTitle'
  | 'homeHeroText'
  | 'homeHeroActions'
  | 'homePrimaryAction'
  | 'homeSecondaryAction'
  | 'homeMeta'
  | 'homeByline'
  | 'homeBylineLabel'
  | 'homeBylineValue'
  | 'homeBylineNote'
  | 'homeCategory'
  | 'homeCategoryLabel'
  | 'homeCategoryValue'
  | 'homeCategoryNote'
  | 'homeReadTime'
  | 'homeReadTimeLabel'
  | 'homeReadTimeValue'
  | 'homeReadTimeNote'
  | 'homeArticle'
  | 'homeEssay'
  | 'homeEssayHeading'
  | 'homeChapterList'
  | 'homeChapterOne'
  | 'homeChapterOneTitle'
  | 'homeChapterOneNumber'
  | 'homeChapterTwo'
  | 'homeChapterTwoTitle'
  | 'homeChapterTwoNumber'
  | 'homeChapterThree'
  | 'homeChapterThreeTitle'
  | 'homeChapterThreeNumber'
  | 'homeQuote'
  | 'homeQuoteHeading'
  | 'homeQuoteList'
  | 'homeQuoteOne'
  | 'homeQuoteOneText'
  | 'homeQuoteTwo'
  | 'homeQuoteTwoText'
  | 'homeQuoteThree'
  | 'homeQuoteThreeText'
  | 'homeDispatches'
  | 'homeDispatchHeading'
  | 'homeDispatchGrid'
  | 'homeDispatchOne'
  | 'homeDispatchOneTitle'
  | 'homeDispatchOneText'
  | 'homeDispatchTwo'
  | 'homeDispatchTwoTitle'
  | 'homeDispatchTwoText'
  | 'homeDispatchThree'
  | 'homeDispatchThreeTitle'
  | 'homeDispatchThreeText'
  | 'homeNewsletter'
  | 'homeNewsletterHeading'
  | 'homeNewsletterText'
  | 'homeNewsletterAction'
  | 'homeFooter'
  | 'homeFooterBrand'
  | 'homeFooterNote'
  | 'card'
  | 'header'
  | 'avatar'
  | 'headline'
  | 'headlineTitle'
  | 'supporting'
  | 'actions'
  | 'primaryButton'
  | 'secondaryButton'
  | 'metrics'
  | 'metricOne'
  | 'metricOneLabel'
  | 'metricOneValue'
  | 'metricTwo'
  | 'metricTwoLabel'
  | 'metricTwoValue'
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

export type FigmaCloneDomNode = DomEditNode<FigmaCloneDomNodeId>
export type FigmaCloneDomContentType = DomEditContentType
export type FigmaCloneDomDisplay = DomEditDisplay
export type FigmaCloneDomPosition = DomEditPosition
export type FigmaCloneDomLayoutContext =
  DomEditLayoutContext<FigmaCloneDomNodeId>
export type FigmaCloneDomEditField = DomEditField
export type FigmaCloneDomAutoLayoutField = DomEditAutoLayoutField
export type FigmaCloneDomAutoLayoutDirection = DomEditAutoLayoutDirection
export type FigmaCloneDomAutoLayoutAlign = DomEditAutoLayoutAlign
export type FigmaCloneDomAutoLayoutDistribution =
  DomEditAutoLayoutDistribution
export type FigmaCloneDomAutoLayoutSizeMode = DomEditAutoLayoutSizeMode
export type FigmaCloneDomEditStyle = DomEditStyle
export type FigmaCloneDomAutoLayout = DomEditAutoLayout
export type FigmaCloneDomEditNodeState = DomEditNodeState
export type FigmaCloneDomEditState = DomEditState<FigmaCloneDomNodeId>
export type FigmaCloneDomTextState = DomEditTextState<FigmaCloneDomNodeId>

const EMPTY_STYLE: FigmaCloneDomEditStyle = {
  gap: 0,
  h: 0,
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

const TEXT_LEAF_STYLE: FigmaCloneDomEditNodeState = {
  ...EMPTY_STYLE,
  ...HUG_BOX_LAYOUT,
  h: 18,
  w: 80,
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
              { id: 'workspaceFloatingNote', label: 'Floating note' },
              {
                id: 'workspaceHeroCopy',
                label: 'Hero copy',
                children: [
                  { id: 'workspaceHeroTitle', label: 'Hero title' },
                  { id: 'workspaceHeroText', label: 'Hero text' },
                  {
                    id: 'workspaceAudienceTags',
                    label: 'Audience tags',
                    children: [
                      { id: 'workspaceAudienceTagEnterprise', label: 'Enterprise tag' },
                      { id: 'workspaceAudienceTagRenewal', label: 'Renewal tag' },
                      { id: 'workspaceAudienceTagExpansion', label: 'Expansion tag' },
                      { id: 'workspaceAudienceTagRisk', label: 'Risk tag' },
                    ],
                  },
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
              {
                id: 'workspaceStatRevenue',
                label: 'Revenue stat',
                children: [
                  { id: 'workspaceStatRevenueLabel', label: 'Revenue label' },
                  { id: 'workspaceStatRevenueValue', label: 'Revenue value' },
                  { id: 'workspaceStatRevenueDelta', label: 'Revenue delta' },
                ],
              },
              {
                id: 'workspaceStatConversion',
                label: 'Conversion stat',
                children: [
                  { id: 'workspaceStatConversionLabel', label: 'Conversion label' },
                  { id: 'workspaceStatConversionValue', label: 'Conversion value' },
                  { id: 'workspaceStatConversionDelta', label: 'Conversion delta' },
                ],
              },
              {
                id: 'workspaceStatTickets',
                label: 'Tickets stat',
                children: [
                  { id: 'workspaceStatTicketsLabel', label: 'Tickets label' },
                  { id: 'workspaceStatTicketsValue', label: 'Tickets value' },
                  { id: 'workspaceStatTicketsDelta', label: 'Tickets delta' },
                ],
              },
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
                      {
                        id: 'workspaceDealOne',
                        label: 'Deal row 1',
                        children: [
                          { id: 'workspaceDealOneTitle', label: 'Deal title 1' },
                          { id: 'workspaceDealOneValue', label: 'Deal value 1' },
                        ],
                      },
                      {
                        id: 'workspaceDealTwo',
                        label: 'Deal row 2',
                        children: [
                          { id: 'workspaceDealTwoTitle', label: 'Deal title 2' },
                          { id: 'workspaceDealTwoValue', label: 'Deal value 2' },
                        ],
                      },
                      {
                        id: 'workspaceDealThree',
                        label: 'Deal row 3',
                        children: [
                          { id: 'workspaceDealThreeTitle', label: 'Deal title 3' },
                          { id: 'workspaceDealThreeValue', label: 'Deal value 3' },
                        ],
                      },
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
                      {
                        id: 'workspaceActivityOne',
                        label: 'Activity item 1',
                        children: [
                          { id: 'workspaceActivityOneText', label: 'Activity text 1' },
                        ],
                      },
                      {
                        id: 'workspaceActivityTwo',
                        label: 'Activity item 2',
                        children: [
                          { id: 'workspaceActivityTwoText', label: 'Activity text 2' },
                        ],
                      },
                      {
                        id: 'workspaceActivityThree',
                        label: 'Activity item 3',
                        children: [
                          { id: 'workspaceActivityThreeText', label: 'Activity text 3' },
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
  {
    id: 'homePage',
    label: 'Editorial homepage',
    children: [
      {
        id: 'homeHeader',
        label: 'Header',
        children: [
          {
            id: 'homeBrand',
            label: 'Brand',
            children: [
              { id: 'homeBrandMark', label: 'Logo mark' },
              { id: 'homeBrandText', label: 'Logo text' },
            ],
          },
          {
            id: 'homeNav',
            label: 'Primary nav',
            children: [
              { id: 'homeNavEssays', label: 'Essays link' },
              { id: 'homeNavMethods', label: 'Methods link' },
              { id: 'homeNavArchive', label: 'Archive link' },
            ],
          },
          {
            id: 'homeSubscribe',
            label: 'Subscribe CTA',
            children: [
              { id: 'homeSubscribeLabel', label: 'CTA label' },
              { id: 'homeSubscribeNote', label: 'CTA note' },
            ],
          },
        ],
      },
      {
        id: 'homeMain',
        label: 'Page body',
        children: [
          {
            id: 'homeIssueRail',
            label: 'Issue rail',
            children: [
              { id: 'homeIssueKicker', label: 'Issue kicker' },
              { id: 'homeIssueTitle', label: 'Issue title' },
              { id: 'homeIssueTime', label: 'Read time' },
            ],
          },
          {
            id: 'homeHero',
            label: 'Hero article',
            children: [
              {
                id: 'homeHeroCopy',
                label: 'Hero copy',
                children: [
                  { id: 'homeHeroTitle', label: 'Hero title' },
                  { id: 'homeHeroText', label: 'Hero dek' },
                ],
              },
              {
                id: 'homeHeroActions',
                label: 'Hero actions',
                children: [
                  { id: 'homePrimaryAction', label: 'Primary action' },
                  { id: 'homeSecondaryAction', label: 'Secondary action' },
                ],
              },
            ],
          },
          {
            id: 'homeMeta',
            label: 'Article meta',
            children: [
              {
                id: 'homeByline',
                label: 'Byline',
                children: [
                  { id: 'homeBylineLabel', label: 'Byline label' },
                  { id: 'homeBylineValue', label: 'Author name' },
                  { id: 'homeBylineNote', label: 'Author note' },
                ],
              },
              {
                id: 'homeCategory',
                label: 'Category',
                children: [
                  { id: 'homeCategoryLabel', label: 'Category label' },
                  { id: 'homeCategoryValue', label: 'Category name' },
                  { id: 'homeCategoryNote', label: 'Category note' },
                ],
              },
              {
                id: 'homeReadTime',
                label: 'Reading time',
                children: [
                  { id: 'homeReadTimeLabel', label: 'Time label' },
                  { id: 'homeReadTimeValue', label: 'Time value' },
                  { id: 'homeReadTimeNote', label: 'Time note' },
                ],
              },
            ],
          },
          {
            id: 'homeArticle',
            label: 'Article preview',
            children: [
              {
                id: 'homeEssay',
                label: 'Essay body',
                children: [
                  { id: 'homeEssayHeading', label: 'Body heading' },
                  {
                    id: 'homeChapterList',
                    label: 'Chapter list',
                    children: [
                      {
                        id: 'homeChapterOne',
                        label: 'Chapter 1',
                        children: [
                          { id: 'homeChapterOneTitle', label: 'Chapter title 1' },
                          { id: 'homeChapterOneNumber', label: 'Chapter number 1' },
                        ],
                      },
                      {
                        id: 'homeChapterTwo',
                        label: 'Chapter 2',
                        children: [
                          { id: 'homeChapterTwoTitle', label: 'Chapter title 2' },
                          { id: 'homeChapterTwoNumber', label: 'Chapter number 2' },
                        ],
                      },
                      {
                        id: 'homeChapterThree',
                        label: 'Chapter 3',
                        children: [
                          { id: 'homeChapterThreeTitle', label: 'Chapter title 3' },
                          { id: 'homeChapterThreeNumber', label: 'Chapter number 3' },
                        ],
                      },
                    ],
                  },
                ],
              },
              {
                id: 'homeQuote',
                label: 'Pull quote',
                children: [
                  { id: 'homeQuoteHeading', label: 'Quote heading' },
                  {
                    id: 'homeQuoteList',
                    label: 'Quote lines',
                    children: [
                      {
                        id: 'homeQuoteOne',
                        label: 'Quote line 1',
                        children: [
                          { id: 'homeQuoteOneText', label: 'Quote text 1' },
                        ],
                      },
                      {
                        id: 'homeQuoteTwo',
                        label: 'Quote line 2',
                        children: [
                          { id: 'homeQuoteTwoText', label: 'Quote text 2' },
                        ],
                      },
                      {
                        id: 'homeQuoteThree',
                        label: 'Quote line 3',
                        children: [
                          { id: 'homeQuoteThreeText', label: 'Quote text 3' },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            id: 'homeDispatches',
            label: 'Dispatches',
            children: [
              { id: 'homeDispatchHeading', label: 'Dispatch heading' },
              {
                id: 'homeDispatchGrid',
                label: 'Dispatch grid',
                children: [
                  {
                    id: 'homeDispatchOne',
                    label: 'Dispatch card 1',
                    children: [
                      { id: 'homeDispatchOneTitle', label: 'Dispatch title 1' },
                      { id: 'homeDispatchOneText', label: 'Dispatch text 1' },
                    ],
                  },
                  {
                    id: 'homeDispatchTwo',
                    label: 'Dispatch card 2',
                    children: [
                      { id: 'homeDispatchTwoTitle', label: 'Dispatch title 2' },
                      { id: 'homeDispatchTwoText', label: 'Dispatch text 2' },
                    ],
                  },
                  {
                    id: 'homeDispatchThree',
                    label: 'Dispatch card 3',
                    children: [
                      { id: 'homeDispatchThreeTitle', label: 'Dispatch title 3' },
                      { id: 'homeDispatchThreeText', label: 'Dispatch text 3' },
                    ],
                  },
                ],
              },
            ],
          },
          {
            id: 'homeNewsletter',
            label: 'Newsletter band',
            children: [
              { id: 'homeNewsletterHeading', label: 'Newsletter heading' },
              { id: 'homeNewsletterText', label: 'Newsletter text' },
              { id: 'homeNewsletterAction', label: 'Newsletter action' },
            ],
          },
          {
            id: 'homeFooter',
            label: 'Footer',
            children: [
              { id: 'homeFooterBrand', label: 'Footer brand' },
              { id: 'homeFooterNote', label: 'Footer note' },
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
              { id: 'headlineTitle', label: 'Headline title' },
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
          {
            id: 'metricOne',
            label: 'Metric 1',
            children: [
              { id: 'metricOneLabel', label: 'Metric label 1' },
              { id: 'metricOneValue', label: 'Metric value 1' },
            ],
          },
          {
            id: 'metricTwo',
            label: 'Metric 2',
            children: [
              { id: 'metricTwoLabel', label: 'Metric label 2' },
              { id: 'metricTwoValue', label: 'Metric value 2' },
            ],
          },
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

const DEFAULT_STYLES = mapFigmaCloneDomEditState(
  normalizeFigmaCloneDomEditStyle,
  {
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
  homePage: {
    ...EMPTY_STYLE,
    ...HUG_AUTO_LAYOUT_FRAME,
    align: 'stretch',
    direction: 'column',
    h: 1736,
    w: 1180,
    widthMode: 'fill',
  },
  homeHeader: {
    ...EMPTY_STYLE,
    ...HUG_AUTO_LAYOUT_FRAME,
    align: 'center',
    direction: 'row',
    distribution: 'space-between',
    gap: 28,
    h: 88,
    padding: 42,
    w: 1180,
    widthMode: 'fill',
  },
  homeBrand: {
    ...EMPTY_STYLE,
    ...HUG_AUTO_LAYOUT_FRAME,
    align: 'center',
    direction: 'row',
    gap: 12,
    h: 32,
    w: 168,
  },
  homeBrandMark: {
    ...EMPTY_STYLE,
    ...FIXED_BOX_LAYOUT,
    h: 28,
    radius: 8,
    w: 28,
  },
  homeBrandText: {
    ...EMPTY_STYLE,
    ...HUG_BOX_LAYOUT,
    h: 22,
    w: 122,
  },
  homeNav: {
    ...EMPTY_STYLE,
    ...HUG_AUTO_LAYOUT_FRAME,
    align: 'center',
    direction: 'row',
    gap: 18,
    h: 36,
    w: 310,
  },
  homeNavEssays: {
    ...EMPTY_STYLE,
    ...HUG_BOX_LAYOUT,
    h: 32,
    padding: 8,
    radius: 16,
    w: 74,
  },
  homeNavMethods: {
    ...EMPTY_STYLE,
    ...HUG_BOX_LAYOUT,
    h: 32,
    padding: 8,
    radius: 16,
    w: 86,
  },
  homeNavArchive: {
    ...EMPTY_STYLE,
    ...HUG_BOX_LAYOUT,
    h: 32,
    padding: 8,
    radius: 16,
    w: 78,
  },
  homeSubscribe: {
    ...EMPTY_STYLE,
    ...HUG_AUTO_LAYOUT_FRAME,
    align: 'center',
    direction: 'row',
    gap: 10,
    h: 38,
    padding: 12,
    radius: 18,
    w: 158,
  },
  homeSubscribeLabel: {
    ...EMPTY_STYLE,
    ...HUG_BOX_LAYOUT,
    h: 18,
    w: 72,
  },
  homeSubscribeNote: {
    ...EMPTY_STYLE,
    ...HUG_BOX_LAYOUT,
    h: 18,
    w: 48,
  },
  homeMain: {
    ...EMPTY_STYLE,
    ...HUG_AUTO_LAYOUT_FRAME,
    direction: 'column',
    h: 1648,
    w: 1180,
    widthMode: 'fill',
  },
  homeIssueRail: {
    ...EMPTY_STYLE,
    ...HUG_AUTO_LAYOUT_FRAME,
    align: 'center',
    direction: 'row',
    distribution: 'space-between',
    gap: 18,
    h: 72,
    padding: 42,
    w: 1180,
    widthMode: 'fill',
  },
  homeIssueKicker: {
    ...EMPTY_STYLE,
    ...HUG_BOX_LAYOUT,
    h: 22,
    w: 104,
  },
  homeIssueTitle: {
    ...EMPTY_STYLE,
    ...HUG_BOX_LAYOUT,
    h: 34,
    padding: 10,
    radius: 17,
    w: 460,
    widthMode: 'fill',
  },
  homeIssueTime: {
    ...EMPTY_STYLE,
    ...HUG_BOX_LAYOUT,
    h: 34,
    padding: 10,
    radius: 17,
    w: 104,
  },
  homeHero: {
    ...EMPTY_STYLE,
    ...HUG_AUTO_LAYOUT_FRAME,
    align: 'start',
    direction: 'column',
    gap: 30,
    h: 560,
    padding: 84,
    w: 1180,
    widthMode: 'fill',
  },
  homeHeroCopy: {
    ...EMPTY_STYLE,
    ...HUG_AUTO_LAYOUT_FRAME,
    direction: 'column',
    gap: 18,
    h: 302,
    w: 780,
  },
  homeHeroTitle: {
    ...EMPTY_STYLE,
    ...HUG_BOX_LAYOUT,
    h: 204,
    w: 760,
  },
  homeHeroText: {
    ...EMPTY_STYLE,
    ...HUG_BOX_LAYOUT,
    h: 80,
    w: 650,
  },
  homeHeroActions: {
    ...EMPTY_STYLE,
    ...HUG_AUTO_LAYOUT_FRAME,
    align: 'center',
    direction: 'row',
    gap: 12,
    h: 46,
    w: 300,
  },
  homePrimaryAction: {
    ...EMPTY_STYLE,
    ...HUG_BOX_LAYOUT,
    h: 44,
    padding: 14,
    radius: 22,
    w: 136,
  },
  homeSecondaryAction: {
    ...EMPTY_STYLE,
    ...HUG_BOX_LAYOUT,
    h: 44,
    padding: 14,
    radius: 22,
    w: 146,
  },
  homeMeta: {
    ...EMPTY_STYLE,
    ...HUG_AUTO_LAYOUT_FRAME,
    align: 'stretch',
    direction: 'row',
    h: 150,
    padding: 48,
    w: 1180,
    widthMode: 'fill',
  },
  homeByline: {
    ...EMPTY_STYLE,
    ...HUG_BOX_LAYOUT,
    h: 72,
    w: 352,
    widthMode: 'fill',
  },
  homeBylineLabel: TEXT_LEAF_STYLE,
  homeBylineValue: {
    ...TEXT_LEAF_STYLE,
    h: 26,
    w: 190,
  },
  homeBylineNote: TEXT_LEAF_STYLE,
  homeCategory: {
    ...EMPTY_STYLE,
    ...HUG_BOX_LAYOUT,
    h: 72,
    w: 352,
    widthMode: 'fill',
  },
  homeCategoryLabel: TEXT_LEAF_STYLE,
  homeCategoryValue: {
    ...TEXT_LEAF_STYLE,
    h: 26,
    w: 190,
  },
  homeCategoryNote: TEXT_LEAF_STYLE,
  homeReadTime: {
    ...EMPTY_STYLE,
    ...HUG_BOX_LAYOUT,
    h: 72,
    w: 352,
    widthMode: 'fill',
  },
  homeReadTimeLabel: TEXT_LEAF_STYLE,
  homeReadTimeValue: {
    ...TEXT_LEAF_STYLE,
    h: 26,
    w: 190,
  },
  homeReadTimeNote: TEXT_LEAF_STYLE,
  homeArticle: {
    ...EMPTY_STYLE,
    ...HUG_AUTO_LAYOUT_FRAME,
    align: 'stretch',
    direction: 'row',
    gap: 52,
    h: 430,
    padding: 72,
    w: 1180,
    widthMode: 'fill',
  },
  homeEssay: {
    ...EMPTY_STYLE,
    ...HUG_AUTO_LAYOUT_FRAME,
    direction: 'column',
    gap: 26,
    h: 286,
    w: 690,
    widthMode: 'fill',
  },
  homeEssayHeading: {
    ...EMPTY_STYLE,
    ...HUG_BOX_LAYOUT,
    h: 42,
    w: 620,
    widthMode: 'fill',
  },
  homeChapterList: {
    ...EMPTY_STYLE,
    ...HUG_AUTO_LAYOUT_FRAME,
    direction: 'column',
    h: 218,
    w: 690,
    widthMode: 'fill',
  },
  homeChapterOne: {
    ...EMPTY_STYLE,
    ...HUG_AUTO_LAYOUT_FRAME,
    align: 'center',
    direction: 'row',
    distribution: 'space-between',
    h: 68,
    w: 690,
    widthMode: 'fill',
  },
  homeChapterOneTitle: {
    ...TEXT_LEAF_STYLE,
    w: 520,
  },
  homeChapterOneNumber: TEXT_LEAF_STYLE,
  homeChapterTwo: {
    ...EMPTY_STYLE,
    ...HUG_AUTO_LAYOUT_FRAME,
    align: 'center',
    direction: 'row',
    distribution: 'space-between',
    h: 68,
    w: 690,
    widthMode: 'fill',
  },
  homeChapterTwoTitle: {
    ...TEXT_LEAF_STYLE,
    w: 520,
  },
  homeChapterTwoNumber: TEXT_LEAF_STYLE,
  homeChapterThree: {
    ...EMPTY_STYLE,
    ...HUG_AUTO_LAYOUT_FRAME,
    align: 'center',
    direction: 'row',
    distribution: 'space-between',
    h: 68,
    w: 690,
    widthMode: 'fill',
  },
  homeChapterThreeTitle: {
    ...TEXT_LEAF_STYLE,
    w: 520,
  },
  homeChapterThreeNumber: TEXT_LEAF_STYLE,
  homeQuote: {
    ...EMPTY_STYLE,
    ...HUG_AUTO_LAYOUT_FRAME,
    direction: 'column',
    gap: 28,
    h: 286,
    w: 330,
  },
  homeQuoteHeading: {
    ...EMPTY_STYLE,
    ...HUG_BOX_LAYOUT,
    h: 42,
    w: 330,
    widthMode: 'fill',
  },
  homeQuoteList: {
    ...EMPTY_STYLE,
    ...HUG_AUTO_LAYOUT_FRAME,
    direction: 'column',
    h: 218,
    w: 330,
    widthMode: 'fill',
  },
  homeQuoteOne: {
    ...EMPTY_STYLE,
    ...HUG_AUTO_LAYOUT_FRAME,
    align: 'center',
    direction: 'row',
    h: 68,
    w: 330,
    widthMode: 'fill',
  },
  homeQuoteOneText: {
    ...TEXT_LEAF_STYLE,
    widthMode: 'fill',
  },
  homeQuoteTwo: {
    ...EMPTY_STYLE,
    ...HUG_AUTO_LAYOUT_FRAME,
    align: 'center',
    direction: 'row',
    h: 68,
    w: 330,
    widthMode: 'fill',
  },
  homeQuoteTwoText: {
    ...TEXT_LEAF_STYLE,
    widthMode: 'fill',
  },
  homeQuoteThree: {
    ...EMPTY_STYLE,
    ...HUG_AUTO_LAYOUT_FRAME,
    align: 'center',
    direction: 'row',
    h: 68,
    w: 330,
    widthMode: 'fill',
  },
  homeQuoteThreeText: {
    ...TEXT_LEAF_STYLE,
    widthMode: 'fill',
  },
  homeDispatches: {
    ...EMPTY_STYLE,
    ...HUG_AUTO_LAYOUT_FRAME,
    direction: 'column',
    gap: 28,
    h: 392,
    padding: 72,
    w: 1180,
    widthMode: 'fill',
  },
  homeDispatchHeading: {
    ...EMPTY_STYLE,
    ...HUG_BOX_LAYOUT,
    h: 44,
    w: 520,
  },
  homeDispatchGrid: {
    ...EMPTY_STYLE,
    ...HUG_AUTO_LAYOUT_FRAME,
    direction: 'row',
    gap: 24,
    h: 176,
    w: 1036,
    widthMode: 'fill',
  },
  homeDispatchOne: {
    ...EMPTY_STYLE,
    ...HUG_AUTO_LAYOUT_FRAME,
    direction: 'column',
    gap: 14,
    h: 176,
    padding: 24,
    radius: 22,
    w: 329,
    widthMode: 'fill',
  },
  homeDispatchOneTitle: {
    ...TEXT_LEAF_STYLE,
    h: 30,
    w: 260,
    widthMode: 'fill',
  },
  homeDispatchOneText: {
    ...TEXT_LEAF_STYLE,
    h: 72,
    w: 260,
    widthMode: 'fill',
  },
  homeDispatchTwo: {
    ...EMPTY_STYLE,
    ...HUG_AUTO_LAYOUT_FRAME,
    direction: 'column',
    gap: 14,
    h: 176,
    padding: 24,
    radius: 22,
    w: 329,
    widthMode: 'fill',
  },
  homeDispatchTwoTitle: {
    ...TEXT_LEAF_STYLE,
    h: 30,
    w: 260,
    widthMode: 'fill',
  },
  homeDispatchTwoText: {
    ...TEXT_LEAF_STYLE,
    h: 72,
    w: 260,
    widthMode: 'fill',
  },
  homeDispatchThree: {
    ...EMPTY_STYLE,
    ...HUG_AUTO_LAYOUT_FRAME,
    direction: 'column',
    gap: 14,
    h: 176,
    padding: 24,
    radius: 22,
    w: 330,
    widthMode: 'fill',
  },
  homeDispatchThreeTitle: {
    ...TEXT_LEAF_STYLE,
    h: 30,
    w: 260,
    widthMode: 'fill',
  },
  homeDispatchThreeText: {
    ...TEXT_LEAF_STYLE,
    h: 72,
    w: 260,
    widthMode: 'fill',
  },
  homeNewsletter: {
    ...EMPTY_STYLE,
    ...HUG_AUTO_LAYOUT_FRAME,
    align: 'center',
    direction: 'column',
    gap: 18,
    h: 264,
    padding: 72,
    w: 1180,
    widthMode: 'fill',
  },
  homeNewsletterHeading: {
    ...TEXT_LEAF_STYLE,
    h: 44,
    w: 560,
  },
  homeNewsletterText: {
    ...TEXT_LEAF_STYLE,
    h: 52,
    w: 620,
  },
  homeNewsletterAction: {
    ...EMPTY_STYLE,
    ...HUG_BOX_LAYOUT,
    h: 42,
    padding: 14,
    radius: 21,
    w: 148,
  },
  homeFooter: {
    ...EMPTY_STYLE,
    ...HUG_AUTO_LAYOUT_FRAME,
    align: 'center',
    direction: 'row',
    distribution: 'space-between',
    h: 92,
    padding: 42,
    w: 1180,
    widthMode: 'fill',
  },
  homeFooterBrand: {
    ...TEXT_LEAF_STYLE,
    w: 180,
  },
  homeFooterNote: {
    ...TEXT_LEAF_STYLE,
    w: 420,
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
  headlineTitle: {
    ...TEXT_LEAF_STYLE,
    h: 28,
    w: 196,
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
  metricOneLabel: TEXT_LEAF_STYLE,
  metricOneValue: {
    ...TEXT_LEAF_STYLE,
    h: 28,
    w: 64,
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
  metricTwoLabel: TEXT_LEAF_STYLE,
  metricTwoValue: {
    ...TEXT_LEAF_STYLE,
    h: 28,
    w: 64,
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
  } satisfies FigmaCloneDomEditState,
)

const DEFAULT_TEXT: FigmaCloneDomTextState = {
  avatar: 'LK',
  headlineTitle: 'Lina Kim',
  metricOneLabel: 'Usage',
  metricOneValue: '18k',
  metricTwoLabel: 'NPS',
  metricTwoValue: '71',
  noticeAction: 'Allow',
  noticeIcon: 'A',
  noticeText: 'Mina wants edit access to the workspace.',
  noticeTitle: 'Access requested',
  primaryButton: 'Invite',
  searchBox: 'Search',
  secondaryButton: 'Message',
  supporting: 'Product systems lead',
  toolbarButton: 'New',
  toolbarTitle: 'Projects',
  homeBrandMark: 'C',
  homeBrandText: 'Canvas Review',
  homeBylineLabel: 'Written by',
  homeBylineNote: 'Design systems editor',
  homeBylineValue: 'Lina Kim',
  homeCategoryLabel: 'Filed under',
  homeCategoryNote: 'Interfaces, layout, copy',
  homeCategoryValue: 'Product craft',
  homeChapterOneNumber: '01',
  homeChapterOneTitle: 'Start with the lead, not the module',
  homeChapterThreeNumber: '03',
  homeChapterThreeTitle: 'Retouch inside the real viewport',
  homeChapterTwoNumber: '02',
  homeChapterTwoTitle: 'Let spacing carry the argument',
  homeDispatchHeading: 'More from the issue',
  homeDispatchOneText: 'How component affordances change when the page is the source of truth.',
  homeDispatchOneTitle: 'The editor is a viewport',
  homeDispatchThreeText: 'A compact guide to deciding what belongs in a panel and what belongs on canvas.',
  homeDispatchThreeTitle: 'Panel last, canvas first',
  homeDispatchTwoText: 'Why final retouching needs distance, baseline, and spacing cues together.',
  homeDispatchTwoTitle: 'Measuring the rhythm',
  homeEssayHeading: 'When the page becomes the editor',
  homeFooterBrand: 'Canvas Review',
  homeFooterNote: 'Independent notes on design tooling, DOM layout, and editorial interfaces.',
  homeHeroText: 'A field note on turning layout controls into editorial rhythm: headline, dek, metadata, quote, body, dispatches, newsletter, and footer all editable in place.',
  homeHeroTitle: 'The homepage is an article before it is an interface',
  homeIssueKicker: 'Field essay',
  homeIssueTime: '12 min',
  homeIssueTitle: 'Issue 04 - Design after the mockup',
  homeNavArchive: 'Archive',
  homeNavEssays: 'Essays',
  homeNavMethods: 'Methods',
  homeNewsletterAction: 'Join weekly',
  homeNewsletterHeading: 'Receive the next field note',
  homeNewsletterText: 'A short weekly note on interface craft, layout semantics, and the last mile of design editing.',
  homePrimaryAction: 'Read essay',
  homeQuoteHeading: "Editor's note",
  homeQuoteOneText: 'A homepage can read like a lead paragraph.',
  homeQuoteThreeText: 'The last retouch belongs in the viewport.',
  homeQuoteTwoText: 'Spacing is part of the argument, not decoration.',
  homeReadTimeLabel: 'Reading time',
  homeReadTimeNote: 'Updated Jun 2026',
  homeReadTimeValue: '12 minutes',
  homeSecondaryAction: 'Save note',
  homeSubscribeLabel: 'Subscribe',
  homeSubscribeNote: 'Weekly',
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
}

const FIELD_LIMITS = {
  gap: { max: 80, min: 0 },
  h: { max: 2400, min: 12 },
  margin: { max: 80, min: -40 },
  order: { max: 20, min: -20 },
  opacity: { max: 100, min: 0 },
  padding: { max: 96, min: 0 },
  paddingBottom: { max: 96, min: 0 },
  paddingLeft: { max: 96, min: 0 },
  paddingRight: { max: 96, min: 0 },
  paddingTop: { max: 96, min: 0 },
  radius: { max: 80, min: 0 },
  rotation: { max: 180, min: -180 },
  w: { max: 1600, min: 12 },
  x: { max: 240, min: -240 },
  y: { max: 240, min: -240 },
} satisfies Record<FigmaCloneDomEditField, { max: number; min: number }>

export function createFigmaCloneDomEditState(): FigmaCloneDomEditState {
  return mapFigmaCloneDomEditState((style) => ({ ...style }), DEFAULT_STYLES)
}

export function createFigmaCloneDomTextState(): FigmaCloneDomTextState {
  return { ...DEFAULT_TEXT }
}

export function getFigmaCloneDomEditStyle(
  state: FigmaCloneDomEditState,
  nodeId: FigmaCloneDomNodeId,
): FigmaCloneDomEditNodeState {
  return state[nodeId] ?? DEFAULT_STYLES[nodeId]
}

export function canFigmaCloneDomNodeEditText(
  nodeId: FigmaCloneDomNodeId,
): boolean {
  return nodeId in DEFAULT_TEXT
}

export function getFigmaCloneDomText(
  state: FigmaCloneDomTextState,
  nodeId: FigmaCloneDomNodeId,
): string {
  return state[nodeId] ?? DEFAULT_TEXT[nodeId] ?? ''
}

export function updateFigmaCloneDomText({
  nodeId,
  state,
  value,
}: {
  nodeId: FigmaCloneDomNodeId
  state: FigmaCloneDomTextState
  value: string
}): FigmaCloneDomTextState {
  if (!canFigmaCloneDomNodeEditText(nodeId)) {
    return state
  }

  if (getFigmaCloneDomText(state, nodeId) === value) {
    return state
  }

  return {
    ...state,
    [nodeId]: value,
  }
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
  const nextStyle = createNextFigmaCloneDomEditStyle({
    current,
    field,
    value: nextValue,
  })

  if (nextStyle === current) {
    return state
  }

  return {
    ...state,
    [nodeId]: nextStyle,
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

export function canFigmaCloneDomFillParent(
  parentDisplay: FigmaCloneDomDisplay | null,
): boolean {
  return canDomEditFillParent(parentDisplay)
}

export function getFigmaCloneDomToggledAxisSizeMode({
  mode,
  parentDisplay,
}: {
  mode: FigmaCloneDomAutoLayoutSizeMode
  parentDisplay: FigmaCloneDomDisplay | null
}): FigmaCloneDomAutoLayoutSizeMode {
  return getDomEditToggledAxisSizeMode({ mode, parentDisplay })
}

export function canFigmaCloneDomNodeUseAutoLayout(
  nodeId: FigmaCloneDomNodeId,
): boolean {
  return Boolean(FIGMA_CLONE_DOM_NODE_BY_ID[nodeId].children?.length) &&
    !isFigmaCloneDomStaticComposite(nodeId)
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
    getFigmaCloneDomPosition()
  const contentType = getFigmaCloneDomContentType(nodeId)
  const hasChildren = Boolean(node.children?.length)
  const supportsAutoLayout = canFigmaCloneDomNodeUseAutoLayout(nodeId)
  const showFlexLayout = supportsAutoLayout && display === 'flex' && hasChildren
  const showGridLayout = supportsAutoLayout && display === 'grid' && hasChildren

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
    showParentParticipation: canFigmaCloneDomFillParent(parentDisplay),
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

  if (
    nodeId === 'avatar' ||
    nodeId === 'homeBrandMark' ||
    nodeId === 'noticeIcon'
  ) {
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

function isFigmaCloneDomStaticComposite(
  nodeId: FigmaCloneDomNodeId,
): boolean {
  return (
    nodeId === 'metricOne' ||
    nodeId === 'metricTwo' ||
    nodeId === 'workspaceStatRevenue' ||
    nodeId === 'workspaceStatConversion' ||
    nodeId === 'workspaceStatTickets'
  )
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
    nodeId === 'workspaceFloatingNote' ||
    nodeId === 'workspacePrimaryAction' ||
    nodeId === 'workspaceSecondaryAction' ||
    nodeId === 'workspaceAudienceTagEnterprise' ||
    nodeId === 'workspaceAudienceTagRenewal' ||
    nodeId === 'workspaceAudienceTagExpansion' ||
    nodeId === 'workspaceAudienceTagRisk' ||
    nodeId === 'homeIssueTime' ||
    nodeId === 'homeNavArchive' ||
    nodeId === 'homeNavEssays' ||
    nodeId === 'homeNavMethods' ||
    nodeId === 'homeNewsletterAction' ||
    nodeId === 'homePrimaryAction' ||
    nodeId === 'homeSecondaryAction' ||
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
    nodeId === 'workspaceDealOneTitle' ||
    nodeId === 'workspaceDealOneValue' ||
    nodeId === 'workspaceDealTwoTitle' ||
    nodeId === 'workspaceDealTwoValue' ||
    nodeId === 'workspaceDealThreeTitle' ||
    nodeId === 'workspaceDealThreeValue' ||
    nodeId === 'workspaceActivityHeader' ||
    nodeId === 'workspaceActivityOneText' ||
    nodeId === 'workspaceActivityTwoText' ||
    nodeId === 'workspaceActivityThreeText' ||
    nodeId === 'workspaceStatRevenueLabel' ||
    nodeId === 'workspaceStatRevenueValue' ||
    nodeId === 'workspaceStatRevenueDelta' ||
    nodeId === 'workspaceStatConversionLabel' ||
    nodeId === 'workspaceStatConversionValue' ||
    nodeId === 'workspaceStatConversionDelta' ||
    nodeId === 'workspaceStatTicketsLabel' ||
    nodeId === 'workspaceStatTicketsValue' ||
    nodeId === 'workspaceStatTicketsDelta' ||
    nodeId === 'homeBrandMark' ||
    nodeId === 'homeBrandText' ||
    nodeId === 'homeSubscribeLabel' ||
    nodeId === 'homeSubscribeNote' ||
    nodeId === 'homeIssueKicker' ||
    nodeId === 'homeIssueTitle' ||
    nodeId === 'homeHeroTitle' ||
    nodeId === 'homeHeroText' ||
    nodeId === 'homeBylineLabel' ||
    nodeId === 'homeBylineValue' ||
    nodeId === 'homeBylineNote' ||
    nodeId === 'homeCategoryLabel' ||
    nodeId === 'homeCategoryValue' ||
    nodeId === 'homeCategoryNote' ||
    nodeId === 'homeReadTimeLabel' ||
    nodeId === 'homeReadTimeValue' ||
    nodeId === 'homeReadTimeNote' ||
    nodeId === 'homeEssayHeading' ||
    nodeId === 'homeChapterOneTitle' ||
    nodeId === 'homeChapterOneNumber' ||
    nodeId === 'homeChapterTwoTitle' ||
    nodeId === 'homeChapterTwoNumber' ||
    nodeId === 'homeChapterThreeTitle' ||
    nodeId === 'homeChapterThreeNumber' ||
    nodeId === 'homeQuoteHeading' ||
    nodeId === 'homeQuoteOneText' ||
    nodeId === 'homeQuoteTwoText' ||
    nodeId === 'homeQuoteThreeText' ||
    nodeId === 'homeDispatchHeading' ||
    nodeId === 'homeDispatchOneTitle' ||
    nodeId === 'homeDispatchOneText' ||
    nodeId === 'homeDispatchTwoTitle' ||
    nodeId === 'homeDispatchTwoText' ||
    nodeId === 'homeDispatchThreeTitle' ||
    nodeId === 'homeDispatchThreeText' ||
    nodeId === 'homeNewsletterHeading' ||
    nodeId === 'homeNewsletterText' ||
    nodeId === 'homeFooterBrand' ||
    nodeId === 'homeFooterNote' ||
    nodeId === 'avatar' ||
    nodeId === 'headlineTitle' ||
    nodeId === 'metricOneLabel' ||
    nodeId === 'metricOneValue' ||
    nodeId === 'metricTwoLabel' ||
    nodeId === 'metricTwoValue' ||
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

function getFigmaCloneDomPosition(): FigmaCloneDomPosition {
  return 'static'
}

export function isFigmaCloneDomOutOfFlowNode(
  nodeId: FigmaCloneDomNodeId,
) {
  return nodeId === 'workspaceFloatingNote'
}

function getFigmaCloneDomRuntimePosition(
  nodeId: FigmaCloneDomNodeId,
): FigmaCloneDomPosition | null {
  if (isFigmaCloneDomOutOfFlowNode(nodeId)) {
    return 'absolute'
  }

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

export function readFigmaCloneDomNodeId(
  element: HTMLElement | null,
): FigmaCloneDomNodeId | null {
  const nodeId = element?.dataset.domEditNode ?? element?.dataset.figmaDomNode

  return nodeId && nodeId in FIGMA_CLONE_DOM_NODE_BY_ID
    ? nodeId as FigmaCloneDomNodeId
    : null
}

export const FIGMA_CLONE_DOM_EDIT_ADAPTER = {
  getElement: getFigmaCloneDomElement,
  getLayoutContext: getFigmaCloneDomLayoutContext,
  getParentId: getFigmaCloneDomParentId,
  getStyle: getFigmaCloneDomEditStyle,
  readNodeId: readFigmaCloneDomNodeId,
} satisfies DomEditModelAdapter<FigmaCloneDomNodeId, FigmaCloneDomEditState>

const PADDING_SIDE_BY_FIELD = Object.fromEntries(
  Object.entries(DOM_EDIT_PADDING_SIDE_FIELDS).map(([side, field]) => [
    field,
    side,
  ]),
) as Partial<Record<FigmaCloneDomEditField, DomEditPaddingSide>>

function createNextFigmaCloneDomEditStyle({
  current,
  field,
  value,
}: {
  current: FigmaCloneDomEditNodeState
  field: FigmaCloneDomEditField
  value: number
}): FigmaCloneDomEditNodeState {
  if (field === 'padding') {
    const nextPadding = createDomEditUniformPaddingSides(value)

    if (
      current.padding === value &&
      areFigmaCloneDomPaddingSidesEqual(
        getDomEditPaddingSides(current),
        nextPadding,
      )
    ) {
      return current
    }

    return normalizeFigmaCloneDomEditStyle({
      ...current,
      padding: value,
      ...createFigmaCloneDomPaddingSideStyle(nextPadding),
    })
  }

  const side = PADDING_SIDE_BY_FIELD[field]

  if (side) {
    const currentPadding = getDomEditPaddingSides(current)

    if (currentPadding[side] === value) {
      return current
    }

    return normalizeFigmaCloneDomEditStyle({
      ...current,
      ...createFigmaCloneDomPaddingSideStyle({
        ...currentPadding,
        [side]: value,
      }),
    })
  }

  if (current[field] === value) {
    return current
  }

  return {
    ...current,
    [field]: value,
  }
}

function normalizeFigmaCloneDomEditStyle(
  style: FigmaCloneDomEditNodeState,
): FigmaCloneDomEditNodeState {
  const padding = getDomEditPaddingSides(style)
  const uniformPadding = getDomEditUniformPadding(padding)

  return {
    ...style,
    padding: uniformPadding ?? style.padding,
    ...createFigmaCloneDomPaddingSideStyle(padding),
  }
}

function createFigmaCloneDomPaddingSideStyle(
  padding: DomEditPaddingSides,
): Pick<
  FigmaCloneDomEditNodeState,
  'paddingBottom' | 'paddingLeft' | 'paddingRight' | 'paddingTop'
> {
  return {
    paddingBottom: padding.bottom,
    paddingLeft: padding.left,
    paddingRight: padding.right,
    paddingTop: padding.top,
  }
}

function areFigmaCloneDomPaddingSidesEqual(
  left: DomEditPaddingSides,
  right: DomEditPaddingSides,
) {
  return left.bottom === right.bottom &&
    left.left === right.left &&
    left.right === right.right &&
    left.top === right.top
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
