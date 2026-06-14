## Parent

Parent roadmap: #101

## Type

AFK - grid display vocabulary를 flex와 분리하는 implementation slice다.

## What to build

`display:grid` DOM node를 위한 grid-specific affordance를 추가한다. Figma Grid Auto Layout과 CSS Grid의 공통 vocabulary인 rows/columns tracks, row-gap/column-gap, occupied cell area, span handles를 canvas에 표시한다.

현재 DOM edit model은 flex 중심이다. 이 slice는 grid를 flex의 변형으로 다루지 않고, 2D layout surface로 독립 처리하기 위한 첫 tracer bullet이다.

## UI behavior

- Grid container selected: row/column track lines 표시.
- Track hover: track label/pill 표시.
- Row-gap/column-gap: 서로 다른 방향의 gap band 표시.
- Grid child selected: occupied cell/area outline 표시.
- Span hover/edit: start/end track edge handles 표시.
- Grid affordance는 flex gap/padding UI와 섞이지 않는다.

## Implementation notes

- Model에 grid sample DOM node를 추가하거나 existing workspace content 일부를 grid로 전환한다.
- Computed style에서 `grid-template-columns`, `grid-template-rows`, `row-gap`, `column-gap`을 읽는다.
- 초기 slice에서는 explicit grid tracks만 지원하고 auto-placement 복잡도는 제한한다.
- Inspector는 grid mode일 때 flex controls 대신 grid controls를 보여야 한다.

## Acceptance criteria

- [ ] Grid sample이 DOM edit frame 안에 존재한다.
- [ ] Grid container 선택 시 track lines가 보인다.
- [ ] Row-gap과 column-gap이 별도 affordance로 보인다.
- [ ] Grid child 선택 시 occupied cell area가 보인다.
- [ ] Flex-only controls가 grid node에 잘못 노출되지 않는다.
- [ ] Preview에서 grid container와 grid child 선택을 각각 검증한다.

## Blocked by

- #102
- #103
