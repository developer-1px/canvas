import type {
  CanvasComponentBinding,
} from '../../../host'
import type {
  CanvasAppInspectorPanel,
  CanvasAppInspectorPanelContext,
} from '../../extensions/inspector-panels'

export type CanvasComponentInspectorPanelModel = CanvasComponentBinding & {
  isRootItem: boolean
}

export const CANVAS_COMPONENT_INSPECTOR_PANEL: CanvasAppInspectorPanel = {
  id: 'component-binding',
  isVisible: (context) =>
    getCanvasComponentInspectorPanelModel(context) !== null,
  render: (context) => {
    const model = getCanvasComponentInspectorPanelModel(context)

    return model ? renderCanvasComponentInspectorPanel(model) : null
  },
}

export function getCanvasComponentInspectorPanelModel(
  context: CanvasAppInspectorPanelContext,
): CanvasComponentInspectorPanelModel | null {
  if (context.selection.length !== 1) {
    return null
  }

  const [itemId] = context.selection

  if (!itemId) {
    return null
  }

  const binding = context.componentDefinitionRegistry.getBinding(itemId)

  return binding
    ? Object.freeze({
        ...binding,
        isRootItem: context.componentDefinitionRegistry.isRootItem(itemId),
      })
    : null
}

function renderCanvasComponentInspectorPanel(
  model: CanvasComponentInspectorPanelModel,
) {
  return (
    <section
      aria-label="Component binding"
      className="component-inspector"
    >
      <dl className="component-inspector-rows">
        <div className="component-inspector-row">
          <dt>Component</dt>
          <dd>{model.componentLabel}</dd>
        </div>
        <div className="component-inspector-row">
          <dt>Instance</dt>
          <dd>{model.instanceLabel}</dd>
        </div>
        <div className="component-inspector-row">
          <dt>Slot</dt>
          <dd>{model.slotId}</dd>
        </div>
        <div className="component-inspector-row">
          <dt>Root</dt>
          <dd>{model.isRootItem ? 'Yes' : 'No'}</dd>
        </div>
        <div className="component-inspector-row">
          <dt>Linked</dt>
          <dd>{model.slotItemIds.length}</dd>
        </div>
      </dl>
      <ol aria-label="Linked items" className="component-inspector-items">
        {model.slotItemIds.map((itemId) => (
          <li key={itemId}>{itemId}</li>
        ))}
      </ol>
      {model.syncDescription ? (
        <p className="component-inspector-sync">
          {model.syncDescription}
        </p>
      ) : null}
    </section>
  )
}
