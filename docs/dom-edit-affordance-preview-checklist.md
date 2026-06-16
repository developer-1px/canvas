# DOM Edit Affordance Preview Checklist

Target: `packages/figma-clone`

## Browser Matrix

| Scenario | Expected preview state | Automated evidence |
| --- | --- | --- |
| Default selection | `Workspace page` selected; selected guide, top label, and size badge align to the DOM rect; measure, X-ray, and transform overlays are absent. | `e2e/figma-dom-preview-verification-matrix.e2e.ts` |
| Nested selection descent | Repeated clicks at one nested point descend `workspacePage -> workspaceMain -> workspaceContent -> workspacePipeline -> workspacePipelineList`; each selected guide stays within 1px of the DOM rect. | `e2e/figma-dom-preview-verification-matrix.e2e.ts` |
| Flex gap edit | `Pipeline list` exposes all shared column gaps; dragging one gap increases the computed gap and all visible gap bands move together. | `e2e/figma-dom-preview-verification-matrix.e2e.ts` |
| Padding edit | `Main area` padding band thickness follows the `Pad` value; active padding drag hides gap affordances. | `e2e/figma-dom-preview-verification-matrix.e2e.ts` |
| Measure mode | Red distance lines appear only in measure state; X-ray overlays stay hidden while measuring. | `e2e/figma-dom-preview-verification-matrix.e2e.ts` |
| Box-model X-ray | Selected content, padding, border, and margin bands appear only while X-ray is enabled. | `e2e/figma-dom-preview-verification-matrix.e2e.ts` |
| Flex child participation | Flex children show Fill/Hug/Fixed in the size badge choices and expose the targeted align-self rail. | `e2e/figma-dom-preview-verification-matrix.e2e.ts` |
| Grid sample | Grid containers show track lines and gaps; grid children show occupied cell area and four span handles. | `e2e/figma-dom-preview-verification-matrix.e2e.ts` |
| Out-of-flow geometry | Static DOM nodes do not get transform handles; `Floating note` gets Moveable handles and an absolute context badge. | `e2e/figma-dom-preview-verification-matrix.e2e.ts` |
| Pan/zoom tracking | Selection and grid overlays continue matching the rendered DOM target within 1px after zoom and pan. | `e2e/figma-dom-preview-verification-matrix.e2e.ts` |

## Focused Specs

- `e2e/figma-dom-selection-guide-layer.e2e.ts`
- `e2e/figma-dom-hover-measurement.e2e.ts`
- `e2e/figma-dom-box-model-xray.e2e.ts`
- `e2e/figma-dom-flex-container-controls.e2e.ts`
- `e2e/figma-dom-flex-child-participation.e2e.ts`
- `e2e/figma-dom-grid-track-lines.e2e.ts`
- `e2e/figma-dom-grid-child-area.e2e.ts`
- `e2e/figma-dom-out-of-flow-geometry.e2e.ts`

## Command Gates

- `npx tsc --noEmit --pretty false`
- `npm run test -- packages/dom-edit-affordance/src/features/node-selection/DomEditAffordanceVisibility.test.ts packages/figma-clone/src/dom-edit/FigmaCloneDomEditModel.test.ts`
- `npx playwright test e2e/figma-dom-preview-verification-matrix.e2e.ts`
- `npm run build`

## Manual Pass

```text
DOM edit preview
|-- Select Workspace page
|   |-- label and size badge align to rendered DOM rect
|   `-- repeated click inside Pipeline list descends one DOM level per click
|-- Select Hero panel
|   |-- Measure: red distances appear; X-ray stays hidden
|   `-- X-ray: box-model bands only
|-- Select Pipeline list
|   `-- drag one gap: all gap bands update; padding stays hidden while active
|-- Select Main area
|   |-- change Pad: padding band thickness changes
|   `-- drag padding: gap stays hidden while active
|-- Select Content grid / Pipeline panel
|   `-- grid tracks, gaps, cell area, and span handles match DOM geometry
|-- Select Floating note
|   `-- transform handles appear only for this absolute node
`-- Zoom and pan
    `-- overlays continue following their DOM targets within 1px
```

## Known Build Warning

- `npm run build` passes with an existing Rolldown PURE annotation warning from `@daybrush/utils`; the warning does not fail the build.
