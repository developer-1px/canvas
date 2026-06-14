## Parent

Parent roadmap: #101

## Type

AFK - CSS box model을 inspect mode로 보여주는 독립 slice다.

## What to build

Webflow X-ray와 CSS box model 문법을 참고해 DOM edit canvas에 box-model inspection affordance를 추가한다. 이 mode는 일반 편집 UI가 아니라 selected/hovered element의 content, padding, border, margin을 이해하기 위한 inspection UI다.

기존 auto-layout padding affordance는 flex container의 padding을 직접 조작하기 위한 편집 surface다. Box-model X-ray는 display와 무관하게 CSS box model을 읽는 surface이므로 별도 overlay로 분리한다.

## UI behavior

- Content box: selected element의 content 영역을 약한 neutral fill/outline으로 표시한다.
- Padding: border 안쪽 spacing을 amber/pink band로 표시한다.
- Border: element border edge를 thin line으로 표시한다.
- Margin: border 바깥 spacing을 purple/neutral outer band로 표시한다.
- Margin collapse 같은 CSS 특수 케이스는 초기 slice에서 computed visual box 기준으로 단순화한다.
- X-ray mode에서는 주변 요소도 hover 기준으로 border/margin/padding을 볼 수 있다.

## Implementation notes

- 새 overlay 후보: `FigmaCloneDomBoxModelOverlay`.
- `getComputedStyle()`에서 `padding*`, `border*Width`, `margin*`을 읽는다.
- rendered rect와 computed style을 결합해 screen-space bands를 만든다.
- AutoLayout padding edit affordance와 X-ray padding inspection affordance가 동시에 강하게 보이지 않도록 gate를 둔다.

## Acceptance criteria

- [ ] X-ray/inspect mode가 별도 gate로 존재한다.
- [ ] Selected element의 padding, border, margin이 서로 다른 visual band로 표시된다.
- [ ] Padding 0, margin 0은 label 없이 hit/outline만 최소화된다.
- [ ] Auto-layout gap edit 중에는 X-ray bands가 숨겨진다.
- [ ] Static block/inline element도 box model inspect가 가능하다.
- [ ] Preview에서 `workspacePipelineList`, `workspaceDealOne`, `workspaceMain`을 검사한다.

## Blocked by

- #102
