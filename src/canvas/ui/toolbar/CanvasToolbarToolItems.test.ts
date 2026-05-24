import { describe, expect, it } from 'vitest'
import { createCanvasAffordanceConfig } from '../../engine'
import { getCanvasToolbarToolItems } from './CanvasToolbarToolItems'

describe('CanvasToolbarToolItems', () => {
  it('builds builtin tool items in stable order and appends custom tools', () => {
    expect(getCanvasToolbarToolItems({
      config: createCanvasAffordanceConfig(),
      customTools: [
        {
          ariaLabel: 'Risk tool',
          id: 'custom:risk',
          label: '!',
          title: 'Risk',
        },
      ],
      tool: 'custom:risk',
    })).toEqual([
      { active: false, kind: 'builtin-tool', tool: 'select' },
      { active: false, kind: 'builtin-tool', tool: 'pan' },
      { active: false, kind: 'builtin-tool', tool: 'sticky' },
      { active: false, kind: 'builtin-tool', tool: 'section' },
      { active: false, kind: 'builtin-tool', tool: 'rect' },
      { active: false, kind: 'builtin-tool', tool: 'text' },
      { active: false, kind: 'builtin-tool', tool: 'comment' },
      { active: false, kind: 'builtin-tool', tool: 'marker' },
      { active: false, kind: 'builtin-tool', tool: 'highlight' },
      { active: false, kind: 'builtin-tool', tool: 'eraser' },
      { active: false, kind: 'builtin-tool', tool: 'laser' },
      { active: false, kind: 'builtin-tool', tool: 'arrow' },
      {
        active: true,
        ariaLabel: 'Risk tool',
        kind: 'custom-tool',
        label: '!',
        title: 'Risk',
        tool: 'custom:risk',
      },
    ])
  })

  it('honors builtin tool feature toggles', () => {
    expect(getCanvasToolbarToolItems({
      config: createCanvasAffordanceConfig({
        tools: {
          marker: false,
          pan: false,
        },
      }),
      customTools: [],
      tool: 'select',
    })).toEqual([
      { active: true, kind: 'builtin-tool', tool: 'select' },
      { active: false, kind: 'builtin-tool', tool: 'sticky' },
      { active: false, kind: 'builtin-tool', tool: 'section' },
      { active: false, kind: 'builtin-tool', tool: 'rect' },
      { active: false, kind: 'builtin-tool', tool: 'text' },
      { active: false, kind: 'builtin-tool', tool: 'comment' },
      { active: false, kind: 'builtin-tool', tool: 'highlight' },
      { active: false, kind: 'builtin-tool', tool: 'eraser' },
      { active: false, kind: 'builtin-tool', tool: 'laser' },
      { active: false, kind: 'builtin-tool', tool: 'arrow' },
    ])
  })
})
