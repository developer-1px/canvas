## Parent

Parent roadmap: #101

## Type

AFK - measurement state를 추가하고 guide visibility를 줄이는 구현 slice다.

## What to build

Red measurement/reference guide를 idle UI에서 분리한다. Figma와 Illustrator의 Distance Guides처럼 measurement는 “항상 보이는 편집 affordance”가 아니라 modifier/inspect/hover reference 상태에서만 보이는 정보 affordance다.

현재 구현은 nested selection에서 parent edge distance 4개가 바로 보일 수 있다. 이 slice에서는 distance guide를 `measure` state 또는 명시적 reference hover 상태로 이동시키고, parent/sibling/frame 기준을 분리한다.

## UI behavior

- Idle: red distance guide 숨김.
- Measure modifier: selected node와 hovered node 사이의 horizontal/vertical distance 표시.
- Parent measure: selected node와 parent content/bounds edge 사이 inset distance 표시.
- Frame measure: selected node와 DOM edit frame/artboard edge 사이 distance 표시.
- Nested measure: deeply nested layer도 bounds 기준으로 측정한다.
- Measurement color는 red 계열로 고정한다.

## Implementation notes

- `FigmaCloneDomGuideOverlay`는 distance render primitive를 유지하되 visibility gate를 받는다.
- `FigmaCloneDomSelectionOverlay` 또는 상위 app state에서 modifier/measure mode를 주입한다.
- `getBoundingClientRect()` 기준 측정과 CSS logical property 기준 측정을 혼동하지 않는다.
- Figma처럼 object bounds 기준으로 먼저 구현한다. Text baseline measurement는 별도 future concern이다.

## Acceptance criteria

- [ ] Idle nested selection에서 red distance line이 보이지 않는다.
- [ ] Measure mode에서 parent edge distance가 표시된다.
- [ ] Measure mode에서 sibling hover 시 selected ↔ sibling distance가 표시된다.
- [ ] Distance label은 zoom/pan 중 selected target을 따라간다.
- [ ] Distance guide는 gap/padding drag 중 표시되지 않는다.
- [ ] Measurement guide와 gap/padding affordance 색상이 명확히 다르다.
- [ ] Preview에서 parent, sibling, frame 기준 측정을 각각 검증한다.

## Blocked by

- #102
- #103
