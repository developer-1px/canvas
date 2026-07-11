# DOM Edit Affordance Reference Map

목표: DOM edit canvas의 시각 어포던스를 CSS 속성과 편집 의도에 맞춰 분리한다. Figma를 주 레퍼런스로 삼고, Adobe/Webflow에서 확인되는 guide, grid, box-model 문법을 보조 기준으로 삼는다.

## Sources

- Figma auto layout: padding, gap, alignment, resizing mode가 parent layout context에서 결정된다. <https://help.figma.com/hc/en-us/articles/360040451373-Guide-to-auto-layout>
- Figma horizontal/vertical auto layout: gap은 item 사이 거리/분배 값을 직접 편집하는 속성이다. <https://help.figma.com/hc/en-us/articles/31289464393751-Use-the-horizontal-and-vertical-flows-in-auto-layout>
- Figma grid auto layout: grid flow는 rows/columns track과 row/column gap을 따로 다룬다. <https://help.figma.com/hc/en-us/articles/31289469907863-Use-the-grid-auto-layout-flow>
- Figma position/dimensions: position, dimensions, rotation은 Design panel과 canvas handle 양쪽에서 조작된다. <https://help.figma.com/hc/en-us/articles/360039956914-Adjust-alignment-rotation-position-and-dimensions>
- Adobe XD guides/grids: guides는 정렬과 spacing 관리를 위한 시각 기준선이고, smart guides는 이동/변형 중 임시로 snap-align 기준을 제공한다. <https://helpx.adobe.com/xd/desktop/design/artboards-guides-and-layers/work-with-guides-and-grids-in-adobe-xd.html>
- Webflow flexbox: display flex 선택 시 direction, alignment, distribution, gap, child grow/shrink/basis가 노출된다. <https://university.webflow.com/videos/intro-to-flexbox>
- Webflow grid: CSS grid는 2차원 rows/columns layout과 grid cell 배치를 다룬다. <https://university.webflow.com/videos/grid-2-0>
- Webflow box model: content, padding, border, margin은 HTML element의 box를 구성하는 별도 영역이다. <https://university.webflow.com/videos/intro-to-the-box-model>
- cstar-ui-2 design measure devtool: fixed overlay, selected rect, margin/padding/content strips, red measure lines를 분리한다. `/Users/user/Desktop/NAVERCORP/cstar-ui-2/react/src/devtools/DesignMeasureDevtools.tsx`
- cstar-ui-2 source inspector devtool: selected/hover rect와 label을 content DOM 밖 overlay로 그린다. `/Users/user/Desktop/NAVERCORP/cstar-ui-2/react/src/devtools/ComponentLayerDevtools.tsx`

## Logic Tree

```text
selected DOM node
├─ identity
│  ├─ always: bounding box
│  ├─ always: label(display + flow)
│  └─ always: bottom size badge(rendered size + W/H mode)
├─ display context
│  ├─ flex container
│  │  ├─ idle: invisible gap/padding hit targets
│  │  ├─ gap hover/drag: all item gaps + single gap value, padding hidden
│  │  ├─ padding hover/drag: four padding bands + value, gap hidden
│  │  ├─ size badge hover: W/H Fixed-Hug-Fill dock
│  │  └─ inspector: direction, align, distribution, gap
│  ├─ grid container
│  │  ├─ idle: invisible grid gap hit target
│  │  ├─ gap hover/drag: grid tracks + grid gap value, padding hidden
│  │  ├─ padding hover/drag: box padding only, grid tracks hidden
│  │  └─ inspector: grid mode, gap, W/H mode
│  ├─ flex child
│  │  ├─ inspector: align-self, order, margin
│  │  └─ size badge hover: Fill appears only when parent can accept fill
│  └─ text/control/leaf
│     ├─ content metadata only
│     └─ box/effects remain editable when meaningful
├─ inspect modes
│  ├─ measure: parent inset distances only
│  └─ xray: content/padding/border/margin bands only
└─ transform mode
   ├─ handles: move/resize/rotate
   ├─ parent reference outline
   └─ center smart guides
```

## Property Mapping

| CSS concept | Canvas affordance | Visibility rule | Current owner |
| --- | --- | --- | --- |
| `display:flex` | Flex gap/padding/size affordances | Only selected flex container with children | `DomEditEditorOverlay` |
| `flex-direction` | H/V toolbar | Only while flex gap is active | `DomEditEditorOverlay` |
| `justify-content` | Distribution segmented control | Inspector only | `DomEditEditorInspector` |
| `align-items` | Align segmented control | Inspector only | `DomEditEditorInspector` |
| `align-self` | Parent participation controls | Only selected child of flex parent | `DomEditEditorInspector` |
| `gap` in flex | One band per real gap | Hover/drag gap; padding hidden | `DomEditEditorOverlay` |
| `display:grid` | Track guides + grid gap band | Hover/drag grid gap; padding hidden | `DomEditEditorOverlay` |
| `gap` in grid | Grid gap value | Only grid gap state | `DomEditEditorOverlay` |
| `padding` | Four box-edge bands | Hover/drag padding; gap hidden | `DomEditEditorOverlay` |
| `margin` | Parent participation field, X-ray outer band | Inspector/X-ray only | `DomEditEditorInspector`, `DomEditEditorOverlay` |
| `width/height` | Bottom size badge + dock | Hover/focus/click size badge | `DomEditEditorOverlay` |
| `border-radius` | Numeric box field | Inspector only | `DomEditEditorInspector` |
| `opacity` | Numeric effects field | Inspector only | `DomEditEditorInspector` |
| `transform` | Moveable handles + center guides | Transform mode only | `DomEditEditorOverlay` |
| box model | Content/padding/border/margin X-ray | X-ray mode only | `DomEditEditorOverlay` |
| measurement | Parent inset distance lines | Measure mode only | `DomEditEditorOverlay` |

## UI Placement Rules

```text
canvas
├─ selected node
│  ├─ top-left: identity label
│  ├─ bottom-center: size badge
│  ├─ in-box: gap/padding/grid guides only while active
│  └─ outside/parent: measure/transform reference guides only by mode
└─ right panel
   ├─ Parent: only parent participation
   ├─ Layout: only active display context controls
   ├─ Box: padding/radius/fixed W/H
   ├─ Effects: visual effects
   └─ Position: transform fields only when geometry mode is meaningful
```

## Negative Rules

- Gap and padding visuals must not be visible at the same time.
- Size mode controls must not float on top/right rails; they belong to the bottom size badge.
- Grid tracks must not appear for flex containers.
- Flex H/V controls must not appear while editing padding.
- Box-model X-ray must not show edit hit targets.
- Measure guides must not pollute idle selection.
- Widget rendering and DOM edit tooling stay separate.

## Slide Frame Guide Boundary

`DomEditFrameGuides`의 frame-local ruler offset, column count/gutter/margin 계산, out-of-frame guide filtering은 slide frame guide 계약에서 참고할 수 있다. `DomEditOverlayRect`, selected DOM distance label, React overlay rendering, DOM node id/ancestry는 DOM edit 전용으로 둔다.
