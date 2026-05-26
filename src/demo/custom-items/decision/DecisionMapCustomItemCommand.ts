import type {
  CanvasAppCustomCommand,
  CanvasAppCustomCommandContext,
} from '../../../canvas'
import {
  findDecisionItem,
  replaceDecisionItem,
} from './DecisionMapCustomItemModel'

export const decideDecisionCommand: CanvasAppCustomCommand = {
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

function getSelectedDecisionItemFromCommand(
  context: CanvasAppCustomCommandContext,
) {
  if (context.selection.length !== 1) {
    return null
  }

  return findDecisionItem(context.items, context.selection[0])
}
