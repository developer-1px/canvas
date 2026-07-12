# Browser input compatibility

The fullscreen canvas owns viewport pan and zoom while preserving explicitly
authored native scroll and text-entry surfaces. The automated contract is split
by browser capability instead of treating Chromium as a Safari proxy.

`data-canvas-wheel-passthrough="true"` reserves ordinary wheel input for an
editor or custom widget. `data-canvas-wheel-passthrough="scroll"` reserves it
only while that element or a nested marked ancestor can scroll in the requested
direction; at an edge the canvas resumes pan ownership. Modifier wheel and
pinch remain canvas zoom in both modes. Fixed DesignDocument frames with
`overflow: "scroll"` receive the `scroll` mode automatically.

## Automated matrix

| Contract | Chromium | Playwright WebKit |
| --- | --- | --- |
| non-passive wheel pan and modifier zoom | yes | yes |
| browser page zoom cancellation | yes | yes |
| keyboard zoom outside text entry | yes | yes |
| text-entry and IME zoom suppression | yes | yes |
| authored scroll ownership and edge handoff | yes | yes |
| Safari-style `gesture*` scale routing | synthetic event | synthetic event |
| two physical touch pointers | CDP probe | unavailable |

Run the shared contract with:

```sh
pnpm exec playwright test e2e/canvas-native-gesture-ownership.e2e.ts \
  --project=chromium --project=webkit
```

Run the Chromium-only touch probe with:

```sh
pnpm exec playwright test e2e/canvas-touch-pinch.e2e.ts --project=chromium
```

## Remaining manual Safari scope

Playwright WebKit is not the installed macOS Safari application. Before a
release that changes browser input, manually verify a real Mac trackpad pinch,
Safari `gesturestart`/`gesturechange`/`gestureend`, a nested authored scroll
frame, and Korean IME composition in an input and contenteditable surface.
Browser page scale must remain unchanged, canvas zoom must follow gestures only
outside text entry, and ordinary scrolling must stay inside a scrollable frame
until that frame reaches its edge.
