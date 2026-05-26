import {
  defineCanvasAppCustomItemModule,
} from '../../../canvas'
import { decideDecisionCommand } from './DecisionMapCustomItemCommand'
import { decisionInspectorPanel } from './DecisionMapCustomItemInspector'
import { decisionItemRenderer } from './DecisionMapCustomItemRenderer'
import { decisionTool } from './DecisionMapCustomItemTool'
import { isDecisionStatus } from './DecisionMapCustomItemModel'
import './DecisionMapCustomItemModule.css'

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
