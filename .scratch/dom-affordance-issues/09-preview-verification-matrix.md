## Parent

Parent roadmap: #101

## Type

AFK - every affordance slice를 preview에서 검증하는 QA/documentation slice다.

## What to build

DOM edit affordance system의 preview verification matrix를 만든다. 사용자가 요구한 것처럼 실제 canvas에서 몇 가지 UI를 만들고 선택/편집/팬/줌/drag하면서, HTML/CSS 편집 개념과 affordance가 일치하는지 확인할 수 있어야 한다.

이 slice는 단순 테스트 추가가 아니라, 앞으로 affordance 변경 때마다 “사용자가 직접 보는 화면에서 뭐가 맞아야 하는지”를 고정하는 검증 절차다.

## Verification scenarios

- Default selection: workspace page selected, top label and size badge only.
- Nested selection descent: click same point to descend `workspacePage → workspaceMain → workspaceContent → workspacePipeline → workspacePipelineList`.
- Flex gap edit: multiple gap bands appear and move together.
- Padding edit: padding band thickness follows value; gap hidden while active.
- Measure mode: red distance appears only in measure state.
- Box-model X-ray: margin/padding/border/content visible only in inspect state.
- Flex child participation: fill/hug/fixed appears in size badge and targeted rail.
- Grid sample: track/gap/cell/span affordances visible.
- Out-of-flow geometry: absolute sample gets transform handles; static sample does not.
- Pan/zoom: every overlay follows the DOM target within 1px.

## Implementation notes

- Use browser preview automation where possible.
- Keep assertions focused on visible state, not implementation internals.
- Add a small debug/test hook only if needed; avoid visible instructional text in demo UI.
- Store manual QA checklist near the figma-clone package or test docs.

## Acceptance criteria

- [ ] Preview verification checklist exists.
- [ ] Browser automation verifies selected DOM rect and overlay rect alignment.
- [ ] Browser automation verifies idle vs measure visibility.
- [ ] Browser automation verifies gap/padding mutual exclusion.
- [ ] Browser automation verifies pan/zoom tracking.
- [ ] `npx tsc --noEmit --pretty false` passes.
- [ ] Focused DOM edit tests pass.
- [ ] `npm run build` passes.

## Blocked by

- #102
- #103
- #104
- #105
- #106
- #107
- #108
- #109
