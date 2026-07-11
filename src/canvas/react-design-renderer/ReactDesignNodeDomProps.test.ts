import { describe, expect, it } from 'vitest'

import type { DesignNode } from '../design-document'
import { createReactDesignNodeDomProps } from './ReactDesignNodeDomProps'

describe('createReactDesignNodeDomProps', () => {
  it('passes only safe authored HTML attributes with primitive values', () => {
    const node = createNode({
      className: 'hero',
      title: 'Pipeline',
      id: 'hero-id',
      role: 'region',
      tabIndex: 2,
      type: 'button',
      'data-state': 'active',
      'data-count': 3,
      'aria-hidden': false,
      key: 'unsafe-key',
      ref: 'unsafe-ref',
      children: 'unsafe-children',
      style: { color: 'red' },
      dangerouslySetInnerHTML: { __html: '<script />' },
      onClick: 'unsafe-event',
      'data-object': { unsafe: true },
      'aria-null': null,
      unknown: 'unsafe-attribute',
    })

    expect(createReactDesignNodeDomProps(node)).toEqual({
      className: 'hero',
      title: 'Pipeline',
      id: 'hero-id',
      role: 'region',
      tabIndex: 2,
      type: 'button',
      'data-state': 'active',
      'data-count': 3,
      'aria-hidden': false,
      style: {},
    })
  })

  it('consumes positioning and wrapping props as CSS without leaking attributes', () => {
    const node = {
      ...createNode({
        position: 'absolute',
        flexWrap: 'wrap',
        'data-position': 'authored',
      }),
      layout: { x: 24, y: -8 },
    }

    expect(createReactDesignNodeDomProps(node)).toEqual({
      'data-position': 'authored',
      style: {
        flexWrap: 'wrap',
        left: 24,
        position: 'absolute',
        top: -8,
      },
    })
  })

  it('maps serializable auto-layout and style fields to browser CSS', () => {
    const node = {
      ...createNode({}),
      children: ['child'],
      layout: {
        align: 'center',
        alignSelf: 'end',
        direction: 'row',
        distribution: 'space-between',
        gap: 12,
        h: 48,
        heightMode: 'hug',
        margin: 4,
        order: 2,
        paddingBottom: 8,
        paddingLeft: 10,
        paddingRight: 12,
        paddingTop: 6,
        w: 240,
        widthMode: 'fill',
      },
      style: { opacity: 75, radius: 8, rotation: 15 },
    }

    expect(createReactDesignNodeDomProps(node).style).toEqual({
      alignItems: 'center',
      alignSelf: 'flex-end',
      borderRadius: 8,
      display: 'flex',
      flexDirection: 'row',
      flexShrink: 0,
      gap: 12,
      height: 'fit-content',
      justifyContent: 'space-between',
      margin: 4,
      minWidth: 0,
      opacity: 0.75,
      order: 2,
      paddingBottom: 8,
      paddingLeft: 10,
      paddingRight: 12,
      paddingTop: 6,
      transform: 'rotate(15deg)',
      width: '100%',
    })
  })

  it('maps frame placement and applies overflow only to fixed viewports', () => {
    const node = {
      ...createNode({}),
      frame: {
        x: 40,
        y: 76,
        width: 1280,
        height: 800,
        rotation: -5,
        widthMode: 'fixed' as const,
        heightMode: 'content' as const,
        overflow: 'clip' as const,
      },
    }

    expect(createReactDesignNodeDomProps(node).style).toEqual({
      height: 'fit-content',
      left: 40,
      overflow: 'visible',
      position: 'absolute',
      top: 76,
      transform: 'rotate(-5deg)',
      width: 1280,
    })
    expect(createReactDesignNodeDomProps({
      ...node,
      frame: {
        ...node.frame,
        heightMode: 'fixed',
      },
    }).style.overflow).toBe('hidden')
  })

  it('uses internal grid presentation props after inferred flex layout', () => {
    const node = {
      ...createNode({
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) max-content',
        gridTemplateRows: 'auto 1fr',
      }),
      children: ['first', 'second'],
      layout: { direction: 'row' },
    }
    const props = createReactDesignNodeDomProps(node)

    expect(props).not.toHaveProperty('display')
    expect(props).not.toHaveProperty('gridTemplateColumns')
    expect(props).not.toHaveProperty('gridTemplateRows')
    expect(props.style).toMatchObject({
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 1fr) max-content',
      gridTemplateRows: 'auto 1fr',
    })
  })

  it('lets fill children share the main axis of an inferred flex parent', () => {
    const parent = {
      ...createNode({}),
      children: ['child'],
      layout: { direction: 'row' },
    }
    const child = {
      ...createNode({}),
      id: 'child',
      layout: {
        h: 48,
        heightMode: 'hug',
        w: 240,
        widthMode: 'fill',
      },
    }

    expect(createReactDesignNodeDomProps(child, parent).style).toMatchObject({
      flexBasis: 0,
      flexGrow: 1,
      flexShrink: 1,
      minWidth: 0,
      width: 0,
    })
  })

  it('preserves authored geometry for wrapping auto-layout and its children', () => {
    const parent = {
      ...createNode({ flexWrap: 'wrap' }),
      children: ['tag'],
      layout: {
        direction: 'row',
        gap: 8,
        h: 60,
        heightMode: 'hug',
        w: 220,
        widthMode: 'hug',
      },
    }
    const child = {
      ...createNode({}),
      id: 'tag',
      layout: {
        h: 26,
        heightMode: 'hug',
        w: 102,
        widthMode: 'hug',
      },
    }

    expect(createReactDesignNodeDomProps(parent).style).toMatchObject({
      flexWrap: 'wrap',
      height: 60,
      width: 220,
    })
    expect(createReactDesignNodeDomProps(child, parent).style).toMatchObject({
      height: 26,
      width: 102,
    })
  })
})

function createNode(props: DesignNode['props']): DesignNode {
  return {
    id: 'hero',
    label: 'Hero',
    definition: { kind: 'intrinsic', id: 'section' },
    children: [],
    props,
    text: null,
    layout: {},
    style: {},
    frame: null,
    component: null,
  }
}
