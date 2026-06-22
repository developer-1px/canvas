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
|  |-- text-authoring-pack
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
