import type { KeyboardEvent } from 'react'
import {
  defineCanvasAppCustomItemModule,
  type CanvasAppCustomCommand,
  type CanvasAppCustomCommandContext,
  type CanvasAppCustomItemModuleCreationTool,
  type CanvasAppCustomItemRendererStrategy,
  type CanvasAppInspectorPanel,
  type CanvasAppInspectorPanelContext,
  type CanvasCustomItem,
  type CanvasItem,
} from '../../../canvas'
import './DecisionMapCustomItemModule.css'

const DECISION_STATUSES = ['proposed', 'decided', 'blocked'] as const

type DecisionStatus = (typeof DECISION_STATUSES)[number]

const DECISION_STATUS_STYLES = Object.freeze({
  proposed: Object.freeze({
    accent: '#2563eb',
    fill: '#eff6ff',
    label: 'Proposed',
    stroke: '#60a5fa',
  }),
  decided: Object.freeze({
    accent: '#059669',
    fill: '#ecfdf5',
    label: 'Decided',
    stroke: '#34d399',
  }),
  blocked: Object.freeze({
    accent: '#dc2626',
    fill: '#fef2f2',
    label: 'Blocked',
    stroke: '#f87171',
  }),
} satisfies Record<
  DecisionStatus,
  {
    accent: string
    fill: string
    label: string
    stroke: string
  }
>)

const decisionItemRenderer: CanvasAppCustomItemRendererStrategy = ({ item }) => {
  const status = getDecisionStatus(item.data.status)
  const style = DECISION_STATUS_STYLES[status]
  const option = getDecisionText(item.data.option, 'Option A')

  return (
    <g className="demo-decision-node" data-decision-status={status}>
      <rect
        className="component-card"
        x={item.x}
        y={item.y}
        width={item.w}
        height={item.h}
        rx="8"
        fill={style.fill}
        stroke={style.stroke}
        vectorEffect="non-scaling-stroke"
      />
      <rect
        x={item.x}
        y={item.y}
        width="8"
        height={item.h}
        rx="4"
        fill={style.accent}
      />
      <foreignObject
        x={item.x + 10}
        y={item.y}
        width={Math.max(0, item.w - 10)}
        height={item.h}
      >
        <div className="demo-decision-node-text">
          <strong>{item.title}</strong>
          <span style={{ backgroundColor: style.accent }}>
            {style.label}
          </span>
          <small>{option}</small>
        </div>
      </foreignObject>
    </g>
  )
}

const decisionTool: CanvasAppCustomItemModuleCreationTool = {
  id: 'decision',
  ariaLabel: 'Decision node tool',
  label: 'D',
  title: 'Decision',
  statusLabel: 'Decision',
  shortcut: { key: 'd', shiftKey: true },
  createItem: ({ currentWorld, moved, startWorld }) => {
    const bounds = moved
      ? {
          x: Math.min(startWorld.x, currentWorld.x),
          y: Math.min(startWorld.y, currentWorld.y),
          w: Math.max(180, Math.abs(currentWorld.x - startWorld.x)),
          h: Math.max(96, Math.abs(currentWorld.y - startWorld.y)),
        }
      : {
          x: startWorld.x,
          y: startWorld.y,
          w: 220,
          h: 112,
        }

    return {
      title: 'Decision',
      data: {
        option: 'Option A',
        status: 'proposed',
      },
      ...bounds,
    }
  },
}

const decideDecisionCommand: CanvasAppCustomCommand = {
  id: 'decide-decision',
  label: 'Decide',
  title: 'Mark decision decided',
  isEnabled: (context) => getSelectedDecisionItemFromCommand(context) !== null,
  run: (context) => {
    const decision = getSelectedDecisionItemFromCommand(context)

    if (!decision) {
      return
    }

    const result = replaceDecisionItem(
      context.items,
      decision.id,
      (item) => ({
        ...item,
        data: {
          ...item.data,
          status: 'decided',
        },
      }),
    )

    if (!result.changed) {
      return
    }

    context.commitItemsChange({
      type: 'replace-changed',
      items: result.items,
    }, {
      before: context.selection,
      after: context.selection,
    })
  },
}

const decisionInspectorPanel: CanvasAppInspectorPanel = {
  id: 'decision-meta',
  isVisible: (context) => getSelectedDecisionItem(context) !== null,
  render: (context) => {
    const decision = getSelectedDecisionItem(context)

    return decision
      ? renderDecisionInspectorPanelContent({
          decision,
          disabled: context.disabled,
          onChangeOption: (option) => changeDecisionOption(context, option),
          onChangeStatus: (status) => changeDecisionStatus(context, status),
          onChangeTitle: (title) => changeDecisionTitle(context, title),
        })
      : null
  },
}

const DECISION_MAP_CUSTOM_ITEM_MODULE = defineCanvasAppCustomItemModule({
  id: 'decision',
  presentation: 'decision-node',
  renderItem: decisionItemRenderer,
  validateItem: (item) =>
    isDecisionStatus(item.data.status) &&
    typeof item.data.option === 'string',
  customCommands: [decideDecisionCommand],
  customCreationTools: [decisionTool],
  inspectorPanels: [decisionInspectorPanel],
})

export default DECISION_MAP_CUSTOM_ITEM_MODULE

function renderDecisionInspectorPanelContent({
  decision,
  disabled,
  onChangeOption,
  onChangeStatus,
  onChangeTitle,
}: {
  decision: CanvasCustomItem
  disabled: boolean
  onChangeOption: (option: string) => void
  onChangeStatus: (status: string) => void
  onChangeTitle: (title: string) => void
}) {
  const status = getDecisionStatus(decision.data.status)
  const option = getDecisionText(decision.data.option, 'Option A')

  return (
    <div className="demo-decision-inspector">
      <label>
        Title
        <input
          key={`title-${decision.title}`}
          type="text"
          defaultValue={decision.title}
          disabled={disabled}
          maxLength={80}
          onBlur={(event) => onChangeTitle(event.currentTarget.value)}
          onKeyDown={(event) =>
            handleDecisionInputKeyDown(event, decision.title)}
        />
      </label>
      <label>
        Status
        <select
          value={status}
          disabled={disabled}
          onChange={(event) => onChangeStatus(event.currentTarget.value)}
        >
          {DECISION_STATUSES.map((entry) => (
            <option key={entry} value={entry}>
              {DECISION_STATUS_STYLES[entry].label}
            </option>
          ))}
        </select>
      </label>
      <label>
        Option
        <input
          key={`option-${option}`}
          type="text"
          defaultValue={option}
          disabled={disabled}
          maxLength={80}
          onBlur={(event) => onChangeOption(event.currentTarget.value)}
          onKeyDown={(event) => handleDecisionInputKeyDown(event, option)}
        />
      </label>
    </div>
  )
}

function changeDecisionTitle(
  context: CanvasAppInspectorPanelContext,
  title: string,
) {
  return commitSelectedDecisionChange(context, (decision) => ({
    ...decision,
    title: getDecisionText(title, 'Decision'),
  }))
}

function changeDecisionStatus(
  context: CanvasAppInspectorPanelContext,
  status: string,
) {
  if (!isDecisionStatus(status)) {
    return false
  }

  return commitSelectedDecisionChange(context, (decision) => ({
    ...decision,
    data: {
      ...decision.data,
      status,
    },
  }))
}

function changeDecisionOption(
  context: CanvasAppInspectorPanelContext,
  option: string,
) {
  return commitSelectedDecisionChange(context, (decision) => ({
    ...decision,
    data: {
      ...decision.data,
      option: getDecisionText(option, 'Option A'),
    },
  }))
}

function commitSelectedDecisionChange(
  context: CanvasAppInspectorPanelContext,
  update: (decision: CanvasCustomItem) => CanvasCustomItem,
) {
  if (context.disabled) {
    return false
  }

  const decision = getSelectedDecisionItem(context)

  if (!decision) {
    return false
  }

  const result = replaceDecisionItem(
    context.items ?? context.selectedItems,
    decision.id,
    update,
  )

  if (!result.changed) {
    return false
  }

  return context.commitItemsChange({
    type: 'replace-changed',
    items: result.items,
  }, {
    before: context.selection,
    after: context.selection,
  })
}

function getSelectedDecisionItem(context: CanvasAppInspectorPanelContext) {
  if (context.selection.length !== 1 || context.selectedItems.length !== 1) {
    return null
  }

  const [item] = context.selectedItems

  return item && isDecisionItem(item) ? item : null
}

function getSelectedDecisionItemFromCommand(
  context: CanvasAppCustomCommandContext,
) {
  if (context.selection.length !== 1) {
    return null
  }

  return findDecisionItem(context.items, context.selection[0])
}

function findDecisionItem(
  items: readonly CanvasItem[],
  id: string,
): CanvasCustomItem | null {
  for (const item of items) {
    if (isDecisionItem(item) && item.id === id) {
      return item
    }

    if (item.type === 'group') {
      const match = findDecisionItem(item.children, id)

      if (match) {
        return match
      }
    }
  }

  return null
}

function replaceDecisionItem(
  items: readonly CanvasItem[],
  id: string,
  update: (decision: CanvasCustomItem) => CanvasCustomItem,
): {
  changed: boolean
  items: CanvasItem[]
} {
  let changed = false

  const nextItems = items.map((item): CanvasItem => {
    if (isDecisionItem(item) && item.id === id) {
      changed = true
      return update(item)
    }

    if (item.type === 'group') {
      const result = replaceDecisionItem(item.children, id, update)

      if (result.changed) {
        changed = true

        return {
          ...item,
          children: result.items,
        }
      }
    }

    return item
  })

  return {
    changed,
    items: nextItems,
  }
}

function isDecisionItem(item: unknown): item is CanvasCustomItem {
  return (
    typeof item === 'object' &&
    item !== null &&
    'type' in item &&
    item.type === 'custom' &&
    'kind' in item &&
    item.kind === 'decision'
  )
}

function isDecisionStatus(value: unknown): value is DecisionStatus {
  return (
    typeof value === 'string' &&
    (DECISION_STATUSES as readonly string[]).includes(value)
  )
}

function getDecisionStatus(value: unknown): DecisionStatus {
  return isDecisionStatus(value) ? value : 'proposed'
}

function getDecisionText(value: unknown, fallback: string) {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}

function handleDecisionInputKeyDown(
  event: KeyboardEvent<HTMLInputElement>,
  value: string,
) {
  if (event.key === 'Enter') {
    event.currentTarget.blur()
    return
  }

  if (event.key === 'Escape') {
    event.currentTarget.value = value
    event.currentTarget.blur()
  }
}
