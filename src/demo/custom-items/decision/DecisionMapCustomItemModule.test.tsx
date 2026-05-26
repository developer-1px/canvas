import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import {
  createCanvasAppAssembly,
  type CanvasAppCustomCommandContext,
  type CanvasAppItemsChange,
  type CanvasCustomItem,
} from '../../../canvas'
import DECISION_MAP_CUSTOM_ITEM_MODULE from './DecisionMapCustomItemModule'

describe('DecisionMapCustomItemModule', () => {
  it('assembles a product-owned item type through the public custom module seam', () => {
    const assembly = createCanvasAppAssembly({
      customItemModules: [DECISION_MAP_CUSTOM_ITEM_MODULE],
      initialItems: [createDecisionItem()],
    })
    const created = assembly.customCreationTools[0]?.createItem({
      createId: (prefix) => `${prefix}-1`,
      currentWorld: { x: 220, y: 180 },
      moved: false,
      startWorld: { x: 160, y: 120 },
    })

    expect(assembly.customCommands.map((command) => command.id)).toEqual([
      'decide-decision',
    ])
    expect(assembly.customCreationTools.map((tool) => tool.id)).toEqual([
      'decision',
    ])
    expect(created).toEqual({
      id: 'decision-1',
      type: 'custom',
      kind: 'decision',
      presentation: 'decision-node',
      title: 'Decision',
      x: 160,
      y: 120,
      w: 220,
      h: 112,
      data: {
        option: 'Option A',
        status: 'proposed',
      },
    })
    expect(assembly.customItemValidators.decision(createDecisionItem())).toBe(
      true,
    )
    expect(assembly.customItemValidators.decision({
      ...createDecisionItem(),
      data: { option: 'Option A', status: 'unknown' },
    })).toBe(false)
    expect(assembly.customItemRenderers['decision-node']).toBe(
      DECISION_MAP_CUSTOM_ITEM_MODULE.renderItem,
    )
  })

  it('renders a compact decision node without canvas-internal knowledge', () => {
    const markup = renderToStaticMarkup(
      <svg>
        {DECISION_MAP_CUSTOM_ITEM_MODULE.renderItem({
          item: createDecisionItem(),
        })}
      </svg>,
    )

    expect(markup).toContain('class="demo-decision-node"')
    expect(markup).toContain('data-decision-status="proposed"')
    expect(markup).toContain('Decision')
    expect(markup).toContain('Proposed')
    expect(markup).toContain('Option A')
  })

  it('commits product-specific status changes from a custom command', () => {
    const command = DECISION_MAP_CUSTOM_ITEM_MODULE.customCommands?.[0]
    let committedChange: CanvasAppItemsChange | null = null
    const context = {
      commitItemsChange: (change: CanvasAppItemsChange) => {
        committedChange = change
        return true
      },
      commitSelection: () => true,
      createId: (prefix: string) => `${prefix}-1`,
      items: [createDecisionItem()],
      selection: ['decision-1'],
      setEditing: vi.fn(),
      viewport: { x: 0, y: 0, scale: 1 },
    } satisfies CanvasAppCustomCommandContext

    expect(command?.isEnabled?.(context)).toBe(true)

    command?.run(context)

    expect(committedChange).toMatchObject({
      type: 'replace-changed',
      items: [
        {
          id: 'decision-1',
          data: {
            option: 'Option A',
            status: 'decided',
          },
        },
      ],
    })
  })

  it('exposes a product inspector panel for decision metadata', () => {
    const panel = DECISION_MAP_CUSTOM_ITEM_MODULE.inspectorPanels?.[0]
    const decision = createDecisionItem()
    const context = {
      bounds: decision,
      commitItemsChange: () => true,
      disabled: false,
      items: [decision],
      label: 'Decision',
      selectedItems: [decision],
      selection: [decision.id],
    }

    expect(panel?.isVisible?.(context)).toBe(true)

    const markup = renderToStaticMarkup(<>{panel?.render(context)}</>)

    expect(markup).toContain('class="demo-decision-inspector"')
    expect(markup).toContain('Title')
    expect(markup).toContain('Status')
    expect(markup).toContain('Option')
  })
})

function createDecisionItem(): CanvasCustomItem {
  return {
    id: 'decision-1',
    type: 'custom',
    kind: 'decision',
    presentation: 'decision-node',
    title: 'Decision',
    x: 80,
    y: 120,
    w: 220,
    h: 112,
    data: {
      option: 'Option A',
      status: 'proposed',
    },
  }
}
