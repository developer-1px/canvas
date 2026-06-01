import type { CanvasAppCustomItemModule } from '../../canvas'
import { METRIC_WIDGET_MODULE } from '../widget-catalog/MetricWidget'
import { TODO_WIDGET_MODULE } from '../widget-catalog/TodoWidget'

export const DEMO_CUSTOM_ITEM_MODULES: readonly CanvasAppCustomItemModule[] = [
  METRIC_WIDGET_MODULE,
  TODO_WIDGET_MODULE,
]
