## Parent

Parent roadmap: #101

## Type

AFK - selected node가 flex parent 안의 child일 때의 participation controls slice다.

## What to build

Selected node 자체의 display가 아니라 parent의 display가 `flex`일 때 적용되는 child participation affordance를 추가한다. CSS flex child는 width/height mode, align-self, margin, order 같은 속성으로 parent layout에 참여한다. 이 속성들은 container gap/padding affordance와 다른 UI 위치와 다른 mental model을 가져야 한다.

## UI behavior

- W/H mode: bottom size badge에 항상 요약한다.
- W/H edge rail: size badge나 selected edge hover 시에만 나타난다.
- Fill option: flex parent 안의 child일 때만 나타난다.
- Align-self: cross-axis marker로 표시한다. `auto`는 parent align-items를 따르는 상태로 표현한다.
- Margin: selected bounds 바깥 outer band로 표시한다.
- Order/reorder: drag/reorder interaction 중 insertion line으로 표시한다.
- Container gap/padding과 child margin/align-self가 동시에 강하게 보이지 않는다.

## Implementation notes

- `getFigmaCloneDomLayoutContext`의 `parentDisplay === 'flex'`를 primary gate로 사용한다.
- `widthMode`, `heightMode` controls는 child participation surface로 본다.
- Existing size rail을 idle 고정 UI가 아니라 hover/targeted UI로 낮춘다.
- margin은 `FigmaCloneDomBoxModelOverlay` 또는 child participation overlay와 책임을 맞춘다.

## Acceptance criteria

- [ ] Flex parent 밖의 node에는 Fill mode가 노출되지 않는다.
- [ ] Top-level root에는 Fill mode가 노출되지 않는다.
- [ ] Bottom size badge에 Fixed/Hug/Fill이 표시된다.
- [ ] Size mode rail은 idle에서 항상 떠 있지 않고 edge/size target에서만 뜬다.
- [ ] Margin affordance는 selected bounds 바깥에 표시된다.
- [ ] Align-self hover 시 cross-axis guide가 표시된다.
- [ ] Preview에서 `workspaceSidebar`, `workspaceMain`, `workspaceDealOne`을 검증한다.

## Blocked by

- #102
- #106
