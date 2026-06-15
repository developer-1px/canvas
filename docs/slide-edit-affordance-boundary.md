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

## Contract Rules

- Public names stay product-neutral: slide, object, frame, bounds, selection, command, text.
- Slide-specific affordances depend on `canvas/core` and `canvas/foundation`; those packages do not depend on slide affordances.
- Host storage, renderer, and product object shapes stay behind adapter slots.
