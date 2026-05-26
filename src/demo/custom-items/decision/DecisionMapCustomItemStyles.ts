import type { DecisionStatus } from './DecisionMapCustomItemModel'

export const DECISION_STATUS_STYLES = Object.freeze({
  proposed: Object.freeze({
    accent: '#2f6fed',
    fill: '#fff8cf',
    label: 'Proposed',
    stroke: '#17202a',
  }),
  decided: Object.freeze({
    accent: '#0f8f63',
    fill: '#e8f8eb',
    label: 'Decided',
    stroke: '#17202a',
  }),
  blocked: Object.freeze({
    accent: '#d94b45',
    fill: '#fff0ed',
    label: 'Blocked',
    stroke: '#17202a',
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
