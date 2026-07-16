import type {
  DesignJSONObject,
  ReactRegisteredDesignInspectorProps,
} from '@interactive-os/canvas/react-design'

export type FigmaComponentDefinitionInspectorMetadata = {
  readonly id: string
  readonly instances: readonly {
    readonly id: string
    readonly label: string
  }[]
  readonly label: string
  readonly syncDescription: string
}

export function createFigmaComponentDefinitionInspector(
  metadata: FigmaComponentDefinitionInspectorMetadata,
) {
  return function FigmaComponentDefinitionInspector({
    editor,
    node,
  }: ReactRegisteredDesignInspectorProps<DesignJSONObject>) {
    const binding = node.component

    if (!binding || !editor) {
      return null
    }

    const instance = metadata.instances.find((candidate) =>
      candidate.id === binding.instanceId)
    const linkedInstances = editor.read.componentInstances(
      binding.definitionId,
    ).flatMap((candidate) => {
      const slot = candidate.slots.find((candidateSlot) =>
        candidateSlot.slotId === binding.slotId)

      return slot ? [{ instance: candidate, node: slot.node }] : []
    })

    return (
      <section className="figma-panel-section figma-panel-section--component">
        <h2>Component</h2>
        <dl className="figma-context-meta">
          <div>
            <dt>Set</dt>
            <dd>{metadata.label}</dd>
          </div>
          <div>
            <dt>Instance</dt>
            <dd>{instance?.label ?? binding.instanceId}</dd>
          </div>
          <div>
            <dt>Slot</dt>
            <dd>{binding.slotId}</dd>
          </div>
        </dl>
        <div
          aria-label={`${metadata.label} synced instances`}
          className="figma-component-instances"
        >
          {linkedInstances.map(({ instance: linkedInstance, node: peer }) => (
            <button
              aria-pressed={linkedInstance.instanceId === binding.instanceId}
              key={linkedInstance.instanceId}
              type="button"
              onClick={() => editor.commands.execute({
                type: 'selection.replace',
                nodeId: peer.id,
              })}
            >
              {metadata.instances.find((candidate) =>
                candidate.id === linkedInstance.instanceId)?.label ??
                peer.label}
            </button>
          ))}
        </div>
        <p className="figma-component-sync-note">
          {metadata.syncDescription}
        </p>
      </section>
    )
  }
}
