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
    const peers = editor.read.componentPeers(node.id)

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
          {peers.map((peer) => (
            <button
              aria-pressed={peer.id === node.id}
              key={peer.id}
              type="button"
              onClick={() => editor.commands.execute({
                type: 'selection.replace',
                nodeId: peer.id,
              })}
            >
              {peer.label}
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
