# ADR 0004: Canvas Document Sync Adapter

## Status

Accepted

## Context

ADR 0002 split collaboration into three concerns:

1. document sync for persistent item state,
2. presence sync for ephemeral overlays,
3. sharing and permissions for Host-owned policy.

Presence already enters the package through `CanvasAppPresenceProvider`, and
policy already enters through `CanvasAppCapabilitySnapshot`. Document sync still
needed a concrete seam so Host apps can attach Yjs, Automerge, server patches,
or another replicated store without moving CRDT, transport, account, or conflict
policy into Core, Foundation, or Engine.

The current local document path is Host-owned: `CanvasDocumentController`
manages item commits, history, selection, clipboard, and text search behind App
workflow contracts. A sync seam must preserve that ownership and must not turn
Engine command or gesture modules into document persistence code.

## Decision

1. The document sync seam sits at the App collaboration assembly boundary, next
   to `presenceProvider`, and is implemented by the Host. It is a document store
   adapter, not a Core/Engine/Firebase/CRDT abstraction.
2. The minimum adapter slots are `getItems`, `commitChange`, and `subscribe`.
   `getItems` returns the current Host-owned item tree snapshot. `commitChange`
   attempts to apply a local `CanvasAppItemsChange` and returns `false` on
   containment failure. `subscribe` reports local and remote item snapshots and
   returns an unsubscribe callback.
3. Remote changes do not create local undo/redo history entries. Local history
   remains owned by the Host document controller. A Host may keep separate CRDT
   or server history behind the adapter, but the canvas package does not model
   it.
4. If `commitChange` returns `false`, App workflow must keep the current state
   and must not throw. This matches the existing containment rule for invalid or
   rejected document mutations.
5. If no adapter is provided, the current local Host document controller path
   continues unchanged. The App must not inject a default no-op adapter because
   absence means the document sync seam is disabled.
6. Core, Foundation, and Engine must not import the adapter type or any
   collaboration transport concept. They continue to consume only headless
   geometry, scene, gesture, command, and viewport contracts.

## API Sketch

The follow-up implementation should extend
`src/canvas/app/workflow/CanvasAppCollaborationAssembly.ts` with these public
types. The import paths below use the current source layout.

```ts
import type { CanvasItem } from '../../entities'
import type {
  CanvasAppItemsChange,
} from '../workspace/document/CanvasAppDocumentContracts'

export type CanvasDocumentSyncOrigin = 'local' | 'remote'

export type CanvasDocumentSyncEvent = Readonly<{
  items: readonly CanvasItem[]
  origin: CanvasDocumentSyncOrigin
}>

export type CanvasDocumentSyncAdapter = Readonly<{
  getItems: () => readonly CanvasItem[]
  commitChange: (change: CanvasAppItemsChange) => boolean
  subscribe: (
    listener: (event: CanvasDocumentSyncEvent) => void,
  ) => () => void
}>

export type CanvasAppCollaborationAssemblyInput = {
  presenceProvider?: CanvasAppPresenceProvider
  documentSyncAdapter?: CanvasDocumentSyncAdapter
}
```

## Consequences

- Host apps can bind the canvas package to CRDT, OT, server patch, or polling
  systems without the package choosing a backend or conflict algorithm.
- Local undo/redo remains deterministic because remote events are explicitly
  excluded from local history.
- Presence stays ephemeral and renderer-facing, while document sync is
  persistent and Host-owned.
- Capability policy remains separate. A Host can deny editing by capability
  snapshot before any sync commit is attempted.
- The reusable package boundary remains intact: Core, Foundation, and Engine
  keep running without React, DOM, transport, account, or persistence imports.

## Follow-up Work

- Add the adapter types to `CanvasAppCollaborationAssembly.ts`.
- Extend App workflow only after there is a narrow implementation issue for
  document sync behavior.
- Add tests proving that remote events do not enter local undo/redo history and
  that `commitChange: false` is contained.
