# ADR 0001: Canvas Reusable Module Seams

## Status

Accepted

## Context

The canvas code is intended to work as a reusable component factory, not as one service-shaped demo app. The risky coupling points were:

- Renderer Stage knowing Demo `CanvasItem` variants and Host bounds helpers.
- App Shell knowing workflow wiring.
- App document hooks knowing more than the Host Document Controller contract.
- Product-specific component templates and SVG presentation strategies being hard-wired into App workflow.
- Module seam rules living only in convention.

## Decision

1. `src/canvas/renderer` owns SVG stage and overlay orchestration only. It accepts an injected item layer and does not import Demo `CanvasItem`, Host read helpers, or the Canvas Component Library.
2. `src/canvas/app/rendering` owns the Demo SVG Item Layer Adapter. It converts Demo `CanvasItem` trees and component presentation keys into SVG children for the Renderer Adapter.
3. `src/canvas/app/workflow` owns App Model modules. Workspace, interaction, text editor, and find/replace state are hidden behind workflow hooks before props reach the App Shell.
4. `CanvasAppAssembly` is the composition seam for product-specific meaning: concrete Host item adapters, component library, initial items, and SVG presentation registry are injected there instead of being hard-wired across workflow code.
5. Host document behavior is exposed through the explicit `CanvasDocumentController` interface. zod-crud document, JSON Patch, selection snapshot, and clipboard internals stay inside `src/canvas/host/document`.
6. Architecture guardrails verify the seams with tests.

## Consequences

- A different Host item model can reuse `CanvasSvgStage` by supplying a different item layer.
- Adding a Demo component kind that reuses an existing presentation remains a Canvas Component Library change.
- Adding a new SVG presentation changes the Demo SVG Item Layer Adapter, not Renderer Stage.
- App Shell stays a layout composition layer.
- Internal document implementation can change without touching app document hooks.
- Custom component kinds and SVG presentation strategies can be assembled outside the internal canvas grammar without editing Renderer Stage or App workflow.
