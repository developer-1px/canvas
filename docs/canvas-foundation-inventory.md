# Canvas Foundation Inventory

Purpose: fix the ownership map before moving code. Canvas Foundation should look
like `@interactive-os/json-document` core: small headless contracts first, reusable extensions second,
product/app meaning last.

Product pressure stays app-owned until repeated consumer demand appears.
Promotion decisions should use a headless contract and at least two real
consumers before moving app-owned code into Foundation or first-party
extensions.

## Ownership Rules

| Owner | Owns | Must not own |
|---|---|---|
| Foundation | geometry, scene, selection, gesture, transform, command, patch-planning contracts | Whiteboard `CanvasItem`, React workflow, UI layout, browser IO, persistence |
| First-party extension | reusable whiteboard affordance bundles on foundation contracts | product-specific storage policy or app shell composition |
| Host | concrete item model, validation, tree adapters, document adapters | app workflow and UI chrome |
| App | React state, assembly, command effects, pointer lifecycle effects, toolbar/inspector wiring | concrete document internals or json-document APIs |
| Renderer | stage and overlay orchestration through injected item layers | Whiteboard item variants or Host tree helpers |
| UI | shared controls and icons | app workflow state or Host document internals |

## Current Module Map

| Path | Target owner | Status | Reason |
|---|---|---|---|
| `src/canvas/foundation` | Foundation public facade | tracer bullet added | Re-exports headless core, scene, selection, transform, gesture, command, snap, and extension contracts through a named public subpath. |
| `src/canvas/foundation/CanvasAlignmentSnap.ts` | Foundation | promoted | Owns alignment snap calculations and guide derivation. |
| `src/canvas/foundation/CanvasCommandAvailabilityRules.ts` | Foundation | promoted | Owns command availability rule descriptors over a structural command config contract. |
| `src/canvas/foundation/CanvasCommandSelectionRules.ts` | Foundation | promoted | Owns command selection threshold grammar. |
| `src/canvas/foundation/CanvasCommandTypes.ts` | Foundation | promoted | Owns generic command item, adapter, result, mode, and availability contracts without Host item storage. |
| `src/canvas/foundation/CanvasExtensionContracts.ts` | Foundation | tracer bullet added | Defines reusable extension descriptor, adapter slot, command planner, renderer slot, and generic effect contracts without app or host ownership. |
| `src/canvas/foundation/CanvasFirstPartyExtensions.ts` | First-party extension | tracer bullet added | Holds the first concrete first-party extension descriptor without Host/App/UI/Renderer imports. |
| `src/canvas/foundation/CanvasGestureEngine.ts` | Foundation | promoted | Owns pointer input to gesture classification over a structural gesture config contract. |
| `src/canvas/foundation/CanvasGridSnap.ts` | Foundation | promoted | Owns grid snap calculations over a structural grid snap config contract. |
| `src/canvas/foundation/CanvasHeadlessGeometry.ts` | Foundation | promoted | Owns measured rect union, padding, local coordinate conversion, and edge-distance calculations for selection/measurement overlays without DOM or product data ownership. |
| `src/canvas/foundation/CanvasSceneAdapter.ts` | Foundation | promoted | Owns scene entries, parent/path/bounds read contracts, and scene-derived bounds without Whiteboard item variants. |
| `src/canvas/foundation/CanvasSelectionEngine.ts` | Foundation | promoted | Owns pointer click and marquee selection policy over `CanvasSceneAdapter`. |
| `src/canvas/foundation/CanvasSnapEngine.ts` | Foundation | promoted | Owns move snap planning over structural snap config and `CanvasSceneAdapter`. |
| `src/canvas/foundation/CanvasSnapGeometry.ts` | Foundation | promoted | Owns snap bounds translation primitives. |
| `src/canvas/foundation/CanvasSnapGuides.ts` | Foundation | promoted | Owns alignment and spacing guide contracts. |
| `src/canvas/foundation/CanvasSpacingSnap.ts` | Foundation | promoted | Owns spacing snap calculations and guide derivation. |
| `src/canvas/foundation/CanvasToolGestureRouting.ts` | Foundation | promoted | Owns built-in and custom tool gesture route descriptors without importing Engine affordance config. |
| `src/canvas/foundation/CanvasTransformEngine.ts` | Foundation | promoted | Owns move/resize planner contracts over a generic transform adapter. |
| `src/canvas/core` | Foundation | already close | Headless geometry, viewport, stable id, and primitive types. |
| `src/canvas/engine` | Engine public facade | compatibility | Re-exports promoted foundation scene, selection, transform, gesture, and command contracts while retaining existing engine imports. |
| `src/canvas/engine/gesture` | Engine public facade | retired | Gesture source moved to Foundation; Engine keeps compatibility exports from the public facade. |
| `src/canvas/engine/command` | Engine / first-party extension | split started | Availability, selection, and generic command contracts moved to Foundation; execution actions remain Engine-owned. |
| `src/canvas/engine/snap` | Engine public facade | retired | Snap source moved to Foundation; Engine keeps compatibility exports from the public facade. |
| `src/canvas/host/read` | Host adapter | keep | Converts Whiteboard `CanvasItem` trees into scene/read contracts. |
| `src/canvas/host/document` | Host adapter | keep | Owns json-document document adapter, validation, patch factories, and item-specific field mapping. |
| `src/canvas/host/tree` | Host | keep | Encodes whiteboard group children, bounds sync, pruning, and item traversal. |
| `src/canvas/host/component` | Host | keep | whiteboard component templates and component storage rules. |
| `src/canvas/host/text` | Host | keep | Maps item variants to editable values and patch fields. |
| `src/canvas/app/workflow` | App | keep | React state fan-out, command effects, pointer lifecycle effects, and assembly wiring. |
| `src/canvas/app/extensions` | App / first-party extension bridge | split started | App bundles now carry and index foundation extension descriptor metadata; current assembly output remains App-owned. |
| `src/canvas/app/rendering` | App adapter | keep | Whiteboard SVG item layer adapter and presentation resolution. |
| `src/canvas/renderer` | Renderer | keep | Stage and overlay renderer should remain item-model independent. |
| `src/canvas/ui` | UI | keep | Shared icons and controls only. |

## Tracer Bullet Order

1. Name and guard the Foundation/Extension ownership model.
2. Promote scene and selection contracts without changing runtime behaviour. Done in issue #71.
3. Promote transform planner contracts behind generic adapters. Done in issue #73.
4. Define an extension descriptor shape for reusable affordance bundles. Done in issue #70.
5. Move one low-risk first-party affordance into the extension shape. Done in issue #75.
6. Promote gesture routing contracts behind structural config adapters. Done in issue #77.
7. Promote command availability contracts behind structural config adapters. Done in issue #79.
8. Promote snap contracts behind structural config adapters. Done in issue #81.
9. Bridge app extension bundles to foundation extension descriptors. Done in issue #83.
10. Index foundation extension tools for App-owned discovery. Done in issue #85.
11. Index foundation extension commands for App-owned discovery. Done in issue #87.
12. Index foundation extension renderer slots for App-owned discovery. Done in issue #89.

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
json-document. Host document adapters decide how document effects become concrete
patches.

`CANVAS_STICKY_NOTE_EXTENSION` is the first concrete first-party extension
descriptor. It names sticky note creation as a creation tool and declares the
creation, document, renderer, and text-target adapter slots without moving whiteboard
component templates, item schemas, SVG rendering, or app workflow.

`CanvasAppExtensionBundle.foundationExtensions` and
`foundationExtensionAdapters` are the app-owned assembly inputs. The App
compiler `compileCanvasAppFoundationExtensions` validates adapter completeness
and duplicate contributions, then produces executable command/tool planners,
renderer contributions, and text targets. `executeCanvasAppFoundationExtensionEffects`
is the single failure-contained App executor for document, selection, viewport,
and post-create editing effects; Host storage and React rendering remain behind
the contributed adapters.

## Guardrails

- Foundation candidates must not import `src/canvas/engine`, `src/canvas/host`,
  `src/canvas/app`, `src/canvas/renderer`, or `src/canvas/ui` implementation
  modules.
- Foundation contracts must not mention Whiteboard `CanvasItem`, `RectItem`,
  `CanvasComponentItem`, or component library constants.
- json-document imports stay inside Host document adapters unless an explicit
  document/patch contract issue justifies moving them.
- Renderer stage remains independent from Whiteboard item variants.
