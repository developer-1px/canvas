import {
  type CSSProperties,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
} from 'react'
import { isDomEditCanvasPanTarget } from '@interactive-os/dom-edit-affordance/canvas'
import {
  type FigmaCloneSectionViewport,
} from '../figmaCloneCanvas'
import {
  canFigmaCloneDomNodeUseAutoLayout,
  canFigmaCloneDomNodeEditText,
  getFigmaCloneDomElement,
  getFigmaCloneDomEditStyle,
  getFigmaCloneDomParentId,
  getFigmaCloneDomRootId,
  getFigmaCloneDomText,
  isFigmaCloneDomComponentRootNode,
  isFigmaCloneDomGridContainer,
  isFigmaCloneDomOutOfFlowNode,
  resolveFigmaCloneDomClickTarget,
  type FigmaCloneDomEditState,
  type FigmaCloneDomNodeId,
  type FigmaCloneDomTextState,
} from './FigmaCloneDomEditModel'

export function FigmaCloneDomEditSurface({
  interactionMode = 'edit',
  isSectionSelected,
  rootId,
  sectionViewport,
  selectedNodeId,
  state,
  textState,
  onSelectSection,
  onSelectNode,
  onChangeText,
}: {
  interactionMode?: 'edit' | 'preview'
  isSectionSelected: boolean
  rootId: FigmaCloneDomNodeId
  sectionViewport: FigmaCloneSectionViewport
  selectedNodeId: FigmaCloneDomNodeId | null
  state: FigmaCloneDomEditState
  textState: FigmaCloneDomTextState
  onSelectSection: () => void
  onSelectNode: (nodeId: FigmaCloneDomNodeId) => void
  onChangeText: (nodeId: FigmaCloneDomNodeId, value: string) => void
}) {
  const selectedNodeIdInRoot =
    selectedNodeId && getFigmaCloneDomRootId(selectedNodeId) === rootId
      ? selectedNodeId
      : null
  const isMockFrame = sectionViewport.frameMode === 'mock'
  const shouldPassThroughCanvasEvent = (target: EventTarget | null) =>
    interactionMode === 'preview' ||
    isDomEditCanvasPanTarget(target) ||
    (
      target instanceof Element &&
      Boolean(target.closest('[data-figma-dom-editing="true"]'))
    )
  const handleClickCapture = (event: MouseEvent<HTMLDivElement>) => {
    if (shouldPassThroughCanvasEvent(event.target)) {
      return
    }

    const target = resolveFigmaCloneDomClickTarget({
      exactTarget: event.metaKey || event.ctrlKey,
      root: event.currentTarget,
      selectedNodeId: selectedNodeIdInRoot,
      target: event.target,
    })

    if (!target) {
      event.preventDefault()
      event.stopPropagation()
      onSelectSection()
      return
    }

    event.preventDefault()
    event.stopPropagation()
    onSelectNode(target)
  }
  const handleDoubleClickCapture = (event: MouseEvent<HTMLDivElement>) => {
    if (shouldPassThroughCanvasEvent(event.target)) {
      return
    }

    const target = resolveFigmaCloneDomClickTarget({
      exactTarget: true,
      root: event.currentTarget,
      selectedNodeId: selectedNodeIdInRoot,
      target: event.target,
    })

    if (!target || !canFigmaCloneDomNodeEditText(target)) {
      if (!target) {
        event.preventDefault()
        event.stopPropagation()
        onSelectSection()
      }

      return
    }

    event.preventDefault()
    event.stopPropagation()
    onSelectNode(target)
    requestAnimationFrame(() => focusFigmaCloneEditableDomNode(target))
  }

  return (
    <div
      className="figma-dom-frame"
      data-figma-dom-root="true"
      onClickCapture={handleClickCapture}
      onDoubleClickCapture={handleDoubleClickCapture}
    >
      <div
        className="figma-dom-section-shell"
        data-section-selected={isSectionSelected ? 'true' : 'false'}
        data-section-mode={sectionViewport.frameMode}
        style={{
          width: sectionViewport.w,
        }}
      >
        {isMockFrame ? (
          <div className="figma-dom-section-chrome" aria-hidden="true">
            <span />
            <span />
            <span />
            <strong>{sectionViewport.w} × {sectionViewport.h}</strong>
          </div>
        ) : null}
        <div
          className="figma-dom-browser"
          data-canvas-wheel-passthrough={isMockFrame ? 'true' : undefined}
          data-figma-section="dom"
          style={{
            height: isMockFrame ? sectionViewport.h : undefined,
            overflow: isMockFrame
              ? sectionViewport.overflow === 'scroll' ? 'auto' : 'hidden'
              : 'visible',
            width: sectionViewport.w,
          }}
        >
          <div className="figma-dom-document">
            {rootId === 'workspacePage'
              ? renderWorkspacePage(state, textState, selectedNodeIdInRoot, onChangeText)
              : null}
            {rootId === 'homePage'
              ? renderEditorialHomePage(state, textState, selectedNodeIdInRoot, onChangeText)
              : null}
            {rootId === 'card'
              ? renderProfileCard(state, textState, selectedNodeIdInRoot, onChangeText)
              : null}
            {rootId === 'toolbar'
              ? renderToolbar(state, textState, selectedNodeIdInRoot, onChangeText)
              : null}
            {rootId === 'notice'
              ? renderNotice(state, textState, selectedNodeIdInRoot, onChangeText)
              : null}
          </div>
        </div>
      </div>
    </div>
  )
}

function renderWorkspacePage(
  state: FigmaCloneDomEditState,
  textState: FigmaCloneDomTextState,
  selectedNodeId: FigmaCloneDomNodeId | null,
  onChangeText: (nodeId: FigmaCloneDomNodeId, value: string) => void,
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
            {...createEditableDomNodeProps(
              state,
              textState,
              selectedNodeId,
              'workspaceBrandMark',
              onChangeText,
            )}
          >
            {getFigmaCloneDomText(textState, 'workspaceBrandMark')}
          </div>
          <strong
            className="figma-dom-workspace__brand-text"
            {...createEditableDomNodeProps(
              state,
              textState,
              selectedNodeId,
              'workspaceBrandText',
              onChangeText,
            )}
          >
            {getFigmaCloneDomText(textState, 'workspaceBrandText')}
          </strong>
        </div>

        <nav
          className="figma-dom-workspace__nav"
          {...createDomNodeProps(state, selectedNodeId, 'workspaceNav')}
        >
          <button
            className="figma-dom-workspace__nav-item figma-dom-workspace__nav-item--active"
            {...createEditableDomNodeProps(
              state,
              textState,
              selectedNodeId,
              'workspaceNavOverview',
              onChangeText,
            )}
            type="button"
          >
            {getFigmaCloneDomText(textState, 'workspaceNavOverview')}
          </button>
          <button
            className="figma-dom-workspace__nav-item"
            {...createEditableDomNodeProps(
              state,
              textState,
              selectedNodeId,
              'workspaceNavRoadmap',
              onChangeText,
            )}
            type="button"
          >
            {getFigmaCloneDomText(textState, 'workspaceNavRoadmap')}
          </button>
          <button
            className="figma-dom-workspace__nav-item"
            {...createEditableDomNodeProps(
              state,
              textState,
              selectedNodeId,
              'workspaceNavCustomers',
              onChangeText,
            )}
            type="button"
          >
            {getFigmaCloneDomText(textState, 'workspaceNavCustomers')}
          </button>
        </nav>

        <div
          className="figma-dom-workspace__usage"
          {...createDomNodeProps(state, selectedNodeId, 'workspaceUpgrade')}
        >
          <strong
            {...createEditableDomNodeProps(
              state,
              textState,
              selectedNodeId,
              'workspaceUpgradeTitle',
              onChangeText,
            )}
          >
            {getFigmaCloneDomText(textState, 'workspaceUpgradeTitle')}
          </strong>
          <span
            {...createEditableDomNodeProps(
              state,
              textState,
              selectedNodeId,
              'workspaceUpgradeText',
              onChangeText,
            )}
          >
            {getFigmaCloneDomText(textState, 'workspaceUpgradeText')}
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
          <span
            {...createEditableDomNodeProps(
              state,
              textState,
              selectedNodeId,
              'workspaceBreadcrumb',
              onChangeText,
            )}
          >
            {getFigmaCloneDomText(textState, 'workspaceBreadcrumb')}
          </span>
          <div
            className="figma-dom-workspace__search"
            {...createEditableDomNodeProps(
              state,
              textState,
              selectedNodeId,
              'workspaceSearch',
              onChangeText,
            )}
          >
            {getFigmaCloneDomText(textState, 'workspaceSearch')}
          </div>
          <button
            className="figma-dom-workspace__profile"
            {...createEditableDomNodeProps(
              state,
              textState,
              selectedNodeId,
              'workspaceProfile',
              onChangeText,
            )}
            type="button"
          >
            {getFigmaCloneDomText(textState, 'workspaceProfile')}
          </button>
        </header>

        <section
          className="figma-dom-workspace__hero"
          {...createDomNodeProps(state, selectedNodeId, 'workspaceHero')}
        >
          <span
            className="figma-dom-workspace__floating-note"
            {...createDomNodeProps(state, selectedNodeId, 'workspaceFloatingNote')}
          >
            {getFigmaCloneDomText(textState, 'workspaceFloatingNote')}
          </span>
          <div
            className="figma-dom-workspace__hero-copy"
            {...createDomNodeProps(state, selectedNodeId, 'workspaceHeroCopy')}
          >
            <h2
              {...createEditableDomNodeProps(
                state,
                textState,
                selectedNodeId,
                'workspaceHeroTitle',
                onChangeText,
              )}
            >
              {getFigmaCloneDomText(textState, 'workspaceHeroTitle')}
            </h2>
            <p
              {...createEditableDomNodeProps(
                state,
                textState,
                selectedNodeId,
                'workspaceHeroText',
                onChangeText,
              )}
            >
              {getFigmaCloneDomText(textState, 'workspaceHeroText')}
            </p>
            <div
              className="figma-dom-workspace__tags"
              {...createDomNodeProps(state, selectedNodeId, 'workspaceAudienceTags')}
            >
              {([
                'workspaceAudienceTagEnterprise',
                'workspaceAudienceTagRenewal',
                'workspaceAudienceTagExpansion',
                'workspaceAudienceTagRisk',
              ] as const).map((nodeId) => (
                <span
                  key={nodeId}
                  className="figma-dom-workspace__tag"
                  {...createEditableDomNodeProps(
                    state,
                    textState,
                    selectedNodeId,
                    nodeId,
                    onChangeText,
                  )}
                >
                  {getFigmaCloneDomText(textState, nodeId)}
                </span>
              ))}
            </div>
          </div>
          <div
            className="figma-dom-workspace__hero-actions"
            {...createDomNodeProps(state, selectedNodeId, 'workspaceHeroActions')}
          >
            <button
              className="figma-dom-workspace__primary"
              {...createEditableDomNodeProps(
                state,
                textState,
                selectedNodeId,
                'workspacePrimaryAction',
                onChangeText,
              )}
              type="button"
            >
              {getFigmaCloneDomText(textState, 'workspacePrimaryAction')}
            </button>
            <button
              className="figma-dom-workspace__secondary"
              {...createEditableDomNodeProps(
                state,
                textState,
                selectedNodeId,
                'workspaceSecondaryAction',
                onChangeText,
              )}
              type="button"
            >
              {getFigmaCloneDomText(textState, 'workspaceSecondaryAction')}
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
            <span
              {...createEditableDomNodeProps(
                state,
                textState,
                selectedNodeId,
                'workspaceStatRevenueLabel',
                onChangeText,
              )}
            >
              {getFigmaCloneDomText(textState, 'workspaceStatRevenueLabel')}
            </span>
            <strong
              {...createEditableDomNodeProps(
                state,
                textState,
                selectedNodeId,
                'workspaceStatRevenueValue',
                onChangeText,
              )}
            >
              {getFigmaCloneDomText(textState, 'workspaceStatRevenueValue')}
            </strong>
            <em
              {...createEditableDomNodeProps(
                state,
                textState,
                selectedNodeId,
                'workspaceStatRevenueDelta',
                onChangeText,
              )}
            >
              {getFigmaCloneDomText(textState, 'workspaceStatRevenueDelta')}
            </em>
          </div>
          <div
            className="figma-dom-workspace__stat"
            {...createDomNodeProps(state, selectedNodeId, 'workspaceStatConversion')}
          >
            <span
              {...createEditableDomNodeProps(
                state,
                textState,
                selectedNodeId,
                'workspaceStatConversionLabel',
                onChangeText,
              )}
            >
              {getFigmaCloneDomText(textState, 'workspaceStatConversionLabel')}
            </span>
            <strong
              {...createEditableDomNodeProps(
                state,
                textState,
                selectedNodeId,
                'workspaceStatConversionValue',
                onChangeText,
              )}
            >
              {getFigmaCloneDomText(textState, 'workspaceStatConversionValue')}
            </strong>
            <em
              {...createEditableDomNodeProps(
                state,
                textState,
                selectedNodeId,
                'workspaceStatConversionDelta',
                onChangeText,
              )}
            >
              {getFigmaCloneDomText(textState, 'workspaceStatConversionDelta')}
            </em>
          </div>
          <div
            className="figma-dom-workspace__stat"
            {...createDomNodeProps(state, selectedNodeId, 'workspaceStatTickets')}
          >
            <span
              {...createEditableDomNodeProps(
                state,
                textState,
                selectedNodeId,
                'workspaceStatTicketsLabel',
                onChangeText,
              )}
            >
              {getFigmaCloneDomText(textState, 'workspaceStatTicketsLabel')}
            </span>
            <strong
              {...createEditableDomNodeProps(
                state,
                textState,
                selectedNodeId,
                'workspaceStatTicketsValue',
                onChangeText,
              )}
            >
              {getFigmaCloneDomText(textState, 'workspaceStatTicketsValue')}
            </strong>
            <em
              {...createEditableDomNodeProps(
                state,
                textState,
                selectedNodeId,
                'workspaceStatTicketsDelta',
                onChangeText,
              )}
            >
              {getFigmaCloneDomText(textState, 'workspaceStatTicketsDelta')}
            </em>
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
            <header
              {...createEditableDomNodeProps(
                state,
                textState,
                selectedNodeId,
                'workspacePipelineHeader',
                onChangeText,
              )}
            >
              {getFigmaCloneDomText(textState, 'workspacePipelineHeader')}
            </header>
            <div
              className="figma-dom-workspace__list"
              {...createDomNodeProps(state, selectedNodeId, 'workspacePipelineList')}
            >
              {renderWorkspaceDeal(
                state,
                textState,
                selectedNodeId,
                'workspaceDealOne',
                'workspaceDealOneTitle',
                'workspaceDealOneValue',
                onChangeText,
              )}
              {renderWorkspaceDeal(
                state,
                textState,
                selectedNodeId,
                'workspaceDealTwo',
                'workspaceDealTwoTitle',
                'workspaceDealTwoValue',
                onChangeText,
              )}
              {renderWorkspaceDeal(
                state,
                textState,
                selectedNodeId,
                'workspaceDealThree',
                'workspaceDealThreeTitle',
                'workspaceDealThreeValue',
                onChangeText,
              )}
            </div>
          </section>

          <section
            className="figma-dom-workspace__panel figma-dom-workspace__panel--activity"
            {...createDomNodeProps(state, selectedNodeId, 'workspaceActivity')}
          >
            <header
              {...createEditableDomNodeProps(
                state,
                textState,
                selectedNodeId,
                'workspaceActivityHeader',
                onChangeText,
              )}
            >
              {getFigmaCloneDomText(textState, 'workspaceActivityHeader')}
            </header>
            <div
              className="figma-dom-workspace__activity-list"
              {...createDomNodeProps(state, selectedNodeId, 'workspaceActivityList')}
            >
              {renderWorkspaceActivity(
                state,
                textState,
                selectedNodeId,
                'workspaceActivityOne',
                'workspaceActivityOneText',
                onChangeText,
              )}
              {renderWorkspaceActivity(
                state,
                textState,
                selectedNodeId,
                'workspaceActivityTwo',
                'workspaceActivityTwoText',
                onChangeText,
              )}
              {renderWorkspaceActivity(
                state,
                textState,
                selectedNodeId,
                'workspaceActivityThree',
                'workspaceActivityThreeText',
                onChangeText,
              )}
            </div>
          </section>
        </section>
      </main>
    </section>
  )
}

function renderWorkspaceDeal(
  state: FigmaCloneDomEditState,
  textState: FigmaCloneDomTextState,
  selectedNodeId: FigmaCloneDomNodeId | null,
  nodeId: Extract<
    FigmaCloneDomNodeId,
    'workspaceDealOne' | 'workspaceDealTwo' | 'workspaceDealThree'
  >,
  titleNodeId: Extract<
    FigmaCloneDomNodeId,
    | 'workspaceDealOneTitle'
    | 'workspaceDealTwoTitle'
    | 'workspaceDealThreeTitle'
  >,
  valueNodeId: Extract<
    FigmaCloneDomNodeId,
    | 'workspaceDealOneValue'
    | 'workspaceDealTwoValue'
    | 'workspaceDealThreeValue'
  >,
  onChangeText: (nodeId: FigmaCloneDomNodeId, value: string) => void,
) {
  return (
    <article
      className="figma-dom-workspace__deal"
      {...createDomNodeProps(state, selectedNodeId, nodeId)}
    >
      <strong
        {...createEditableDomNodeProps(
          state,
          textState,
          selectedNodeId,
          titleNodeId,
          onChangeText,
        )}
      >
        {getFigmaCloneDomText(textState, titleNodeId)}
      </strong>
      <span
        {...createEditableDomNodeProps(
          state,
          textState,
          selectedNodeId,
          valueNodeId,
          onChangeText,
        )}
      >
        {getFigmaCloneDomText(textState, valueNodeId)}
      </span>
    </article>
  )
}

function renderWorkspaceActivity(
  state: FigmaCloneDomEditState,
  textState: FigmaCloneDomTextState,
  selectedNodeId: FigmaCloneDomNodeId | null,
  nodeId: Extract<
    FigmaCloneDomNodeId,
    'workspaceActivityOne' | 'workspaceActivityTwo' | 'workspaceActivityThree'
  >,
  textNodeId: Extract<
    FigmaCloneDomNodeId,
    | 'workspaceActivityOneText'
    | 'workspaceActivityTwoText'
    | 'workspaceActivityThreeText'
  >,
  onChangeText: (nodeId: FigmaCloneDomNodeId, value: string) => void,
) {
  return (
    <article
      className="figma-dom-workspace__activity"
      {...createDomNodeProps(state, selectedNodeId, nodeId)}
    >
      <span
        {...createEditableDomNodeProps(
          state,
          textState,
          selectedNodeId,
          textNodeId,
          onChangeText,
        )}
      >
        {getFigmaCloneDomText(textState, textNodeId)}
      </span>
    </article>
  )
}

function renderEditorialHomePage(
  state: FigmaCloneDomEditState,
  textState: FigmaCloneDomTextState,
  selectedNodeId: FigmaCloneDomNodeId | null,
  onChangeText: (nodeId: FigmaCloneDomNodeId, value: string) => void,
) {
  return (
    <section
      className="figma-dom-home"
      {...createDomNodeProps(state, selectedNodeId, 'homePage')}
    >
      <header
        className="figma-dom-home__header"
        {...createDomNodeProps(state, selectedNodeId, 'homeHeader')}
      >
        <div
          className="figma-dom-home__brand"
          {...createDomNodeProps(state, selectedNodeId, 'homeBrand')}
        >
          <div
            className="figma-dom-home__brand-mark"
            {...createEditableDomNodeProps(
              state,
              textState,
              selectedNodeId,
              'homeBrandMark',
              onChangeText,
            )}
          >
            {getFigmaCloneDomText(textState, 'homeBrandMark')}
          </div>
          <strong
            className="figma-dom-home__brand-text"
            {...createEditableDomNodeProps(
              state,
              textState,
              selectedNodeId,
              'homeBrandText',
              onChangeText,
            )}
          >
            {getFigmaCloneDomText(textState, 'homeBrandText')}
          </strong>
        </div>

        <nav
          className="figma-dom-home__nav"
          {...createDomNodeProps(state, selectedNodeId, 'homeNav')}
        >
          {renderHomeButton(
            state,
            textState,
            selectedNodeId,
            'homeNavEssays',
            'figma-dom-home__nav-item figma-dom-home__nav-item--active',
            onChangeText,
          )}
          {renderHomeButton(
            state,
            textState,
            selectedNodeId,
            'homeNavMethods',
            'figma-dom-home__nav-item',
            onChangeText,
          )}
          {renderHomeButton(
            state,
            textState,
            selectedNodeId,
            'homeNavArchive',
            'figma-dom-home__nav-item',
            onChangeText,
          )}
        </nav>

        <div
          className="figma-dom-home__subscribe"
          {...createDomNodeProps(state, selectedNodeId, 'homeSubscribe')}
        >
          <strong
            {...createEditableDomNodeProps(
              state,
              textState,
              selectedNodeId,
              'homeSubscribeLabel',
              onChangeText,
            )}
          >
            {getFigmaCloneDomText(textState, 'homeSubscribeLabel')}
          </strong>
          <span
            {...createEditableDomNodeProps(
              state,
              textState,
              selectedNodeId,
              'homeSubscribeNote',
              onChangeText,
            )}
          >
            {getFigmaCloneDomText(textState, 'homeSubscribeNote')}
          </span>
        </div>
      </header>

      <main
        className="figma-dom-home__main"
        {...createDomNodeProps(state, selectedNodeId, 'homeMain')}
      >
        <section
          className="figma-dom-home__issue"
          {...createDomNodeProps(state, selectedNodeId, 'homeIssueRail')}
        >
          <span
            {...createEditableDomNodeProps(
              state,
              textState,
              selectedNodeId,
              'homeIssueKicker',
              onChangeText,
            )}
          >
            {getFigmaCloneDomText(textState, 'homeIssueKicker')}
          </span>
          <div
            {...createEditableDomNodeProps(
              state,
              textState,
              selectedNodeId,
              'homeIssueTitle',
              onChangeText,
            )}
          >
            {getFigmaCloneDomText(textState, 'homeIssueTitle')}
          </div>
          <button
            className="figma-dom-home__time"
            {...createEditableDomNodeProps(
              state,
              textState,
              selectedNodeId,
              'homeIssueTime',
              onChangeText,
            )}
            type="button"
          >
            {getFigmaCloneDomText(textState, 'homeIssueTime')}
          </button>
        </section>

        <section
          className="figma-dom-home__hero"
          {...createDomNodeProps(state, selectedNodeId, 'homeHero')}
        >
          <div
            className="figma-dom-home__hero-copy"
            {...createDomNodeProps(state, selectedNodeId, 'homeHeroCopy')}
          >
            <h1
              {...createEditableDomNodeProps(
                state,
                textState,
                selectedNodeId,
                'homeHeroTitle',
                onChangeText,
              )}
            >
              {getFigmaCloneDomText(textState, 'homeHeroTitle')}
            </h1>
            <p
              {...createEditableDomNodeProps(
                state,
                textState,
                selectedNodeId,
                'homeHeroText',
                onChangeText,
              )}
            >
              {getFigmaCloneDomText(textState, 'homeHeroText')}
            </p>
          </div>
          <div
            className="figma-dom-home__hero-actions"
            {...createDomNodeProps(state, selectedNodeId, 'homeHeroActions')}
          >
            {renderHomeButton(
              state,
              textState,
              selectedNodeId,
              'homePrimaryAction',
              'figma-dom-home__primary',
              onChangeText,
            )}
            {renderHomeButton(
              state,
              textState,
              selectedNodeId,
              'homeSecondaryAction',
              'figma-dom-home__secondary',
              onChangeText,
            )}
          </div>
        </section>

        <section
          className="figma-dom-home__meta"
          {...createDomNodeProps(state, selectedNodeId, 'homeMeta')}
        >
          {renderHomeMetaItem(
            state,
            textState,
            selectedNodeId,
            'homeByline',
            'homeBylineLabel',
            'homeBylineValue',
            'homeBylineNote',
            onChangeText,
          )}
          {renderHomeMetaItem(
            state,
            textState,
            selectedNodeId,
            'homeCategory',
            'homeCategoryLabel',
            'homeCategoryValue',
            'homeCategoryNote',
            onChangeText,
          )}
          {renderHomeMetaItem(
            state,
            textState,
            selectedNodeId,
            'homeReadTime',
            'homeReadTimeLabel',
            'homeReadTimeValue',
            'homeReadTimeNote',
            onChangeText,
          )}
        </section>

        <section
          className="figma-dom-home__article"
          {...createDomNodeProps(state, selectedNodeId, 'homeArticle')}
        >
          <article
            className="figma-dom-home__essay"
            {...createDomNodeProps(state, selectedNodeId, 'homeEssay')}
          >
            <h2
              {...createEditableDomNodeProps(
                state,
                textState,
                selectedNodeId,
                'homeEssayHeading',
                onChangeText,
              )}
            >
              {getFigmaCloneDomText(textState, 'homeEssayHeading')}
            </h2>
            <div
              className="figma-dom-home__chapters"
              {...createDomNodeProps(state, selectedNodeId, 'homeChapterList')}
            >
              {renderHomeChapter(
                state,
                textState,
                selectedNodeId,
                'homeChapterOne',
                'homeChapterOneTitle',
                'homeChapterOneNumber',
                onChangeText,
              )}
              {renderHomeChapter(
                state,
                textState,
                selectedNodeId,
                'homeChapterTwo',
                'homeChapterTwoTitle',
                'homeChapterTwoNumber',
                onChangeText,
              )}
              {renderHomeChapter(
                state,
                textState,
                selectedNodeId,
                'homeChapterThree',
                'homeChapterThreeTitle',
                'homeChapterThreeNumber',
                onChangeText,
              )}
            </div>
          </article>

          <aside
            className="figma-dom-home__quote"
            {...createDomNodeProps(state, selectedNodeId, 'homeQuote')}
          >
            <h2
              {...createEditableDomNodeProps(
                state,
                textState,
                selectedNodeId,
                'homeQuoteHeading',
                onChangeText,
              )}
            >
              {getFigmaCloneDomText(textState, 'homeQuoteHeading')}
            </h2>
            <div
              className="figma-dom-home__quote-list"
              {...createDomNodeProps(state, selectedNodeId, 'homeQuoteList')}
            >
              {renderHomeQuoteLine(
                state,
                textState,
                selectedNodeId,
                'homeQuoteOne',
                'homeQuoteOneText',
                onChangeText,
              )}
              {renderHomeQuoteLine(
                state,
                textState,
                selectedNodeId,
                'homeQuoteTwo',
                'homeQuoteTwoText',
                onChangeText,
              )}
              {renderHomeQuoteLine(
                state,
                textState,
                selectedNodeId,
                'homeQuoteThree',
                'homeQuoteThreeText',
                onChangeText,
              )}
            </div>
          </aside>
        </section>

        <section
          className="figma-dom-home__dispatches"
          {...createDomNodeProps(state, selectedNodeId, 'homeDispatches')}
        >
          <h2
            {...createEditableDomNodeProps(
              state,
              textState,
              selectedNodeId,
              'homeDispatchHeading',
              onChangeText,
            )}
          >
            {getFigmaCloneDomText(textState, 'homeDispatchHeading')}
          </h2>
          <div
            className="figma-dom-home__dispatch-grid"
            {...createDomNodeProps(state, selectedNodeId, 'homeDispatchGrid')}
          >
            {renderHomeDispatch(
              state,
              textState,
              selectedNodeId,
              'homeDispatchOne',
              'homeDispatchOneTitle',
              'homeDispatchOneText',
              onChangeText,
            )}
            {renderHomeDispatch(
              state,
              textState,
              selectedNodeId,
              'homeDispatchTwo',
              'homeDispatchTwoTitle',
              'homeDispatchTwoText',
              onChangeText,
            )}
            {renderHomeDispatch(
              state,
              textState,
              selectedNodeId,
              'homeDispatchThree',
              'homeDispatchThreeTitle',
              'homeDispatchThreeText',
              onChangeText,
            )}
          </div>
        </section>

        <section
          className="figma-dom-home__newsletter"
          {...createDomNodeProps(state, selectedNodeId, 'homeNewsletter')}
        >
          <h2
            {...createEditableDomNodeProps(
              state,
              textState,
              selectedNodeId,
              'homeNewsletterHeading',
              onChangeText,
            )}
          >
            {getFigmaCloneDomText(textState, 'homeNewsletterHeading')}
          </h2>
          <p
            {...createEditableDomNodeProps(
              state,
              textState,
              selectedNodeId,
              'homeNewsletterText',
              onChangeText,
            )}
          >
            {getFigmaCloneDomText(textState, 'homeNewsletterText')}
          </p>
          {renderHomeButton(
            state,
            textState,
            selectedNodeId,
            'homeNewsletterAction',
            'figma-dom-home__newsletter-action',
            onChangeText,
          )}
        </section>

        <footer
          className="figma-dom-home__footer"
          {...createDomNodeProps(state, selectedNodeId, 'homeFooter')}
        >
          <strong
            {...createEditableDomNodeProps(
              state,
              textState,
              selectedNodeId,
              'homeFooterBrand',
              onChangeText,
            )}
          >
            {getFigmaCloneDomText(textState, 'homeFooterBrand')}
          </strong>
          <span
            {...createEditableDomNodeProps(
              state,
              textState,
              selectedNodeId,
              'homeFooterNote',
              onChangeText,
            )}
          >
            {getFigmaCloneDomText(textState, 'homeFooterNote')}
          </span>
        </footer>
      </main>
    </section>
  )
}

function renderHomeButton(
  state: FigmaCloneDomEditState,
  textState: FigmaCloneDomTextState,
  selectedNodeId: FigmaCloneDomNodeId | null,
  nodeId: FigmaCloneDomNodeId,
  className: string,
  onChangeText: (nodeId: FigmaCloneDomNodeId, value: string) => void,
) {
  return (
    <button
      className={className}
      {...createEditableDomNodeProps(
        state,
        textState,
        selectedNodeId,
        nodeId,
        onChangeText,
      )}
      type="button"
    >
      {getFigmaCloneDomText(textState, nodeId)}
    </button>
  )
}

function renderHomeMetaItem(
  state: FigmaCloneDomEditState,
  textState: FigmaCloneDomTextState,
  selectedNodeId: FigmaCloneDomNodeId | null,
  nodeId: FigmaCloneDomNodeId,
  labelNodeId: FigmaCloneDomNodeId,
  valueNodeId: FigmaCloneDomNodeId,
  noteNodeId: FigmaCloneDomNodeId,
  onChangeText: (nodeId: FigmaCloneDomNodeId, value: string) => void,
) {
  return (
    <article
      className="figma-dom-home__meta-item"
      {...createDomNodeProps(state, selectedNodeId, nodeId)}
    >
      <span
        {...createEditableDomNodeProps(
          state,
          textState,
          selectedNodeId,
          labelNodeId,
          onChangeText,
        )}
      >
        {getFigmaCloneDomText(textState, labelNodeId)}
      </span>
      <strong
        {...createEditableDomNodeProps(
          state,
          textState,
          selectedNodeId,
          valueNodeId,
          onChangeText,
        )}
      >
        {getFigmaCloneDomText(textState, valueNodeId)}
      </strong>
      <em
        {...createEditableDomNodeProps(
          state,
          textState,
          selectedNodeId,
          noteNodeId,
          onChangeText,
        )}
      >
        {getFigmaCloneDomText(textState, noteNodeId)}
      </em>
    </article>
  )
}

function renderHomeChapter(
  state: FigmaCloneDomEditState,
  textState: FigmaCloneDomTextState,
  selectedNodeId: FigmaCloneDomNodeId | null,
  nodeId: FigmaCloneDomNodeId,
  titleNodeId: FigmaCloneDomNodeId,
  numberNodeId: FigmaCloneDomNodeId,
  onChangeText: (nodeId: FigmaCloneDomNodeId, value: string) => void,
) {
  return (
    <article
      className="figma-dom-home__chapter"
      {...createDomNodeProps(state, selectedNodeId, nodeId)}
    >
      <strong
        {...createEditableDomNodeProps(
          state,
          textState,
          selectedNodeId,
          titleNodeId,
          onChangeText,
        )}
      >
        {getFigmaCloneDomText(textState, titleNodeId)}
      </strong>
      <span
        {...createEditableDomNodeProps(
          state,
          textState,
          selectedNodeId,
          numberNodeId,
          onChangeText,
        )}
      >
        {getFigmaCloneDomText(textState, numberNodeId)}
      </span>
    </article>
  )
}

function renderHomeQuoteLine(
  state: FigmaCloneDomEditState,
  textState: FigmaCloneDomTextState,
  selectedNodeId: FigmaCloneDomNodeId | null,
  nodeId: FigmaCloneDomNodeId,
  textNodeId: FigmaCloneDomNodeId,
  onChangeText: (nodeId: FigmaCloneDomNodeId, value: string) => void,
) {
  return (
    <article
      className="figma-dom-home__quote-line"
      {...createDomNodeProps(state, selectedNodeId, nodeId)}
    >
      <span
        {...createEditableDomNodeProps(
          state,
          textState,
          selectedNodeId,
          textNodeId,
          onChangeText,
        )}
      >
        {getFigmaCloneDomText(textState, textNodeId)}
      </span>
    </article>
  )
}

function renderHomeDispatch(
  state: FigmaCloneDomEditState,
  textState: FigmaCloneDomTextState,
  selectedNodeId: FigmaCloneDomNodeId | null,
  nodeId: FigmaCloneDomNodeId,
  titleNodeId: FigmaCloneDomNodeId,
  textNodeId: FigmaCloneDomNodeId,
  onChangeText: (nodeId: FigmaCloneDomNodeId, value: string) => void,
) {
  return (
    <article
      className="figma-dom-home__dispatch"
      {...createDomNodeProps(state, selectedNodeId, nodeId)}
    >
      <strong
        {...createEditableDomNodeProps(
          state,
          textState,
          selectedNodeId,
          titleNodeId,
          onChangeText,
        )}
      >
        {getFigmaCloneDomText(textState, titleNodeId)}
      </strong>
      <p
        {...createEditableDomNodeProps(
          state,
          textState,
          selectedNodeId,
          textNodeId,
          onChangeText,
        )}
      >
        {getFigmaCloneDomText(textState, textNodeId)}
      </p>
    </article>
  )
}

function renderProfileCard(
  state: FigmaCloneDomEditState,
  textState: FigmaCloneDomTextState,
  selectedNodeId: FigmaCloneDomNodeId | null,
  onChangeText: (nodeId: FigmaCloneDomNodeId, value: string) => void,
) {
  return (
    <section
      className="figma-dom-card"
      {...createDomNodeProps(state, selectedNodeId, 'card')}
    >
      <header
        className="figma-dom-header"
        {...createDomNodeProps(state, selectedNodeId, 'header')}
      >
        <div
          className="figma-dom-avatar"
          {...createEditableDomNodeProps(
            state,
            textState,
            selectedNodeId,
            'avatar',
            onChangeText,
          )}
        >
          {getFigmaCloneDomText(textState, 'avatar')}
        </div>
        <div
          className="figma-dom-headline"
          {...createDomNodeProps(state, selectedNodeId, 'headline')}
        >
          <strong
            {...createEditableDomNodeProps(
              state,
              textState,
              selectedNodeId,
              'headlineTitle',
              onChangeText,
            )}
          >
            {getFigmaCloneDomText(textState, 'headlineTitle')}
          </strong>
          <span
            {...createEditableDomNodeProps(
              state,
              textState,
              selectedNodeId,
              'supporting',
              onChangeText,
            )}
          >
            {getFigmaCloneDomText(textState, 'supporting')}
          </span>
        </div>
      </header>

      <div
        className="figma-dom-actions"
        {...createDomNodeProps(state, selectedNodeId, 'actions')}
      >
        <button
          {...createEditableDomNodeProps(
            state,
            textState,
            selectedNodeId,
            'primaryButton',
            onChangeText,
          )}
          type="button"
        >
          {getFigmaCloneDomText(textState, 'primaryButton')}
        </button>
        <button
          {...createEditableDomNodeProps(
            state,
            textState,
            selectedNodeId,
            'secondaryButton',
            onChangeText,
          )}
          type="button"
        >
          {getFigmaCloneDomText(textState, 'secondaryButton')}
        </button>
      </div>

      <div
        className="figma-dom-metrics"
        {...createDomNodeProps(state, selectedNodeId, 'metrics')}
      >
        <div
          {...createDomNodeProps(state, selectedNodeId, 'metricOne')}
        >
          <span
            {...createEditableDomNodeProps(
              state,
              textState,
              selectedNodeId,
              'metricOneLabel',
              onChangeText,
            )}
          >
            {getFigmaCloneDomText(textState, 'metricOneLabel')}
          </span>
          <strong
            {...createEditableDomNodeProps(
              state,
              textState,
              selectedNodeId,
              'metricOneValue',
              onChangeText,
            )}
          >
            {getFigmaCloneDomText(textState, 'metricOneValue')}
          </strong>
        </div>
        <div
          {...createDomNodeProps(state, selectedNodeId, 'metricTwo')}
        >
          <span
            {...createEditableDomNodeProps(
              state,
              textState,
              selectedNodeId,
              'metricTwoLabel',
              onChangeText,
            )}
          >
            {getFigmaCloneDomText(textState, 'metricTwoLabel')}
          </span>
          <strong
            {...createEditableDomNodeProps(
              state,
              textState,
              selectedNodeId,
              'metricTwoValue',
              onChangeText,
            )}
          >
            {getFigmaCloneDomText(textState, 'metricTwoValue')}
          </strong>
        </div>
      </div>
    </section>
  )
}

function renderToolbar(
  state: FigmaCloneDomEditState,
  textState: FigmaCloneDomTextState,
  selectedNodeId: FigmaCloneDomNodeId | null,
  onChangeText: (nodeId: FigmaCloneDomNodeId, value: string) => void,
) {
  return (
    <section
      className="figma-dom-toolbar"
      {...createDomNodeProps(state, selectedNodeId, 'toolbar')}
    >
      <strong
        {...createEditableDomNodeProps(
          state,
          textState,
          selectedNodeId,
          'toolbarTitle',
          onChangeText,
        )}
      >
        {getFigmaCloneDomText(textState, 'toolbarTitle')}
      </strong>
      <div
        className="figma-dom-search"
        {...createEditableDomNodeProps(
          state,
          textState,
          selectedNodeId,
          'searchBox',
          onChangeText,
        )}
      >
        {getFigmaCloneDomText(textState, 'searchBox')}
      </div>
      <button
        {...createEditableDomNodeProps(
          state,
          textState,
          selectedNodeId,
          'toolbarButton',
          onChangeText,
        )}
        type="button"
      >
        {getFigmaCloneDomText(textState, 'toolbarButton')}
      </button>
    </section>
  )
}

function renderNotice(
  state: FigmaCloneDomEditState,
  textState: FigmaCloneDomTextState,
  selectedNodeId: FigmaCloneDomNodeId | null,
  onChangeText: (nodeId: FigmaCloneDomNodeId, value: string) => void,
) {
  return (
    <section
      className="figma-dom-notice"
      {...createDomNodeProps(state, selectedNodeId, 'notice')}
    >
      <div
        className="figma-dom-notice-icon"
        {...createEditableDomNodeProps(
          state,
          textState,
          selectedNodeId,
          'noticeIcon',
          onChangeText,
        )}
      >
        {getFigmaCloneDomText(textState, 'noticeIcon')}
      </div>
      <div
        className="figma-dom-notice-content"
        {...createDomNodeProps(state, selectedNodeId, 'noticeContent')}
      >
        <strong
          {...createEditableDomNodeProps(
            state,
            textState,
            selectedNodeId,
            'noticeTitle',
            onChangeText,
          )}
        >
          {getFigmaCloneDomText(textState, 'noticeTitle')}
        </strong>
        <span
          {...createEditableDomNodeProps(
            state,
            textState,
            selectedNodeId,
            'noticeText',
            onChangeText,
          )}
        >
          {getFigmaCloneDomText(textState, 'noticeText')}
        </span>
      </div>
      <button
        {...createEditableDomNodeProps(
          state,
          textState,
          selectedNodeId,
          'noticeAction',
          onChangeText,
        )}
        type="button"
      >
        {getFigmaCloneDomText(textState, 'noticeAction')}
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
    'data-dom-edit-node': nodeId,
    'data-figma-component-root':
      isFigmaCloneDomComponentRootNode(nodeId) ? 'true' : 'false',
    'data-figma-dom-node': nodeId,
    'data-selected': selectedNodeId === nodeId ? 'true' : 'false',
    style: createNodeStyle(state, nodeId),
  } as const
}

function createEditableDomNodeProps(
  state: FigmaCloneDomEditState,
  textState: FigmaCloneDomTextState,
  selectedNodeId: FigmaCloneDomNodeId | null,
  nodeId: FigmaCloneDomNodeId,
  onChangeText: (nodeId: FigmaCloneDomNodeId, value: string) => void,
) {
  const isEditing =
    selectedNodeId === nodeId && canFigmaCloneDomNodeEditText(nodeId)

  return {
    ...createDomNodeProps(state, selectedNodeId, nodeId),
    'aria-label': isEditing
      ? `Edit ${getFigmaCloneDomText(textState, nodeId)}`
      : undefined,
    contentEditable: isEditing ? 'plaintext-only' : undefined,
    'data-figma-dom-editing': isEditing ? 'true' : undefined,
    suppressContentEditableWarning: isEditing ? true : undefined,
    tabIndex: isEditing ? 0 : undefined,
    onBlur: isEditing
      ? (event: FocusEvent<HTMLElement>) => {
          onChangeText(nodeId, event.currentTarget.textContent ?? '')
        }
      : undefined,
    onKeyDown: isEditing
      ? (event: KeyboardEvent<HTMLElement>) => {
          if (event.key === 'Escape') {
            event.currentTarget.blur()
            return
          }

          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault()
            event.currentTarget.blur()
          }
        }
      : undefined,
  } as const
}

function focusFigmaCloneEditableDomNode(nodeId: FigmaCloneDomNodeId) {
  const element = getFigmaCloneDomElement(nodeId)

  if (!element?.isContentEditable) {
    return
  }

  element.focus()

  const selection = window.getSelection()
  const range = document.createRange()
  range.selectNodeContents(element)
  range.collapse(false)
  selection?.removeAllRanges()
  selection?.addRange(range)
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
  const usesAuthoredWrapSize = usesFigmaCloneAuthoredWrapSize(nodeId)
  const isOutOfFlow = isFigmaCloneDomOutOfFlowNode(nodeId)

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
    flexWrap: nodeId === 'workspaceAudienceTags' ? 'wrap' : undefined,
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
      : usesAuthoredWrapSize
        ? style.h
        : mapFigmaCloneAutoLayoutSize(style.heightMode, style.h),
    justifyContent: canUseAutoLayout
      ? mapFigmaCloneAutoLayoutDistribution(style.distribution)
      : undefined,
    left: isOutOfFlow ? style.x : undefined,
    margin: style.margin,
    minHeight: style.heightMode === 'fill' ? 0 : undefined,
    minWidth: style.widthMode === 'fill' ? 0 : undefined,
    opacity: style.opacity / 100,
    order: style.order,
    paddingBottom: style.paddingBottom,
    paddingLeft: style.paddingLeft,
    paddingRight: style.paddingRight,
    paddingTop: style.paddingTop,
    position: isOutOfFlow ? 'absolute' : undefined,
    top: isOutOfFlow ? style.y : undefined,
    width: fillsParentRow
      ? 0
      : usesAuthoredWrapSize
        ? style.w
        : mapFigmaCloneAutoLayoutSize(style.widthMode, style.w),
  }
}

function usesFigmaCloneAuthoredWrapSize(
  nodeId: FigmaCloneDomNodeId,
) {
  return nodeId === 'workspaceAudienceTags' ||
    nodeId === 'workspaceAudienceTagEnterprise' ||
    nodeId === 'workspaceAudienceTagRenewal' ||
    nodeId === 'workspaceAudienceTagExpansion' ||
    nodeId === 'workspaceAudienceTagRisk'
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
  if (distribution === 'center') {
    return 'center'
  }

  if (distribution === 'end') {
    return 'flex-end'
  }

  if (distribution === 'space-between') {
    return 'space-between'
  }

  return 'flex-start'
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
