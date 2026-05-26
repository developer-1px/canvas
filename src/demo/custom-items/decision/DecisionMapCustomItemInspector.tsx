import type { KeyboardEvent } from 'react'
import type {
  CanvasAppInspectorPanel,
  CanvasAppInspectorPanelContext,
  CanvasCustomItem,
} from '../../../canvas'
import {
  DECISION_STATUSES,
  getDecisionStatus,
  getDecisionText,
  isDecisionItem,
  isDecisionStatus,
  replaceDecisionItem,
} from './DecisionMapCustomItemModel'
import { DECISION_STATUS_STYLES } from './DecisionMapCustomItemStyles'

export const decisionInspectorPanel: CanvasAppInspectorPanel = {
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
