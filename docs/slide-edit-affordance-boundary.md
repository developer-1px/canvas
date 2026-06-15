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
| Object layer pane | `slide-edit-affordance` | object row descriptor, selection pane command intent, ARIA tree contract |
| Layout/theme affordance | `slide-edit-affordance` | layout, master, placeholder mapping, and theme token descriptors |
| Slide object clipboard | `slide-edit-affordance` | source slide metadata, paste target, and id remap plan |
| Slide metadata inspector | `slide-edit-affordance` | active slide name, background, notes, size, orientation fields |
| Slide transition timing | `slide-edit-affordance` | transition type, duration, click/after advance policy |
| Text measurement | `slide-edit-affordance` | bounded text size, overflow, and auto-fit hints |
| Object inspector | `slide-edit-affordance` | object-level inspector grouping without DOM layout assumptions |

## Host Adapter Slots

| Slot | Host Provides |
| --- | --- |
| `slide-frame` | Editable page frame in canvas coordinates |
| `object-bounds` | Object bounds for a slide/object reference |
| `selection` | Active page id and selected object ids |
| `command-effect` | Transaction boundary for command effects |
| `layout-theme` | Layout, master, placeholder, and theme token descriptors |
| `slide-metadata` | Active slide metadata values for inspector descriptors |
| `slide-transition` | Slide transition and advance timing values for inspector, preview, and export |
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

## Object Layer Pane Contract

| Area | Contract |
| --- | --- |
| Row read model | object id, display name, kind label, order, selected, hidden, locked, grouped, group id |
| Selection interaction | replace, additive, and range row press intents produce host `select-objects` command effects |
| Object commands | rename, hide/show, lock/unlock, and reorder row intents produce product-neutral host command effects |
| ARIA contract | renderers use a `tree` container with `treeitem` rows, roving tabindex, and host-controlled multi-selection |
| Visibility dependency | rows may expose hidden objects for selection pane access without changing the placeholder/visibility contract |

## Layout, Master, And Theme Contract

| Area | Contract |
| --- | --- |
| Theme tokens | product-neutral color, font, and spacing tokens with role labels and token ids |
| Master | master id, name, theme id, available layout ids, and optional default style token refs |
| Layout | layout id, master id, name, default style token refs, and placeholder descriptors |
| Placeholder mapping | placeholder id, role, title, default bounds, locked state, visible state, and optional default style token refs |
| Style inheritance | theme default style < master default style < layout default style < placeholder default style |
| Apply layout | host command effect carries whether existing objects are preserved or mapped to placeholders |

## Layout Placeholder vs Placeholder Visibility

| Shared Field | Layout/theme Meaning | Placeholder visibility Meaning |
| --- | --- | --- |
| `placeholderId` | stable slot id inside a layout | stable slot id available to a slide object |
| `role` | semantic slot role such as title/body/media | semantic role for placeholder selection and replacement |
| `title` | renderer-facing slot label | renderer-facing placeholder label |
| `bounds` / `defaultBounds` | default slot geometry before host object mapping | current placeholder geometry on a concrete slide |
| `isLocked` | layout slot cannot be casually remapped | placeholder or object is not user-editable |
| `isVisible` | layout slot may be hidden by default | placeholder/object can be hidden while still represented in controls |

## Slide Object Clipboard Contract

| Area | Contract |
| --- | --- |
| Payload | operation, source slide id, selected object ids, opaque host objects, optional group/placeholder metadata |
| Paste target | active slide origin, viewport center, pointer position, or slide frame offset |
| Remap plan | host policy rewrites object id, group id, and placeholder binding before paste commit |
| Paste command | host receives `paste-slide-objects` command effect with target selection ids |
| Adapter example | minimal adapter can copy a selection payload and paste it into a target slide without product model names |

## Canvas Clipboard vs Slide-Aware Clipboard

| Contract | Owns | Does Not Own |
| --- | --- | --- |
| Canvas object clipboard | object clone/paste inside one canvas document and generic object offset behavior | slide id, slide frame, placeholder binding, cross-slide id policy |
| Slide object clipboard | cross-slide payload metadata, slide-local paste target, and remap plan | host object serialization, final object mutation, format-specific details |

## Slide Metadata Inspector Contract

| Area | Contract |
| --- | --- |
| Active slide source | reuses slide rail `activeSlideId` and `slideOrder` |
| Fields | `name`, `background`, `notes`, optional `size`, optional `orientation` |
| Display priority | object selection inspector wins when selected object ids are present |
| Updates | field edits become host `slide-command-effect` payloads |
| Storage | host owns slide metadata values and persistence |

## Slide Transition Timing Contract

| Area | Contract |
| --- | --- |
| Read model | slide id, transition type, duration ms, and advance policy |
| Built-in types | `none`, `fade`, `push`; host-specific string descriptors remain allowed |
| Timing | duration clamps to 0..60000 ms; auto-advance `afterMs` is optional |
| Advance | click advance is explicit and may coexist with optional `afterMs` |
| Updates | field-level type, duration, and advance edits become host command effects |
| Runtime | host owns preview rendering, export mapping, and persistence |

## Contract Rules

- Public names stay product-neutral: slide, object, frame, bounds, selection, command, text.
- Placeholder and visibility state stay slide-domain contracts; they are not added to the generic canvas item schema.
- Slide-specific affordances depend on `canvas/core` and `canvas/foundation`; those packages do not depend on slide affordances.
- Host storage, renderer, and product object shapes stay behind adapter slots.
