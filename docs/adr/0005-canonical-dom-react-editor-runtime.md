# ADR 0005: Canonical DOM/React Editor Runtime

## Status

Accepted

## Context

ADR 0001 separates reusable canvas seams from the concrete Whiteboard
`CanvasItem` model. ADR 0002 separates persistent document state from
ephemeral collaboration state. ADR 0003 keeps reusable geometry, scene,
selection, gesture, transform, command, and patch-planning grammar independent
from React and product storage.

The current Figma route nevertheless spreads authored meaning across four
places:

1. `CanvasItem` frames used for placement and viewport focus,
2. a DOM edit document used for style and text history,
3. a product model used for hierarchy, defaults, and component bindings, and
4. hand-authored React JSX used for the actual browser DOM.

That arrangement is useful as a proof of the existing seams, but it is not a
stable source-of-truth model for a React design editor. Structure, rendering,
selection, history, and component propagation can drift when more than one
model is writable. The FigJam direction creates the same pressure: sticky
notes, shapes, drawings, connectors, comments, and stamps should be installed
React widgets on the same editor runtime rather than new engine item variants.

Issue #621 records the invariant before the migration in roadmap #620 begins.
It deliberately does not decide the exact graph schema, public package surface,
or source-code round-trip format.

## Decision

### DesignDocument

`DesignDocument` is the only persistent source of truth for Figma and FigJam
authored content. Its private source seam is reserved at
`src/canvas/design-document/`.

The Module owns a versioned serializable node graph, schema version, stable node
ids, roots and ordered children, intrinsic or registered definition ids, JSON
props and text, layout and style, frame geometry, component and widget
references, validation, atomic command semantics, and undo/redo semantics.

The serialized authored graph does not contain React elements or functions,
DOM objects, `CanvasItem` values, selection, camera, editor overlays, or the
undo stack itself. The DesignDocument Module owns history behavior, while
history storage remains runtime state around the authored graph.

### ReactDesignRenderer

`ReactDesignRenderer` resolves intrinsic elements and registered component or
widget definitions, renders direct React DOM, registers stable node identity
with `DomProjection`, and contains unknown-definition or renderer failure.

It does not own document mutation, selection, editing policy, history, or
product commands. The live DOM is derived runtime output, not document state.

### DomProjection

`DomProjection` owns the ephemeral relationship between a stable design node id
and its `HTMLElement`: registration, measurement, coordinate projection,
observation, and hit targets. DOM references and measurements never enter the
DesignDocument.

### EditorEngine

`EditorEngine` applies existing Canvas Foundation and Affordance grammar to
DesignDocument reads, document commands, `DomProjection`, input, and editor
runtime state. It plans Figma-style selection, move, resize, text, layout,
keyboard, and viewport effects.

A committed edit becomes one atomic DesignDocument command. EditorEngine does
not maintain a second authored model and does not treat imperative DOM mutation
as a committed document change.

### React Component Definition and React Widget Definition

A `React Component Definition` binds a stable definition id to a React
renderer, JSON prop validation and defaults, creation and editing capabilities,
and an optional inspector contribution. DesignDocument stores the stable id and
JSON data, never the renderer function.

A `React Widget Definition` uses the same registered-definition contract for
freeform collaboration behavior. A widget is not a new Engine item union member
and does not add a renderer switch branch.

### Product Pack

A `Product Pack` installs registered definitions, layout presets, tools,
commands, and inspector contributions. The Figma product pack owns web-design
primitives and component authoring. The FigJam product pack owns a freeform
preset and first-party React widget definitions.

Installing a Product Pack must not require an Engine union change, a renderer
switch, or an App Shell conditional for each definition.

### Editor Runtime State

The App or product runtime owns the lifecycle and composition of a
`DomProjection` instance. It separately owns ephemeral selection, camera and
viewport, active tool and mode, focus and hover, overlay, guide, and marquee
state, pointer draft and live preview, and local or remote presence.
`DomProjection` remains the semantic owner of node-to-`HTMLElement`
registration, measurement, coordinate projection, observation, and hit targets.

Undo/redo may produce a runtime hint that reconciles selection after a document
change. That does not make selection part of authored content.

## Ownership and State Matrix

| State | Owner | Persisted as authored content |
|---|---|---|
| schema version, stable node ids, roots and ordered children | DesignDocument | yes |
| intrinsic/registered definition ids, JSON props, text | DesignDocument | yes |
| layout and style, frame geometry, component and widget references | DesignDocument | yes |
| command validation and undo/redo semantics | DesignDocument Module | no; runtime behavior around the graph |
| live React DOM | ReactDesignRenderer | no; derived runtime output |
| node-to-HTMLElement registration, measurement and observation | DomProjection | no |
| selection, camera and viewport, active tool and mode | editor runtime | no |
| focus and hover, overlay, guide, and marquee state | editor runtime | no |
| pointer draft and live preview | editor runtime | no |

## Migration Invariants

1. Product code must not dual-write DesignDocument and a legacy authored model.
2. Every committed change uses one atomic DesignDocument command and one history
   entry. A drag may use ephemeral preview, but cancel discards it and commit
   records one transaction.
3. A `Read-only Compatibility Projection` may be a one-way derivation from a
   DesignDocument snapshot into a temporary legacy read shape. It provides no
   mutation, history, persistence, or reverse sync.
4. Compatibility projections remain package-internal and are deleted when their
   last consumer migrates.
5. Direct React DOM is the canonical authored-content surface. DOM or SVG
   overlays remain valid editor instruments, and widget-internal SVG remains
   valid implementation detail. A Canvas/SVG scene, `foreignObject`, or
   `CanvasItem` envelope is not the canonical authored-content renderer.
6. DesignDocument source cannot depend on React, DOM, Figma, FigJam,
   `CanvasItem`, App Shell, Renderer, or Host implementations. Zod,
   json-document, and headless core contracts remain valid implementation
   dependencies where their interfaces fit.
7. The migration reuses the existing Figma and FigJam UI. It does not combine
   architecture work with decorative redesign.

## Considered Options

### Use live DOM as the source of truth

Rejected. Browser DOM does not provide a stable versioned serialization,
validation, atomic command, or history model, and it mixes authored meaning with
ephemeral measurement and focus state.

### Keep CanvasItem and SVG as the canonical product model

Rejected for the target Figma and FigJam routes. It makes React DOM a secondary
projection even though React components and CSS are the authored result.

### Keep two writable documents synchronized

Rejected. Dual writes create drift, ambiguous history ownership, and partial
failure modes across structure, component propagation, persistence, and render.

### Use one serializable graph with derived direct DOM

Accepted. It gives document semantics one deep Module, lets React produce the
actual authored surface, and keeps measurement and interaction state ephemeral.

## Relationship to Existing Decisions

- ADR 0001 and ADR 0003 continue to protect the headless Foundation and
  renderer seams. React definitions do not move into Foundation.
- ADR 0002's persistent-versus-ephemeral distinction applies to the whole
  editor runtime, not only collaboration overlays.
- Existing Whiteboard `CanvasItem` storage, Host document behavior, and SVG item
  rendering remain a pre-1.0 `Legacy CanvasItem Runtime` for compatibility. They
  are not removed by this ADR and must not be dual-written with DesignDocument.
- `ADR 0004: Canvas Document Sync Adapter` remains specific to the legacy
  `CanvasItem` path. This ADR does not silently generalize its sync contract.
- `ADR 0004: Canvas Extension Capability Contracts` establishes that multiple
  input surfaces converge on one document meaning; that decision supports the
  single DesignDocument command path.

## Consequences

- Issue #622 can introduce the private DesignDocument Module behind the reserved
  seam without re-litigating state ownership.
- Issue #623 must adapt legacy readers through a read-only projection, not a
  mirrored writable state.
- Issues #624 through #626 can replace the Figma route incrementally while
  characterization tests preserve current behavior.
- Issues #627 and #628 can make FigJam a consumer of the same runtime through
  React Widget Definitions and a Product Pack.
- Existing public `CanvasItem` compatibility exports may remain until a separate
  compatibility decision removes them.
- Exact schema fields, arbitrary React source AST round-trip, multiplayer sync,
  remote plugin execution, and public package publishing remain outside this
  decision.
