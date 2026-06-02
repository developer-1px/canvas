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
| `src/canvas/foundation/CanvasExtensionContracts.ts` | Foundation | tracer bullet added | Defines reusable extension descriptor, adapter slot, command planner, renderer slot, and generic effect contracts without app or host ownership. |
| `src/canvas/foundation/CanvasFirstPartyExtensions.ts` | First-party extension | tracer bullet added | Holds the first concrete first-party extension descriptor without Host/App/UI/Renderer imports. |
| `src/canvas/foundation/CanvasSceneAdapter.ts` | Foundation | promoted | Owns scene entries, parent/path/bounds read contracts, and scene-derived bounds without Demo item variants. |
| `src/canvas/foundation/CanvasSelectionEngine.ts` | Foundation | promoted | Owns pointer click and marquee selection policy over `CanvasSceneAdapter`. |
| `src/canvas/foundation/CanvasTransformEngine.ts` | Foundation | promoted | Owns move/resize planner contracts over a generic transform adapter. |
| `src/canvas/core` | Foundation | already close | Headless geometry, viewport, stable id, and primitive types. |
| `src/canvas/engine` | Engine public facade | compatibility | Re-exports promoted foundation scene, selection, and transform contracts while retaining existing engine imports. |
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
2. Promote scene and selection contracts without changing runtime behaviour. Done in issue #71.
3. Promote transform planner contracts behind generic adapters. Done in issue #73.
4. Define an extension descriptor shape for reusable affordance bundles. Done in issue #70.
5. Move one low-risk first-party affordance into the extension shape. Done in issue #75.

## Extension Shape

`CanvasExtensionDescriptor` answers the minimum questions from issue #69:

| Question | Contract field |
|---|---|
| What state does the extension read? | planner input generic |
| What document patch or effect descriptor does it produce? | `CanvasExtensionEffect` |
| What adapter slots does it require? | `requiredAdapters` |
| What feature toggle or command id does it register? | `commands[].id` |
| What creation or drawing tool does it expose? | `tools[].id` and `tools[].kind` |
| What renderer or UI surface is optional? | `rendererSlots` |

The descriptor deliberately uses generic patch payloads instead of importing
zod-crud. Host document adapters decide how document effects become concrete
patches.

`CANVAS_STICKY_NOTE_EXTENSION` is the first concrete first-party extension
descriptor. It names sticky note creation as a creation tool and declares the
creation, document, renderer, and text-target adapter slots without moving Demo
component templates, item schemas, SVG rendering, or app workflow.

## Guardrails

- Foundation candidates must not import `src/canvas/host`, `src/canvas/app`,
  `src/canvas/renderer`, or `src/canvas/ui` implementation modules.
- Foundation contracts must not mention Demo `CanvasItem`, `RectItem`,
  `CanvasComponentItem`, or component library constants.
- zod-crud imports stay inside Host document adapters unless an explicit
  document/patch contract issue justifies moving them.
- Renderer stage remains independent from Demo item variants.
