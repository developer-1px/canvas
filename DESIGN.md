---
version: alpha
name: Canvas DevTools
description: Light-first, plane-based, content-first design contract for a canvas-based internal web development tool.
defaultMode: light
tokens:
  color:
    background: "#F8F8F7"
    surface: "#FFFFFF"
    surface-muted: "#F1F1EF"
    surface-active: "#EEF3FF"
    text: "#1D2028"
    text-secondary: "#39404C"
    text-muted: "#6D7380"
    border: "#E1E2DE"
    border-strong: "#D0D2CC"
    accent: "#2457C5"
    success: "#0F8F63"
    warning: "#B45309"
    danger: "#D94B45"
  typography:
    ui: Inter, ui-sans-serif, system-ui, sans-serif
    code: ui-monospace, SFMono-Regular, Consolas, monospace
  radius:
    sm: 4px
    md: 6px
    full: 999px
  spacing:
    xs: 4px
    sm: 8px
    md: 12px
    lg: 16px
    xl: 24px
modes:
  light:
    background: "{tokens.color.background}"
    surface: "{tokens.color.surface}"
    text: "{tokens.color.text}"
    border: "{tokens.color.border}"
  dark:
    background: "#0F1012"
    surface: "#1F2228"
    surface-muted: "#17191D"
    text: "#F8F7F3"
    text-secondary: "#D4D4D4"
    text-muted: "#B8B8B8"
    border: "#3E4044"
    border-strong: "#4A4D53"
---

# Canvas DevTools Design Contract

## Product Identity

This is a lightweight workbench for inspecting and editing real web UI on a canvas. The product surface is the app preview, selected DOM target, CSS rules, editable values, controls, and verification evidence. Controls exist because this is a web app, not a static webpage.

One sentence: content first, surface planes over lines, precise editing, visible app controls, one quiet floating dock.

The closest product tone is a Codex-style workbench: quiet left navigation, central work content, and a small right-side status/control island. It is not Figma chrome, Chrome DevTools chrome, or a decorative SaaS dashboard.

## Non-Negotiables

1. Content before chrome.
2. Light mode is the default. Dark mode is token-driven only.
3. Decoration is a cost. Remove it unless it improves selection, editing, scanning, navigation, or verification.
4. Pro-tool quality comes from precision and density, not dark mode, monospace, shadows, or heavy borders.
5. No landing page, hero, marketing copy, fake product framing, or explanatory feature panels.
6. Controls are not decoration. Required work controls must remain visible, reachable, and stateful.
7. Canvas, content, and controls must each expose distinct affordances.
8. Selection controls live in one quiet floating dock, not scattered cards or a right inspector.

## Layout

Use the simplest workbench that exposes the task:

- Main canvas: app preview and selected objects dominate the viewport.
- Workspace rail: lightweight navigation and source/status entry points when the demo needs product context.
- Selection dock: DOM/CSS details, editable values, affected nodes, patches, and actions for the current selection.
- Floating controls: one contextual dock for the active selection. Avoid multiple independent floating cards.
- Toolbars: compact controls for actual work, no title-bar theater.

Do not wrap the primary app preview in an extra card or decorative frame. Use tonal surface planes, empty space, and alignment before adding a divider. A divider is allowed only when plane contrast cannot preserve scanning accuracy.

## Plane Definition

Plane-based does not mean splitting the screen into large colored panels. It means using local surface changes to express layer and purpose.

- Canvas plane: quiet base with spatial cues.
- Content plane: the editable app surface and its product controls.
- Control plane: workspace rail plus one floating selection dock with editing instruments.

Do not use a large right-side color block as the main control model. Controls should stay canvas-centered and selection-relative.

## Layer Affordances

This product edits UI content on a canvas, so the three layers must not blur together.

- Canvas is the quiet spatial stage. It needs subtle operability cues: sparse low-contrast grid or origin ticks, zoom or scale state, and object placement cues. These cues must be quieter than content.
- Content is the app being edited. It needs real product controls, state, dense data, hover/selection, inputs, menus, toggles, checkboxes, and actions.
- Controls are editing instruments. They need selector/source/CSS/patch semantics, utility actions, mode state, and inline editable values.

If canvas affordance is missing, the screen reads as a webpage. If content affordance is missing, the sample reads as editorial mock content. If control affordance is missing, the user cannot tell editing tools from the app's own controls.

## Surface Tone

The target tone is Codex-like surface workbench, not Chrome DevTools, Figma canvas, or a SaaS dashboard. Separate areas with subtle filled planes rather than borders.

Use by default:

- Neutral off-white workspace base.
- White app work surface.
- One white floating selection dock.
- Selected content plane with restrained accent fill.
- Tiny semantic status marks or text.

Avoid by default:

- Border stacks around panels, sections, rows, and fields.
- Shadow as hierarchy.
- Boxed inspector sections.
- Large colored side sheets as the primary separation method.
- Multiple floating inspector cards for the same selection.
- Card grids for page structure.
- Fake browser chrome or fake tool chrome.

## Floating Selection Dock

Controls for the current selection belong in one compact dock. The dock may move with, or sit near, the selected content. It should feel like a tool instrument orbiting the selected object, not a right-side DevTools panel, side sheet, or static inspector.

Required dock areas:

- `Target`: selected selector, component/source path, inspect/edit mode state.
- `Style`: key CSS declarations with inline editable values.
- `Patch`: concise patch summary and preview.
- `Actions`: copy, export, revert, apply/ship patch.

The dock uses calm collapsible sections:

- Collapsed does not mean hidden. Collapsed means summarized.
- Expanded means editable.
- `Target` collapsed still shows selector and source path.
- `Style` collapsed still shows 3-5 key declarations and affected node count.
- `Patch` collapsed still shows update/insert count and readiness.
- `Actions` stays visible enough for copy/export/revert/apply.

Internal dock grouping should use spacing, tiny chevrons, and summary text. Avoid section boxes, heavy rules, large headers, and many typography styles.

## Web App Affordances

The demo must read as an operating web app, not an editorial webpage. Removing decoration must not remove product controls.

Required visible controls:

- Mode or target control for inspect/edit state.
- Current selected target and source path.
- Undo/redo or clear recovery affordance when edits exist.
- Copy/export controls for HTML/CSS or patch output.
- Apply/ship/publish action for the proposed patch.
- Search or filter where the surface contains many rows or nodes.
- Editable CSS values that clearly accept input.
- Collapsible dock sections whose collapsed state still summarizes the work.

Controls should be compact and integrated into the surface. They may be icon-only when the icon is familiar and accessible. They should not be hidden behind explanatory copy, oversized bars, or decorative chrome.

## Weight Budget

Every visible layer must earn its place. Before adding a surface, ask whether it makes the user faster or more accurate.

Remove by default:

- Section wrappers that only group visually.
- Panel headers that repeat obvious context.
- Shadows, glows, glass, gradients, blobs, and atmospheric backgrounds.
- Badges that do not change a decision.
- Borders that do not separate editable or selectable regions.
- Copy that explains the UI instead of being part of the work.

Prefer instead:

- Tonal planes with 2-4% contrast shifts.
- Row fill, selected fill, and hover fill before row borders.
- Inline editable values before bordered inputs.
- One local selection dock before global panels.

## Color

Use semantic tokens only. Components bind to meaning, not raw color:

- `background`: page and canvas.
- `surface`: selection dock, popover, field, and active work surfaces.
- `surface-muted`: read-only or inactive rows.
- `surface-active`: selected rows, active target planes, and focused context.
- `text`, `text-secondary`, `text-muted`: hierarchy.
- `border`, `border-strong`: separation and selected structure.
- `accent`: selection, focus, and primary action.
- `success`, `warning`, `danger`: status.

Color should guide attention, not brand the screen. One accent path per decision area. Use fills for structure before lines. Do not use broad color washes.

## Typography

Use the UI sans font for almost everything. Use monospace only for code, selectors, paths, IDs, command output, or raw values where character identity matters.

Avoid oversized type inside tools. Labels, tables, forms, and inspector rows should be compact and scannable. Letter spacing is `0`.

Limit control typography to three tones: primary UI text, muted labels, and code values. Too many type voices make the dock feel like a code editor or DevTools clone.

Weight contract:

- Body/work text: `500-560`.
- Labels and secondary controls: `500-600`.
- Strong row names and compact buttons: `600-650`.
- Page titles only: `650-700`.
- Avoid `720+` in the demo unless it is a single numeric metric or brand mark.
- Never use monospace, uppercase, or extra letter spacing as a pro-tool costume.

Font size contract:

- Inspector labels: `10-11px`.
- Inspector values and table cells: `11-12px`.
- App controls: `12px`.
- Page title: `18-21px`.
- Avoid large type inside controls, docks, tables, or side rails.

## Borders And Shadows

Borders are not structure. Use fills, spacing, and alignment first.

Material baseline:

- Light mode is neutral white and soft gray first, not cream, slate, or branded color.
- Text should feel medium and calm before it feels bold. If a row, button, or title looks loud, lower weight before changing layout.
- Hairlines should barely register until a control is active. If a border becomes the visual structure, replace it with a filled plane or spacing.
- Shadows are off by default. A visible shadow is treated as a bug in the demo unless the surface is a modal/popover that cannot read without elevation.

Border contract:

- Default containers: no border.
- Work islands and floating controls: at most one `1px` hairline using 30-40% line opacity.
- Selection: one accent hairline plus a faint fill.
- Inputs: filled value surfaces before bordered fields.
- Never stack borders inside borders.

Shadow contract:

- Default shadow: none.
- Do not use shadow for hierarchy in the demo.
- If a true modal/popover later needs elevation, use one very soft shadow only after fill/position fails.

## Components

Buttons are compact and quiet. Use icons for common commands such as select, pan, copy, export, undo, redo, search, zoom, expand, collapse, and close. Text buttons are only for commands whose label carries domain meaning, such as `Apply patch`.

Inputs look like editable values, not decorative form cards. CSS declarations should read as inline rule editing: property, value, source, affected nodes. Read-only values should be quieter than editable fields.

Tables and lists are preferred over card grids when the user needs to compare state. Use row planes, aligned values, and hover/selection states before row dividers.

Status and risk should not become decorative pills. Use quiet text and a tiny semantic mark first. Saturated badge fills are allowed only when the state itself is the primary work object.

Cards are allowed only for repeated objects, popovers, modals, or genuinely framed tools. Page sections are not cards.

The sample app must include real application controls: actions, filters, inputs, select menus, toggles or checkboxes, row selection, status changes, and patch/application commands. A static content layout is not acceptable.

## Demo Surface

The default demo surface is a design-system release queue, not a component specimen page. It should read as an internal web app used to approve design-system changes.

Required content:

- Compact release toolbar with export, re-run, and approve actions.
- Filter/search surface with tabs, select filters, and a token-change toggle.
- Dense release table with component, source, owner, risk, checks, status, and updated columns.
- One selected row as the default editable target.
- Batch action bar for the selected row.

The selected row is the first target because it makes the canvas/editing relationship visible. Buttons can still be edited through the outline or direct preview selection, but they are not the initial target. Avoid returning to generic samples such as `Workspace controls`, empty component playgrounds, or self-referential tables containing only `Button`, `TextField`, and `Badge`.

## Motion

Motion clarifies state change only. Use short opacity or transform transitions. Do not animate layout in ways that move text or controls while the user is reading or clicking.

## Accessibility

Every interactive element needs a visible focus state and accessible name. Color cannot be the only state channel. Maintain WCAG AA contrast in light and dark themes.

## Hard No

- Dark mode as the default identity.
- Monospace as a general pro-tool costume.
- Decorative chrome, fake browser bars, fake app headers, or ornamental panels.
- Nested cards.
- Multiple floating cards for one selection.
- Border-heavy sectioning.
- Fixed right DevTools inspector as the primary control surface.
- Large right color sheet as the primary control surface.
- Webpage-like editorial composition without app controls.
- Hidden accordion content that removes essential target/style/patch context.
- One-hue palettes or broad gradient themes.
- Shadows by default.
- Visible in-app instructions that describe how polished the UI is.
- Hard-coded component colors that break theme switching.

## Agent Prompt

Use DESIGN.md as the source of truth. Build the working surface first. Make the UI light-first, content-first, plane-based, and lightweight. Keep required app controls visible and compact. Use one quiet floating dock for the current selection; collapsed dock sections summarize, expanded sections edit. Preserve distinct canvas/content/control affordances. Use semantic tokens for theme colors. Prefer surface fill, spacing, and alignment before borders. Avoid shadows by default. Use monospace only for code-like values. Verify the rendered UI at desktop and mobile widths.
