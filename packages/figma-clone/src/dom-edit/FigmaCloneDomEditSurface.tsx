import {
  type CSSProperties,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
} from 'react'
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
  isFigmaCloneDomGridContainer,
  resolveFigmaCloneDomClickTarget,
  type FigmaCloneDomEditState,
  type FigmaCloneDomNodeId,
  type FigmaCloneDomTextState,
} from './FigmaCloneDomEditModel'
import { isFigmaCloneDomCanvasPanTarget } from './FigmaCloneDomCanvasPointer'

export function FigmaCloneDomEditSurface({
  isSectionSelected,
  sectionViewport,
  selectedNodeId,
  state,
  textState,
  onSelectSection,
  onSelectNode,
  onChangeText,
}: {
  isSectionSelected: boolean
  sectionViewport: FigmaCloneSectionViewport
  selectedNodeId: FigmaCloneDomNodeId | null
  state: FigmaCloneDomEditState
  textState: FigmaCloneDomTextState
  onSelectSection: () => void
  onSelectNode: (nodeId: FigmaCloneDomNodeId) => void
  onChangeText: (nodeId: FigmaCloneDomNodeId, value: string) => void
}) {
  const activeRootId = getFigmaCloneDomRootId(selectedNodeId)
  const shouldPassThroughCanvasEvent = (target: EventTarget | null) =>
    isFigmaCloneDomCanvasPanTarget(target) ||
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
      selectedNodeId,
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
      selectedNodeId,
      target: event.target,
    })

    if (!target || !canFigmaCloneDomNodeEditText(target)) {
      if (!target) {
        event.preventDefault()
        event.stopPropagation()
        onSelectNode(getFigmaCloneDomRootId(selectedNodeId))
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
        className="figma-dom-browser"
        data-figma-section="dom"
        data-section-selected={isSectionSelected ? 'true' : 'false'}
        style={{
          height: sectionViewport.h,
          overflow: sectionViewport.overflow === 'scroll' ? 'auto' : 'hidden',
          width: sectionViewport.w,
        }}
      >
        <div className="figma-dom-document">
          {activeRootId === 'workspacePage'
            ? renderWorkspacePage(state, textState, selectedNodeId, onChangeText)
            : null}
          {activeRootId === 'card'
            ? renderProfileCard(state, textState, selectedNodeId, onChangeText)
            : null}
          {activeRootId === 'toolbar'
            ? renderToolbar(state, textState, selectedNodeId, onChangeText)
            : null}
          {activeRootId === 'notice'
            ? renderNotice(state, textState, selectedNodeId, onChangeText)
            : null}
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
