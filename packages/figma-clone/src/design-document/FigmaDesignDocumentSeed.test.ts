import { describe, expect, it } from 'vitest'

import {
  createFigmaDesignDocument,
  FIGMA_DESIGN_DOCUMENT_SNAPSHOT,
  FIGMA_HOME_COMPONENT_METADATA,
  FIGMA_WIDGET_DEFINITION_ID,
  FIGMA_WIDGET_NODE_ID,
  FIGMA_WORKSPACE_DESIGN_DOCUMENT_SNAPSHOT,
} from '.'

const canonicalSeedModules = import.meta.glob([
  './FigmaDesignDocumentSeedTypes.ts',
  './FigmaHomeDesignDocumentSeed.ts',
  './FigmaWidgetDesignDocumentSeed.ts',
  './FigmaWorkspaceComponentMetadata.ts',
  './FigmaWorkspaceDesignDocumentSeed.ts',
  '../direct-dom/FigmaWorkspaceReactDefinitions.ts',
  '../direct-dom/FigmaWorkspaceReactDefinitionViews.tsx',
], {
  eager: true,
  import: 'default',
  query: '?raw',
}) as Record<string, string>

describe('Figma canonical product document', () => {
  it('seeds every exposed product root in one immutable document', () => {
    const snapshot = FIGMA_DESIGN_DOCUMENT_SNAPSHOT
    const nodeIds = snapshot.nodes.map((node) => node.id)

    expect(snapshot.roots).toEqual([
      FIGMA_WIDGET_NODE_ID,
      'workspacePage',
      'homePage',
    ])
    expect(snapshot.nodes).toHaveLength(144)
    expect(new Set(nodeIds).size).toBe(snapshot.nodes.length)
    expect(snapshot.nodes.filter((node) => node.id.startsWith('workspace')))
      .toHaveLength(FIGMA_WORKSPACE_DESIGN_DOCUMENT_SNAPSHOT.nodes.length)
    expect(snapshot.nodes.filter((node) => node.id.startsWith('home')))
      .toHaveLength(78)
    expect(Object.isFrozen(snapshot)).toBe(true)
    expect(Object.isFrozen(snapshot.nodes)).toBe(true)
  })

  it('owns the existing workspace, homepage, and widget frame positions', () => {
    const document = createFigmaDesignDocument()

    expect(document.read.node('workspacePage')?.frame).toEqual({
      x: 40,
      y: 76,
      width: 1280,
      height: 800,
      rotation: 0,
      widthMode: 'fixed',
      heightMode: 'content',
      overflow: 'scroll',
    })
    expect(document.read.node('homePage')?.frame).toEqual({
      x: 1528,
      y: 76,
      width: 1280,
      height: 800,
      rotation: 0,
      widthMode: 'fixed',
      heightMode: 'content',
      overflow: 'scroll',
    })
    expect(document.read.node(FIGMA_WIDGET_NODE_ID)?.frame).toEqual({
      x: -360,
      y: 128,
      width: 280,
      height: 176,
      rotation: 0,
      widthMode: 'fixed',
      heightMode: 'fixed',
      overflow: 'visible',
    })
  })

  it('preserves homepage identity, authored layout, text, and CSS classes', () => {
    const document = createFigmaDesignDocument()
    const home = document.read.node('homePage')
    const hero = document.read.node('homeHero')
    const title = document.read.node('homeHeroTitle')
    const footer = document.read.node('homeFooter')

    expect(home).toMatchObject({
      label: 'Editorial homepage',
      definition: { kind: 'intrinsic', id: 'section' },
      children: ['homeHeader', 'homeMain'],
      props: { className: 'figma-dom-home' },
      layout: {
        h: 1736,
        heightMode: 'hug',
        w: 1180,
        widthMode: 'fill',
      },
    })
    expect(hero).toMatchObject({
      props: {
        className: 'figma-dom-home__hero',
        position: 'relative',
      },
      layout: { gap: 30, padding: 84, w: 1180 },
    })
    expect(title).toMatchObject({
      definition: { kind: 'intrinsic', id: 'h1' },
      text: 'The homepage is an article before it is an interface',
    })
    expect(footer).toMatchObject({
      definition: { kind: 'intrinsic', id: 'footer' },
      props: { className: 'figma-dom-home__footer' },
    })
  })

  it('binds homepage component instances and registers the widget node', () => {
    const document = createFigmaDesignDocument()

    expect(FIGMA_HOME_COMPONENT_METADATA).toHaveLength(1)
    expect(document.read.node('homeByline')).toMatchObject({
      definition: { kind: 'component', id: 'home-meta-card' },
      component: {
        definitionId: 'home-meta-card',
        instanceId: 'homeByline',
        slotId: 'root',
      },
    })
    expect(document.read.componentPeers('homeBylineValue').map(
      (node) => node.id,
    )).toEqual([
      'homeBylineValue',
      'homeCategoryValue',
      'homeReadTimeValue',
    ])
    expect(document.read.node(FIGMA_WIDGET_NODE_ID)).toMatchObject({
      label: 'React widget',
      definition: {
        kind: 'widget',
        id: FIGMA_WIDGET_DEFINITION_ID,
      },
      props: {
        delta: '+12.4%',
        label: 'Activation',
        value: '84.2',
      },
    })
  })

  it('keeps canonical seed and React definitions off the legacy runtime', () => {
    const source = Object.values(canonicalSeedModules).join('\n')

    expect(Object.keys(canonicalSeedModules)).toHaveLength(7)
    expect(source).not.toContain('FigmaCloneDomEditModel')
    expect(source).not.toContain('/dom-edit/')
    expect(source).not.toMatch(/\bCanvasItem\b/)
    expect(source).not.toContain('foreignObject')
  })
})
