# Canvas Foundation Inventory

Purpose: fix the ownership map before moving code. Canvas Foundation should look
like `zod-crud` core: small headless contracts first, reusable extensions second,
product/app meaning last.

## Ownership Rules

| Owner | Owns | Must not own |
|---|---|---|
| Foundation | geometry, scene, selection, gesture, transform, command, patch-planning contracts | Demo `CanvasItem`, React workflow, UI layout, browser IO, persistence |
| First-party extension | reusable whiteboard affordance bundles on foundation contracts | product-specific storage policy or app shell composition |
| Host | concrete item model, validation, tree adapters, document adapters | app workflow and UI chrome |
| App | React state, assembly, command effects, pointer lifecycle effects, toolbar/inspector wiring | concrete document internals or zod-crud APIs |
| Renderer | stage and overlay orchestration through injected item layers | Demo item variants or Host tree helpers |
| UI | shared controls and icons | app workflow state or Host document internals |

## Current Module Map

| Path | Target owner | Status | Reason |
|---|---|---|---|
| `src/canvas/foundation` | Foundation public facade | tracer bullet added | Re-exports headless core, scene, selection, and transform contracts through a named public subpath. |
| `src/canvas/core` | Foundation | already close | Headless geometry, viewport, stable id, and primitive types. |
| `src/canvas/engine/scene` | Foundation | tracer-bullet candidate | `CanvasSceneAdapter` uses entries, paths, parent ids, and bounds without Demo item variants. |
| `src/canvas/engine/selection` | Foundation | tracer-bullet candidate | Pointer click and marquee selection depend on `CanvasSceneAdapter` and bounds only. |
| `src/canvas/engine/transform` | Foundation | tracer-bullet candidate | Move/resize planning already uses a generic transform adapter. |
| `src/canvas/engine/gesture` | Foundation | candidate | Gesture classification is host-independent but still tied to current built-in tool grammar. |
| `src/canvas/engine/command` | Foundation or first-party extension | split needed | Availability and selection rules are generic; built-in whiteboard commands may become extension descriptors. |
| `src/canvas/engine/snap` | Foundation or first-party extension | split needed | Grid and geometry primitives are generic; guide policy may stay extension-owned. |
| `src/canvas/host/read` | Host adapter | keep | Converts Demo `CanvasItem` trees into scene/read contracts. |
| `src/canvas/host/document` | Host adapter | keep | Owns zod-crud document adapter, validation, patch factories, and item-specific field mapping. |
| `src/canvas/host/tree` | Host | keep | Encodes Demo group children, bounds sync, pruning, and item traversal. |
| `src/canvas/host/component` | Host | keep | Demo component templates and component storage rules. |
| `src/canvas/host/text` | Host | keep | Maps item variants to editable values and patch fields. |
| `src/canvas/app/workflow` | App | keep | React state fan-out, command effects, pointer lifecycle effects, and assembly wiring. |
| `src/canvas/app/extensions` | App / first-party extension bridge | split needed | Registry and descriptor validation are reusable candidates; current assembly output remains App-owned. |
| `src/canvas/app/rendering` | App adapter | keep | Demo SVG item layer adapter and presentation resolution. |
| `src/canvas/renderer` | Renderer | keep | Stage and overlay renderer should remain item-model independent. |
| `src/canvas/ui` | UI | keep | Shared icons and controls only. |

## Tracer Bullet Order

1. Name and guard the Foundation/Extension ownership model.
2. Promote scene and selection contracts without changing runtime behaviour.
3. Promote transform planner contracts behind generic adapters.
4. Define an extension descriptor shape for reusable affordance bundles.
5. Move one low-risk first-party affordance into the extension shape.

## Guardrails

- Foundation candidates must not import `src/canvas/host`, `src/canvas/app`,
  `src/canvas/renderer`, or `src/canvas/ui` implementation modules.
- Foundation contracts must not mention Demo `CanvasItem`, `RectItem`,
  `CanvasComponentItem`, or component library constants.
- zod-crud imports stay inside Host document adapters unless an explicit
  document/patch contract issue justifies moving them.
- Renderer stage remains independent from Demo item variants.
