## What to build

DOM edit canvas의 편집 어포던스를 Figma를 주 레퍼런스로 삼아 재정의한다. 목표는 HTML/CSS DOM을 “웹 빌더처럼 모든 속성을 노출하는 UI”가 아니라, 선택된 노드의 CSS context에 따라 필요한 guide, measurement, box-model, layout control만 필요한 순간에 보여주는 편집 체계로 만드는 것이다.

현재 DOM edit 예시는 React widget과 파일/개념상 분리되었고, selection overlay, auto-layout overlay, guide overlay가 존재한다. 하지만 UI가 아직 과하거나, measurement/parent guide가 idle 상태에 너무 많이 보이거나, flex/grid/block/position에 따라 affordance vocabulary가 충분히 분기되지 않는다. 이 roadmap은 해당 체계를 issue 단위로 세분화해 구현과 preview 검증을 진행한다.

## Reference model

- Figma: 선택 bounding box, top label, bottom size badge, auto-layout gap/padding controls, red measurement guides, resizing modes.
- Adobe XD: padding canvas drag controls, stack/padding/responsive resize 조합.
- Adobe Illustrator / Photoshop: Smart Guides, Distance Guides, edge/center alignment and delta measurement during manipulation.
- Webflow: X-ray mode, selected/hovered element의 border, margin, padding 시각화.

## Product principles

- Idle 상태는 선택 identity만 보여준다.
- Hover 상태는 사용자가 건드릴 수 있는 속성 하나만 보여준다.
- Drag 상태는 active property의 값과 영향만 보여주고 나머지는 숨긴다.
- Inspect/measure 상태는 거리, parent, sibling, box-model 정보를 보여준다.
- Transform handles는 CSS normal flow 안의 DOM에는 기본적으로 노출하지 않는다.
- `display:flex`, `display:grid`, `display:block/inline`, `position:absolute/fixed/static`은 서로 다른 affordance vocabulary를 가져야 한다.
- Demo 설명과 장식은 최소화한다. 화면은 도구 자체가 설명이 되도록 만든다.

## Roadmap slices

- #102 Affordance visibility state machine and overlay ownership contract.
- #103 Selection guide layer normalization.
- #104 Measurement/reference guide gating.
- #105 Box-model X-ray mode.
- #106 Flex container affordances.
- #107 Flex child participation affordances.
- #108 Grid affordances.
- #109 Out-of-flow transform and smart alignment affordances.
- #110 Preview verification matrix.

## Acceptance criteria

- [ ] CSS context별 affordance 로직 트리가 코드와 UI에 반영된다.
- [ ] `widget`과 `DOM edit` 구현 파일/개념/상태가 계속 분리된다.
- [ ] Idle 화면은 과하지 않고 selection identity만 남는다.
- [ ] Gap, padding, margin, measurement, transform affordance가 서로 섞여 동시에 과하게 보이지 않는다.
- [ ] Flex/grid/block/position context가 서로 다른 UI vocabulary로 분기된다.
- [ ] 각 slice는 `http://127.0.0.1:53175/` preview에서 직접 검증된다.
- [ ] Typecheck, focused tests, production build가 통과한다.

## Blocked by

None - can start immediately.
