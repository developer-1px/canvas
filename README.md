# Canvas

Reusable canvas engine package for FE products that need canvas-like viewing,
authoring, and installable feature packs.

Canvas is not a single DOM editor, Story Canvas copy, or all-in-one whiteboard
app. The core stays small and product features are provided through complete
feature packs, suites, and starter profiles.

## Package Boundaries

```text
Canvas
|-- runtime core
|-- platform bridges
|-- plugin / marketplace contracts
|-- complete feature packs
|-- suites and starter profiles
`-- demos / references
```

Core owns stable runtime protocols: coordinates, viewport, selection, command
dispatch, contribution registries, feature lifecycle, compatibility, and host
bridge contracts. Core does not own shape, text authoring UI, component
authoring, Story Canvas, toolbar, command palette, minimap, import/export UI,
DOM edit style, facilitation, AI, account policy, or billing.

Feature packs are sized as the smallest complete user feature. A pack should be
small enough to install, disable, update, and remove, but complete enough to
ship its required schema, renderer, tools, commands, shortcuts, inspector,
lifecycle, tests, and docs.

See [Canvas Package Product Line](docs/canvas-package-product-line.md) for the
consumer-facing boundary map.

## Public Entry Points

```text
@interactive-os/canvas/core        headless primitives and stable types
@interactive-os/canvas/foundation  headless protocol engines and contracts
@interactive-os/canvas/engine      compatibility facade for engine contracts
@interactive-os/canvas/renderer    renderer primitives
@interactive-os/canvas/host        current concrete document/item adapter layer
@interactive-os/canvas/app         React assembly and feature-pack orchestration
@interactive-os/canvas/style.css   app shell CSS surface
```

## Run

```sh
pnpm install
pnpm dev
```

Default route `/` opens the minimal engine verification demo for pan/zoom,
object selection, toolbar actions, sticky notes, text editing, and drawing.
Route `/engine` remains available as the same demo path for existing checks.

## Check

```sh
pnpm lint
pnpm build
```
