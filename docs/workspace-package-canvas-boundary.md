# Workspace package Canvas boundary

Workspace consumers must import Canvas only through published
`@interactive-os/canvas` subpaths. Relative imports into `src/canvas` make a
consumer compile in this monorepo while failing as soon as that consumer is
moved or independently packaged.

The architecture guard covers production and test modules under `packages/**`:

```sh
pnpm test -- --run \
  src/canvas/architecture/CanvasWorkspacePackageBoundaries.test.ts
```

The deletion test builds Canvas, packs it, copies Figma clone, DOM edit
affordance, and slide edit affordance into an OS temporary directory, installs
the Canvas tarball there, and compiles the copied consumers to JavaScript:

```sh
pnpm build:package
node scripts/verify-packed-workspace-consumers.mjs
```

The fixture intentionally defines no TypeScript path mapping for
`@interactive-os/canvas`. Its installed Canvas directory is also asserted to
live outside the repository. Therefore deleting or moving the original
consumer directories cannot be masked by the monorepo source tree: a relative
`src/canvas` import has no target in the temporary fixture and compilation
fails, while public package imports resolve from the packed tarball.

Prefer the existing `app`, `core`, `foundation`, `editor`, and `react-design`
subpaths. Add a public export only when the concept is reusable at that facade's
Interface; otherwise keep the helper consumer-owned.
