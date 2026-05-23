# ADR 0001: Canvas Reusable Module Seams

## Status

Accepted

## Context

The canvas code is intended to work as a reusable component factory, not as one service-shaped demo app. The risky coupling points were:

- Renderer Stage knowing Demo `CanvasItem` variants and Host bounds helpers.
- App Shell knowing workflow wiring.
- App document hooks knowing more than the Host Document Controller contract.
- Product-specific component templates and SVG presentation strategies being hard-wired into App workflow.
- Product-specific business actions being added to the internal Engine command union.
- Product-specific inspector panels being added to the default Object Inspector.
- Product-specific creation tools being added to the internal builtin `Tool` union.
- Product-specific item kinds being added as new internal `CanvasItem` variants and SVG renderer branches.
- Module seam rules living only in convention.

## Decision

1. `src/canvas/renderer` owns SVG stage and overlay orchestration only. It accepts an injected item layer and does not import Demo `CanvasItem`, Host read helpers, or the Canvas Component Library.
2. `src/canvas/app/rendering` owns the Demo SVG Item Layer Adapter. It converts Demo `CanvasItem` trees and component presentation keys into SVG children for the Renderer Adapter.
3. `src/canvas/app/workflow` owns App Model modules. Workspace, interaction, text editor, and find/replace state are hidden behind workflow hooks before props reach the App Shell.
4. `CanvasAppAssembly` is the composition seam for product-specific meaning: concrete Host item adapters, component library, custom commands, custom creation tools, custom item renderers, custom item validators, inspector panels, initial items, and SVG presentation registry are injected there instead of being hard-wired across workflow code.
5. Host document behavior is exposed through the explicit `CanvasDocumentController` interface. zod-crud document, JSON Patch, selection snapshot, and clipboard internals stay inside `src/canvas/host/document`.
6. Product-specific item kinds use the stable `custom` item storage envelope with JSON `data`, `kind`, and `presentation`. The SVG renderer resolves presentation through an injected custom item renderer registry, and the Host document controller runs injected validators by `kind`.
7. Architecture guardrails verify the seams with tests.

## Consequences

- A different Host item model can reuse `CanvasSvgStage` by supplying a different item layer.
- Adding a Demo component kind that reuses an existing presentation remains a Canvas Component Library change.
- Adding a new SVG presentation changes the Demo SVG Item Layer Adapter, not Renderer Stage.
- App Shell stays a layout composition layer.
- Internal document implementation can change without touching app document hooks.
- Custom component kinds and SVG presentation strategies can be assembled outside the internal canvas grammar without editing Renderer Stage or App workflow.
- Product-specific business actions can be registered as App custom commands without changing the internal Engine command grammar.
- Product-specific inspector panels can be registered without changing the default Object Inspector.
- Product-specific creation tools can be registered without changing the internal builtin tool grammar.
- Product-specific item kinds can be stored, validated, and rendered without adding a new `CanvasItem` variant or a new SVG renderer branch.
