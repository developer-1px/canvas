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
| Object accessibility | `slide-edit-affordance` | object alt text, decorative state, metadata attribute, and host command effect |
| Object animation build order | `slide-edit-affordance` | object animation type, trigger, timing, and slide-local build order |
| Object corner radius | `slide-edit-affordance` | object corner radius value, support state, numeric bounds, and host command effect |
| Object fill opacity | `slide-edit-affordance` | object fill-only opacity value, support state, and host command effect |
| Object hyperlink/action | `slide-edit-affordance` | object URL/action metadata, URL policy, and host command effect |
| Object opacity | `slide-edit-affordance` | object opacity value, metadata attribute, and host command effect |
| Object shadow/effect | `slide-edit-affordance` | object shadow subset, metadata attribute, and host command effect |
| Object stroke line style | `slide-edit-affordance` | object stroke solid/dash/dot subset and host command effect |
| Layout/theme affordance | `slide-edit-affordance` | layout, master, placeholder mapping, and theme token descriptors |
| Slide object clipboard | `slide-edit-affordance` | source slide metadata, paste target, and id remap plan |
| Slide metadata inspector | `slide-edit-affordance` | active slide name, background, notes, size, orientation fields |
| Style clipboard | `slide-edit-affordance` | source object style categories, target applicability, and format painter command effects |
| Slide transition timing | `slide-edit-affordance` | transition type, duration, click/after advance policy |
| Text font family | `slide-edit-affordance` | selected text object font family options and command effects |
| Text frame inset | `slide-edit-affordance` | text frame top/right/bottom/left inset metadata and command effects |
| Text vertical alignment | `slide-edit-affordance` | text frame internal vertical alignment metadata and command effects |
| Text paragraph spacing | `slide-edit-affordance` | line height and paragraph before/after spacing descriptors |
| Text measurement | `slide-edit-affordance` | bounded text size, overflow, and auto-fit hints |
| Object inspector | `slide-edit-affordance` | object-level inspector grouping without DOM layout assumptions |

## Host Adapter Slots

| Slot | Host Provides |
| --- | --- |
| `slide-frame` | Editable page frame in canvas coordinates |
| `object-bounds` | Object bounds for a slide/object reference |
| `selection` | Active page id and selected object ids |
| `command-effect` | Transaction boundary for command effects |
| `object-accessibility` | Selected object alt text and decorative state for inspector, stage, thumbnail, and export |
| `object-animation` | Object animation and build order values scoped to a slide |
| `object-corner-radius` | Selected object corner radius values for rounded shape affordances |
| `object-fill-opacity` | Selected object fill opacity values separate from whole-object opacity |
| `object-hyperlink` | Selected object hyperlink/action values for inspector, stage, thumbnail, and export |
| `object-opacity` | Selected object opacity values for inspector, stage, thumbnail, and export |
| `object-shadow` | Selected object shadow values for inspector, stage, thumbnail, and export |
| `object-stroke-line-style` | Selected object stroke line style values for inspector, stage, thumbnail, and export |
| `layout-theme` | Layout, master, placeholder, and theme token descriptors |
| `slide-metadata` | Active slide metadata values for inspector descriptors |
| `style-clipboard` | Copied style categories and formatting paste availability |
| `slide-transition` | Slide transition and advance timing values for inspector, preview, and export |
| `text-font-family` | Selected text object font family value and allowed family options |
| `text-frame-inset` | Selected text object frame inset values for stage, thumbnail, and export |
| `text-vertical-alignment` | Selected text object vertical alignment value for stage, thumbnail, and export |
| `text-paragraph-spacing` | Text paragraph spacing and line height values for object inspectors |
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

## Text Paragraph Spacing Contract

| Area | Contract |
| --- | --- |
| Read model | slide id, text object id, line-height ratio, paragraph before spacing, paragraph after spacing |
| Line height | ratio-based numeric subset with 0.5..4 normalization |
| Paragraph spacing | numeric amount in `px` or `slide-unit`, normalized to 0..1000 |
| Fields | `lineHeightRatio`, `paragraphBefore`, `paragraphAfter` descriptors |
| Updates | field edits become host command effects with object id and normalized value |
| Runtime | host owns text layout, preview rendering, export mapping, and persistence |

## Text Font Family Contract

| Area | Contract |
| --- | --- |
| Read model | slide id, selected text object id, current font family, fallback, option list |
| Options | host-provided font family list with label, source, and optional default marker |
| Field | `fontFamily` select descriptor routes through `update-text-font-family` |
| Fallback | unknown or empty family normalizes to fallback or first allowed option |
| Updates | selected object id and normalized font family value become host command effects |
| Runtime | host owns actual font loading, text layout, export mapping, and persistence |

## Text Vertical Alignment Contract

| Area | Contract |
| --- | --- |
| Values | `top`, `middle`, `bottom`; `top` is the default |
| Field | `verticalAlignment` segmented-control descriptor |
| Metadata | `data-slide-text-vertical-align` carries the normalized value |
| Updates | selected text object id and normalized alignment become host command effects |
| Runtime | stage, thumbnail, inspector, and export can read the same metadata value |

## Text Frame Inset Contract

| Area | Contract |
| --- | --- |
| Values | `top`, `right`, `bottom`, `left` numeric inset values; default is `0 0 0 0` |
| Fields | one `inset-number` descriptor per side, routed through `update-text-frame-inset` |
| Metadata | `data-slide-text-frame-inset` carries `top right bottom left` order |
| Normalization | values clamp to 0..1000 px and round to two decimals |
| Updates | selected text object id, side, and normalized inset value become host command effects |
| Runtime | stage, thumbnail, inspector, and export can read the same metadata value |

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

## Object Animation Build Order Contract

| Area | Contract |
| --- | --- |
| Read model | slide id, object id, animation type, trigger, duration, delay, build order |
| Built-in types | `none`, `fade-in`, `fly-in`; host-specific string descriptors remain allowed |
| Built-in triggers | `on-click`, `with-previous`; host-specific trigger descriptors remain allowed |
| Timing | duration and delay clamp to 0..60000 ms |
| Build order | slide-local object order sorts by numeric order and preserves input order for ties |
| Updates | field-level type, trigger, duration, delay, and order edits become host command effects |
| Runtime | host owns animation preview rendering, export mapping, and persistence |

## Object Accessibility Contract

| Area | Contract |
| --- | --- |
| Value | accessibility uses `altText` and `decorative` |
| Default | empty alt text and `decorative: false` serialize as `none` |
| Decorative | decorative objects normalize to empty alt text while retaining decorative metadata |
| Field | alt text and decorative fields route through `update-object-accessibility` |
| Removal | `remove-object-alt-text` clears object description through a host command effect |
| Metadata | `data-slide-object-accessibility` carries `none` or a JSON string for normalized accessibility metadata |
| Scope | describes slide content objects, not app chrome, toolbar controls, or UI `aria-label` strings |
| Runtime | stage, thumbnail, presentation, inspector, and export can read the same metadata value |

## Object Opacity Contract

| Area | Contract |
| --- | --- |
| Value | `opacity` is a normalized numeric ratio from `0` to `1`; default is `1` |
| Field | `opacity` slider descriptor routes through `update-object-opacity` |
| Metadata | `data-slide-object-opacity` carries the normalized value as an attribute string |
| Normalization | invalid values use `1`; valid values clamp to `0..1` and round to two decimals |
| Updates | selected object id and normalized opacity value become host command effects |
| Runtime | stage, thumbnail, presentation, inspector, and export can read the same metadata value |

## Object Fill Opacity Contract

| Area | Contract |
| --- | --- |
| Value | fill opacity is a normalized numeric ratio from `0` to `1`; default is `1` |
| Field | `fillOpacity` slider descriptor routes through `update-object-fill-opacity` |
| Bounds | numeric bounds are `0..1` with `0.01` step |
| Metadata | `data-slide-object-fill-opacity` carries the normalized value or `unsupported` |
| Unsupported | objects without fill can expose `isSupported: false` and reason `no-fill` |
| Independence | only fill alpha changes; object opacity, stroke opacity, and text opacity stay separate |
| Updates | selected object id and normalized fill opacity value become host command effects |
| Runtime | stage, thumbnail, presentation, inspector, and export can read the same metadata value |

## Object Corner Radius Contract

| Area | Contract |
| --- | --- |
| Value | corner radius is a normalized numeric value; default is `0` |
| Field | `cornerRadius` slider descriptor routes through `update-object-corner-radius` |
| Bounds | default bounds are `0..1000` with `1` step and `px` unit |
| Metadata | `data-slide-object-corner-radius` carries the normalized value or `unsupported` |
| Unsupported | non-rounded-shape selections can expose `isSupported: false` and reason `unsupported-shape` |
| Mapping | host maps the value to DOM border radius, SVG radii, or another renderer-specific shape model |
| Updates | selected object id and normalized corner radius value become host command effects |
| Runtime | stage, thumbnail, presentation, inspector, and export can read the same metadata value |

## Object Hyperlink/Action Contract

| Area | Contract |
| --- | --- |
| Value | hyperlink uses `url`, `target`, and optional `title` |
| Default | empty URL is disabled and serializes as `none` |
| Target | built-in targets are `same-context` and `new-context` |
| Field | URL, target, and title fields route through `update-object-hyperlink` |
| Removal | `remove-object-hyperlink` clears action metadata through a host command effect |
| Metadata | `data-slide-object-hyperlink` carries `none` or a JSON string for normalized action metadata |
| URL policy | default allowed schemes are `https`, `http`, and `mailto`; hosts can override allowed schemes |
| Scope | mutates existing slide object action metadata, not link-preview import or media insertion |
| Runtime | stage, thumbnail, presentation, inspector, and export can read the same metadata value |

## Object Shadow/Effect Contract

| Area | Contract |
| --- | --- |
| Value | shadow uses `enabled`, `color`, `opacity`, `blur`, `angle`, and `distance` |
| Default | `enabled` is `false`; disabled metadata serializes as `none` |
| Field | each field routes through `update-object-shadow` |
| Metadata | `data-slide-object-shadow` carries `none` or a JSON string for the normalized shadow subset |
| Normalization | opacity clamps to `0..1`; blur and distance clamp to non-negative limits; angle clamps to `0..360` |
| Updates | selected object id, field id, and normalized value become host command effects |
| Scope | applies to slide content objects, not demo chrome, panel decoration, or app-shell shadows |
| Runtime | stage, thumbnail, presentation, inspector, and export can read the same metadata value |

## Object Stroke Line Style Contract

| Area | Contract |
| --- | --- |
| Value | line style is one of `solid`, `dash`, or `dot`; default is `solid` |
| Field | `strokeLineStyle` segmented descriptor routes through `update-object-stroke-line-style` |
| Metadata | `data-slide-object-stroke-line-style` carries the normalized value or `unsupported` |
| Unsupported | objects without stroke can expose `isSupported: false` and reason `no-stroke` |
| Scope | applies to stroked slide content objects such as outlines, lines, connectors, and paths |
| Updates | selected object id and normalized line style become host command effects |
| Runtime | stage, thumbnail, presentation, inspector, and export can read the same metadata value |

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

## Style Clipboard / Format Painter Contract

| Area | Contract |
| --- | --- |
| Payload | source slide id, source object id, source kind, copied style category descriptors, and opaque style payloads |
| Categories | built-in category ids include `shape-fill`, `shape-stroke`, `line-style`, `text-style`, and `object-effect` |
| Copy command | host receives `copy-object-formatting` with a `slide-style-clipboard` payload |
| Paste availability | each target object exposes applicable category ids, ignored category ids, support state, and disabled reason |
| Paste command | host receives `paste-object-formatting` with per-target category applications |
| Partial apply | unsupported categories are ignored per target instead of blocking compatible categories |
| Scope | copies style subsets only; it does not clone content, object ids, groups, placeholders, or slide placement |
| Runtime | host owns mapping category payloads to its shape, text, line, and effect model |

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
