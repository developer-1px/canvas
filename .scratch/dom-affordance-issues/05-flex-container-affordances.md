## Parent

Parent roadmap: #101

## Type

AFK - selected node가 flex container일 때의 direct manipulation slice다.

## What to build

`display:flex`이고 children이 있는 selected DOM node에 대해 flex container affordance를 정리한다. Figma Auto Layout의 방향, gap, padding, alignment, distribution을 CSS flex 속성에 맞춰 canvas에서 직접 이해/수정할 수 있게 한다.

현재 gap/padding/direct H-V affordance가 존재하지만, idle/hover/drag state와 alignment/distribution guide가 아직 약하다. 이 slice는 flex container에만 적용되는 UI vocabulary를 확정한다.

## UI behavior

- Direction: selected flex container 하단 근처에 H/V axis chip을 표시한다.
- Gap: child 사이 모든 gap band를 표시하고, 하나의 gap 값 변경으로 함께 움직인다.
- Padding: selected bounds 내부 top/right/bottom/left band를 표시한다. 0이면 idle에서 숨긴다.
- Gap active: padding/margin/measurement 숨김.
- Padding active: gap/margin/measurement 숨김.
- Justify-content hover: main-axis distribution guide를 표시한다.
- Align-items hover: cross-axis alignment guide를 표시한다.
- `space-between` 상태는 gap numeric control과 다르게 distribution affordance로 보인다.

## Implementation notes

- `FigmaCloneDomAutoLayoutOverlay`에 flex-specific rendering branch를 둔다.
- Gap rect 계산은 actual child rect 사이 distance를 기준으로 한다.
- Direction 변경 시 size/gap/padding labels가 frame 밖으로 과하게 겹치지 않게 배치한다.
- inspector control hover와 canvas affordance hover가 같은 active property gate를 공유하게 한다.

## Acceptance criteria

- [ ] Flex container가 아닌 node에는 gap/direction affordance가 보이지 않는다.
- [ ] Row flex와 column flex에서 gap band 방향이 올바르다.
- [ ] 여러 gap band가 모두 표시되고 같은 값으로 함께 편집된다.
- [ ] Gap drag 중 padding affordance는 숨겨진다.
- [ ] Padding drag 중 gap affordance는 숨겨진다.
- [ ] Padding 값이 커지면 band thickness도 커진다.
- [ ] Direction H/V 변경 후 실제 DOM layout이 변경된다.
- [ ] Preview에서 `workspacePage`, `workspaceMain`, `workspacePipelineList`, `workspaceHeroActions`를 검증한다.

## Blocked by

- #102
- #103
