# ADR 0003: Canvas Foundation and Extension Architecture

## Status

Accepted

## Context

ADR 0001 makes the canvas package a reusable component factory instead of a
single demo app. ADR 0002 keeps collaboration transport, account, and sharing
policy outside core. Those decisions protect seams, but they do not yet name the
next ownership layer: a canvas foundation that mirrors the shape of `zod-crud`.

`zod-crud` keeps a small core for JSON Pointer, JSON Patch, document runtime,
selection primitives, and headless contracts. Reusable behaviours such as
grouping, search/replace, and patch preview live as packages or labs extensions.
Applications own their domain data, UI, persistence, and concrete product
policy.

Canvas needs the same split. The reusable part is not the Demo `CanvasItem`
model. The reusable part is the geometry, scene, selection, gesture, transform,
command, and patch-planning grammar that can run through adapters.

## Decision

1. Canvas Foundation owns host-independent primitives and contracts:
   geometry, scene entries, selection rules, gesture descriptors, transform
   planners, command availability grammar, document patch planning contracts,
   and renderer adapter contracts.
2. Canvas Foundation must not import Host, App, UI, Renderer implementation
   modules, or concrete Demo `CanvasItem` variants. Host-specific item storage
   enters through adapters such as scene, transform, text target, document, and
   renderer item-layer adapters.
3. Canvas Extensions provide reusable affordance or planner bundles on top of
   Foundation contracts. They may register command descriptors, effect
   descriptors, renderer slots, or document patch planners, but they do not own
   product persistence, browser IO, or app shell layout.
   `CanvasExtensionDescriptor` is the headless descriptor shape: it declares
   required adapter slots, command planners, tool descriptors, renderer slots,
   and generic document/selection/viewport effects without importing zod-crud,
   React, Host, App, UI, or Renderer implementation modules.
4. First-party whiteboard extensions own de-facto canvas affordances such as
   shapes, sticky notes, drawing strokes, connectors, comments, stamps, image
   import/export, and presence overlays. They remain internal/reusable
   affordances, not product-specific custom item modules.
5. Host/Demo continues to own concrete `CanvasItem` storage, validation,
   component templates, item-specific bounds derivation, zod-crud document
   adapters, and Demo SVG item rendering.
6. App continues to own React workflow, toolbar and inspector UI, local
   workspace persistence, browser clipboard/file/download details, and product
   assembly.
7. zod-crud remains the document/patch substrate behind Host document adapters.
   Canvas Foundation should not expose zod-crud directly except through explicit
   document or patch contracts.
8. The migration must use tracer bullets. Contract and guardrail tests come
   before broad package or folder moves.

## Consequences

- `CanvasSceneAdapter`, generic selection rules, and transform planner
  contracts are valid foundation candidates because they already operate through
  small adapters.
- `CanvasSceneAdapter` and `CanvasSelectionEngine` live in Foundation source
  ownership. The Engine facade may re-export them for compatibility, but Engine
  internals should import scene contracts from Foundation.
- `CanvasTransformEngine` lives in Foundation source ownership. Host item
  mutation remains adapter-owned; Foundation only plans move and resize through
  `CanvasTransformAdapter`.
- `CANVAS_STICKY_NOTE_EXTENSION` is the first concrete first-party extension
  descriptor. It names the sticky note creation affordance and adapter slots
  without moving Demo component storage, SVG rendering, or App workflow.
- `canvas/foundation` is the named public facade for low-risk foundation
  tracer bullets. It can re-export existing headless contracts before broad
  implementation moves.
- `defineCanvasExtension` fixes the first extension descriptor shape. It keeps
  reusable extension planning separate from App Assembly and Host item storage.
- `CanvasItemReadModel`, `CanvasItemSchema`, component library templates, and
  Demo SVG item renderers remain Host/App-owned adapters.
- Built-in whiteboard affordances can become first-party extensions without
  becoming product-specific custom modules.
- External apps can swap Host item models or renderers without reimplementing
  common selection, gesture, and transform grammar.
- Architecture tests must preserve the rule that foundation candidates do not
  depend on Host/App/UI/Renderer implementation details.

## Follow-up Work

- Issue #69 tracks the detailed foundation and extension architecture plan.
- Add or keep an inventory mapping current canvas modules to Foundation,
  Extension, Host, App, Renderer, and UI ownership.
- Promote one low-risk foundation tracer bullet at a time, starting with scene
  and selection contracts.
