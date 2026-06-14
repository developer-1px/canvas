## Parent

Parent roadmap: #101

## Type

AFK - out-of-flow geometry editing과 smart alignment guide를 분리하는 implementation slice다.

## What to build

CSS normal flow 안의 DOM node에는 transform/resize handles를 기본 노출하지 않고, `position:absolute/fixed`, `ignore auto layout`, transform mode 같은 out-of-flow context에서만 geometry affordance를 보여준다. Adobe Smart Guides와 Figma snapping처럼 drag/resize 중에는 edge/center/equal spacing guide를 표시한다.

## UI behavior

- Static DOM: no move/resize/rotate handles.
- Absolute/fixed DOM: move/resize handles 표시.
- Relative offset editing: offset guide만 표시하고 full transform box는 과하게 노출하지 않는다.
- Drag 중: nearby sibling/frame edge/center에 smart guide 표시.
- Resize 중: fixed/hug/fill mode와 충돌하지 않는 geometry resize guide 표시.
- Rotate handle: transform mode 또는 transform property가 있는 node에만 표시.

## Implementation notes

- `context.showGeometry` gate를 더 세분화한다.
- Moveable integration은 geometry mode 전용으로 유지한다.
- Smart guide calculation은 selected rect와 candidate rect의 edge/center distance를 기준으로 한다.
- CSS flow layout edit와 geometry transform edit는 같은 handle을 공유하지 않는다.

## Acceptance criteria

- [ ] Static flex/block children에는 resize/rotate handles가 보이지 않는다.
- [ ] Absolute/fixed sample node에서는 geometry handles가 보인다.
- [ ] Drag 중 edge/center smart guide가 표시된다.
- [ ] Pan/zoom 중 smart guide 좌표가 target과 함께 움직인다.
- [ ] Width/height mode rail과 geometry resize handle이 동시에 혼동되게 보이지 않는다.
- [ ] Preview에 absolute/fixed sample을 추가해 검증한다.

## Blocked by

- #102
- #104
