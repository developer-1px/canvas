# Canvas Engine Plugin / Marketplace Architecture

Date: 2026-06-18
Status: revised architecture note
Issue: https://github.com/developer-1px/canvas/issues/419

## 0. One Sentence

Canvas는 "캔버스 앱"이 아니라 FE 제품들이 원하는 만큼 조립해서 쓰는
캔버스 엔진이다. 따라서 core는 작고 변하지 않는 protocol/runtime만
가져야 하고, 사용자가 체감하는 기능은 plugin, extension, marketplace
add-on처럼 install/uninstall 및 enable/disable 가능한 feature pack 단위가
되어야 한다.

## 1. 우리가 만드는 것

우리가 만들고 있는 것은 DOM edit 앱 하나가 아니다.

```
Not This
|-- Figma-like DOM editor only
|-- Story Canvas demo only
|-- whiteboard demo only
|-- fixed SaaS product only
`-- all-in-one frontend app
```

목표는 다음에 가깝다.

```
Target
|-- ProseMirror-like engine
|-- canvas runtime substrate
|-- component-based authoring/viewing engine
|-- installable feature-pack platform
|-- host-app-assembled FE canvas
`-- future marketplace-ready add-on system
```

ProseMirror가 하나의 에디터 앱이 아니라 editor state, schema, transaction,
plugin, view를 통해 여러 제품을 만들 수 있는 기반인 것처럼, Canvas도
하나의 화면이 아니라 여러 FE 제품이 원하는 만큼 가져다 쓰는 엔진이어야
한다.

## 2. 핵심 판단

이번 논의에서 고정해야 할 판단은 다음이다.

```
Architecture Decision
|-- Core는 제품이 아니어도 된다.
|-- Core는 변하지 않을 계약만 가져야 한다.
|-- Shape은 core가 아니다.
|-- Text UI는 canvas core가 아니다.
|-- json-document는 foundation이다.
|-- nano-edit은 text foundation이다.
|-- Story Canvas는 편집 없는 canvas 제품 가능성을 증명한다.
|-- 모든 user-facing 기능은 feature pack 후보이다.
|-- Feature pack은 install/uninstall 단위이다.
|-- Feature pack은 가능하면 runtime on/off 단위이다.
|-- Suite는 함께 설치되는 pack 묶음이다.
|-- Profile은 pack 조합의 기본값이다.
`-- Marketplace와 billing은 core 위의 나중 layer이다.
```

중요한 뉘앙스:

- "core만으로 제품이 안 된다"는 것은 문제가 아니다.
- starter pack, minimal pack, editor pack, inspector pack이 제품성을 만든다.
- core에 많은 기능을 넣으면 처음은 편하지만 marketplace와 plugin 구조가
  죽는다.
- 반대로 너무 잘게 쪼개면 pack을 켜고 끄는 의미가 사라진다.
- 따라서 경계는 "기술 파일 크기"가 아니라 "사용자가 이해하는 기능 응집도"로
  나눠야 한다.
- 패키지는 충분히 작아야 하지만, 설치했을 때 하나의 사용자 기능 경험이
  완결되어야 한다.
- package consumer에게 보이는 public boundary는 code folder보다 중요하다.

## 3. 용어

### 3.0 Package Product Line

Canvas는 하나의 root export가 아니라 다음 제품군으로 읽혀야 한다.

```text
Canvas Package Product Line
|-- External immutable foundations
|-- Canvas runtime core
|-- Platform bridges
|-- Plugin / marketplace contracts
|-- Complete first-party feature packs
|-- Starter / profile / suite packages
`-- Demo / reference only
```

각 경계의 의미:

| Boundary | Owns | Must not own |
|---|---|---|
| External immutable foundation | Canvas보다 아래의 안정 문서/텍스트/상호작용 기반 | Canvas 제품 기능 |
| Canvas runtime core | concrete item kind 없이도 유효한 runtime/protocol | shape, text UI, component, story, toolbar, import/export UI |
| Platform bridge | React, SVG, DOM, pointer, keyboard 같은 실행 환경 연결 | domain-specific canvas 기능 |
| Plugin / marketplace contract | pack identity, lifecycle, install state, compatibility, dependency, listing | 실제 billing, account, workspace policy |
| Feature pack | 하나의 완결 user-facing 기능 | unrelated 기능 묶음 |
| Suite | 함께 설치되어야 의미 있는 pack 묶음 | member pack이 소유해야 할 runtime behavior |
| Profile / starter | 바로 시작 가능한 기본 pack 조합 | core protocol 자체 |
| Demo / reference | routes, sample data, fixtures, comparison glue | public package contract |

상세 분류표는 `docs/canvas-package-product-line.md`를 기준으로 한다.

### 3.1 Immutable Foundation

foundation은 Canvas보다 더 아래에 있는 안정 기반이다. 제품 기능이 아니라
여러 엔진과 앱이 공유할 수 있는 계약이다.

```
Immutable Foundations
|-- ../json-document
|  |-- JSON document model
|  |-- JSON Pointer / JSON Patch
|  |-- document transaction boundary
|  |-- history / patch planning substrate
|  |-- schema boundary
|  `-- migration boundary
|-- ../nano-edit
|  |-- contenteditable foundation
|  |-- browser text selection
|  |-- IME and composition handling
|  |-- inline edit primitive
|  `-- text editing normalization
`-- canvas-runtime-core
   |-- viewport model
   |-- selection model
   |-- coordinate system
   |-- command dispatch contract
   |-- renderer registry contract
   |-- hit-test registry contract
   |-- feature lifecycle
   `-- extension registry
```

판단:

- `../json-document`는 변하지 않을 가능성이 높기 때문에 foundation이다.
- `../nano-edit`도 text editing foundation이다.
- 하지만 `text-pack`은 Canvas feature pack이다. nano-edit이 core라고 해서
  Canvas text authoring UI가 core가 되는 것은 아니다.

### 3.2 Canvas Runtime Core

Canvas core는 product 기능이 아니라 기능들이 붙을 수 있는 runtime과 protocol을
제공한다.

```
Canvas Runtime Core
|-- document adapter boundary
|-- item identity boundary
|-- viewport / camera
|-- coordinate transform
|-- selection state
|-- hit-test orchestration
|-- command dispatch
|-- undo/redo patch planning contract
|-- renderer contribution registry
|-- tool contribution registry
|-- inspector contribution registry
|-- feature lifecycle state machine
|-- extension registry validation
|-- compatibility negotiation
`-- host bridge contracts
```

Core에 들어가면 안 되는 것:

```
Not Core
|-- shape item kind
|-- shape creation tool
|-- sticky note
|-- text authoring UI
|-- connector / arrow UI
|-- drawing pen / marker / highlighter
|-- comment
|-- stamp
|-- toolbar
|-- command palette
|-- minimap
|-- story preview card
|-- purple DOM/source outline
|-- Story Canvas gallery
|-- DOM style editor
|-- CSS/token inspector
|-- image import UI
|-- table import UI
|-- board export UI
|-- collaboration transport
|-- account / workspace policy
|-- billing / entitlement
`-- SaaS product shell
```

이 기능들이 중요하지 않아서 core가 아닌 것이 아니다. 오히려 제품 가치가 큰
기능이기 때문에 pack으로 판매, 설치, 교체, 업데이트 가능해야 한다.

### 3.3 Capability Protocol

protocol은 core가 제공하는 extension point이다. pack은 protocol에 기여한다.

```
Capability Protocols
|-- item schema contribution
|  |-- kind
|  |-- version
|  |-- validator
|  |-- migration
|  `-- default factory
|-- renderer contribution
|  |-- item renderer
|  |-- overlay renderer
|  |-- selection decoration
|  `-- external surface renderer
|-- interaction contribution
|  |-- tool
|  |-- gesture grammar
|  |-- hit-test
|  `-- shortcut
|-- command contribution
|  |-- descriptor
|  |-- availability
|  |-- execution
|  `-- undo/redo patch plan
|-- inspector contribution
|  |-- panel
|  |-- field
|  `-- source navigation
|-- import/export contribution
|  |-- importer
|  |-- exporter
|  |-- paste handler
|  `-- file/drop handler
`-- runtime contribution
   |-- model hook
   |-- persisted feature state
   |-- ephemeral state
   |-- background task
   `-- telemetry hook
```

Core는 protocol을 소유한다. Feature pack은 contribution을 소유한다.

### 3.4 Feature Pack

feature pack은 사용자가 이해할 수 있는 최소 기능 단위다.

```
Feature Pack
|-- manifest
|-- commands
|-- tools
|-- renderers
|-- inspectors
|-- validators
|-- migrations
|-- runtime model
|-- view surfaces
|-- tests
`-- docs
```

정확히는 "가장 작은 완결 기능 패키지"여야 한다.

```
Smallest Complete Feature Pack Test
|-- 사용자가 왜 설치하는지 한 문장으로 말할 수 있다.
|-- 설치하면 하나의 사용자 기능 경험이 완성된다.
|-- manifest가 identity, lifecycle, compatibility, contributions를 가진다.
|-- 필요한 schema, renderer, tool, command, shortcut, inspector를 포함하거나 dependency로 선언한다.
|-- enable/disable 동작이 정의되어 있다.
|-- uninstall과 orphaned data policy가 정의되어 있다.
|-- 문서화된 dependency 외에는 독립 테스트가 가능하다.
`-- 제거되어도 host app은 계속 실행된다.
```

Feature pack이 가져야 할 lifecycle:

```
Feature Pack Lifecycle
|-- discover
|-- install
|-- enable
|-- disable
|-- update
|-- partial-update
|-- rollback
`-- uninstall
```

중요한 구분:

- install/uninstall은 제품 설치 상태이다.
- enable/disable은 현재 runtime 활성 상태이다.
- update는 pack 전체 버전 변경이다.
- partial-update는 renderer, inspector, command 등 일부 contribution만
  호환성 범위 안에서 바꾸는 것이다.
- disable은 document data를 삭제하지 않는다.
- uninstall은 orphaned document data 정책을 반드시 가져야 한다.

현재 코드에는 이미 이 방향의 시작점이 있다.

```
Current Anchors
|-- src/canvas/app/feature-packs/CanvasAppFeaturePacks.ts
|-- src/canvas/app/feature-packs/CanvasAppFeaturePackManifests.ts
|-- src/canvas/app/feature-packs/CanvasAppFeaturePackRuntimeModel.ts
|-- src/canvas/app/feature-packs/CanvasAppDefaultFeaturePacks.ts
|-- src/canvas/app/feature-packs/CanvasAppDefaultViewFeaturePacks.ts
`-- src/canvas/app/feature-packs/story-preview/CanvasStoryPreviewItems.ts
```

하지만 현재는 `disabledFeaturePackIds` 중심의 1차 모델이다. 다음 단계에서는
available, installed, enabled, disabled, updating, activation-failed를 분리해야
한다.

### 3.5 Suite

suite는 함께 설치되는 pack 묶음이다. 사용자는 하나의 제품 영역으로 이해하지만,
내부 pack들은 독립 on/off 또는 update 의미를 가진다.

```
Suite
|-- feature-pack A
|-- feature-pack B
|-- feature-pack C
`-- suite-level profile defaults
```

예:

```
story-canvas-suite
|-- story-catalog-pack
|-- story-preview-pack
|-- source-layer-inspection-pack
|-- measurement-pack
|-- story-curation-pack
`-- css-token-inspection-pack
```

### 3.6 Profile

profile은 pack 조합의 기본값이다. 기능 자체가 아니라 assembly preset이다.

```
Profiles
|-- core-only
|-- minimal-viewer
|-- story-viewer
|-- reviewer
|-- inspector
|-- editor
|-- component-editor
`-- host-custom
```

profile은 "이 제품 모드에서는 어떤 pack을 설치하고 켤 것인가"를 표현한다.

## 4. Core와 Optional Feature 구분

없으면 Canvas engine이 성립하지 않는 것:

```
Required Core
|-- document adapter contract
|-- item identity/reference contract
|-- viewport / camera
|-- coordinate transform
|-- selection model
|-- command dispatch
|-- renderer registry
|-- feature registry
|-- lifecycle state machine
|-- compatibility checks
`-- host bridge boundary
```

없어도 engine은 성립하지만 제품성이 생기는 것:

```
Optional User Features
|-- shape authoring
|-- text authoring
|-- sticky note
|-- drawing
|-- connector / arrow
|-- component authoring
|-- story import
|-- story preview
|-- DOM edit
|-- layer inspection
|-- measurement
|-- CSS/token inspection
|-- image import/export
|-- table import
|-- minimap
|-- command palette
|-- facilitation
|-- collaboration
`-- AI automation
```

Shape이 core가 아닌 이유:

- shape은 user-facing item kind이다.
- shape tool, renderer, inspector, schema, migration을 가진다.
- 어떤 host는 shape 없이 story viewer만 쓸 수 있다.
- 어떤 host는 shape 대신 자체 diagram node만 쓸 수 있다.

Text가 canvas core가 아닌 이유:

- text editing foundation은 `nano-edit`이 맡을 수 있다.
- Canvas text authoring은 tool, item schema, renderer, inspector, editing UI를
  가진다.
- 어떤 host는 text authoring 없이 readonly preview만 쓸 수 있다.

Story Canvas가 core가 아닌 이유:

- Story Canvas는 강력한 제품 기능이다.
- story catalog, preview, DOM/source inspection, measurement, review state를
  가진다.
- 편집이 없어도 쓸 수 있는 viewer/inspector 제품이다.
- 따라서 suite 또는 feature pack으로 분리되어야 한다.

## 5. Feature Pack 응집도 기준

같은 pack에 둔다.

```
Same Pack When
|-- 같은 user purpose를 가진다.
|-- 같은 이유로 변경된다.
|-- 같은 runtime state를 공유한다.
|-- 같은 persisted schema/migration lifecycle을 가진다.
|-- 함께 테스트/릴리즈되어야 한다.
|-- 한쪽을 끄면 다른 한쪽도 의미가 없다.
`-- install/uninstall 설명이 하나로 자연스럽다.
```

분리한다.

```
Split Pack When
|-- host가 하나만 가져다 쓸 수 있다.
|-- 하나만 판매/설치/업데이트할 수 있다.
|-- 하나는 readonly이고 하나는 authoring이다.
|-- 하나는 document schema를 바꾸고 하나는 UI만 바꾼다.
|-- 하나는 무거운 dependency 또는 browser IO를 가진다.
|-- 하나는 restricted viewer에서 허용되고 하나는 안 된다.
`-- failure/rollback 정책이 다르다.
```

suite로 묶는다.

```
Use Suite When
|-- 사용자에게는 하나의 제품 영역이다.
|-- 보통 함께 설치된다.
|-- 내부 pack들은 독립 on/off 의미가 있다.
|-- 내부 pack들은 독립 update 의미가 있다.
`-- profile별로 일부 pack만 켤 수 있다.
```

## 6. Feature Pack Manifest 방향

현재 manifest는 작게 시작했지만, marketplace-ready 구조로 가려면 다음 정도의
정보가 필요하다.

```ts
type CanvasFeaturePackManifest = Readonly<{
  id: string
  version: string
  displayName: string
  category:
    | 'foundation'
    | 'view'
    | 'authoring'
    | 'inspection'
    | 'review'
    | 'import-export'
    | 'collaboration'
    | 'automation'
    | 'suite'
  lifecycle: {
    installable: boolean
    runtimeToggleable: boolean
    uninstallable: boolean
    partialUpdate: readonly CanvasContributionSurface[]
    hotReloadable: boolean
  }
  contributes: {
    commands?: readonly CanvasCommandContribution[]
    tools?: readonly CanvasToolContribution[]
    itemSchemas?: readonly CanvasItemSchemaContribution[]
    itemRenderers?: readonly CanvasItemRendererContribution[]
    viewRenderers?: readonly CanvasViewRendererContribution[]
    inspectors?: readonly CanvasInspectorContribution[]
    importers?: readonly CanvasImporterContribution[]
    exporters?: readonly CanvasExporterContribution[]
    overlays?: readonly CanvasOverlayContribution[]
    migrations?: readonly CanvasMigrationContribution[]
    runtimeModels?: readonly CanvasRuntimeModelContribution[]
  }
  requires?: readonly string[]
  optionalRequires?: readonly string[]
  conflicts?: readonly string[]
  provides?: readonly string[]
  compatibility: {
    engineVersion: string
    documentSchemaVersion?: string
    featureStateVersion?: string
  }
}>
```

Contribution surface:

```
CanvasContributionSurface
|-- command
|-- tool
|-- item-schema
|-- item-renderer
|-- view-renderer
|-- inspector
|-- importer
|-- exporter
|-- overlay
|-- migration
|-- runtime-model
|-- asset
`-- documentation
```

Pack state:

```
Feature Pack Runtime State
|-- available
|-- installed
|-- enabled
|-- disabled
|-- updating
|-- partially-updated
|-- activation-failed
|-- rollback-available
`-- uninstalled
```

## 7. Component 기반 요구사항

이 엔진의 핵심은 component 기반이다.

사용자는 Story Canvas처럼 widgets, features, shared components를 가져오고,
Canvas 위에서 부품을 보고, instance를 배치하고, source component와 연결된
상태를 이해해야 한다. component definition이 수정되면 연결된 instance에도
반영되어야 한다.

```
Component System
|-- component registry
|  |-- component id
|  |-- display name
|  |-- version
|  |-- source module
|  |-- variants
|  `-- renderer binding
|-- component instance
|  |-- instance id
|  |-- component reference
|  |-- props
|  |-- overrides
|  |-- variant
|  `-- source metadata
|-- propagation
|  |-- definition change updates linked instances
|  |-- local override remains explicit
|  |-- missing component fallback
|  |-- prop migration
|  `-- version compatibility
|-- authoring
|  |-- component palette
|  |-- insert component
|  |-- detach / relink
|  |-- variant selection
|  `-- component inspector
`-- inspection
   |-- parts tree
   |-- source link
   |-- instance outline
   |-- source navigation
   `-- readonly component preview
```

이것은 하나의 화면 기능이 아니라 suite로 봐야 한다.

```
component-system-suite
|-- component-registry-pack
|  |-- definitions
|  |-- resolver
|  `-- version metadata
|-- component-instance-pack
|  |-- instance schema
|  |-- props / overrides
|  |-- propagation
|  `-- migration
|-- component-authoring-pack
|  |-- palette
|  |-- insert
|  |-- detach / relink
|  `-- inspector
|-- component-parts-inspection-pack
|  |-- parts tree
|  |-- source link
|  `-- source outline
`-- component-import-pack
   |-- Story Canvas import
   |-- widgets import
   |-- features import
   `-- shared components import
```

중요한 경계:

- component registry와 instance reference는 엔진 레벨의 중요한 contract이다.
- component authoring UI는 optional pack이다.
- source outline, parts panel, import UI는 optional pack이다.
- component propagation은 document/schema/migration contract가 필요하다.

## 8. Story Canvas 분석

Story Canvas는 편집 기능이 없어도 canvas가 제품이 될 수 있음을 보여준다.

외부 원본:

```
../../NAVERCORP/cstar-ui-2/react/src/devtools/storyCanvas
|-- StoryCanvasPage.tsx
|-- StoryCanvasCard.tsx
|-- StoryCanvasInspector.tsx
|-- StoryLayersPanel.tsx
|-- StoryElementPanel.tsx
|-- StoryCssPanel.tsx
|-- StoryCanvasSelectionLayer.tsx
|-- storyCanvasModules.tsx
|-- storyCanvasModel.ts
|-- storyData.ts
|-- elementSelection.ts
|-- selectionGeometry.ts
`-- tokenInspection.ts
```

현재 repo에 복사된 위치:

```
src/devtools/storyCanvas
|-- StoryCanvasPage.tsx
|-- StoryCanvasCard.tsx
|-- StoryCanvasInspector.tsx
|-- StoryLayersPanel.tsx
|-- StoryElementPanel.tsx
|-- StoryCssPanel.tsx
|-- StoryCanvasSelectionLayer.tsx
|-- storyCanvasModules.tsx
|-- storyCanvasModel.ts
|-- storyCanvasSeedStories.tsx
`-- figmaCloneDomStories.tsx
```

Canvas feature pack으로 이미 시작된 위치:

```
src/canvas/app/feature-packs/story-preview
|-- CanvasStoryPreviewItems.ts
|-- CanvasStoryPreviewItems.test.ts
`-- index.ts
```

Story Canvas에서 추출해야 할 feature들:

```
Story Canvas Capability Map
|-- story catalog
|  |-- route grouping
|  |-- foundation grouping
|  |-- entity grouping
|  |-- story metadata
|  `-- search/filter
|-- story preview
|  |-- preview cards
|  |-- responsive frames
|  |-- lazy mounted stories
|  |-- content hug measurement
|  `-- viewport fit
|-- source layer inspection
|  |-- annotated DOM selection
|  |-- layer tree
|  |-- source reference
|  |-- instance target
|  `-- source navigation
|-- measurement
|  |-- selected element bounds
|  |-- clip geometry
|  |-- element size
|  |-- edge distance
|  `-- Alt-hover distance reading
|-- review and curation
|  |-- favorites
|  |-- review notes
|  |-- bridge snapshots
|  `-- favorites-only filter
|-- CSS and token inspection
|  |-- computed CSS
|  |-- matched rules
|  |-- token inspection
|  `-- optional style edit bridge
`-- readonly canvas host
   |-- pan
   |-- zoom
   |-- focus camera
   |-- select preview
   `-- select DOM element
```

Story Canvas suite proposal:

```
story-canvas-suite
|-- story-catalog-pack
|  |-- story import
|  |-- route/folder grouping
|  |-- foundation/entities views
|  `-- story metadata model
|-- story-preview-pack
|  |-- preview card
|  |-- preview group
|  |-- responsive frame
|  |-- lazy mount
|  `-- content hug measurement hook
|-- source-layer-inspection-pack
|  |-- annotated DOM layer selection
|  |-- Figma-like click grammar
|  |-- layer tree
|  |-- source reference
|  `-- instance source navigation
|-- measurement-pack
|  |-- selected bounds
|  |-- clip geometry
|  |-- Alt-hover element distance
|  `-- frame-to-frame distance
|-- story-curation-pack
|  |-- favorites
|  |-- favorites-only filter
|  |-- review notes
|  `-- bridge snapshot persistence
`-- css-token-inspection-pack
   |-- computed CSS
   |-- matched rules
   |-- token inspection
   `-- optional editable CSS bridge
```

Story Canvas의 보라색 선은 장식이 아니다. source-layer-inspection의
selection decoration contribution이다. Canvas 밖의 DOM/source와 Canvas 안의
preview item을 연결해주는 inspection affordance다. 따라서 core가 아니라
`source-layer-inspection-pack` 또는 shared selection decoration protocol에
속해야 한다.

## 9. Editing 없는 Canvas 모드

Canvas engine은 editor만을 위한 것이 아니다.

```
Canvas Modes
|-- viewer
|  |-- pan
|  |-- zoom
|  |-- select
|  `-- inspect
|-- reviewer
|  |-- viewer
|  |-- notes
|  |-- favorites
|  `-- copy context
|-- explorer
|  |-- viewer
|  |-- layer tree
|  |-- source navigation
|  `-- route/folder grouping
|-- inspector
|  |-- explorer
|  |-- measurement
|  |-- CSS rules
|  `-- token inspection
`-- editor
   |-- authoring tools
   |-- component insertion
   |-- object inspector
   `-- document mutation
```

이 구분은 매우 중요하다. 편집 기능을 core로 넣으면 viewer/inspector만 원하는
host가 불필요한 기능과 상태를 함께 가져가게 된다.

## 10. User Feature Map

아래 feature map은 사용자 관점의 install/uninstall 단위이다. 기술 폴더 이름이
아니라 사용자가 이해하는 기능 응집도를 기준으로 한다.

```
Canvas Engine User Feature Map
|-- Core Runtime [core, required]
|  |-- document adapter boundary
|  |-- item identity/reference boundary
|  |-- viewport / camera
|  |-- coordinate transform
|  |-- selection model
|  |-- command dispatch
|  |-- renderer registry
|  |-- feature registry
|  |-- lifecycle state machine
|  `-- compatibility validation
|-- Component System [suite]
|  |-- component registry [pack]
|  |-- component instances [pack]
|  |-- component authoring [pack]
|  |-- component parts inspection [pack]
|  `-- component import [pack]
|-- Basic Authoring [suite]
|  |-- basic shapes [pack]
|  |-- text authoring [pack, depends on nano-edit]
|  |-- sticky notes [pack]
|  |-- drawing tools [pack]
|  |-- connectors / arrows [pack]
|  `-- object toolbar [pack]
|-- Story Canvas [suite]
|  |-- story catalog [pack]
|  |-- story preview [pack]
|  |-- source layer inspection [pack]
|  |-- measurement [pack]
|  |-- review / curation [pack]
|  `-- CSS/token inspection [pack]
|-- DOM Edit [suite]
|  |-- DOM selection [pack]
|  |-- DOM style editing [pack]
|  |-- DOM component mapping [pack]
|  |-- responsive preview [pack]
|  `-- source sync bridge [pack]
|-- Import / Export [suite]
|  |-- image import/export [pack]
|  |-- text paste import [pack]
|  |-- table import [pack]
|  |-- media link import [pack]
|  |-- board serialization [pack]
|  `-- story import [pack]
|-- Inspection [suite]
|  |-- layers panel [pack]
|  |-- object inspector [pack]
|  |-- measurement overlay [pack]
|  |-- CSS/token inspector [pack]
|  `-- source navigation [pack]
|-- Navigation [suite]
|  |-- zoom controls [pack]
|  |-- minimap [pack]
|  |-- focus camera [pack]
|  `-- search / find replace [pack]
|-- Facilitation [suite]
|  |-- timer [pack]
|  |-- voting [pack]
|  |-- spotlight [pack]
|  |-- emotes [pack]
|  `-- cursor chat [pack]
|-- Collaboration [suite, outside core]
|  |-- presence [pack]
|  |-- comments [pack]
|  |-- review workflow [pack]
|  |-- conflict / merge policy [pack]
|  `-- transport adapter [host-owned]
|-- Automation [suite]
|  |-- command palette [pack]
|  |-- AI labs [pack]
|  |-- macros [pack]
|  `-- scripted transforms [pack]
`-- Host Product Shell [host-owned]
   |-- routing
   |-- account / billing
   |-- workspace policy
   |-- persistence backend
   |-- entitlement filter
   `-- product navigation
```

MECE 관점:

- Core Runtime은 모든 feature의 substrate이다.
- Component System은 reusable component와 instance propagation 문제이다.
- Basic Authoring은 whiteboard/editor 작성 기능이다.
- Story Canvas는 readonly/story inspection 제품 영역이다.
- DOM Edit은 실제 DOM/source 편집 제품 영역이다.
- Import/Export는 외부 데이터 boundary이다.
- Inspection은 보는 기능과 source 이해 기능이다.
- Navigation은 canvas 탐색성이다.
- Facilitation은 meeting/workshop 기능이다.
- Collaboration은 multi-user와 review workflow이다.
- Automation은 명령 자동화와 AI 영역이다.
- Host Product Shell은 엔진 밖 제품 정책이다.

## 11. Profile Map

Core만으로 제품이 아니어도 된다. 제품성은 profile이 만든다.

```
core-only-profile
`-- Core Runtime

minimal-viewer-profile
|-- Core Runtime
|-- readonly renderer bindings
`-- zoom/navigation basics

story-viewer-profile
|-- minimal-viewer-profile
|-- story-catalog-pack
`-- story-preview-pack

reviewer-profile
|-- story-viewer-profile
|-- story-curation-pack
`-- source-copy affordance

inspector-profile
|-- reviewer-profile
|-- source-layer-inspection-pack
|-- measurement-pack
`-- css-token-inspection-pack

editor-profile
|-- Core Runtime
|-- basic-shapes-pack
|-- text-pack
|-- sticky-note-pack
|-- connector-pack
|-- toolbar-pack
`-- object-inspector-pack

component-editor-profile
|-- editor-profile
|-- component-registry-pack
|-- component-instance-pack
|-- component-authoring-pack
`-- component-parts-inspection-pack
```

## 12. Marketplace Readiness

우리는 지금 SaaS를 만드는 것이 아니다. 하지만 pack lifecycle을 지금 제대로
만들면 나중에 marketplace 구조를 얹을 수 있다.

```
Marketplace Layer
|-- catalog metadata
|-- license / entitlement
|-- price / plan
|-- install source
|-- version channel
|-- trust / verification
|-- update policy
`-- support policy

Feature Pack Layer
|-- manifest
|-- contributions
|-- lifecycle
|-- compatibility
`-- migrations

Core Layer
|-- registry
|-- lifecycle machine
|-- compatibility validation
`-- contribution activation
```

Core는 billing을 모른다. Core는 "이 pack이 설치 가능하고 활성화 가능한가"만
검증한다. Entitlement는 host/marketplace layer가 pack availability를 필터링하는
방식으로 붙인다.

가능해지는 제품 구조:

```
Distribution Model
|-- free core
|-- free starter pack
|-- paid add-on
|-- private internal add-on
|-- enterprise-only pack
|-- host-specific pack
`-- labs / experimental pack
```

## 13. Refactoring Roadmap

큰 폴더 이동보다 tracer bullet로 간다.

```
Refactoring Roadmap
|-- 1. Manifest Strengthening
|  |-- category
|  |-- version
|  |-- requires / optionalRequires
|  |-- conflicts / provides
|  |-- lifecycle flags
|  |-- contribution surface list
|  `-- compatibility metadata
|-- 2. Runtime State Split
|  |-- available packs
|  |-- installed packs
|  |-- enabled packs
|  |-- disabled packs
|  |-- failed activation
|  `-- pending updates
|-- 3. Profile Assembly
|  |-- core-only
|  |-- minimal-viewer
|  |-- story-viewer
|  |-- inspector
|  |-- editor
|  `-- component-editor
|-- 4. Story Canvas Suite Extraction
|  |-- story-catalog-pack
|  |-- story-preview-pack
|  |-- source-layer-inspection-pack
|  |-- measurement-pack
|  |-- story-curation-pack
|  `-- css-token-inspection-pack
|-- 5. Component System Suite
|  |-- component-registry-pack
|  |-- component-instance-pack
|  |-- component-authoring-pack
|  |-- component-parts-inspection-pack
|  `-- component-import-pack
|-- 6. Core Guardrails
|  |-- no shape/text/story imports in core
|  |-- no host product policy in core
|  |-- no billing or entitlement in core
|  `-- no browser IO in core
`-- 7. Marketplace Readiness
   |-- signed pack metadata later
   |-- entitlement filter later
   |-- version channel later
   `-- partial update policy later
```

## 14. Acceptance Criteria

Feature pack으로 잘 분리되었다고 볼 수 있는 기준:

```
Feature Pack Done
|-- stable id가 있다.
|-- version이 있다.
|-- category가 있다.
|-- contribution surfaces를 선언한다.
|-- required dependencies를 선언한다.
|-- optional dependencies를 선언한다.
|-- conflicts/provides를 선언한다.
|-- enabled/disabled 상태 테스트가 있다.
|-- duplicate id 실패 테스트가 있다.
|-- missing dependency 실패 테스트가 있다.
|-- disabled 상태에서 document data가 깨지지 않는다.
|-- uninstall 시 orphaned data 정책이 있다.
|-- host가 internal subpath import 없이 조립할 수 있다.
`-- profile에서 제외해도 type hole이 없다.
```

Core에 남겨도 되는 기준:

```
Core Candidate
|-- 모든 canvas product가 필요하다.
|-- product feature가 아니라 protocol이다.
|-- runtime off 의미가 없다.
|-- product UI가 없다.
|-- browser IO가 없다.
|-- billing/account/workspace 정책이 없다.
`-- contract가 pack보다 오래 안정될 가능성이 높다.
```

Core 밖으로 빼야 하는 기준:

```
Move Out Of Core
|-- user-visible workflow이다.
|-- 특정 item kind를 가진다.
|-- tool/toolbar/inspector UI가 있다.
|-- import/export browser IO가 있다.
|-- 일부 profile에서만 필요하다.
|-- 가격/권한/update 단위가 될 수 있다.
`-- disabled 상태가 의미 있다.
```

## 15. Open Questions

```
Open Questions
|-- component instance override model은 어떻게 정의할 것인가?
|-- component propagation 중 어디까지 json-document contract인가?
|-- Story Canvas import는 route module, file manifest, host registry 중 무엇을 기준으로 할 것인가?
|-- runtime disable이 가능한 pack과 remount가 필요한 pack을 어떻게 구분할 것인가?
|-- production partial update를 허용할 contribution surface는 무엇인가?
|-- orphaned item은 어떤 fallback renderer로 보여줄 것인가?
|-- marketplace pack loading은 local-only부터 시작할 것인가?
|-- third-party pack author에게 공개할 stable API 범위는 어디까지인가?
`-- pack migration rollback을 어디까지 요구할 것인가?
```

## 16. Next Issues

```
Issue Candidates
|-- Define CanvasFeaturePackManifest v2
|-- Split installed/enabled/available runtime state
|-- Add profile assembly for core/viewer/inspector/editor
|-- Extract story-canvas-suite from copied Story Canvas
|-- Extract source-layer-inspection-pack
|-- Extract measurement-pack
|-- Define component registry contract
|-- Define component instance/override contract
|-- Add component propagation tests
|-- Add core import guardrails
`-- Document entitlement as host layer
```

## 17. Local Source Anchors

```
Architecture Docs
|-- docs/adr/0001-canvas-reusable-module-seams.md
|-- docs/adr/0003-canvas-foundation-extension-architecture.md
`-- docs/adr/0004-canvas-plugin-marketplace-feature-boundary.md

Feature Pack Runtime
|-- src/canvas/app/feature-packs/CanvasAppFeaturePacks.ts
|-- src/canvas/app/feature-packs/CanvasAppFeaturePackManifests.ts
|-- src/canvas/app/feature-packs/CanvasAppFeaturePackRuntimeModel.ts
|-- src/canvas/app/feature-packs/CanvasAppDefaultFeaturePacks.ts
`-- src/canvas/app/feature-packs/CanvasAppDefaultViewFeaturePacks.ts

Story Canvas Copy
|-- src/devtools/storyCanvas/StoryCanvasPage.tsx
|-- src/devtools/storyCanvas/storyCanvasModules.tsx
|-- src/devtools/storyCanvas/storyCanvasModel.ts
|-- src/devtools/storyCanvas/storyCanvasSeedStories.tsx
`-- src/canvas/app/feature-packs/story-preview/CanvasStoryPreviewItems.ts

External Story Canvas Source
|-- ../../NAVERCORP/cstar-ui-2/react/src/devtools/storyCanvas/StoryCanvasPage.tsx
|-- ../../NAVERCORP/cstar-ui-2/react/src/devtools/storyCanvas/storyCanvasModules.tsx
|-- ../../NAVERCORP/cstar-ui-2/react/src/devtools/storyCanvas/storyCanvasModel.ts
`-- ../../NAVERCORP/cstar-ui-2/react/src/devtools/storyCanvas/elementSelection.ts
```

## 18. Final Boundary Statement

Canvas는 기능 많은 앱이 아니라 기능이 붙는 엔진이다. Core는 작고 안정적인
runtime/protocol이어야 한다. Shape, text UI, Story Canvas, DOM edit,
component authoring 같은 가치 있는 기능은 core가 아니라 feature pack 또는 suite가
되어야 한다. 그래야 host가 원하는 만큼 설치하고, 켜고 끄고, 부분 업데이트하고,
나중에 marketplace나 paid add-on으로도 확장할 수 있다.
