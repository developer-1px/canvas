# ADR 0004: Canvas Extension Capability Contracts

## Status

Accepted

## Context

ADR 0001 makes the canvas package a reusable component factory. ADR 0003 names
the Canvas Foundation layer and introduces `CanvasExtensionDescriptor` with
`defineCanvasExtension`, and ships the sticky note extension as a
declaration-only descriptor: it lists adapter slot names such as `text-target`
and `creation`, but the behavior behind those names still lives in privileged
App and Host modules.

That gap blocks the extension direction agreed for this package:

- The core identity of the canvas is viewport, scene, selection, transform,
  and the gesture/command/toggle grammar. Everything that can be toggled off
  is genre convention, not core.
- Built-in whiteboard features must be assembled from the same public
  contracts that third-party feature packs use. A feature the package cannot
  rebuild from its own public slots proves the slot grid is incomplete.
- A feature such as a sticky note decomposes into capability primitives:
  bounded item storage, click-place creation, post-create edit entry,
  editable text, style, renderer, adjacent quick-create. Every primitive must
  be a contract, or the feature cannot leave the privileged path.

The concrete blocker found first: editable text judgment is a closed union.
`CanvasEditableTextItem` narrows a fixed set of item types, so an item
introduced by a custom item module can never enter text editing, and the
sticky note extension descriptor cannot carry its own text behavior.

## Decision

1. `CanvasExtensionContracts` in `src/canvas/foundation` is the single home
   for extension capability contracts. Contracts are split into three parts:
   capability contracts that the platform provides to extensions (text
   target, document, creation, scene, transform, style, placement),
   contribution slots that extensions provide to assembly (tools, commands,
   renderer slots, keyboard shortcuts, inspectors, validators), and the
   effect grammar that connects them (`CanvasExtensionEffect`).
2. Every input surface of a feature converges on one planner. Pointer
   gestures, inspector fields, toolbar actions, and keyboard shortcuts call
   the same `CanvasExtensionPlanner` and apply the returned
   `CanvasExtensionEffect` list. A feature owns one source of truth for its
   document meaning.
3. `CanvasExtensionTextTargetContract` is the first capability contract body.
   It states editable judgment, current value, committed value fallback,
   editor bounds projection, enter-commit policy, and commit patch update
   planning without importing any item storage shape.
4. Host-owned editable text rules become the first-party implementation of
   that contract. `CANVAS_WHITEBOARD_TEXT_TARGET` in `src/canvas/host/text`
   adapts the existing whiteboard editable text module to the contract, and
   the closed-union judgment is demoted from public contract to whiteboard
   implementation detail.
5. Growth is governed by cost tiers. Adding a row that binds an existing
   gesture kind (a new shape, stamp, or tool) is free for packs and touches
   no core code. Adding a capability contract or effect kind is a deliberate
   minor-version engine event. Adding a gesture verb (for example a
   selection affordance such as padding handles) is a major design event and
   is intentionally deferred until the creation and editing contracts are
   proven.
6. The dogfooding gate for this architecture is the sticky note: when the
   sticky note extension can be assembled from descriptor and capability
   contracts alone, with existing engine demo end-to-end checks passing
   unmodified, the slot grid is proven for the text-box family of features.

## Consequences

- Custom item modules gain a path to text editing: a future `textTarget`
  slot on the module descriptor satisfies the same contract that built-in
  items use.
- App workflow modules migrate from importing whiteboard text functions
  directly to consuming an injected text target contract. This happens
  per-consumer, guarded by the existing text editing unit tests and the
  engine demo end-to-end suite.
- Later capability contracts (post-create effect, style tokens, adjacent
  placement, keyboard contribution) follow the same pattern: contract body
  in Foundation, first-party implementation in Host or App, external
  registration through assembly.
- Foundation stays free of item storage vocabulary; the contract uses a
  generic item parameter, and the module boundary guardrails keep enforcing
  the import directions.
