export type DesignNodeId = string

export type DesignJSONValue =
  | boolean
  | number
  | string
  | null
  | readonly DesignJSONValue[]
  | { readonly [key: string]: DesignJSONValue }

export type DesignJSONObject = {
  readonly [key: string]: DesignJSONValue
}

export type DesignNodeDefinition = {
  readonly kind: 'component' | 'intrinsic' | 'widget'
  readonly id: string
}

export type DesignNodeFrame = {
  readonly x: number
  readonly y: number
  readonly width: number
  readonly height: number
  readonly rotation: number
  readonly widthMode: 'content' | 'fixed'
  readonly heightMode: 'content' | 'fixed'
  readonly overflow: 'clip' | 'scroll' | 'visible'
}

export type DesignNodeComponentBinding = {
  readonly definitionId: string
  readonly instanceId: string
  readonly slotId: string
}

export type DesignNode = {
  readonly id: DesignNodeId
  readonly label: string
  readonly definition: DesignNodeDefinition
  readonly children: readonly DesignNodeId[]
  readonly props: DesignJSONObject
  readonly text: string | null
  readonly layout: DesignJSONObject
  readonly style: DesignJSONObject
  readonly frame: DesignNodeFrame | null
  readonly component: DesignNodeComponentBinding | null
}

export type DesignDocumentSnapshot = {
  readonly schemaVersion: 1
  readonly roots: readonly DesignNodeId[]
  readonly nodes: readonly DesignNode[]
}

export type DesignDocumentRead = {
  node(nodeId: DesignNodeId): DesignNode | null
  roots(): readonly DesignNode[]
  children(nodeId: DesignNodeId): readonly DesignNode[]
  ancestry(nodeId: DesignNodeId): readonly DesignNode[]
  componentPeers(nodeId: DesignNodeId): readonly DesignNode[]
}

export type DesignNodeUpdateValues = Partial<Pick<
  DesignNode,
  | 'component'
  | 'definition'
  | 'frame'
  | 'label'
  | 'layout'
  | 'props'
  | 'style'
  | 'text'
>>

export type DesignDocumentChange =
  | {
      readonly type: 'add'
      readonly parentId: DesignNodeId | null
      readonly index: number
      readonly node: DesignNode
    }
  | {
      readonly type: 'move'
      readonly nodeId: DesignNodeId
      readonly parentId: DesignNodeId | null
      readonly index: number
    }
  | {
      readonly type: 'remove'
      readonly nodeId: DesignNodeId
    }
  | {
      readonly type: 'update'
      readonly nodeId: DesignNodeId
      readonly values: DesignNodeUpdateValues
    }

export type DesignDocumentCommand = {
  readonly label: string
  readonly changes: readonly DesignDocumentChange[]
}

export type DesignDocumentCommandResult =
  | { readonly ok: true; readonly changed: boolean }
  | {
      readonly ok: false
      readonly code: 'invalid-command'
      readonly reason: string
    }

export type DesignDocument = {
  readonly snapshot: DesignDocumentSnapshot
  readonly read: DesignDocumentRead
  execute(command: DesignDocumentCommand): DesignDocumentCommandResult
  undo(): boolean
  redo(): boolean
  subscribe(listener: () => void): () => void
  serialize(): string
}
