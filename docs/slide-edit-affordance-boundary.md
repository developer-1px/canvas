# Slide Edit Affordance Boundary

목표: slide 기반 편집기가 공유할 수 있는 affordance 계약을 제품 모델 없이 분리한다.

## Owner Boundary

| Area | Owner | Contract |
| --- | --- | --- |
| Geometry | `canvas/core` | `Point`, `Bounds`, primitive math |
| Viewport | `canvas/core` | world/screen projection and zoom state |
| Selection ids | `canvas/core` | id list shape only |
| Transform planning | `canvas/foundation` | move/resize planning over structural bounds |
| Snap guides | `canvas/foundation` | alignment and spacing guide contracts |
| Slide frame affordance | `slide-edit-affordance` | page frame, page-safe overlays, page-relative anchors |
| Slide object bounds | `slide-edit-affordance` | selected object bounds through a host adapter |
| Slide command effects | `slide-edit-affordance` | product-neutral command envelopes routed to the host |
| Slide rail interaction | `slide-edit-affordance` | active slide, slide order, thumbnail hit target, rail command intent |
| Placeholder visibility affordance | `slide-edit-affordance` | slide placeholder structure and object hide/show read model |
| Layout/master/theme tokens | `slide-edit-affordance` | layout, master, and theme token read model |
| Text measurement | `slide-edit-affordance` | bounded text size, overflow, and auto-fit hints |
| Object inspector | `slide-edit-affordance` | object-level inspector grouping without DOM layout assumptions |

## Host Adapter Slots

| Slot | Host Provides |
| --- | --- |
| `slide-frame` | Editable page frame in canvas coordinates |
| `object-bounds` | Object bounds for a slide/object reference |
| `selection` | Active page id and selected object ids |
| `command-effect` | Transaction boundary for command effects |
| `text-measurement` | Rendered text size and overflow for bounded text |

## DOM Affordance References

| Reusable Reference | Use |
| --- | --- |
| `guide` | Overlay rhythm, label placement, and guide visibility policy |
| `inspector` | Panel composition pattern and field grouping rhythm |
| `size-capsule` | Compact size/status capsule pattern near selected bounds |

| Do Not Reuse As-Is | Reason |
| --- | --- |
| `dom-layout-controls` | CSS flex/grid controls mutate DOM layout concepts, not slide objects |
| `dom-computed-overflow` | DOM overflow is computed by CSS layout, not slide text fitting |
| `dom-tree-selection` | DOM ancestry is not the slide object ownership model |
| `dom-box-model-xray` | Margin/padding/border bands are CSS box-model concepts |

## Frame Guide Contract

| Guide | Input | Output |
| --- | --- | --- |
| Center | slide frame bounds | vertical and horizontal center lines |
| Margin | numeric or side-specific inset config | frame-local margin lines |
| Safe area | numeric or side-specific inset config | safe-area region and edge lines |
| Ruler | optional axis/id/offset list | frame-local ruler lines |
| Column | optional count/gutter/margin config | headless column bands |

## DOM Frame Guide Split

| Reusable From `DomEditFrameGuides` | DOM-Only |
| --- | --- |
| frame-local ruler offsets | `DomEditOverlayRect` naming |
| column width from count/gutter/margin | selected DOM distance labels |
| invalid out-of-frame guide filtering | React overlay rendering |
| guide line orientation vocabulary | DOM node id and ancestry |

## Slide Rail Interaction Contract

| Area | Contract |
| --- | --- |
| Active slide | `activeSlideId` only; host owns slide data |
| Slide order | ordered slide id list |
| Thumbnail target | thumbnail bounds plus expanded hit target bounds |
| Commands | `add-slide`, `duplicate-slide`, `delete-slide`, `reorder-slide`, `select-active-slide` |
| Keyboard intent | select relative, move active, add/duplicate/delete active |
| Pointer intent | thumbnail press/drop and rail command button press |

## Object Reorder vs Slide Reorder

| Affordance | Owns | Does Not Own |
| --- | --- | --- |
| Object reorder | z-order among objects inside a canvas scene or group | slide list order |
| Slide reorder | ordered slide id list and active slide rail selection | object z-order, layer tree, object storage |

## Text Box Auto-Fit And Overflow Contract

| Area | Contract |
| --- | --- |
| Size mode | `fixed`, `resize-to-fit`, `shrink-text` |
| Host measurement | host provides rendered text size and overflow state through `text-measurement` |
| Auto-size target | `resize-to-fit` calculates target bounds from measured text size, optional min size, and optional slide/frame max bounds |
| Overflow indicator | headless state includes visibility, overflow axis, measured size, line count, and bottom-right indicator bounds |
| Gesture hook | resize handle double-click can produce a host `resize-text-box-to-fit` command effect |

## DOM Hug/Fill vs Slide Text Auto-Fit

| Concept | DOM edit meaning | Slide edit meaning |
| --- | --- | --- |
| Hug content | element participates in CSS layout and can reflow siblings | text box may resize its own bounds to measured text, without reflowing other slide objects |
| Fill container | element size is resolved by parent layout tracks or flex space | slide text box stays an absolute object; fill is not a shared slide text size mode |
| Shrink text | usually a typography/style decision outside CSS intrinsic sizing | text scale can change to keep bounds fixed |
| Overflow | computed by browser layout and scroll/clipping rules | host measurement reports slide text overflow for indicators and auto-fit commands |

## Placeholder And Object Visibility Contract

| Area | Contract |
| --- | --- |
| Placeholder structure | role, title, bounds, locked state, visible state, slide id, placeholder id |
| Object visibility read model | object id, hidden state, locked state, selectable state, optional placeholder reference |
| Selection vs visibility | hidden objects can be non-visible while still selectable by a host policy such as selection pane access |
| Hide/show availability | command availability is derived from selected objects, locked state, and current hidden state |
| Command effect | hide/show produces product-neutral `slide-command-effect`; host owns storage mutation |

## Visibility vs Selection Pane

| Contract | Owns | Does Not Own |
| --- | --- | --- |
| Placeholder visibility affordance | placeholder geometry/state and object hidden/selectable/locked read model | object list row rendering, tree keyboard model, rename UI |
| Selection pane affordance | consumes the visibility read model to render rows and route select/rename/reorder intents | placeholder semantics or canvas generic item schema |

## Layout/Master/Theme Token Contract

| Area | Contract |
| --- | --- |
| Theme tokens | color, font, and spacing descriptors with product-neutral ids and roles |
| Master | master id, theme id, and title; host owns actual master page storage |
| Layout | layout id, master id, default style refs, and placeholder descriptors |
| Placeholder sharing | layout placeholders reuse placeholder id, role, title, bounds, lock, and visibility fields from placeholder visibility affordance |
| Inherited style | placeholder style refs override layout defaults, then resolve against theme tokens |
| Apply policy | host chooses `preserve-existing-objects` or `reflow-objects-to-placeholders` |

## Contract Rules

- Public names stay product-neutral: slide, object, frame, bounds, selection, command, text.
- Placeholder and visibility state stay slide-domain contracts; they are not added to the generic canvas item schema.
- Slide-specific affordances depend on `canvas/core` and `canvas/foundation`; those packages do not depend on slide affordances.
- Host storage, renderer, and product object shapes stay behind adapter slots.
