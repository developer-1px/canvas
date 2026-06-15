import { describe, expect, it } from 'vitest'
import { getFigmaCloneDomOverlayVisibility } from './overlay'
import {
  canFigmaCloneDomNodeEditText,
  canFigmaCloneDomFillParent,
  createFigmaCloneDomEditState,
  createFigmaCloneDomTextState,
  getFigmaCloneDomEditStyle,
  getFigmaCloneDomLayoutContext,
  getFigmaCloneDomRootId,
  getFigmaCloneDomText,
  getFigmaCloneDomToggledAxisSizeMode,
  updateFigmaCloneDomAutoLayoutField,
  updateFigmaCloneDomEditField,
  updateFigmaCloneDomText,
} from './FigmaCloneDomEditModel'

describe('FigmaCloneDomEditModel', () => {
  it('stores DOM edit values outside widget data', () => {
    const state = createFigmaCloneDomEditState()
    const next = updateFigmaCloneDomEditField({
      field: 'padding',
      nodeId: 'card',
      state,
      value: 32,
    })

    expect(getFigmaCloneDomEditStyle(next, 'card').padding).toBe(32)
    expect(getFigmaCloneDomEditStyle(next, 'card').paddingTop).toBe(32)
    expect(getFigmaCloneDomEditStyle(next, 'card').paddingRight).toBe(32)
    expect(getFigmaCloneDomEditStyle(next, 'card').paddingBottom).toBe(32)
    expect(getFigmaCloneDomEditStyle(next, 'card').paddingLeft).toBe(32)
    expect(getFigmaCloneDomEditStyle(state, 'card').padding).toBe(24)
    expect(getFigmaCloneDomEditStyle(state, 'card').paddingTop).toBe(24)
  })

  it('updates one padding side without mutating the other sides', () => {
    const state = createFigmaCloneDomEditState()
    const next = updateFigmaCloneDomEditField({
      field: 'paddingLeft',
      nodeId: 'card',
      state,
      value: 40,
    })

    expect(getFigmaCloneDomEditStyle(next, 'card').padding).toBe(24)
    expect(getFigmaCloneDomEditStyle(next, 'card').paddingTop).toBe(24)
    expect(getFigmaCloneDomEditStyle(next, 'card').paddingRight).toBe(24)
    expect(getFigmaCloneDomEditStyle(next, 'card').paddingBottom).toBe(24)
    expect(getFigmaCloneDomEditStyle(next, 'card').paddingLeft).toBe(40)
    expect(getFigmaCloneDomEditStyle(state, 'card').paddingLeft).toBe(24)
  })

  it('clamps direct manipulation values', () => {
    const state = updateFigmaCloneDomEditField({
      field: 'radius',
      nodeId: 'primaryButton',
      state: createFigmaCloneDomEditState(),
      value: 999,
    })

    expect(getFigmaCloneDomEditStyle(state, 'primaryButton').radius).toBe(80)
  })

  it('clamps visual effect values', () => {
    const state = updateFigmaCloneDomEditField({
      field: 'opacity',
      nodeId: 'card',
      state: createFigmaCloneDomEditState(),
      value: 250,
    })

    expect(getFigmaCloneDomEditStyle(state, 'card').opacity).toBe(100)
  })

  it('stores auto layout values in DOM edit state', () => {
    const state = createFigmaCloneDomEditState()
    const next = updateFigmaCloneDomAutoLayoutField({
      field: 'direction',
      nodeId: 'card',
      state,
      value: 'row',
    })

    expect(getFigmaCloneDomEditStyle(next, 'card').direction).toBe('row')
    expect(getFigmaCloneDomEditStyle(state, 'card').direction).toBe('column')
  })

  it('stores distribution values without mutating previous DOM edit state', () => {
    const state = createFigmaCloneDomEditState()
    const next = updateFigmaCloneDomAutoLayoutField({
      field: 'distribution',
      nodeId: 'workspaceHeroActions',
      state,
      value: 'center',
    })

    expect(getFigmaCloneDomEditStyle(next, 'workspaceHeroActions').distribution)
      .toBe('center')
    expect(getFigmaCloneDomEditStyle(state, 'workspaceHeroActions').distribution)
      .toBe('packed')
  })

  it('stores editable copy outside DOM layout values', () => {
    const state = createFigmaCloneDomTextState()
    const next = updateFigmaCloneDomText({
      nodeId: 'workspaceHeroTitle',
      state,
      value: 'Revenue command center',
    })

    expect(getFigmaCloneDomText(next, 'workspaceHeroTitle')).toBe(
      'Revenue command center',
    )
    expect(getFigmaCloneDomText(state, 'workspaceHeroTitle')).toBe(
      'Revenue operations',
    )
    expect(canFigmaCloneDomNodeEditText('workspaceHeroTitle')).toBe(true)
    expect(canFigmaCloneDomNodeEditText('homeHeroTitle')).toBe(true)
    expect(canFigmaCloneDomNodeEditText('workspaceHero')).toBe(false)
  })

  it('models composite UI copy as selectable text leaves', () => {
    const dealValue = getFigmaCloneDomLayoutContext('workspaceDealTwoValue')
    const headlineTitle = getFigmaCloneDomLayoutContext('headlineTitle')

    expect(getFigmaCloneDomRootId('workspaceDealTwoValue')).toBe('workspacePage')
    expect(dealValue.contentType).toBe('text')
    expect(headlineTitle.contentType).toBe('text')
  })

  it('defaults DOM samples to hug/fill sizing and reserves fixed for atomic visuals', () => {
    const state = createFigmaCloneDomEditState()

    const fixedNodes = Object.entries(state)
      .filter(([, style]) =>
        style.widthMode === 'fixed' || style.heightMode === 'fixed')
      .map(([nodeId]) => nodeId)

    expect(getFigmaCloneDomEditStyle(state, 'workspacePage').widthMode).toBe('fill')
    expect(getFigmaCloneDomEditStyle(state, 'workspacePage').heightMode).toBe('hug')
    expect(getFigmaCloneDomEditStyle(state, 'workspaceSidebar').widthMode).toBe('hug')
    expect(getFigmaCloneDomEditStyle(state, 'workspaceMain').widthMode).toBe('fill')
    expect(getFigmaCloneDomEditStyle(state, 'workspaceMain').heightMode).toBe('hug')
    expect(getFigmaCloneDomEditStyle(state, 'workspaceSearch').widthMode).toBe('fill')
    expect(getFigmaCloneDomEditStyle(state, 'homePage').widthMode).toBe('fill')
    expect(getFigmaCloneDomEditStyle(state, 'homePage').heightMode).toBe('hug')
    expect(getFigmaCloneDomEditStyle(state, 'card').widthMode).toBe('hug')
    expect(getFigmaCloneDomEditStyle(state, 'card').heightMode).toBe('hug')
    expect(getFigmaCloneDomEditStyle(state, 'header').widthMode).toBe('fill')
    expect(getFigmaCloneDomEditStyle(state, 'header').heightMode).toBe('hug')
    expect(getFigmaCloneDomEditStyle(state, 'primaryButton').widthMode).toBe('fill')
    expect(getFigmaCloneDomEditStyle(state, 'secondaryButton').widthMode).toBe('hug')
    expect(getFigmaCloneDomEditStyle(state, 'noticeContent').widthMode).toBe('fill')
    expect(getFigmaCloneDomEditStyle(state, 'workspaceBrandMark').widthMode).toBe('fixed')
    expect(getFigmaCloneDomEditStyle(state, 'workspaceBrandMark').heightMode).toBe('fixed')
    expect(getFigmaCloneDomEditStyle(state, 'homeBrandMark').widthMode).toBe('fixed')
    expect(getFigmaCloneDomEditStyle(state, 'homeBrandMark').heightMode).toBe('fixed')
    expect(getFigmaCloneDomEditStyle(state, 'avatar').widthMode).toBe('fixed')
    expect(getFigmaCloneDomEditStyle(state, 'avatar').heightMode).toBe('fixed')
    expect(fixedNodes).toEqual([
      'workspaceBrandMark',
      'homeBrandMark',
      'avatar',
      'noticeIcon',
    ])
  })

  it('projects controls from display and parent display', () => {
    const card = getFigmaCloneDomLayoutContext('card')
    const header = getFigmaCloneDomLayoutContext('header')
    const avatar = getFigmaCloneDomLayoutContext('avatar')

    expect(card.display).toBe('flex')
    expect(card.parentDisplay).toBeNull()
    expect(card.showSelfLayout).toBe(true)
    expect(card.showParentParticipation).toBe(false)

    expect(header.parentDisplay).toBe('flex')
    expect(header.showFlexLayout).toBe(true)
    expect(header.showSelfLayout).toBe(true)
    expect(header.showParentParticipation).toBe(true)

    expect(avatar.display).toBe('grid')
    expect(avatar.parentDisplay).toBe('flex')
    expect(avatar.showGridLayout).toBe(false)
    expect(avatar.showGeometry).toBe(true)
    expect(avatar.showSelfLayout).toBe(false)
    expect(avatar.showParentParticipation).toBe(true)
  })

  it('projects grid containers separately from flex auto layout', () => {
    const contentGrid = getFigmaCloneDomLayoutContext('workspaceContent')
    const pipeline = getFigmaCloneDomLayoutContext('workspacePipeline')

    expect(contentGrid.display).toBe('grid')
    expect(contentGrid.showGridLayout).toBe(true)
    expect(contentGrid.showFlexLayout).toBe(false)
    expect(contentGrid.showSelfLayout).toBe(false)
    expect(pipeline.parentDisplay).toBe('grid')
    expect(pipeline.showParentParticipation).toBe(true)
  })

  it('allows fill participation in flex and grid parents', () => {
    expect(canFigmaCloneDomFillParent('flex')).toBe(true)
    expect(canFigmaCloneDomFillParent('grid')).toBe(true)
    expect(canFigmaCloneDomFillParent('block')).toBe(false)
    expect(canFigmaCloneDomFillParent(null)).toBe(false)
  })

  it('toggles resize handles between natural and parent fill sizing', () => {
    expect(getFigmaCloneDomToggledAxisSizeMode({
      mode: 'fixed',
      parentDisplay: 'flex',
    })).toBe('hug')
    expect(getFigmaCloneDomToggledAxisSizeMode({
      mode: 'hug',
      parentDisplay: 'flex',
    })).toBe('fill')
    expect(getFigmaCloneDomToggledAxisSizeMode({
      mode: 'hug',
      parentDisplay: 'grid',
    })).toBe('fill')
    expect(getFigmaCloneDomToggledAxisSizeMode({
      mode: 'fill',
      parentDisplay: 'grid',
    })).toBe('hug')
    expect(getFigmaCloneDomToggledAxisSizeMode({
      mode: 'hug',
      parentDisplay: null,
    })).toBe('hug')
  })

  it('projects controls for additional ui samples', () => {
    const toolbar = getFigmaCloneDomLayoutContext('toolbar')
    const searchBox = getFigmaCloneDomLayoutContext('searchBox')
    const noticeContent = getFigmaCloneDomLayoutContext('noticeContent')

    expect(toolbar.display).toBe('flex')
    expect(toolbar.showSelfLayout).toBe(true)
    expect(searchBox.contentType).toBe('control')
    expect(searchBox.parentDisplay).toBe('flex')
    expect(searchBox.showParentParticipation).toBe(true)
    expect(noticeContent.display).toBe('flex')
    expect(noticeContent.showSelfLayout).toBe(true)
  })

  it('resolves the active rendered root from the selected node', () => {
    expect(getFigmaCloneDomRootId('workspaceDealTwo')).toBe('workspacePage')
    expect(getFigmaCloneDomRootId('homeQuoteTwoText')).toBe('homePage')
    expect(getFigmaCloneDomRootId('searchBox')).toBe('toolbar')
    expect(getFigmaCloneDomRootId('noticeText')).toBe('notice')
    expect(getFigmaCloneDomRootId('metricOne')).toBe('card')
  })

  it('gates affordance visibility by interaction state', () => {
    const context = getFigmaCloneDomLayoutContext('workspacePipelineList')

    const idle = getFigmaCloneDomOverlayVisibility({
      affordanceState: { mode: 'idle' },
      context,
    })
    const measure = getFigmaCloneDomOverlayVisibility({
      affordanceState: { mode: 'measure' },
      context,
    })
    const gapHover = getFigmaCloneDomOverlayVisibility({
      affordanceState: { mode: 'hover-property', property: 'gap' },
      context,
    })
    const paddingDrag = getFigmaCloneDomOverlayVisibility({
      affordanceState: { mode: 'drag-property', property: 'padding' },
      context,
    })
    const transform = getFigmaCloneDomOverlayVisibility({
      affordanceState: { mode: 'transform' },
      context,
    })

    expect(idle.selection).toBe(true)
    expect(idle.parentReference).toBe(true)
    expect(idle.directionControls).toBe(true)
    expect(idle.geometry).toBe(false)
    expect(idle.sizeModes).toBe(true)
    expect(idle.measurements).toBe(false)
    expect(idle.gapVisuals).toBe(false)
    expect(idle.paddingVisuals).toBe(false)

    expect(measure.measurements).toBe(true)
    expect(measure.geometry).toBe(false)
    expect(measure.directionControls).toBe(false)
    expect(measure.parentReference).toBe(false)
    expect(measure.sizeModes).toBe(false)
    expect(gapHover.gapVisuals).toBe(true)
    expect(gapHover.geometry).toBe(false)
    expect(gapHover.directionControls).toBe(true)
    expect(gapHover.paddingHitTargets).toBe(false)
    expect(gapHover.sizeModes).toBe(false)
    expect(paddingDrag.paddingVisuals).toBe(true)
    expect(paddingDrag.gapHitTargets).toBe(false)
    expect(paddingDrag.directionControls).toBe(false)
    expect(paddingDrag.parentReference).toBe(false)
    expect(paddingDrag.sizeModes).toBe(false)
    expect(paddingDrag.xray).toBe(false)
    expect(transform.geometry).toBe(false)
    expect(transform.sizeModes).toBe(false)
  })

  it('gates grid gap and padding visibility separately', () => {
    const context = getFigmaCloneDomLayoutContext('workspaceContent')

    const idle = getFigmaCloneDomOverlayVisibility({
      affordanceState: { mode: 'idle' },
      context,
    })
    const gapHover = getFigmaCloneDomOverlayVisibility({
      affordanceState: { mode: 'hover-property', property: 'gap' },
      context,
    })
    const paddingHover = getFigmaCloneDomOverlayVisibility({
      affordanceState: { mode: 'hover-property', property: 'padding' },
      context,
    })

    expect(idle.gridGapHitTargets).toBe(true)
    expect(idle.gridGapVisuals).toBe(false)
    expect(idle.paddingHitTargets).toBe(true)
    expect(gapHover.gridGapVisuals).toBe(true)
    expect(gapHover.paddingHitTargets).toBe(false)
    expect(paddingHover.paddingVisuals).toBe(true)
    expect(paddingHover.gridGapHitTargets).toBe(false)
  })
})
