# ADR 0006: Canonical DesignDocument Causal Host

## Status

Provisional — accepted for SHA-pinned dogfood, not a collaboration protocol.

## Context

ADR 0005 makes `DesignDocument` the only persistent authored source for Figma
and FigJam. Browser text input and pointer transforms first live in an
`EditorEngine` preview, then become one atomic DesignDocument command. React DOM
is a derived render and `DomProjection` is ephemeral runtime state.

A delayed external edit must therefore not commit while a preview still owns
uncommitted browser input. The private json-document causal inbox can defer a
ready envelope, but it previously required the complete internal
`JSONDocument`. Exposing that object would bypass DesignDocument graph
validation and widen the public mutation surface.

## Decision

1. Causal dogfood targets the canonical
   `DesignDocument → EditorEngine → ReactDesignRenderer` path. This first
   tracer exercises its headless `DesignDocument → EditorEngine` coordination
   seam and a registered `DomProjection` element; it is not yet a browser or
   React render-integration test. The legacy `CanvasItemsDocument` path does
   not define the target behavior.
2. `getDesignDocumentPatchPort(document)` exposes only the JSON projection
   operations required by the causal tracer: `value`, `query`, `at`,
   `canPatch`, `commit`, and `subscribe`.
3. The patch port owns and freezes caller operations, previews every commit
   through the persisted schema and `validateAndIndexDesignDocument`, and
   accepts only content metadata before publication. Its reads come from the
   immutable canonical snapshot rather than the mutable history store. A
   successful publication synchronizes the snapshot, graph index, and document
   listeners before notifying patch observers and returning. A successful
   test-only or net-no-op batch returns without creating history or a
   publication.
4. DesignDocument commands, history restores, and patch-port commits reserve a
   monotonic ownership sequence before publication. Ownership remains active
   through snapshot synchronization and observer delivery so synchronous
   reentry fails closed. A subscriber added while synchronization is already
   handling a publication starts at the next publication. The sequence exists
   only in this synchronous scope and is not a transport clock.
5. `getEditorEngineDocumentHost(engine)` defers a ready change while a text or
   transform preview is active, while another document mutation is running, or
   while a ready change is already executing. The caller owns retry policy.
   The headless tracer schedules one microtask retry after an engine change;
   that is not a browser render-settle contract.
6. The first tracer uses a stable design-node id and one text-field
   replacement. It does not use positional rebase because current local
   DesignDocument commands publish a root replacement.
7. Unpublished causal/rebase packages remain SHA-pinned test dependencies.
   Production `src/canvas/**` code does not import them and the published Canvas
   package keeps registry-only runtime dependencies.

## Boundaries

- This is not CRDT, OT, transport, persistence, acknowledgement, replicated
  undo, or a convergence claim. Hosts still own those policies.
- The patch port does not own DOM selection, caret restoration, composition
  events, render scheduling, or focus. Editor preview ownership is the current
  conservative browser-input gate.
- The tracer does not prove that `compositionend`, a React commit, DOM
  selection restoration, or layout has completed before retrying.
- A conflicting stable-id replacement fails on its authored `expected` value;
  it never overwrites a newer local field automatically.
- Patch-port commits currently enter the existing DesignDocument undo stack.
  Canonical remote-history policy must be decided before production sync.

## Consequences and Follow-up

- Canvas now has the headless seam needed to test delayed stable-id editing
  without exposing the internal JSONDocument or adding a runtime dependency on
  private labs. A FigJam browser test remains follow-up evidence.
- Structural and positional delayed edits need granular DesignDocument command
  patches instead of a root replacement.
- DOM caret handoff needs a separate selection adapter plus a render-settle
  signal; it must not be inferred from the authored graph.
- FigJam composition/blur behavior and a real ReactDesignRenderer commit must
  be covered before claiming IME-safe browser coordination.
- Large documents still pay whole-snapshot clone/freeze, validation, and index
  rebuild costs. Incremental validation and indexing remain separate
  performance work.
- Promotion and npm RC publication of the causal graph require evidence from
  this tracer and the existing editable tracer.
