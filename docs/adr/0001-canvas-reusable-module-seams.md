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
- Module seam rules and extension id rules living only in convention.

## Decision

1. `src/canvas/renderer` owns SVG stage and overlay orchestration only. It accepts an injected item layer and does not import Demo `CanvasItem`, Host read helpers, or the Canvas Component Library.
2. `src/canvas/app/rendering` owns the Demo SVG Item Layer Adapter. It converts Demo `CanvasItem` trees and component presentation keys into SVG children for the Renderer Adapter.
3. `src/canvas/app/workflow` owns App Model modules. Workspace, interaction, text editor, and find/replace state are hidden behind workflow hooks before props reach the App Shell.
4. `CanvasAppAssembly` is the composition seam for product-specific meaning: concrete Host item adapters, component library, custom commands, custom item modules, component presentation renderers, inspector panels, initial items, and SVG presentation registry are injected there instead of being hard-wired across workflow code.
5. Host document behavior is exposed through the explicit `CanvasDocumentController` interface. zod-crud document, JSON Patch, selection snapshot, and clipboard internals stay inside `src/canvas/host/document`.
6. Product-specific item kinds use the stable `custom` item storage envelope with JSON `data`, `kind`, and `presentation`. The SVG renderer resolves presentation through an injected custom item renderer registry, and the Host document controller runs injected validators by `kind`.
7. `CanvasAppCustomItemModule` bundles the presentation, renderer, validator, creation tool, inspector panel, and commands for one product-specific item kind so adding a new kind has one definition unit. Each module has a stable `id` that is also its custom item kind, and App assembly derives the custom item renderer, validator, and module-owned creation tool envelopes from the module instead of asking callers to provide registry maps or stamp `kind`/`presentation` by hand. Modules can be disabled by Host App assembly, and duplicate or unknown extension keys fail at assembly time instead of being overwritten or ignored. Custom creation tool shortcuts also fail at assembly time when they conflict with internal canvas shortcuts or other custom tools.
8. Canvas App extension ids, registry keys, custom item `kind`/`presentation`, and component template `id`/`presentation` use a shared lower-kebab stable id contract. Invalid module ids, command ids, tool ids, renderer keys, validator keys, inspector panel ids, persisted custom item keys, and component template keys fail at define, validation, library creation, or assembly time. Descriptor shape is also validated at the seam: malformed command, creation tool, inspector panel, renderer strategy, shortcut, registry shape, or component template shape fails before registration. Component Library, Canvas App Assembly, and Custom Item Module Assembly snapshot accepted inputs so later caller mutation cannot change assembled behavior. Component library resolver results must match its template list, and presentation keys without an assembled component presentation renderer fail at assembly time.
9. Vite dedupes linked peer dependencies and splits React runtime into a separate production chunk so reusable-package development does not create duplicate runtime copies or oversized app chunks.
10. Architecture guardrails verify the seams with tests.

## Consequences

- A different Host item model can reuse `CanvasSvgStage` by supplying a different item layer.
- Adding a Demo component kind that reuses an existing presentation remains a Canvas Component Library change.
- Adding a new SVG presentation is assembled as a Canvas App Assembly extension or override, not as a Renderer Stage change.
- A Canvas Component Library template cannot introduce a presentation key without an assembled renderer.
- App Shell stays a layout composition layer.
- Internal document implementation can change without touching app document hooks.
- Custom component kinds and SVG presentation strategies can be assembled outside the internal canvas grammar without editing Renderer Stage or App workflow.
- Product-specific business actions can be registered as App custom commands without changing the internal Engine command grammar, and custom command availability/run failures do not tear down the internal command loop.
- Product-specific inspector panels can be registered without changing the default Object Inspector.
- Product-specific item creation tools can be registered through `CanvasAppCustomItemModule` without changing the internal builtin tool grammar or stamping custom item envelopes by hand.
- Product-specific item kinds can be stored, validated, rendered, created, inspected, and commanded through one App-owned module without adding a new `CanvasItem` variant or a new SVG renderer branch.
