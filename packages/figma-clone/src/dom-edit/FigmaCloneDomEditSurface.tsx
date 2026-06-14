import {
  type CSSProperties,
  type MouseEvent,
} from 'react'
import {
  canFigmaCloneDomNodeUseAutoLayout,
  getFigmaCloneDomEditStyle,
  getFigmaCloneDomParentId,
  getFigmaCloneDomRootId,
  isFigmaCloneDomGridContainer,
  resolveFigmaCloneDomClickTarget,
  type FigmaCloneDomEditState,
  type FigmaCloneDomNodeId,
} from './FigmaCloneDomEditModel'
import { isFigmaCloneDomCanvasPanTarget } from './FigmaCloneDomCanvasPointer'

export function FigmaCloneDomEditSurface({
  selectedNodeId,
  state,
  onSelectNode,
}: {
  selectedNodeId: FigmaCloneDomNodeId | null
  state: FigmaCloneDomEditState
  onSelectNode: (nodeId: FigmaCloneDomNodeId) => void
}) {
  const activeRootId = getFigmaCloneDomRootId(selectedNodeId)
  const handleClickCapture = (event: MouseEvent<HTMLDivElement>) => {
    if (isFigmaCloneDomCanvasPanTarget(event.target)) {
      return
    }

    const target = resolveFigmaCloneDomClickTarget({
      exactTarget: event.metaKey || event.ctrlKey,
      root: event.currentTarget,
      selectedNodeId,
      target: event.target,
    })

    if (!target) {
      return
    }

    event.preventDefault()
    event.stopPropagation()
    onSelectNode(target)
  }

  return (
    <div
      className="figma-dom-frame"
      data-figma-dom-root="true"
      onClickCapture={handleClickCapture}
    >
      {activeRootId === 'workspacePage'
        ? renderWorkspacePage(state, selectedNodeId)
        : null}
      {activeRootId === 'card'
        ? renderProfileCard(state, selectedNodeId)
        : null}
      {activeRootId === 'toolbar'
        ? renderToolbar(state, selectedNodeId)
        : null}
      {activeRootId === 'notice'
        ? renderNotice(state, selectedNodeId)
        : null}
    </div>
  )
}

function renderWorkspacePage(
  state: FigmaCloneDomEditState,
  selectedNodeId: FigmaCloneDomNodeId | null,
) {
  return (
    <section
      className="figma-dom-workspace"
      {...createDomNodeProps(state, selectedNodeId, 'workspacePage')}
    >
      <aside
        className="figma-dom-workspace__sidebar"
        {...createDomNodeProps(state, selectedNodeId, 'workspaceSidebar')}
      >
        <div
          className="figma-dom-workspace__brand"
          {...createDomNodeProps(state, selectedNodeId, 'workspaceBrand')}
        >
          <div
            className="figma-dom-workspace__brand-mark"
            {...createDomNodeProps(state, selectedNodeId, 'workspaceBrandMark')}
          >
            C
          </div>
          <strong
            className="figma-dom-workspace__brand-text"
            {...createDomNodeProps(state, selectedNodeId, 'workspaceBrandText')}
          >
            CoreOS
          </strong>
        </div>

        <nav
          className="figma-dom-workspace__nav"
          {...createDomNodeProps(state, selectedNodeId, 'workspaceNav')}
        >
          <button
            className="figma-dom-workspace__nav-item figma-dom-workspace__nav-item--active"
            {...createDomNodeProps(state, selectedNodeId, 'workspaceNavOverview')}
            type="button"
          >
            Overview
          </button>
          <button
            className="figma-dom-workspace__nav-item"
            {...createDomNodeProps(state, selectedNodeId, 'workspaceNavRoadmap')}
            type="button"
          >
            Roadmap
          </button>
          <button
            className="figma-dom-workspace__nav-item"
            {...createDomNodeProps(state, selectedNodeId, 'workspaceNavCustomers')}
            type="button"
          >
            Customers
          </button>
        </nav>

        <div
          className="figma-dom-workspace__usage"
          {...createDomNodeProps(state, selectedNodeId, 'workspaceUpgrade')}
        >
          <strong {...createDomNodeProps(state, selectedNodeId, 'workspaceUpgradeTitle')}>
            Capacity
          </strong>
          <span {...createDomNodeProps(state, selectedNodeId, 'workspaceUpgradeText')}>
            68% of this quarter's workspace budget is allocated.
          </span>
        </div>
      </aside>

      <main
        className="figma-dom-workspace__main"
        {...createDomNodeProps(state, selectedNodeId, 'workspaceMain')}
      >
        <header
          className="figma-dom-workspace__topbar"
          {...createDomNodeProps(state, selectedNodeId, 'workspaceTopbar')}
        >
          <span {...createDomNodeProps(state, selectedNodeId, 'workspaceBreadcrumb')}>
            Workspace / Growth
          </span>
          <div
            className="figma-dom-workspace__search"
            {...createDomNodeProps(state, selectedNodeId, 'workspaceSearch')}
          >
            Search accounts
          </div>
          <button
            className="figma-dom-workspace__profile"
            {...createDomNodeProps(state, selectedNodeId, 'workspaceProfile')}
            type="button"
          >
            MK
          </button>
        </header>

        <section
          className="figma-dom-workspace__hero"
          {...createDomNodeProps(state, selectedNodeId, 'workspaceHero')}
        >
          <div
            className="figma-dom-workspace__hero-copy"
            {...createDomNodeProps(state, selectedNodeId, 'workspaceHeroCopy')}
          >
            <h2 {...createDomNodeProps(state, selectedNodeId, 'workspaceHeroTitle')}>
              Revenue operations
            </h2>
            <p {...createDomNodeProps(state, selectedNodeId, 'workspaceHeroText')}>
              Review pipeline health, expansion risk, and activation blockers.
            </p>
          </div>
          <div
            className="figma-dom-workspace__hero-actions"
            {...createDomNodeProps(state, selectedNodeId, 'workspaceHeroActions')}
          >
            <button
              className="figma-dom-workspace__primary"
              {...createDomNodeProps(state, selectedNodeId, 'workspacePrimaryAction')}
              type="button"
            >
              New report
            </button>
            <button
              className="figma-dom-workspace__secondary"
              {...createDomNodeProps(state, selectedNodeId, 'workspaceSecondaryAction')}
              type="button"
            >
              Export
            </button>
          </div>
        </section>

        <section
          className="figma-dom-workspace__stats"
          {...createDomNodeProps(state, selectedNodeId, 'workspaceStats')}
        >
          <div
            className="figma-dom-workspace__stat"
            {...createDomNodeProps(state, selectedNodeId, 'workspaceStatRevenue')}
          >
            <span>Revenue</span>
            <strong>$482k</strong>
            <em>+18.2%</em>
          </div>
          <div
            className="figma-dom-workspace__stat"
            {...createDomNodeProps(state, selectedNodeId, 'workspaceStatConversion')}
          >
            <span>Conversion</span>
            <strong>32.8%</strong>
            <em>+4.1%</em>
          </div>
          <div
            className="figma-dom-workspace__stat"
            {...createDomNodeProps(state, selectedNodeId, 'workspaceStatTickets')}
          >
            <span>Open tickets</span>
            <strong>124</strong>
            <em>-12</em>
          </div>
        </section>

        <section
          className="figma-dom-workspace__content"
          {...createDomNodeProps(state, selectedNodeId, 'workspaceContent')}
        >
          <section
            className="figma-dom-workspace__panel figma-dom-workspace__panel--pipeline"
            {...createDomNodeProps(state, selectedNodeId, 'workspacePipeline')}
          >
            <header {...createDomNodeProps(state, selectedNodeId, 'workspacePipelineHeader')}>
              Pipeline review
            </header>
            <div
              className="figma-dom-workspace__list"
              {...createDomNodeProps(state, selectedNodeId, 'workspacePipelineList')}
            >
              {renderWorkspaceDeal(state, selectedNodeId, 'workspaceDealOne', 'Acme rollout', '$84k')}
              {renderWorkspaceDeal(state, selectedNodeId, 'workspaceDealTwo', 'Northstar renewal', '$62k')}
              {renderWorkspaceDeal(state, selectedNodeId, 'workspaceDealThree', 'Helio expansion', '$38k')}
            </div>
          </section>

          <section
            className="figma-dom-workspace__panel figma-dom-workspace__panel--activity"
            {...createDomNodeProps(state, selectedNodeId, 'workspaceActivity')}
          >
            <header {...createDomNodeProps(state, selectedNodeId, 'workspaceActivityHeader')}>
              Activity
            </header>
            <div
              className="figma-dom-workspace__activity-list"
              {...createDomNodeProps(state, selectedNodeId, 'workspaceActivityList')}
            >
              {renderWorkspaceActivity(state, selectedNodeId, 'workspaceActivityOne', 'Mina updated forecast')}
              {renderWorkspaceActivity(state, selectedNodeId, 'workspaceActivityTwo', 'Jae flagged churn risk')}
              {renderWorkspaceActivity(state, selectedNodeId, 'workspaceActivityThree', 'Lina shared notes')}
            </div>
          </section>
        </section>
      </main>
    </section>
  )
}

function renderWorkspaceDeal(
  state: FigmaCloneDomEditState,
  selectedNodeId: FigmaCloneDomNodeId | null,
  nodeId: Extract<
    FigmaCloneDomNodeId,
    'workspaceDealOne' | 'workspaceDealTwo' | 'workspaceDealThree'
  >,
  title: string,
  value: string,
) {
  return (
    <article
      className="figma-dom-workspace__deal"
      {...createDomNodeProps(state, selectedNodeId, nodeId)}
    >
      <strong>{title}</strong>
      <span>{value}</span>
    </article>
  )
}

function renderWorkspaceActivity(
  state: FigmaCloneDomEditState,
  selectedNodeId: FigmaCloneDomNodeId | null,
  nodeId: Extract<
    FigmaCloneDomNodeId,
    'workspaceActivityOne' | 'workspaceActivityTwo' | 'workspaceActivityThree'
  >,
  label: string,
) {
  return (
    <article
      className="figma-dom-workspace__activity"
      {...createDomNodeProps(state, selectedNodeId, nodeId)}
    >
      <span>{label}</span>
    </article>
  )
}

function renderProfileCard(
  state: FigmaCloneDomEditState,
  selectedNodeId: FigmaCloneDomNodeId | null,
) {
  return (
    <section
      className="figma-dom-card"
      data-figma-dom-node="card"
      data-selected={selectedNodeId === 'card' ? 'true' : 'false'}
      style={createNodeStyle(state, 'card')}
    >
      <header
        className="figma-dom-header"
        data-figma-dom-node="header"
        data-selected={selectedNodeId === 'header' ? 'true' : 'false'}
        style={createNodeStyle(state, 'header')}
      >
        <div
          className="figma-dom-avatar"
          data-figma-dom-node="avatar"
          data-selected={selectedNodeId === 'avatar' ? 'true' : 'false'}
          style={createNodeStyle(state, 'avatar')}
        >
          LK
        </div>
        <div
          className="figma-dom-headline"
          data-figma-dom-node="headline"
          data-selected={selectedNodeId === 'headline' ? 'true' : 'false'}
          style={createNodeStyle(state, 'headline')}
        >
          <strong>Lina Kim</strong>
          <span
            data-figma-dom-node="supporting"
            data-selected={selectedNodeId === 'supporting' ? 'true' : 'false'}
            style={createNodeStyle(state, 'supporting')}
          >
            Product systems lead
          </span>
        </div>
      </header>

      <div
        className="figma-dom-actions"
        data-figma-dom-node="actions"
        data-selected={selectedNodeId === 'actions' ? 'true' : 'false'}
        style={createNodeStyle(state, 'actions')}
      >
        <button
          data-figma-dom-node="primaryButton"
          data-selected={selectedNodeId === 'primaryButton' ? 'true' : 'false'}
          style={createNodeStyle(state, 'primaryButton')}
          type="button"
        >
          Invite
        </button>
        <button
          data-figma-dom-node="secondaryButton"
          data-selected={selectedNodeId === 'secondaryButton' ? 'true' : 'false'}
          style={createNodeStyle(state, 'secondaryButton')}
          type="button"
        >
          Message
        </button>
      </div>

      <div
        className="figma-dom-metrics"
        data-figma-dom-node="metrics"
        data-selected={selectedNodeId === 'metrics' ? 'true' : 'false'}
        style={createNodeStyle(state, 'metrics')}
      >
        <div
          data-figma-dom-node="metricOne"
          data-selected={selectedNodeId === 'metricOne' ? 'true' : 'false'}
          style={createNodeStyle(state, 'metricOne')}
        >
          <span>Usage</span>
          <strong>18k</strong>
        </div>
        <div
          data-figma-dom-node="metricTwo"
          data-selected={selectedNodeId === 'metricTwo' ? 'true' : 'false'}
          style={createNodeStyle(state, 'metricTwo')}
        >
          <span>NPS</span>
          <strong>71</strong>
        </div>
      </div>
    </section>
  )
}

function renderToolbar(
  state: FigmaCloneDomEditState,
  selectedNodeId: FigmaCloneDomNodeId | null,
) {
  return (
    <section
      className="figma-dom-toolbar"
      data-figma-dom-node="toolbar"
      data-selected={selectedNodeId === 'toolbar' ? 'true' : 'false'}
      style={createNodeStyle(state, 'toolbar')}
    >
      <strong
        data-figma-dom-node="toolbarTitle"
        data-selected={selectedNodeId === 'toolbarTitle' ? 'true' : 'false'}
        style={createNodeStyle(state, 'toolbarTitle')}
      >
        Projects
      </strong>
      <div
        className="figma-dom-search"
        data-figma-dom-node="searchBox"
        data-selected={selectedNodeId === 'searchBox' ? 'true' : 'false'}
        style={createNodeStyle(state, 'searchBox')}
      >
        Search
      </div>
      <button
        data-figma-dom-node="toolbarButton"
        data-selected={selectedNodeId === 'toolbarButton' ? 'true' : 'false'}
        style={createNodeStyle(state, 'toolbarButton')}
        type="button"
      >
        New
      </button>
    </section>
  )
}

function renderNotice(
  state: FigmaCloneDomEditState,
  selectedNodeId: FigmaCloneDomNodeId | null,
) {
  return (
    <section
      className="figma-dom-notice"
      data-figma-dom-node="notice"
      data-selected={selectedNodeId === 'notice' ? 'true' : 'false'}
      style={createNodeStyle(state, 'notice')}
    >
      <div
        className="figma-dom-notice-icon"
        data-figma-dom-node="noticeIcon"
        data-selected={selectedNodeId === 'noticeIcon' ? 'true' : 'false'}
        style={createNodeStyle(state, 'noticeIcon')}
      >
        A
      </div>
      <div
        className="figma-dom-notice-content"
        data-figma-dom-node="noticeContent"
        data-selected={selectedNodeId === 'noticeContent' ? 'true' : 'false'}
        style={createNodeStyle(state, 'noticeContent')}
      >
        <strong
          data-figma-dom-node="noticeTitle"
          data-selected={selectedNodeId === 'noticeTitle' ? 'true' : 'false'}
          style={createNodeStyle(state, 'noticeTitle')}
        >
          Access requested
        </strong>
        <span
          data-figma-dom-node="noticeText"
          data-selected={selectedNodeId === 'noticeText' ? 'true' : 'false'}
          style={createNodeStyle(state, 'noticeText')}
        >
          Mina wants edit access to the workspace.
        </span>
      </div>
      <button
        data-figma-dom-node="noticeAction"
        data-selected={selectedNodeId === 'noticeAction' ? 'true' : 'false'}
        style={createNodeStyle(state, 'noticeAction')}
        type="button"
      >
        Allow
      </button>
    </section>
  )
}

function createDomNodeProps(
  state: FigmaCloneDomEditState,
  selectedNodeId: FigmaCloneDomNodeId | null,
  nodeId: FigmaCloneDomNodeId,
) {
  return {
    'data-figma-dom-node': nodeId,
    'data-selected': selectedNodeId === nodeId ? 'true' : 'false',
    style: createNodeStyle(state, nodeId),
  } as const
}

function createNodeStyle(
  state: FigmaCloneDomEditState,
  nodeId: FigmaCloneDomNodeId,
): CSSProperties {
  const style = getFigmaCloneDomEditStyle(state, nodeId)
  const parentId = getFigmaCloneDomParentId(nodeId)
  const parentDirection = parentId
    ? getFigmaCloneDomEditStyle(state, parentId).direction
    : null
  const parentUsesFlex = parentId
    ? canFigmaCloneDomNodeUseAutoLayout(parentId) &&
      !isFigmaCloneDomGridContainer(parentId)
    : false
  const canUseAutoLayout = canFigmaCloneDomNodeUseAutoLayout(nodeId)
  const isGridContainer = isFigmaCloneDomGridContainer(nodeId)
  const fillsParentRow =
    parentUsesFlex && parentDirection === 'row' && style.widthMode === 'fill'
  const fillsParentColumn =
    parentUsesFlex && parentDirection === 'column' && style.heightMode === 'fill'
  const shouldGrowInParent = fillsParentRow || fillsParentColumn

  return {
    alignItems: canUseAutoLayout ? mapFigmaCloneAutoLayoutAlign(style.align) : undefined,
    alignSelf: style.alignSelf === 'auto'
      ? undefined
      : mapFigmaCloneAutoLayoutAlign(style.alignSelf),
    borderRadius: style.radius,
    display: canUseAutoLayout
      ? isGridContainer ? 'grid' : 'flex'
      : undefined,
    flexDirection: canUseAutoLayout && !isGridContainer ? style.direction : undefined,
    flexBasis: shouldGrowInParent ? 0 : undefined,
    flexGrow: shouldGrowInParent ? 1 : undefined,
    flexShrink: style.widthMode === 'hug' || style.heightMode === 'hug'
      ? 0
      : undefined,
    gap: style.gap,
    gridTemplateColumns: isGridContainer
      ? getFigmaCloneGridTemplateColumns(state, nodeId)
      : undefined,
    height: fillsParentColumn
      ? 0
      : mapFigmaCloneAutoLayoutSize(style.heightMode, style.h),
    justifyContent: canUseAutoLayout
      ? mapFigmaCloneAutoLayoutDistribution(style.distribution)
      : undefined,
    margin: style.margin,
    minHeight: style.heightMode === 'fill' ? 0 : undefined,
    minWidth: style.widthMode === 'fill' ? 0 : undefined,
    opacity: style.opacity / 100,
    order: style.order,
    padding: style.padding,
    width: fillsParentRow
      ? 0
      : mapFigmaCloneAutoLayoutSize(style.widthMode, style.w),
  }
}

function getFigmaCloneGridTemplateColumns(
  state: FigmaCloneDomEditState,
  nodeId: FigmaCloneDomNodeId,
): CSSProperties['gridTemplateColumns'] {
  if (nodeId !== 'workspaceContent') {
    return undefined
  }

  const pipeline = getFigmaCloneDomEditStyle(state, 'workspacePipeline')
  const activity = getFigmaCloneDomEditStyle(state, 'workspaceActivity')

  return `${mapFigmaCloneGridTrackSize(pipeline.widthMode, pipeline.w)} ${mapFigmaCloneGridTrackSize(activity.widthMode, activity.w)}`
}

function mapFigmaCloneGridTrackSize(
  mode: ReturnType<typeof getFigmaCloneDomEditStyle>['widthMode'],
  value: number,
) {
  if (mode === 'fill') {
    return 'minmax(0, 1fr)'
  }

  if (mode === 'hug') {
    return 'max-content'
  }

  return `${value}px`
}

function mapFigmaCloneAutoLayoutAlign(
  align: ReturnType<typeof getFigmaCloneDomEditStyle>['align'],
): CSSProperties['alignItems'] {
  if (align === 'start') {
    return 'flex-start'
  }

  if (align === 'end') {
    return 'flex-end'
  }

  return align
}

function mapFigmaCloneAutoLayoutDistribution(
  distribution: ReturnType<typeof getFigmaCloneDomEditStyle>['distribution'],
): CSSProperties['justifyContent'] {
  return distribution === 'space-between' ? 'space-between' : 'flex-start'
}

function mapFigmaCloneAutoLayoutSize(
  mode: ReturnType<typeof getFigmaCloneDomEditStyle>['widthMode'],
  value: number,
): CSSProperties['width'] {
  if (mode === 'hug') {
    return 'fit-content'
  }

  if (mode === 'fill') {
    return '100%'
  }

  return value
}
