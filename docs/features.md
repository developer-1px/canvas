# Feature 제공 목록

기준: 기본 URL `/`은 제품형 brainstorming board를 연다. Engine 검증용 미니멀 demo는 `/engine`에서 보존한다.

## Product board

1. 설명 화면 없이 바로 canvas stage를 표시한다.
2. demo fixture가 아닌 product-owned workshop seed board를 표시한다.
3. sticky note, section, shape, arrow/connector, drawing, stamp, text editing을 한 작업 흐름으로 드러낸다.
4. toolbar, selection floating bar, zoom controls, status, sticky quick-create, stamp controls만 기본 product surface에 노출한다.
5. inspector, component palette, command palette, cursor chat, emote, timer, voting, spotlight는 기본 product surface에 노출하지 않는다.
6. 제품 chrome은 작업을 돕는 compact control만 허용하고, landing page/hero/설명 panel은 두지 않는다.
7. board state는 reload 후에도 복원된다.

## Engine demo

1. 설명 화면 없이 바로 canvas stage를 표시한다.
2. seed item은 shape, sticky note, text, arrow, marker, highlighter, image object를 둔다.
3. pan/zoom, object select, object toolbar, resize, text editing, shape creation, sticky creation, arrow creation, drawing을 검증한다.
4. route `/engine`에서 toolbar, inspector, palette, status, timer, voting, spotlight, emote, presence는 기본 demo에 표시하지 않는다.
5. DOM inspector와 HTML/CSS specimen은 core가 아니라 legacy concept 또는 consumer feature 후보로 분류한다.
6. 같은 취지의 product UI surface는 engine demo에서 하나도 노출하지 않는다.
7. Shape, text, sticky note, marker, highlighter, eraser, arrow tool은 하단 미니멀 toolbar에 노출한다.
8. 도형은 하나의 shape tool로 만들고, 선택 toolbar에서 rect/ellipse/diamond 형태를 바꾼다.
9. 선택 toolbar는 select mode에서만 노출하고, object type에 맞는 edit/shape/routing/style/duplicate/delete/fit action만 둔다.

## 검증

- `pnpm test`
- `pnpm test:e2e`
- `pnpm build`
