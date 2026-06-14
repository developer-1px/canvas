## Parent

Parent roadmap: #101

## Type

AFK - current guide overlay를 기준으로 noise와 placement를 정리하는 구현 slice다.

## What to build

Selection guide layer를 “선택 identity만 보여주는 레이어”로 정규화한다. Figma/cstar-ui-2 문법처럼 selected bounding box는 stage-level overlay에서 그리고, DOM node 자체 outline이나 sibling stacking에 의존하지 않는다.

이 slice는 사용자가 선택한 DOM node가 무엇인지, 어떤 layout context인지, 실제 렌더링 크기가 얼마인지 즉시 알 수 있게 하는 기본 affordance를 안정화한다. 반대로 gap, padding, parent distance, W/H mode rail 같은 편집 affordance는 selection identity layer에 섞지 않는다.

## UI behavior

- Bounding box: selected DOM node의 rendered bounds와 정확히 맞는다.
- Top label: `{node label} · {display} {direction?}`까지만 표시한다.
- Bottom size badge: `{rendered width} x {rendered height} · {widthMode} / {heightMode}`를 표시한다.
- Parent outline: nested selection에서만 약하게 표시한다. Idle에서 red measurement line은 보이지 않는다.
- Corner handles: static flow에서는 decoration 수준이거나 숨김. Transform mode에서만 진짜 resize handles가 된다.

## Implementation notes

- `FigmaCloneDomGuideOverlay`의 label/size/bounds 책임을 명확히 유지한다.
- `FigmaCloneDomSelectionOverlay`의 rAF measurement loop를 유지해 pan/zoom 중 좌표가 밀리지 않게 한다.
- `[data-selected='true']` DOM outline에 의존하지 않는다.
- parent outline과 red measurement guide는 별도 gate를 통과해야 한다.

## Acceptance criteria

- [ ] Top label에서 W/H mode 텍스트가 보이지 않는다.
- [ ] Bottom size badge에서 W/H numeric + mode가 보인다.
- [ ] Bounding box가 selected element `getBoundingClientRect()`와 1px 이내로 일치한다.
- [ ] Pan 이후에도 selected DOM rect와 overlay rect 이동량이 일치한다.
- [ ] Nested DOM selection에서 parent outline은 보이되, red distance guide는 idle에서 숨겨진다.
- [ ] Widget selection과 DOM edit selection의 UI/상태가 섞이지 않는다.
- [ ] Preview에서 `workspacePage`, `workspaceMain`, `workspacePipelineList`를 각각 선택해 검증한다.

## Blocked by

- #102
