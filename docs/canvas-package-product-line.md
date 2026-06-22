# Canvas Package Product Line

Issue: https://github.com/developer-1px/canvas/issues/582

## Purpose

Canvas is a package product line for building canvas-like FE products. It is not
a single DOM editor, Story Canvas copy, or all-in-one whiteboard app.

The package boundary is based on the smallest complete user feature, not on file
size. A package should be small enough to install, disable, update, and remove,
but complete enough that a user can understand why it exists.

## Product Line Map

```text
Canvas Package Product Line
|-- External immutable foundations
|  |-- @interactive-os/json-document
|  |-- nano-edit
|  `-- interaction/object/preview surface packages
|-- Canvas runtime core
|  |-- geometry / bounds / stable id
|  |-- viewport / camera / coordinate transform
|  |-- scene adapter contract
|  |-- selection / transform / snap / gesture engine
|  |-- command dispatch contract
|  |-- tool / renderer / inspector contribution contract
|  |-- feature lifecycle state machine
|  |-- compatibility / registry validation
|  `-- host bridge contract
|-- Platform bridges
|  |-- React shell
|  |-- React hooks
|  |-- SVG renderer bridge
|  |-- DOM / pointer / keyboard adapter
|  `-- CSS surface contract
|-- Plugin and marketplace contracts
|  |-- feature pack manifest
|  |-- install / uninstall plan
|  |-- enable / disable runtime state
|  |-- partial update plan
|  |-- profile
|  |-- suite
|  |-- catalog
|  `-- marketplace listing / entitlement contract
|-- Complete first-party feature packs
|  |-- viewer controls
|  |-- authoring basics
|  |-- component system
|  |-- story canvas
|  |-- import / export
|  |-- collaboration / facilitation
|  |-- inspector packs
|  |-- DOM edit style
|  `-- AI labs
|-- Starter / profile / suite packages
|  |-- core-only
|  |-- minimal-viewer
|  |-- story-viewer
|  |-- basic-editor
|  |-- component-editor
|  `-- workshop / facilitation
`-- Demo / reference only
   |-- sample data
   |-- routes
   |-- fixtures
   |-- Story Canvas comparison glue
   `-- non-contract examples
```

## Boundary Definitions

| Boundary | Owns | Must not own |
|---|---|---|
| External immutable foundation | Stable lower-level document, text, interaction, and object-surface primitives shared beyond Canvas | Canvas-specific product features or app shell policy |
| Canvas runtime core | Runtime protocols that remain useful without a concrete item kind: coordinates, selection, commands, contribution registries, lifecycle, compatibility | Shape, text UI, component authoring, Story Canvas, import UI, toolbar, marketplace billing |
| Platform bridge | The framework or runtime adapter that lets the core run in a host FE product | Domain-specific canvas features or persisted document semantics |
| Plugin / marketplace contract | Pack identity, lifecycle, install state, compatibility, dependency, listing, and entitlement metadata | Actual billing, account policy, or SaaS workspace ownership |
| Feature pack | One complete user-facing feature or narrow product capability | Unrelated user outcomes bundled only for convenience |
| Suite | A named group of feature packs that should be installed together for a coherent product mode | New runtime behavior not owned by member packs |
| Profile / starter | A default pack and suite selection that starts a usable product mode | Core-only protocol definitions or hidden product policy |
| Demo / reference | Example routes, seed data, fixtures, and comparison glue | Public package contract or required consumer behavior |

## Not Core

These features may be first-party, high-value, or paid add-ons, but they are not
Canvas runtime core:

```text
Not Core
|-- shape item kind and shape creation UI
|-- text authoring UI
|-- sticky note
|-- connector / arrow UI
|-- drawing pen / marker / highlighter
|-- image item kind and image import UI
|-- comment
|-- stamp
|-- component library / sync / authoring
|-- toolbar
|-- command palette
|-- minimap
|-- story preview / story import / Story Canvas gallery
|-- DOM edit style / CSS inspector
|-- table import / text paste import / board export UI
|-- facilitation tools
|-- AI automation
|-- collaboration transport
|-- account / workspace policy
|-- billing / entitlement
`-- SaaS product shell
```

## Smallest Complete Feature Pack Test

A feature pack is the right size when all answers are yes:

```text
Smallest Complete Feature Pack
|-- Can a user say why they installed it in one sentence?
|-- Does it complete one user-facing capability when added to a host?
|-- Does it expose a manifest with identity, lifecycle, compatibility, and contributions?
|-- Are required schema, renderer, tool, command, shortcut, inspector, and view pieces included or declared as dependencies?
|-- Is enable/disable behavior defined?
|-- Is uninstall behavior and orphaned data policy defined?
|-- Can it be tested without unrelated packs, except documented dependencies?
`-- Does removing it leave the host app running?
```

## Feature Pack Manifest Contract

Every feature pack manifest is also a package contract. It must say what the
pack is, where it is distributed from, what it contributes, what it depends on,
and how it behaves through lifecycle transitions.

```text
Feature Pack Manifest
|-- id
|-- label
|-- version
|-- package
|  |-- name
|  `-- subpath
|-- category
|-- compatibility
|  |-- engineVersion
|  |-- documentSchemaVersion
|  `-- featureStateVersion
|-- contributes
|  `-- surfaces
|-- requires / optionalRequires / conflicts / provides
`-- lifecycle
   |-- installable
   |-- uninstallable
   |-- runtimeToggleable
   |-- hotReloadable
   |-- partialUpdate
   |-- orphanedDataPolicy
   `-- orphanedDataScopeIds
```

`package.name` defaults to `@interactive-os/canvas` for current first-party
packs. Future standalone packs can use names such as
`@interactive-os/canvas-pack-story`. `package.subpath` is optional, but when
present it must map to a package export subpath such as `./story-canvas`.

Too small:

```text
Too Small
|-- canvas-shape-schema
|-- canvas-shape-renderer
|-- canvas-shape-toolbar-button
`-- canvas-shape-shortcuts
```

Better:

```text
canvas-pack-shapes
|-- item schema
|-- renderer contribution
|-- creation tools
|-- inspector controls
|-- commands
|-- shortcuts
|-- lifecycle manifest
`-- tests / docs
```

Too large:

```text
Too Large
`-- canvas-pack-editor-everything
   |-- shapes
   |-- text
   |-- story
   |-- components
   |-- import / export
   |-- facilitation
   `-- marketplace
```

Better:

```text
Starter and Packs
|-- canvas-starter-basic-editor
|  `-- default profile / suite selection
|-- canvas-pack-shapes
|-- canvas-pack-text
|-- canvas-pack-components
|-- canvas-pack-story
|-- canvas-pack-import-export
`-- canvas-pack-facilitation
```

## First-Party Pack Classification

```text
First-Party Packages
|-- viewer-controls-pack
|  |-- zoom controls
|  |-- status bar
|  |-- minimap
|  `-- shortcut help
|-- authoring-basics-suite
|  |-- shape-authoring-pack
|  |-- drawing-tools-pack
|  |-- stamp-authoring-pack
|  |-- toolbar-pack
|  `-- command-palette-pack
|-- component-system-suite
|  |-- component-library-pack
|  |-- component-source-outline-pack
|  |-- component-sync-pack
|  |-- component-inspector-pack
|  |-- component-authoring-pack
|  `-- component-schema-pack
|-- story-canvas-suite
|  |-- story-preview-pack
|  |-- story-import-pack
|  `-- story-viewer profile glue
|-- import-export-suite
|  |-- image-io-pack
|  |-- media-import-pack
|  |-- table-import-pack
|  |-- text-paste-import-pack
|  `-- board-io-pack
|-- collaboration-facilitation-suite
|  |-- cursor-chat-pack
|  |-- comments-pack
|  `-- facilitation-pack
`-- specialized-product-packs
   |-- dom-edit-style-pack
   |-- ai-labs-pack
   |-- arrow-routing-inspector-pack
   |-- checklist-inspector-pack
   `-- kanban-inspector-pack
```

Inspector packs follow the domain that makes them meaningful. For example,
component and checklist inspectors belong with the component system unless they
become useful as independent diagnostics.

## Shape Authoring Tracer Bullet

Issue: https://github.com/developer-1px/canvas/issues/586

`shape-authoring-pack` is the first concrete domain pack extracted from the
current editor. It is intentionally a tracer bullet, not a full source-tree move
yet.

```text
shape-authoring-pack
|-- manifest id: shape-authoring
|-- package contract
|  |-- package.name: @interactive-os/canvas
|  `-- category: authoring
|-- contribution surfaces
|  |-- command
|  |-- inspector
|  |-- item-renderer
|  |-- item-schema
|  |-- migration
|  `-- tool
|-- runtime disabled affordances
|  |-- gestures.createShape
|  |-- overlays.draftRect
|  |-- shortcuts.ellipseTool
|  |-- shortcuts.rectTool
|  |-- tools.diamond
|  |-- tools.ellipse
|  `-- tools.rect
`-- lifecycle
   |-- runtimeToggleable
   |-- partialUpdate: item-renderer / inspector / tool
   `-- orphanedDataPolicy: preserve
```

The pack is part of the default editor profile, but not part of `core-only` or
`minimal-viewer`. Disabling or uninstalling it must leave the host running while
shape creation affordances are masked.

## Authoring Basics Suite

Issue: https://github.com/developer-1px/canvas/issues/587

`authoring-basics-suite` is the first complete basic editor install unit. It is
not core. It groups the packs that make a small authoring experience coherent,
while leaving component, Story Canvas, import/export, collaboration, and
inspection packs outside.

```text
authoring-basics-suite
|-- included packs
|  |-- shape-authoring-pack
|  |-- drawing-tools-pack
|  |-- stamp-authoring-pack
|  |-- toolbar-pack
|  `-- command-palette-pack
|-- explicit exclusions
|  |-- component-system-suite
|  |-- story-canvas-suite
|  |-- import-export-suite
|  |-- collaboration-facilitation-suite
|  |-- minimap-pack
|  |-- status-bar-pack
|  |-- shortcut-help-pack
|  `-- image-io / media-import / table-import / text-paste-import
`-- pending extraction
   `-- text-authoring-pack
```

`toolbar-pack` and `command-palette-pack` are authoring experience packs, not
Canvas runtime core. They can be installed or disabled independently, but the
basic editor starter installs them through `authoring-basics-suite`.

## Component System Suite

Issue: https://github.com/developer-1px/canvas/issues/588

`component-system-suite` is the complete component editing install unit. It is
not core. Component schema/model responsibility belongs to
`component-library-pack` and the current host adapter bridge until it is
promoted into a standalone component package.

```text
component-system-suite
|-- component-library-pack
|  |-- provides: component-runtime
|  |-- owns component templates / definition registry / runtime model
|  `-- orphanedDataPolicy: preserve
|-- component-source-outline-pack
|  |-- requires: component-runtime
|  `-- contributes: overlay
|-- component-sync-pack
|  |-- requires: component-runtime
|  `-- contributes: document-change
|-- component-inspector-pack
|  |-- requires: component-runtime
|  `-- contributes: inspector
`-- component-authoring-pack
   |-- requires: component-runtime
   `-- contributes: view-renderer
```

`component-editor` is `basic-editor` plus `component-system-suite`. Removing a
component pack preserves component-owned data by default; the host remains
responsible for deciding whether preserved orphaned component data should be
shown, migrated, or cleaned.

## Story Canvas Suite

Issue: https://github.com/developer-1px/canvas/issues/589

`story-canvas-suite` is a viewer-oriented canvas product mode, not core and not
demo glue. It demonstrates that a host can use the canvas engine without
authoring tools.

```text
story-canvas-suite
|-- story-preview-pack
|  |-- contributes: item-schema / item-renderer
|  |-- owns story preview custom item kinds
|  `-- orphanedDataPolicy: preserve
|-- story-import-pack
|  |-- requires: story-preview-items
|  |-- contributes: importer / item-schema
|  `-- orphanedDataPolicy: preserve
`-- story-viewer starter
   |-- read-only capabilities
   |-- zoom-controls
   |-- story-canvas-suite
   `-- host-provided preview/group renderers
```

Story preview renderers are supplied by the host or demo route. The package
contract owns the manifest, item kinds, import format, and starter assembly
path; concrete visual rendering remains host/reference glue.

## Import Export Suite

Issue: https://github.com/developer-1px/canvas/issues/590

`import-export-suite` groups IO packs by what users bring in or send out. It is
not core. Each member pack owns one IO outcome, and the suite only installs them
together for full editor profiles.

```text
import-export-suite
|-- image-io-pack
|  |-- contributes: importer / exporter / view-renderer
|  `-- orphanedDataPolicy: preserve
|-- media-import-pack
|  |-- contributes: importer / inspector
|  `-- orphanedDataPolicy: preserve
|-- table-import-pack
|  |-- contributes: importer / item-schema
|  `-- orphanedDataPolicy: preserve
|-- text-paste-import-pack
|  |-- contributes: importer / item-schema
|  `-- orphanedDataPolicy: preserve
`-- board-io-pack
   |-- contributes: importer / exporter
   `-- orphanedDataPolicy: preserve
```

`minimal-viewer`, `basic-editor`, `component-editor`, and `story-viewer` do not
install this suite. The broad default editor profile installs IO through
`import-export-suite`.

## Marketplace Catalog Contract

Issue: https://github.com/developer-1px/canvas/issues/591

The marketplace model is a package contract projection, not a billing system.
It lets a host UI show what can be installed, enabled, disabled, updated, or
removed without moving account policy into Canvas core.

```text
Marketplace Package Contract
|-- pack packageContract
|  |-- manifest package.name / package.subpath
|  |-- category / version / compatibility
|  |-- contributes / requires / provides / conflicts
|  |-- lifecycle installable / uninstallable / runtimeToggleable
|  `-- marketplace listing access / distribution / entitlement
|-- suite packageContract
|  |-- suite id / label
|  |-- member feature pack ids
|  |-- member package contracts
|  `-- optional suite listing access / distribution / entitlement
|-- profile packageContract
|  |-- profile id / label
|  |-- target installed feature pack ids
|  |-- target enabled feature pack ids
|  `-- member package contracts
`-- packageState
   |-- primaryStatus
   |-- statuses
   |  |-- available
   |  |-- installed
   |  |-- enabled
   |  |-- disabled
   |  |-- blocked
   |  |-- updating
   |  `-- partially-updated
   |-- actionKind: install / enable / disable / uninstall / apply
   |-- actionStatus: ready / blocked / active
   |-- blockedReasonCount
   |-- marketplaceBlockedReasonCount
   `-- partialUpdateSurfaceIds
```

`paid`, `private`, `coming-soon`, `deprecated`, and `unavailable` are
marketplace listing states. They are represented by `packageContract.listing`
and `packageState.marketplaceBlockedReasonCount`; they do not imply that Canvas
core owns billing, accounts, workspace policy, or entitlement resolution.

Pack actions still come from the lifecycle state machine. The marketplace item
only exposes the result:

| User action | Source of truth |
|---|---|
| install | manifest lifecycle `installable`, dependency graph, listing entitlement/distribution |
| enable | manifest lifecycle `runtimeToggleable`, dependency graph, listing entitlement/distribution |
| disable | manifest lifecycle `runtimeToggleable` |
| uninstall | manifest lifecycle `uninstallable`, orphaned data policy |
| partial update | manifest lifecycle `partialUpdate` surfaces |

## Starter Profiles

```text
Profiles
|-- core-only
|  `-- protocol/runtime verification, not a product
|-- minimal-viewer
|  `-- core + platform bridge + renderer + viewer controls
|-- story-viewer
|  `-- minimal-viewer + story-canvas-suite
|-- basic-editor
|  `-- minimal-viewer + authoring-basics-suite
|-- component-editor
|  `-- basic-editor + component-system-suite
`-- workshop
   `-- basic-editor + collaboration-facilitation-suite
```

Current starter helpers:

| Starter | Public helper | Pack selection |
|---|---|---|
| `minimal-viewer` | `createCanvasAppMinimalViewerAssembly` | read-only capabilities + `zoom-controls` |
| `basic-editor` | `createCanvasAppBasicEditorAssembly` | editor capabilities + `authoring-basics-suite` + `zoom-controls` |
| `component-editor` | `createCanvasAppComponentEditorAssembly` | editor capabilities + `authoring-basics-suite` + `component-system-suite` + `zoom-controls` |
| `story-viewer` | `createCanvasAppStoryViewerAssembly` | read-only capabilities + `story-canvas-suite` + `zoom-controls` + host preview renderers |

## Current Package Entry Interpretation

| Import path | Consumer meaning |
|---|---|
| `@interactive-os/canvas/core` | Smallest headless primitives and stable types |
| `@interactive-os/canvas/foundation` | Headless protocol engines and contribution contracts |
| `@interactive-os/canvas/engine` | Compatibility facade for promoted engine contracts |
| `@interactive-os/canvas/renderer` | Renderer primitives that do not own item domains |
| `@interactive-os/canvas/host` | Current concrete document and item adapter layer; should shrink away from core-only usage |
| `@interactive-os/canvas/app` | React app assembly and feature-pack orchestration |
| `@interactive-os/canvas/app/authoring` | Authoring-facing app helper surface |
| `@interactive-os/canvas/style.css` | App shell CSS surface |

The current root export is broad for compatibility. New package work should
prefer explicit subpaths that match this product line.
