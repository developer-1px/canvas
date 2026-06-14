# DOM Edit Affordance Preview Checklist

## Runtime

- URL: `http://127.0.0.1:53175/`
- Date: 2026-06-14
- Target: `packages/figma-clone`

## Browser Matrix

| Scenario | Expected | Verified evidence |
| --- | --- | --- |
| Idle nested selection | Bounding box, label, size badge, parent outline only | `Hero panel`: `distances=0`, `parent=1`, `xray=0` |
| Measure mode | Parent inset distance lines only | `Hero panel`: `distances=4`, labels `73, 415, 21, 19`, `gaps=0`, `padding=0`, `xray=0`, `transformGuides=0` |
| Flex size mode | Size dock opens from bottom size badge | `Top bar`: `dock=1`, size buttons present, `gapVisible=0`, `paddingVisible=0` |
| Flex gap | All gap bands visible together, padding hidden | `Top bar`: visible flex gaps, `paddingHit=0`, gap label present |
| Flex padding | Padding bands visible, gap hidden | `Top bar` / `Hero panel`: padding label present, visible gap count `0` |
| Grid gap | Grid tracks and grid gap visible, flex gap hidden | `Content grid`: computed `display=grid`, `gridGap=1`, `tracks=2`, `flexGap=0` |
| Transform mode | Move/resize handles plus parent/center guides | `Hero panel`: `controls=10`, `guides=4`, `parent=1` |
| Box-model X-ray | Content/padding/border/margin inspection only | `Hero panel`: `content=1`, `paddingBands=4`, `gapVisible=0`, value `Pad 18` |
| Pan tracking | Overlay follows rendered DOM target through viewport movement | `Hero panel`: target delta `300,240`, guide delta `300,240`, error `0,0` |

## Command Gates

- `npx tsc --noEmit --pretty false`
- `npm run test -- packages/figma-clone/src/dom-edit/FigmaCloneDomEditModel.test.ts`
- `npm run build`

## Manual Visual Checks

```text
DOM edit canvas
├─ Select Hero panel
│  ├─ click Measure tool: red distances appear, no gap/padding/X-ray
│  ├─ click Transform tool: handles and center guides appear
│  └─ click X-ray: box-model bands appear
├─ Select Top bar
│  ├─ hover size badge: W/H dock appears below badge
│  ├─ hover gap: all flex gaps appear, padding hidden
│  └─ hover padding: padding only, gap hidden
└─ Select Content grid
   └─ hover grid gap: grid tracks + grid gap label, no flex gap
pan/scroll viewport
└─ selected overlay and DOM target move together with <= 1px error
```

## Current Known Build Warning

- `npm run build` passes.
- Rolldown reports an existing third-party `@daybrush/utils` PURE annotation warning. It does not fail the build.
