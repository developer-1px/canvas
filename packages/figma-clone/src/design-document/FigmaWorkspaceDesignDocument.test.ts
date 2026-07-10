import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import {
  restoreDesignDocument,
  type DesignDocumentSnapshot,
} from '../../../../src/canvas/design-document'
import {
  applyFigmaWorkspaceFramePreset,
  createFigmaWorkspaceDesignDocument,
  FIGMA_WORKSPACE_COMPONENT_METADATA,
  FIGMA_WORKSPACE_DESIGN_DOCUMENT_SNAPSHOT,
  getFigmaWorkspaceLegacyComponentBinding,
  projectFigmaWorkspaceDesignDocument,
  updateFigmaWorkspaceAutoLayoutField,
  updateFigmaWorkspaceFrame,
  updateFigmaWorkspaceNumericField,
  updateFigmaWorkspaceText,
} from '.'
import { FigmaCloneDomEditSurface } from '../dom-edit/FigmaCloneDomEditSurface'
import {
  createFigmaCloneDomReadModel,
  type FigmaCloneDomEditState,
} from '../dom-edit/FigmaCloneDomEditModel'

describe('Figma workspace DesignDocument', () => {
  it('seeds the complete workspace graph, authored values, and bindings', () => {
    const snapshot = FIGMA_WORKSPACE_DESIGN_DOCUMENT_SNAPSHOT
    const projection = projectFigmaWorkspaceDesignDocument(snapshot)
    const boundNodes = snapshot.nodes.filter((node) => node.component)

    expect(snapshot.roots).toEqual(['workspacePage'])
    expect(snapshot.nodes).toHaveLength(65)
    expect(Object.keys(projection.nodeById)).toHaveLength(65)
    expect(Object.keys(projection.state)).toHaveLength(65)
    expect(Object.keys(projection.textState)).toHaveLength(39)
    expect(boundNodes).toHaveLength(21)
    expect(snapshot.nodes.filter((node) => node.definition.kind === 'component'))
      .toHaveLength(6)
    expect(snapshot.nodes.filter((node) => node.definition.kind === 'intrinsic'))
      .toHaveLength(59)

    expect(projection.tree).toHaveLength(1)
    expect(projection.tree[0]).toMatchObject({
      id: 'workspacePage',
      label: 'Workspace page',
      children: [
        { id: 'workspaceSidebar', label: 'Sidebar' },
        { id: 'workspaceMain', label: 'Main area' },
      ],
    })
    expect(projection.nodeById.workspacePipelineList.children?.map(
      (node) => node.id,
    )).toEqual([
      'workspaceDealOne',
      'workspaceDealTwo',
      'workspaceDealThree',
    ])
    expect(projection.textState.workspaceHeroTitle).toBe('Revenue operations')
    expect(projection.textState.workspaceUpgradeText).toBe(
      "68% of this quarter's workspace budget is allocated.",
    )
    expect(projection.state.workspacePage).toMatchObject({
      align: 'stretch',
      direction: 'row',
      gap: 14,
      h: 636,
      padding: 14,
      paddingBottom: 14,
      paddingLeft: 14,
      paddingRight: 14,
      paddingTop: 14,
      radius: 0,
      w: 912,
      widthMode: 'fill',
    })
    expect(projection.state.workspaceFloatingNote).toMatchObject({
      h: 32,
      padding: 10,
      radius: 10,
      w: 124,
      x: 484,
      y: 14,
    })
    expect(projection.state.workspaceActivity).toMatchObject({
      gap: 12,
      h: 270,
      padding: 14,
      radius: 16,
      w: 230,
      widthMode: 'hug',
    })
    expect(projection.componentBindingByNodeId.workspaceStatRevenueValue)
      .toEqual({
        definitionId: 'workspace-stat-card',
        instanceId: 'workspaceStatRevenue',
        slotId: 'value',
      })
    expect(projection.componentBindingByNodeId.workspaceDealThreeTitle)
      .toEqual({
        definitionId: 'workspace-deal-row',
        instanceId: 'workspaceDealThree',
        slotId: 'title',
      })
    expect(getFigmaWorkspaceLegacyComponentBinding(
      projection,
      'workspaceStatRevenueValue',
    )).toMatchObject({
      componentId: 'workspace-stat-card',
      componentLabel: 'Stat card',
      instanceCount: 3,
      instanceLabel: 'Revenue',
      slotLabel: 'value',
      slotNodeIds: [
        'workspaceStatRevenueValue',
        'workspaceStatConversionValue',
        'workspaceStatTicketsValue',
      ],
    })

    expect(JSON.stringify(snapshot)).not.toContain('src/widgets/workspace-stat-card')
    expect(FIGMA_WORKSPACE_COMPONENT_METADATA[0].source.importPath).toBe(
      'src/widgets/workspace-stat-card',
    )
  })

  it('round-trips through serialization without changing the projection', () => {
    const document = createFigmaWorkspaceDesignDocument()
    const restored = restoreDesignDocument(document.serialize())

    expect(restored.snapshot).toEqual(document.snapshot)
    expect(projectFigmaWorkspaceDesignDocument(restored.read)).toEqual(
      projectFigmaWorkspaceDesignDocument(document.snapshot),
    )
  })

  it('projects updates without mutating or empowering an older read view', () => {
    const document = createFigmaWorkspaceDesignDocument()
    const before = projectFigmaWorkspaceDesignDocument(document.read)

    expect(updateFigmaWorkspaceText(document, {
      nodeId: 'workspaceHeroTitle',
      value: 'Pipeline control',
    })).toEqual({ ok: true, changed: true })

    const after = projectFigmaWorkspaceDesignDocument(document.snapshot)

    expect(before.textState.workspaceHeroTitle).toBe('Revenue operations')
    expect(after.textState.workspaceHeroTitle).toBe('Pipeline control')
    expect(Object.isFrozen(before)).toBe(true)
    expect(Object.isFrozen(before.state.workspaceHeroTitle)).toBe(true)
    expect('execute' in before).toBe(false)
    expect('history' in before).toBe(false)
  })

  it('writes text and auto-layout fields only through document commands', () => {
    const document = createFigmaWorkspaceDesignDocument()

    expect(updateFigmaWorkspaceText(document, {
      nodeId: 'workspaceHeroText',
      value: 'Review the canonical pipeline.',
    })).toMatchObject({ ok: true, changed: true })
    expect(updateFigmaWorkspaceAutoLayoutField(document, {
      nodeId: 'workspaceHeroActions',
      field: 'distribution',
      value: 'center',
    })).toMatchObject({ ok: true, changed: true })

    const projection = projectFigmaWorkspaceDesignDocument(document.read)

    expect(projection.textState.workspaceHeroText).toBe(
      'Review the canonical pipeline.',
    )
    expect(projection.state.workspaceHeroActions.distribution).toBe('center')
  })

  it('updates component peers atomically and restores them with one undo', () => {
    const document = createFigmaWorkspaceDesignDocument()

    expect(updateFigmaWorkspaceNumericField(document, {
      nodeId: 'workspaceStatRevenue',
      field: 'padding',
      value: 24,
    })).toMatchObject({ ok: true, changed: true })

    const edited = projectFigmaWorkspaceDesignDocument(document.read)

    expect([
      edited.state.workspaceStatRevenue.padding,
      edited.state.workspaceStatConversion.padding,
      edited.state.workspaceStatTickets.padding,
    ]).toEqual([24, 24, 24])
    expect(document.undo()).toBe(true)

    const restored = projectFigmaWorkspaceDesignDocument(document.read)

    expect([
      restored.state.workspaceStatRevenue.padding,
      restored.state.workspaceStatConversion.padding,
      restored.state.workspaceStatTickets.padding,
    ]).toEqual([14, 14, 14])
    expect(document.undo()).toBe(false)
  })

  it('groups continuous numeric and auto-layout edits when requested', () => {
    const document = createFigmaWorkspaceDesignDocument()

    updateFigmaWorkspaceNumericField(document, {
      nodeId: 'workspaceHero',
      field: 'gap',
      value: 28,
      historyGroup: 'drag:workspaceHero:gap',
    })
    updateFigmaWorkspaceNumericField(document, {
      nodeId: 'workspaceHero',
      field: 'gap',
      value: 32,
      historyGroup: 'drag:workspaceHero:gap',
    })

    expect(document.undo()).toBe(true)
    expect(projectFigmaWorkspaceDesignDocument(document.read)
      .state.workspaceHero.gap).toBe(24)
    expect(document.undo()).toBe(false)
  })

  it('owns the workspace frame and applies viewport presets through history', () => {
    const document = createFigmaWorkspaceDesignDocument()
    const initial = projectFigmaWorkspaceDesignDocument(document.read)

    expect(initial.frame).toEqual({
      x: 40,
      y: 76,
      width: 1280,
      height: 800,
      rotation: 0,
      widthMode: 'fixed',
      heightMode: 'content',
      overflow: 'scroll',
    })
    expect(initial.sectionViewport).toEqual({
      frameMode: 'page',
      h: 800,
      overflow: 'scroll',
      w: 1280,
    })

    updateFigmaWorkspaceFrame(document, {
      heightMode: 'fixed',
      overflow: 'clip',
    })
    applyFigmaWorkspaceFramePreset(document, { w: 768, h: 1024 })

    const updated = projectFigmaWorkspaceDesignDocument(document.read)

    expect(updated.frame).toMatchObject({
      width: 768,
      height: 1024,
      heightMode: 'fixed',
      overflow: 'clip',
    })
    expect(updated.sectionViewport).toEqual({
      frameMode: 'mock',
      h: 1024,
      overflow: 'clip',
      w: 768,
    })
  })

  it('rejects projections that would need legacy defaults', () => {
    const snapshot = structuredClone(
      FIGMA_WORKSPACE_DESIGN_DOCUMENT_SNAPSHOT,
    ) as DesignDocumentSnapshot
    const hero = snapshot.nodes.find((node) => node.id === 'workspaceHero')

    if (!hero) {
      throw new Error('Missing test fixture node')
    }

    const invalidSnapshot = {
      ...snapshot,
      nodes: snapshot.nodes.map((node) => node === hero
        ? {
            ...node,
            layout: Object.fromEntries(
              Object.entries(node.layout).filter(([field]) => field !== 'gap'),
            ),
          }
        : node),
    }

    expect(() => projectFigmaWorkspaceDesignDocument(invalidSnapshot))
      .toThrow('Invalid Figma workspace numeric field: gap')
  })

  it('provides stable parent, root, depth, and component data', () => {
    const projection = projectFigmaWorkspaceDesignDocument(
      FIGMA_WORKSPACE_DESIGN_DOCUMENT_SNAPSHOT,
    )

    expect(projection.parentIdByNodeId.workspaceDealTwoTitle)
      .toBe('workspaceDealTwo')
    expect(projection.rootIdByNodeId.workspaceDealTwoTitle)
      .toBe('workspacePage')
    expect(projection.depthByNodeId.workspaceDealTwoTitle).toBe(6)
    expect(projection.componentBindingByNodeId.workspaceHeroTitle).toBeNull()
  })

  it('renders workspace structure and intrinsic tags from the current projection', () => {
    const snapshot = structuredClone(
      FIGMA_WORKSPACE_DESIGN_DOCUMENT_SNAPSHOT,
    ) as DesignDocumentSnapshot
    const changedSnapshot = {
      ...snapshot,
      nodes: snapshot.nodes.map((node) => {
        if (node.id === 'workspacePage') {
          return { ...node, children: [...node.children].reverse() }
        }

        if (node.id === 'workspaceSearch') {
          return {
            ...node,
            definition: { kind: 'intrinsic' as const, id: 'label' },
          }
        }

        return node
      }),
    }
    const projection = projectFigmaWorkspaceDesignDocument(changedSnapshot)
    const markup = renderWorkspaceSurface(projection)

    expect(markup.indexOf('data-figma-dom-node="workspaceMain"'))
      .toBeLessThan(markup.indexOf('data-figma-dom-node="workspaceSidebar"'))
    expect(markup).toMatch(
      /<label[^>]*data-figma-dom-node="workspaceSearch"/,
    )
  })

  it('resolves workspace parent layout from the projected read model', () => {
    const snapshot = structuredClone(
      FIGMA_WORKSPACE_DESIGN_DOCUMENT_SNAPSHOT,
    ) as DesignDocumentSnapshot
    const movedSnapshot = {
      ...snapshot,
      nodes: snapshot.nodes.map((node) => {
        if (node.id === 'workspacePage') {
          return {
            ...node,
            children: node.children.filter((childId) =>
              childId !== 'workspaceMain'),
          }
        }

        if (node.id === 'workspaceSidebar') {
          return { ...node, children: [...node.children, 'workspaceMain'] }
        }

        return node
      }),
    }
    const defaultMain = requireRenderedNodeOpeningTag(
      renderWorkspaceSurface(projectFigmaWorkspaceDesignDocument(snapshot)),
      'main',
      'workspaceMain',
    )
    const movedMain = requireRenderedNodeOpeningTag(
      renderWorkspaceSurface(projectFigmaWorkspaceDesignDocument(
        movedSnapshot,
      )),
      'main',
      'workspaceMain',
    )

    expect(defaultMain).toContain('flex-grow:1')
    expect(movedMain).not.toContain('flex-grow:1')
  })
})

function renderWorkspaceSurface(
  projection: ReturnType<typeof projectFigmaWorkspaceDesignDocument>,
) {
  return renderToStaticMarkup(createElement(FigmaCloneDomEditSurface, {
    isSectionSelected: false,
    readModel: createFigmaCloneDomReadModel(projection.tree),
    rootId: 'workspacePage',
    sectionViewport: projection.sectionViewport,
    selectedNodeId: null,
    state: projection.state as FigmaCloneDomEditState,
    textState: projection.textState,
    workspaceDefinitionByNodeId: projection.definitionByNodeId,
    onChangeText: () => {},
    onSelectNode: () => {},
    onSelectSection: () => {},
  }))
}

function requireRenderedNodeOpeningTag(
  markup: string,
  intrinsic: string,
  nodeId: string,
) {
  const match = markup.match(new RegExp(
    '<' + intrinsic + '[^>]*data-figma-dom-node="' + nodeId + '"[^>]*>',
  ))

  if (!match) {
    throw new Error('Missing rendered workspace node: ' + nodeId)
  }

  return match[0]
}
