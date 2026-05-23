import type { CanvasCommandId } from '../affordance/CanvasAffordanceTypes'
import type { CanvasAffordanceConfig } from '../affordance/CanvasAffordances'
import type { CanvasCommandAvailability } from './CanvasCommandTypes'
import {
  getCanvasCommandSelectionState,
  type CanvasCommandSelectionState,
} from './CanvasCommandSelectionRules'

type CanvasAvailableCommandId =
  keyof CanvasCommandAvailability & CanvasCommandId

type CanvasCommandAvailabilityRule =
  | keyof CanvasCommandSelectionState
  | 'always'
  | 'canRedo'
  | 'canUndo'
  | 'hasSelectedGroup'

type CanvasCommandAvailabilityRuleState =
  CanvasCommandSelectionState &
  Readonly<{
    always: boolean
    canRedo: boolean
    canUndo: boolean
    hasSelectedGroup: boolean
  }>

export type CanvasCommandAvailabilityInput = Readonly<{
  canRedo: boolean
  canUndo: boolean
  config: CanvasAffordanceConfig
  hasSelectedGroup: boolean
  selection: readonly string[]
}>

export type CanvasCommandUseInput = Readonly<{
  canRedo?: boolean
  canUndo?: boolean
  commandId: CanvasAvailableCommandId
  config: CanvasAffordanceConfig
  hasSelectedGroup?: boolean
  selection?: readonly string[]
}>

export const CANVAS_COMMAND_AVAILABILITY_RULES = Object.freeze({
  alignBottom: 'canAlign',
  alignCenter: 'canAlign',
  alignLeft: 'canAlign',
  alignMiddle: 'canAlign',
  alignRight: 'canAlign',
  alignTop: 'canAlign',
  bringForward: 'hasSelection',
  bringToFront: 'hasSelection',
  delete: 'hasSelection',
  duplicate: 'hasSelection',
  distributeHorizontal: 'canDistribute',
  distributeVertical: 'canDistribute',
  group: 'canGroup',
  lockSelection: 'hasSelection',
  redo: 'canRedo',
  selectAll: 'always',
  sendBackward: 'hasSelection',
  sendToBack: 'hasSelection',
  undo: 'canUndo',
  ungroup: 'hasSelectedGroup',
  unlockAll: 'always',
} satisfies Readonly<Record<CanvasAvailableCommandId, CanvasCommandAvailabilityRule>>)

const CANVAS_COMMAND_AVAILABILITY_COMMAND_IDS = Object.freeze(
  Object.keys(CANVAS_COMMAND_AVAILABILITY_RULES) as CanvasAvailableCommandId[],
)

export function getCanvasCommandAvailability({
  canRedo,
  canUndo,
  config,
  hasSelectedGroup,
  selection,
}: CanvasCommandAvailabilityInput): CanvasCommandAvailability {
  const ruleState = getCanvasCommandAvailabilityRuleState({
    canRedo,
    canUndo,
    hasSelectedGroup,
    selection,
  })
  const availability = {} as CanvasCommandAvailability

  for (const commandId of CANVAS_COMMAND_AVAILABILITY_COMMAND_IDS) {
    availability[commandId] = canUseCanvasCommandWithRuleState({
      commandId,
      config,
      ruleState,
    })
  }

  return availability
}

export function canUseCanvasCommand({
  canRedo = false,
  canUndo = false,
  commandId,
  config,
  hasSelectedGroup = false,
  selection = [],
}: CanvasCommandUseInput) {
  return canUseCanvasCommandWithRuleState({
    commandId,
    config,
    ruleState: getCanvasCommandAvailabilityRuleState({
      canRedo,
      canUndo,
      hasSelectedGroup,
      selection,
    }),
  })
}

function canUseCanvasCommandWithRuleState({
  commandId,
  config,
  ruleState,
}: {
  commandId: CanvasAvailableCommandId
  config: CanvasAffordanceConfig
  ruleState: CanvasCommandAvailabilityRuleState
}) {
  const rule = CANVAS_COMMAND_AVAILABILITY_RULES[commandId]

  return config.commands[commandId] && ruleState[rule]
}

function getCanvasCommandAvailabilityRuleState({
  canRedo,
  canUndo,
  hasSelectedGroup,
  selection,
}: Omit<CanvasCommandAvailabilityInput, 'config'>): CanvasCommandAvailabilityRuleState {
  return {
    ...getCanvasCommandSelectionState({ selection }),
    always: true,
    canRedo,
    canUndo,
    hasSelectedGroup,
  }
}
