# ADR 0004: Canvas Plugin / Marketplace Feature Boundary

## Status

Accepted

## Context

Canvas는 단일 demo app이나 Figma-like DOM editor만을 목표로 하지 않는다.
목표는 여러 FE 제품이 조립해서 쓰는 canvas engine이다. ProseMirror가 특정
에디터 앱이 아니라 schema, state, transaction, plugin, view를 제공하는 것처럼,
Canvas도 host가 필요한 기능만 설치하고 켤 수 있는 runtime substrate가 되어야
한다.

ADR 0001은 Canvas를 reusable module surface로 분리했다. ADR 0003은 foundation과
extension architecture를 정의했다. 이번 결정은 user-facing 기능의 경계다.

중요한 요구사항은 다음이다.

- Core는 작고 안정적인 protocol/runtime이어야 한다.
- Core만으로 완성 제품이 되지 않아도 된다.
- 사용자가 체감하는 기능은 feature pack 단위로 install/uninstall 가능해야 한다.
- 가능한 기능은 runtime enable/disable 가능해야 한다.
- pack은 update/partial-update/rollback의 단위가 되어야 한다.
- marketplace, paid add-on, entitlement는 나중에 core 위에 얹을 수 있어야 한다.
- Story Canvas는 편집 없는 canvas viewer/inspector 제품도 가능하다는 증거다.
- Component definition 변경이 instance에 반영되는 component 기반 모델은
  engine의 핵심 목표다.

## Decision

1. Canvas Core는 stable runtime/protocol만 소유한다.
   - document adapter boundary
   - item identity/reference boundary
   - viewport/camera
   - coordinate transform
   - selection model
   - command dispatch contract
   - renderer/tool/inspector registries
   - feature lifecycle state machine
   - extension registry validation
   - compatibility negotiation
2. `../json-document`는 immutable foundation이다. Canvas는 document/patch
   contract를 adapter로 사용하고, product feature가 이를 우회하지 않게 한다.
3. `../nano-edit`은 text editing foundation이다. Canvas text authoring UI는
   `text-pack`으로 제공하고 core에 넣지 않는다.
4. Shape, sticky note, connector, drawing, toolbar, minimap, command palette,
   Story Canvas, DOM edit, CSS/token inspection, facilitation, collaboration,
   automation, AI 기능은 core가 아니다. 이들은 feature pack, suite, 또는
   host-owned product feature다.
5. Feature pack은 user-facing 기능의 최소 install/uninstall 단위다. 같은 pack에
   들어가려면 user purpose, runtime state, persisted schema, migration, release,
   rollback reason이 응집되어야 한다.
6. Installed state와 enabled state는 분리한다. Disable은 contribution을 숨기거나
   비활성화하지만 document data를 삭제하지 않는다. Uninstall은 orphaned data
   정책을 반드시 가진다.
7. Suite는 함께 설치되는 pack 묶음이다. Suite는 marketplace product가 될 수
   있지만 내부 pack들은 독립 on/off와 update 의미를 유지한다.
8. Profile은 product mode별 pack 조합이다. Profile은 capability를 새로 만들지
   않고 default assembly만 정의한다.
9. Feature pack manifest는 id/label을 넘어 category, version, lifecycle,
   contribution surfaces, requires, optionalRequires, conflicts, provides,
   compatibility를 선언해야 한다.
10. Marketplace와 billing은 core에 넣지 않는다. Host/marketplace layer가 pack
    availability와 entitlement를 필터링하고, core는 lifecycle과 compatibility만
    검증한다.
11. Story Canvas는 `story-canvas-suite`로 모델링한다.
    - story-catalog-pack
    - story-preview-pack
    - source-layer-inspection-pack
    - measurement-pack
    - story-curation-pack
    - css-token-inspection-pack
12. Component 기능은 `component-system-suite`로 모델링한다.
    - component-registry-pack
    - component-instance-pack
    - component-authoring-pack
    - component-parts-inspection-pack
    - component-import-pack
13. Core guardrail tests는 product-shaped feature pack이 core runtime으로
    역수입되는 것을 막아야 한다.

## Consequences

- Core는 더 작아진다. 이것은 의도된 결과다.
- Starter, minimal viewer, story viewer, inspector, editor, component editor 같은
  profile이 제품성을 만든다.
- Shape/text/story/DOM edit 등 가치 있는 기능은 core에 묶이지 않고 판매, 설치,
  제거, 교체, 업데이트 가능한 단위가 된다.
- Disable은 data deletion이 아니다. Disabled pack의 persisted data는 fallback
  renderer 또는 readable orphan state로 남아야 한다.
- Story Canvas 기능은 현재 복사된 page 자체가 아니라 suite/pack 구조로 흡수되어야
  한다.
- Component propagation은 UI 편의 기능이 아니라 document/component contract의
  핵심 요구사항이 된다.
- 미래의 paid add-on과 marketplace는 pack lifecycle 위에 얹을 수 있다.

## Follow-up Work

- 상세 기준 문서:
  `docs/wiki/canvas-engine-plugin-marketplace-architecture.md`
- GitHub issue:
  https://github.com/developer-1px/canvas/issues/419
- Feature pack manifest v2를 정의한다.
- available/installed/enabled/disabled/updating/activation-failed runtime state를
  분리한다.
- core-only, minimal-viewer, story-viewer, inspector, editor, component-editor
  profile assembly를 추가한다.
- Story Canvas를 suite와 내부 packs로 분리한다.
- Component registry, instance, override, propagation, import contract를 정의한다.
- Core import guardrail tests를 추가한다.
