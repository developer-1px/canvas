## Parent

Parent roadmap: #101

## Type

HITL - CSS-contextual affordance vocabulary의 기준을 고정하는 UX/architecture decision slice다. 구현은 작게 갈 수 있지만, 이후 모든 slice가 이 visibility grammar를 따른다.

## What to build

DOM edit canvas의 affordance visibility state machine을 명시하고 코드에 반영한다. Selection guide, layout affordance, measurement guide, box-model X-ray, transform controls가 서로 다른 책임을 갖도록 overlay ownership을 정한다.

이 slice의 목적은 UI를 더 추가하는 것이 아니라, “언제 무엇을 숨길지”를 먼저 고정하는 것이다. 현재 화면은 selection, parent distance, gap, padding, size rail이 동시에 보이기 쉬워서 정보 우선순위가 흐려진다. Figma, Adobe Smart Guides, Webflow X-ray를 기준으로 idle/hover/drag/inspect/transform 상태를 분리한다.

## UX logic

- Idle: selected bounding box, top label, bottom size badge만 보인다.
- Nested idle: parent outline은 아주 약하게 보이거나 필요 시에만 보인다.
- Hover property: hovered property affordance만 강조한다.
- Drag property: active affordance와 live value만 보이고, unrelated affordance는 숨긴다.
- Measure modifier: red measurement guide를 표시한다.
- X-ray/inspect: margin, border, padding, content box를 표시한다.
- Transform mode: out-of-flow element에만 resize/rotate/move handles를 표시한다.

## Implementation notes

- `FigmaCloneDomGuideOverlay`: selection identity, parent/reference hints, measurement rendering을 소유한다.
- `FigmaCloneDomAutoLayoutOverlay`: flex/grid layout property 직접 조작을 소유한다.
- future `FigmaCloneDomBoxModelOverlay`: margin/padding/border/content inspection을 소유한다.
- future `FigmaCloneDomSmartGuideOverlay`: drag/resize 중 alignment/snap guide를 소유한다.
- `FigmaCloneDomSelectionOverlay`는 측정 루프와 overlay composition만 맡는다.

## Acceptance criteria

- [ ] Affordance state union이 코드에 존재한다. 예: `idle`, `hover-property`, `drag-property`, `measure`, `xray`, `transform`.
- [ ] 각 state에서 visible overlay set이 한 곳에서 결정된다.
- [ ] Gap drag 중 padding, margin, measurement가 보이지 않는다.
- [ ] Padding drag 중 gap, margin, measurement가 보이지 않는다.
- [ ] Idle 상태에서 red distance guide가 항상 보이지 않는다.
- [ ] Static normal-flow DOM node에는 Moveable transform box가 보이지 않는다.
- [ ] Top label에는 identity만 남고 W/H mode는 bottom size badge로 유지된다.
- [ ] Preview에서 state별 before/after screenshot 또는 DOM assertion으로 확인할 수 있다.

## Blocked by

Parent roadmap #101. Can start immediately after triage.
