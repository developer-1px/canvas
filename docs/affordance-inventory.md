# Canvas Affordance Inventory

목적: core에는 보편 canvas 편집 부품만 남기고, product/demo 장식은 default path에서 제거한다.

## Keep

| 부품 | 이유 |
|------|------|
| Viewport pan/zoom | 모든 canvas류 편집기의 기본 이동 affordance |
| Object selection | 편집 대상 지정의 공통 affordance |
| Nested object selection | group 같은 wrapper를 해체하지 않고 내부 child를 직접 편집하는 공통 affordance |
| Object toolbar | 선택 object type에 맞는 edit/style/route/action 노출 affordance |
| Transform/resize/rotation | 선택한 object를 이동, 크기 조정, 회전하는 공통 affordance |
| Layer order/z-order | 선택 object를 앞/뒤로 보내는 공통 arrange affordance |
| Snap/grid/guides | 이동/생성/리사이즈 중 위치 보정을 돕는 공통 arrange affordance |
| Text editing | canvas object의 텍스트 편집 공통 affordance |
| Shape creation | 하나의 shape 생성 affordance와 선택 후 rect/ellipse/diamond 전환 |
| Sticky note | FigJam류 whiteboard의 기본 post-it object affordance |
| Connector/arrow | object 사이 관계를 표현하는 공통 affordance |
| Drawing stroke | marker/highlighter/eraser 계열 freehand affordance |
| Image object | canvas asset/object 배치 affordance |
| Keyboard command routing | select/delete/duplicate/nudge/undo/redo 같은 입력 affordance |
| Context command menu | right-click/context key로 같은 command surface를 여는 공통 affordance |

Rotation v1 stores optional degrees on supported bounded leaf items and keeps
unsupported items disabled rather than adding a full transform inspector.

## Legacy Concept

| 항목 | 분류 | 이유 |
|------|------|------|
| DOM inspector | feature 후보 | DOM tree 선택 개념은 쓸 수 있지만 core engine default는 아님 |
| HTML/CSS specimen | legacy consumer demo | CSS cascade/editor 실험으로는 유효하지만 canvas affordance core보다 제품 쪽에 가까움 |
| Design-system specimen | legacy product demo | source/design 협업 제품 컨셉이며 default engine demo를 흐림 |
| Widget-like modules | extension seam | React component 또는 trusted HTML/CSS를 canvas object 안에 렌더링하는 custom item helper로 살림 |
| Comment annotations | collaboration part | 독립 canvas object로는 살리되 thread/sidebar/review product는 core가 아님 |

Legacy specimen tests are kept as `.legacy.ts(x)` and excluded from the default test run until the DOM/CSS feature is promoted again.

## File-Level Boundary

| Path | 판정 | 이유 |
|------|------|------|
| `src/demo/CanvasDevToolsDemoApp.tsx` | keep | default engine demo shell. FigJam-like controls and canvas stage만 보여준다 |
| `src/demo/CanvasDevToolsDemoApp.css` | keep | demo-specific minimal layout only |
| `src/demo/CanvasDemoAssembly.ts` | keep | demo assembly entry. built-in affordance wiring의 canonical path |
| `src/demo/CanvasDemoSeedItems.ts` | keep | engine demo seed document |
| `src/demo/custom-items/index.ts` | keep seam | custom object extension point. default exports stay empty |
| `src/demo/custom-items/widget-counter/**` | extension fixture | FigJam widget-like seam 검증용 sample module. default demo에서 import하지 않는다 |
| `src/canvas/app/extensions/widgets/**` | keep seam | React/HTML widget을 `<foreignObject>` custom item으로 렌더링하는 authoring helper |
| `src/demo/custom-items/html-specimen/**` | legacy quarantine | DOM/CSS editor consumer demo. default demo에서 import하지 않는다 |
| `e2e/legacy/html-specimen-paste-to-edit.legacy.ts` | legacy quarantine | promoted DOM/CSS feature가 될 때만 되살릴 regression suite |
| `src/canvas/app/shell/CanvasAppView.tsx` | keep generic | app surfaces must not branch on consumer panel ids |
| `src/canvas/app/affordances/editing/inspector/CanvasObjectInspector.tsx` | keep generic | custom panel은 기본 bounds/style inspector 옆에 compose만 한다 |
| `src/canvas/app/shell/CanvasApp.css` | keep generic | consumer-specific rail/inspector styling 제거 대상 |

## Cleanup Decisions

| 항목 | 판정 | 이유 |
|------|------|------|
| `html-specimen-css` branch in app shell | 제거 | custom panel id가 selection bar와 zoom controls를 숨기는 것은 core affordance 오염 |
| `object-inspector-devtools` mode | 제거 | HTML/CSS demo만을 위한 takeover chrome이며 inspector compose 규칙과 충돌 |
| `canvas-floating-zone-devtools-rail` CSS | 제거 | 위 특수 모드 제거 후 존재 이유 없음 |
| `DEMO_CUSTOM_ITEM_MODULES = []` | 유지 | widget-like/custom-object seam은 남기되 default product 기능을 붙이지 않는 경계 |
| `widget-counter` sample module | fixture 유지 | custom item module 계약 검증용이며 default demo surface로 승격하지 않는다 |

## Drop From Default Demo

| 항목 | 이유 |
|------|------|
| Product rail/source/review UI | engine affordance 검증과 무관한 장식 |
| Voting/session/spotlight/emote controls | facilitation product surface이며 core demo의 보편 부품이 아님 |
| Command palette/component palette/floating product chrome | 같은 명령 노출 취지의 중복 UI surface |
| Export HTML/CSS/patch UI | DOM/CSS consumer feature이며 canvas engine core가 아님 |

Facilitation 기능은 제거 대상이 아니라 `canvas-facilitation` first-party
bundle이다. Host/Demo는 `withCanvasAppFacilitationBundle`로 timer, voting,
spotlight, emote, cursor chat, laser pointer의 overlay/shortcut/gesture/tool
toggle을 한 번에 opt-in/out한다.

## De-facto Reconciliation

> `docs/canvas-affordance-defacto.md` 정본 기준으로 위 keep/legacy/drop을 재해석한다.
> keep/legacy/drop은 "본 데모에 보일지" 결정일 뿐, **affordance의 정당성 판정이 아니다.**
> 정당성은 (① 5계열 축 × ② 엔진-commodity vs 제품-domain × ③ persistent 문서 vs ephemeral presence)로 본다.

### 축 ②③ 재태깅

| 항목 | 계열 축 | 엔진/제품 | 상태 | 데모 노출 | 비고 |
|------|--------|-----------|------|-----------|------|
| pan/zoom/fit, select, transform, align/distribute, z-order, group, snap, text/shape/sticky/connector/draw/image | ①②③④ | 엔진 commodity | persistent | keep | de-facto 코어. 본 데모의 정당한 주역 |
| flip, select-same, tidy | ③④ | 엔진 commodity | persistent | keep | 이번 패스에서 노출/확인 (#33/#35/#37) |
| comment, stamp, cursor-chat, emote, presence cursor | ⑤ | 엔진(협업) | comment=persistent, 나머지=**ephemeral** | keep(comment) / drop-from-default(나머지) | drop은 "불법"이 아니라 facilitation product surface라 본 데모서 숨김 |
| voting, timer, spotlight | ⑤ | 제품(facilitation) | ephemeral | drop-from-default | 정당한 ⑤축 제품 기능. core 데모만 비노출 |
| dark mode | cross-cutting | 제품 chrome | ephemeral(UI state) | keep | 토큰은 엔진 자산, 토글은 데모 (#38) |
| HTML/CSS specimen, DOM inspector, design-system specimen | ②③(제품 콘텐츠) | **제품 domain** | persistent | legacy-quarantine | **legacy=폐기가 아니라 제품-domain 위치 지정.** custom item module로 승격 가능 |
| Export HTML/CSS/patch UI | — | 제품 domain | — | drop | DOM/CSS consumer export. **캔버스 SVG/PNG export(#36)와 별개** |
| widget-counter | ② | 엔진 seam fixture | persistent | fixture | custom item 계약 검증용 |

### 핵심 정정

- 이전 inventory의 "legacy"는 **폐기 신호로 읽히기 쉬웠다.** de-facto 기준으로는 "제품-domain 기능, 본 데모 비노출"이며 — custom item module seam으로 언제든 승격 가능한 **정당한** affordance다.
- ⑤ Collaboration 항목의 drop은 "core 보편 부품이 아님"이지 "표준이 아님"이 아니다. presence/voting/timer는 de-facto 협업 표준이며 ephemeral 채널로 분리돼 있다(Figma/Yjs 경계와 정합).
- "완료"는 본 inventory 소진이 아니라 `canvas-affordance-defacto.md` 5축 표의 **필수+보편 칸이 채워졌는가**로 측정한다.
