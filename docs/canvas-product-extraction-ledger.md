# Canvas product extraction ledger

기준: #91 product-first slices에서 실제 `/` board workflow가 드러낸 압력만 기록한다. Foundation/package promotion은 반복 책임이 확인된 뒤에만 한다.

## Promotion rule

- Product route, product chrome, seed/demo item model, browser storage policy, and renderer-specific UI stay app-owned.
- Foundation candidates must be headless contracts or pure geometry/selection/command/gesture rules.
- First-party extension candidates may own reusable whiteboard affordances, but not product route composition or local storage policy.
- zod-crud stays behind Host document adapters unless a separate ADR opens a public dependency seam.

## App-owned product features

| Feature | Owner | Reason to keep app-owned |
| --- | --- | --- |
| Product route `/` shell | App-owned product | Route composition and sparse product chrome are product policy, not Foundation behavior. |
| Compact product affordance config | App-owned product | The enabled/disabled surface set is the current board product choice. |
| Workspace persistence | App-owned Host/App adapter | Browser storage key, reload policy, validation, and snapshot timing are app/runtime policy. |
| Board JSON/SVG IO plugin | App-owned IO affordance | Export/import file names, MIME adapters, browser storage, and SVG rendering are app/browser responsibilities. |
| Product e2e workflow coverage | App-owned product | The tests encode the product workflow contract for `/`, not reusable package API. |
| Floating surface placement CSS | App shell | UI collision fixes are shell layout behavior and should not move into Foundation. |

## Foundation/package candidates

| Candidate | Observed product pressure | Proposed owner | Promotion trigger |
| --- | --- | --- | --- |
| Inline text editing adapter over `nano-edit` | Sticky notes and free text now share immediate contenteditable editing with Enter newline and Esc commit/blur. | First-party whiteboard extension or App authoring package | A second product surface needs the same inline editing contract outside this app shell. |
| Whiteboard organize/mark tool bundle | Section, comment, arrow, stamp, marker, and highlighter form one reusable board workflow. | First-party whiteboard extension | A consumer needs the same tool bundle with different product chrome. |
| Surface collision contract | Stamp controls overlapped zoom controls until the bottom-left zone was fixed. | App shell package, not Foundation | More floating surfaces need deterministic region/collision tests independent of this product route. |
| Workspace snapshot validation helpers | Reload persistence depends on normalized items, sanitized selection, and viewport clamping. | Host document/workspace adapter | Another host runtime needs the same snapshot contract without adopting this product storage policy. |

## Hold list

| Item | Hold reason |
| --- | --- |
| Product route `/` | Product entrypoint, not a reusable canvas contract. |
| Demo seed items | Verification fixtures, not stable product data. |
| localStorage key and save debounce | Browser/runtime policy; keep out of Foundation. |
| Board export file names | Host/app adapter policy. |
| Renderer-specific SVG/CSS details | Renderer and shell ownership. |

## Next extraction gate

Promote only when a candidate has:

1. At least two product or consumer call sites.
2. A headless contract that does not import Product, App shell, Renderer UI, or browser storage.
3. A failing product or consumer test that becomes simpler through the extraction.
4. A documented owner: Foundation, first-party extension, Host adapter, or App shell package.
