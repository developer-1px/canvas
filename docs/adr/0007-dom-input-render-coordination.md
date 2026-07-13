# ADR 0007: DOM Input and Render Coordination

## Status

Provisional — accepted for browser dogfood, not a native IME or convergence claim.

## Context

ADR 0005 makes `DesignDocument` the authored source of truth and direct React
DOM its derived browser surface. ADR 0006 prevents a ready external document
change from running while `EditorEngine` preview owns uncommitted input. The
headless causal tracer intentionally retries in a microtask and does not prove
that React has committed either the local or external snapshot.

That gap matters for browser input. A canonical document publication can finish
synchronously while React is still rendering the previous snapshot. A raw DOM
selection can also point at an element that React is about to replace. Using
`DomProjection.revision()`, `EditorEngineSnapshot.revision`, a timer, animation
frame, or `ResizeObserver` as a render acknowledgement would mix unrelated
invalidation with actual React commit.

FigJam additionally committed `blur` during an active composition. That could
end the preview and unmount its textarea before the final composition input was
observed.

## Decision

1. `ReactDesignEditorRenderer` is the runtime-owned canonical render surface.
   It keeps the existing `ReactDesignRenderer` interface intact and
   acknowledges the immutable `DesignDocument.snapshot` and
   `EditorEngineSnapshot` identities from a parent layout effect after the
   renderer subtree DOM mutation and callback refs have committed. The editor
   snapshot identity invalidates old evidence; its revision number is not
   itself render evidence. The acknowledgement is a mounted render lease and
   is revoked by layout-effect cleanup.
2. `getReactDesignEditorExternalChangeHost(runtime)` exposes the browser-aware
   external change host without changing the existing `ReactDesignEditorRuntime`
   shape. It delegates publication ownership and the headless preview/mutation
   gate to `EditorEngineDocumentHost`, and additionally returns `host_not_ready`
   until the one canonical renderer lease acknowledges the current document
   and editor snapshot identities. A runtime has exactly one canonical render
   surface because its `DomProjection` registration is singular/latest-wins;
   a runtime that observes overlapping renderer mounts remains fail closed for
   the rest of its lifetime. Runtimes backed by a document without patch
   coordination remain usable when this additive capability is not requested.
3. A ready notification is delivered in a generation-checked microtask after
   the explicit layout-commit acknowledgement. The microtask is delivery
   scheduling, not the evidence of render completion. If the document snapshot
   changes while one listener applies an external change, remaining listeners
   do not run for the obsolete snapshot.
4. The required ordering is:

   ```text
   input preview owns browser edits
     -> local canonical commit
     -> local React DOM commit acknowledgement
     -> ready external change apply
     -> external React DOM commit acknowledgement
     -> selection correction
   ```

5. `ReactDesignTextSelection` stores text-control selection as stable design
   node id, UTF-16 anchor/focus offsets, and direction. It does not
   retain a DOM `Range` or element reference in the bookmark. Restore resolves
   the current element and succeeds only for the active ownership generation,
   unchanged focus generation, connected element, and current logical node.
   A body-focus gap is accepted only when the captured control was disconnected
   and the resolver now returns a different connected replacement. Focusing is
   revalidated before the range is written.
6. A React remount may focus the replacement control before its ref callback is
   visible to the resolver. That focus transition is reconciled only when the
   previously focused element becomes disconnected, no later focus event has
   intervened, and the resolver identifies the new target as the same active
   logical input.
7. FigJam composition blur is deferred in explicit `composing` and `settling`
   phases. `compositionend` starts a generation-checked 30 ms settling window;
   a later final input updates the existing `EditorEnginePreviewSession` first
   and restarts that window. New composition, preview-session replacement, or
   unmount invalidates the timer. This is a conservative browser event window,
   not render acknowledgement.
8. The browser causal tracer lives under `e2e/fixtures`. It may compose the
   SHA-pinned private causal inbox, but production `src/canvas/**` keeps no
   runtime dependency on unpublished json-document labs.

## Boundaries

- A React layout commit acknowledgement does not mean browser paint, font load,
  image decode, network completion, or asynchronous layout has settled.
- `DesignDocument` remains independent from DOM, React, focus, composition, and
  selection.
- `DomProjection` remains measurement and node-to-element runtime state. Its
  revision and subscription channel are not reused for render acknowledgement.
- The external change host does not choose CRDT, OT, transport, retry backoff,
  acknowledgement, persistence, or conflict policy.
- Text selection bookmarks currently cover native text controls. They preserve
  and clamp UTF-16 offsets across remount; they do not rebase offsets through a
  same-node text patch. A contenteditable adapter or patch-aware correction
  layer must define its own position mapping and boundary affinity semantics.
- Synthetic Chromium composition evidence verifies browser event-handler
  ordering, not real Korean/Japanese IME behavior across operating systems or
  Safari. Native IME verification remains required before an IME-safe claim.

## Consequences

- Figma and FigJam canonical routes use the runtime-owned renderer, so future
  external-change adapters can consume one render-aware host instead of wiring
  document, engine, projection, and React timing independently.
- A delayed change cannot run merely because a preview ended; the locally
  committed or reverted DOM must first be observed in a React commit.
- Selection correction cannot steal focus after the user moves to another
  control, deliberately blurs a still-connected editor, or a newer edit
  generation takes ownership.
- The headless causal tracer remains useful for deterministic document
  coordination, while the Chromium tracer provides separate evidence for DOM
  focus, remount, and selection behavior.
