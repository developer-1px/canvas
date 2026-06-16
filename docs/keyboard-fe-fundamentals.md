# FE Keyboard Fundamentals

Last researched: 2026-06-16

Goal: keyboard interaction을 "Tab만 된다" 수준이 아니라, role/semantics/focus/event/test가 함께 맞는 FE 기본기로 다룬다.

## One-line Rule

Keyboard support is a contract, not an event handler.

If UI claims a role, state, popup, selection, or command surface, it must also own the keyboard behavior, focus lifecycle, visible focus, and exit route expected for that claim.

## Source Baseline

Use these as the authority order when reviewing or implementing:

1. Native HTML behavior first.
2. WCAG 2.2 success criteria for minimum user rights.
3. WAI-ARIA APG pattern contracts for custom widgets.
4. UI Events and HTML focus model for event/focus mechanics.
5. Browser and assistive tech testing for integration reality.

Key references:

- W3C APG, "Read Me First": ARIA roles are promises; native ARIA does not add browser keyboard behavior.
  https://www.w3.org/WAI/ARIA/apg/practices/read-me-first/
- W3C APG, "Developing a Keyboard Interface": composite widgets should use roving `tabindex` or `aria-activedescendant`.
  https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/
- W3C WCAG 2.2: keyboard operability, no keyboard trap, character shortcut constraints, focus order, focus visible, focus not obscured.
  https://www.w3.org/TR/WCAG22/
- WHATWG HTML, focus model and `tabindex`: focusable, sequentially focusable, click focusable, and `tabindex` behavior are distinct.
  https://html.spec.whatwg.org/multipage/interaction.html
- W3C UI Events: keyboard events are UI events and `KeyboardEvent` is the event model.
  https://www.w3.org/TR/uievents/
- MDN `KeyboardEvent.key`: `keydown`, `beforeinput`, `input`, `keyup` order and repeat behavior.
  https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key
- MDN `KeyboardEvent.isComposing`: IME composition guard.
  https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/isComposing

## Non-negotiables

| Rule | Practical meaning | Failure smell |
| --- | --- | --- |
| All functionality must be keyboard-operable | Every pointer action needs an equivalent keyboard path unless the underlying function is inherently path-based | drag-only resize, hover-only commands, context menu only on pointer |
| No keyboard trap | Focus can leave a component with normal keyboard methods, or the custom exit is announced | modal with broken Tab loop, canvas mode that captures Escape/Tab forever |
| Focus order preserves meaning | Sequential focus follows the task model and visual/semantic structure | positive `tabindex`, focus jumping to hidden/irrelevant controls |
| Focus is visible and not obscured | The focused target has a visible indicator and is not fully hidden by author content | custom outline removed, floating toolbar covers the focused item |
| Character shortcuts are constrained | Single-key shortcuts are off, remappable, or active only in a focused component | global `v`, `r`, `t` shortcuts firing while typing |
| Role implies behavior | `role="button"` means Enter/Space activation; `role="toolbar"` means toolbar focus model; `role="dialog"` means dialog focus lifecycle | ARIA role added without key handling |

## Native First

Prefer native controls when they match the job:

- Use `button` for commands.
- Use `a[href]` for navigation.
- Use `input`, `select`, `textarea` for form input.
- Use `details`/`summary` when their disclosure behavior matches.
- Use native `checkbox`, `radio`, `range`, and `number` before recreating them.

Native elements come with platform keyboard behavior, focusability, disabled behavior, form semantics, and assistive technology mappings. A custom element with ARIA has to recreate all of that.

When a native element cannot satisfy the product shape:

- Write down the APG pattern name.
- Write down the root role, contained roles, states/properties, focus model, and key bindings.
- Add tests for role/state plus keyboard behavior, not just markup.

## Focus Model

### Three Kinds of Focusability

The HTML focus model distinguishes:

- programmatic focusability: can `.focus()` target it?
- sequential focusability: can Tab/Shift+Tab reach it?
- click focusability: does pointer activation focus it?

Do not assume these are identical across browsers or user preferences.

### `tabindex` Rules

Use:

- no `tabindex` for native controls in normal flow.
- `tabindex="0"` for a custom widget root or active item that must be reachable in document order.
- `tabindex="-1"` for programmatic focus targets and inactive roving items.

Avoid:

- positive `tabindex`; it creates a parallel navigation order and is brittle.
- putting non-interactive decoration in the tab order.
- relying on `tabindex="-1"` to make something unreachable to all keyboard users; user agents can override for accessibility.

### Focus Ownership

Every interactive surface needs an owner:

- Page owns ordinary sequential focus.
- Composite widget owns arrow navigation inside itself.
- Modal/dialog owns focus while open and restores focus when closed.
- Combobox/listbox/menu/tree/tabs own active item movement and selection rules.
- Canvas/editor app owns shortcut routing only after excluding text inputs and embedded widgets.

If no module clearly owns focus, bugs will appear as duplicate tab stops, dead arrows, lost focus after close, or global shortcuts firing at the wrong time.

## Composite Widgets

Composite widgets are collections that should normally be one Tab stop, then internally navigated with arrows or pattern-specific keys.

Common composites:

- toolbar
- menu / menubar
- listbox
- combobox popup
- radio group
- tabs
- treeview
- grid/treegrid

### Roving `tabindex`

Use this when DOM focus should move item-to-item:

1. Exactly one enabled item has `tabindex="0"`.
2. All other items have `tabindex="-1"`.
3. Arrow/Home/End moves the active item.
4. Moving active item updates tab indexes and calls `.focus()`.
5. When focus leaves and returns, the intended item has `tabindex="0"`.

Pros:

- Browser scrolls the focused item into view.
- Native focus ring and `document.activeElement` match the active item.

Cons:

- More DOM focus churn.
- Harder when active item is virtualized/unmounted.

### `aria-activedescendant`

Use this when DOM focus should stay on a container/input:

1. Container/input is focusable.
2. Container/input has `aria-activedescendant="<active item id>"`.
3. The active item is in a valid owned/controlled relationship.
4. Visual active indicator follows the referenced item.
5. Arrow/Home/End update the id, not DOM focus.

Best fit:

- combobox input with listbox suggestions.
- virtual focus where text input caret must stay in the input.
- large grids where DOM focus movement is expensive.

Hard rule: never expose both roving focus and `aria-activedescendant` as competing active models for the same widget.

## Event Model

### `keydown`, `beforeinput`, `input`, `keyup`

For character-producing keys, the usual sequence is:

1. `keydown`
2. `beforeinput`
3. `input`
4. `keyup`

`keydown` can repeat while a key is held; `event.repeat` is true on repeats. Some keys do not repeat because they do not produce characters.

Use `keydown` for:

- navigation keys: Arrow, Home, End, PageUp, PageDown.
- command keys: Escape, Enter, Space when implementing widget activation.
- shortcut routing.

Use `beforeinput`/`input` for:

- text mutation.
- editor content changes.
- IME-safe text insertion.

Do not build text editors by interpreting printable `keydown` as text. That loses IME, dead keys, mobile keyboard behavior, and browser editing semantics.

### `key` vs `code`

Use `event.key` for semantic actions:

- `ArrowLeft`
- `Enter`
- `Escape`
- `a` as "the character a under the current layout"

Use `event.code` for physical key location:

- game controls.
- canvas tools where physical WASD/QWERTY position matters.

For productivity apps, default to `key` unless the design explicitly says physical keyboard position matters.

### Composition

When `event.isComposing` is true, the key event is inside an IME composition session.

Rules:

- Do not run global character shortcuts while composing.
- Do not commit/cancel text edits just because Enter/Escape appears during composition without checking editor behavior.
- Prefer `beforeinput`/`input` for actual text changes.

### Preventing Default

Only call `preventDefault()` after deciding that your component owns the key.

Good:

- ArrowRight inside a focused toolbar where it moves toolbar focus.
- Space on a custom button where it activates the button.
- Escape inside an open modal where it closes.

Bad:

- Global `keydown` prevents all arrows before checking target.
- Canvas intercepts Backspace while a text input is active.
- Shortcut handler prevents default on unrelated keys.

## Pattern Contracts

Use this table as a review shortcut. Details still come from APG.

| Pattern | Focus model | Must-have keyboard | Must-have ARIA/state |
| --- | --- | --- | --- |
| Button | native button or custom equivalent | Enter and Space activate | accessible name; `aria-pressed` only for toggle button |
| Disclosure | trigger focus | Enter/Space toggles | trigger `aria-expanded`; usually `aria-controls`; panel labelled/related |
| Dialog | focus trap while open | Escape closes; Tab/Shift+Tab stay inside | `role=dialog`; labelled; modal only if focus/inertness is modal; restore focus on close |
| Toolbar | one Tab stop into toolbar; roving inside | Arrow navigation, often Home/End | `role=toolbar`; labelled; one active tab stop |
| Menu button | trigger then menu active item | Arrow/Home/End, Enter/Space, Escape | trigger `aria-haspopup/expanded/controls`; `menu`/`menuitem*` |
| Radio group | roving or active descendant | Arrows move/select; Space selects | `radiogroup`; `radio`; `aria-checked` |
| Tabs | roving tab | Arrow/Home/End; Enter/Space if manual activation | `tablist`; `tab`; `tabpanel`; `aria-selected`; `aria-controls` |
| Listbox | roving or active descendant | Arrow/Home/End; typeahead if appropriate; selection keys | `listbox`; `option`; `aria-selected` |
| Combobox | focus usually stays on input | Arrow opens/moves; Enter accepts; Escape closes | `combobox`; popup relation; `aria-activedescendant` when active option is virtual focus |
| Treeview | roving or active descendant | Arrow up/down; right/left expand/collapse; Home/End | `tree`; `treeitem`; expanded/selected/level/posinset/setsize |
| Grid | one Tab stop or managed cell focus | arrows move cells; Home/End/Page keys as designed | `grid`; rows/cells/headers; selected/active state |

## Canvas/App Shortcut Routing

Canvas-like FE apps need a stricter routing gate than ordinary pages.

Process a global shortcut only if:

1. The event is trusted user input for the current document/window.
2. `event.defaultPrevented` is false.
3. The target is not an input, textarea, select, contenteditable, or embedded widget that owns keyboard input.
4. `event.isComposing` is false.
5. The active surface is allowed to receive canvas shortcuts.
6. The shortcut is enabled by feature toggles and current app state.
7. The key is not reserved by an open modal/menu/combobox/tree/grid focus owner.

For app modes:

- Escape should unwind the smallest active mode first: text edit, popup, drag, temporary tool, selection mode, then app-level fallback.
- Space should not be global pan when focus is inside a button, editor, checkbox, or page scroll context.
- Backspace/Delete should not delete canvas items while text editing.
- Arrow keys should route to the focused widget before nudge/viewport behavior.
- Single-letter shortcuts should be scoped or configurable to satisfy WCAG character shortcut constraints.

## Popup and Overlay Rules

When opening additional content from keyboard focus:

- Provide a keyboard dismissal path.
- Keep content persistent long enough to use.
- If it is hoverable by pointer, it should not disappear when pointer moves into it.
- If it is modal, trap focus and restore focus.
- If it is nonmodal disclosure/popover, connect trigger and panel with ids and do not claim modal semantics.
- If it claims `aria-haspopup="menu"`, the popup should actually be a menu with menu item semantics and keyboard behavior.

Do not use `title` as the only information path for custom controls. Browser tooltips are user-agent controlled, inconsistent, and not a substitute for accessible names or keyboard-visible help.

## Testing Matrix

### Manual Keyboard Pass

For every interactive surface:

```text
Keyboard pass
|-- Tab from before the component
|   |-- focus enters the expected first/active target
|   `-- focus indicator is visible and unobscured
|-- Shift+Tab backward
|   `-- reverse order preserves meaning
|-- Arrow/Home/End inside composite widgets
|   `-- active item and focus/active descendant update exactly once
|-- Enter and Space on commands
|   `-- activation matches native expectation
|-- Escape
|   `-- closes/cancels the innermost active mode first
|-- Type in inputs/contenteditable
|   `-- global shortcuts do not fire
|-- IME composition
|   `-- composing text does not trigger global shortcut/commit/cancel bugs
|-- Open and close popup/dialog
|   |-- focus goes where the pattern says
|   `-- focus restores or exits predictably
`-- Zoom/pan/scroll/fixed overlays
    `-- focused target is not covered
```

### Automated Evidence

Unit/DOM tests should assert:

- role and accessible state exist together.
- exactly one roving item has `tabIndex=0`.
- inactive roving items have `tabIndex=-1`.
- `aria-activedescendant` points to an existing active item id.
- trigger `aria-controls` points to the open panel/menu/dialog id.
- `aria-labelledby`/`aria-label` exists where a role needs a name.
- disabled items are skipped or handled according to the pattern.
- Escape close path is centralized.
- text-input target suppression blocks global shortcuts.

Browser/e2e tests should assert:

- `document.activeElement` after open, arrow move, activation, close.
- Tab/Shift+Tab behavior for modal and nonmodal surfaces.
- focus ring visibility with screenshots when layout overlays are involved.
- IME-sensitive flows if the product owns text editing.

## Review Smells

Flag these immediately:

- `role="button"` on a non-button without Enter/Space handling.
- `role="toolbar"` with every child in the Tab order.
- `role="dialog"` without focus move/trap/restore.
- `aria-modal="true"` without actually making outside content inert/unreachable.
- `aria-haspopup="menu"` where the popup is a `div role="group"` or plain list of buttons.
- `aria-selected` on plain buttons not inside a selectable pattern.
- mutually exclusive options implemented as `aria-pressed` toggle buttons.
- positive `tabindex`.
- `onKeyDown` at `window` that does not check target/editing/composition.
- preventing default before checking ownership.
- pointer-only drag handles with no keyboard equivalent or fallback.
- focus outline removed without replacement.
- shortcut docs not matching actual shortcut routing.

## Implementation Checklist

Before shipping a keyboard-affecting change:

- Name the pattern: native, APG pattern, or product-specific mode.
- Identify the focus owner.
- Define Tab entry and exit.
- Define arrow/Home/End behavior if composite.
- Define Enter/Space behavior.
- Define Escape behavior.
- Define text-input and IME suppression.
- Define disabled item behavior.
- Define focus restore after close/cancel.
- Define visible focus styling.
- Add role/state tests.
- Add keyboard behavior tests.
- Add at least one manual keyboard pass note for high-risk surfaces.

## Canvas-specific Standard

For this repo, new keyboard work should make these boundaries explicit:

- `CanvasKeyboardShortcutIntent`: owns app-level shortcut eligibility and target suppression.
- Composite UI components: own their own APG pattern key handling before events reach canvas global routing.
- Popup/dialog/disclosure components: own trigger/panel relation and focus lifecycle.
- Toolbars/menus/radio/tabs/tree/listbox: use a shared helper or APG runtime once the pattern repeats.
- Tests should fail if a role is present without the matching keyboard/focus contract.

The bar is not "screen reader text exists". The bar is "the declared UI contract is true under keyboard-only operation".
