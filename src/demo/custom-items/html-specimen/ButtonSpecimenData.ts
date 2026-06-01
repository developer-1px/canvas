import type { HtmlSpecimenData } from './HtmlSpecimenCustomItemTypes'

export function createButtonSpecimenData(): HtmlSpecimenData {
  return {
    viewportHeight: 188,
    viewportWidth: 360,
    html: `<main
  class="specimen"
  data-surface-kind="html"
  data-surface-component="ButtonSpecimen"
  data-surface-source="src/specimens/button.html"
>
  <button
    class="button primary"
    data-surface-kind="html"
    data-surface-component="Button"
    data-surface-source="src/specimens/button.css"
  >Create project</button>
  <button
    class="button secondary"
    data-surface-kind="html"
    data-surface-component="Button"
    data-surface-source="src/specimens/button.css"
  >Invite team</button>
  <button
    class="button danger"
    data-surface-kind="html"
    data-surface-component="Button"
    data-surface-source="src/specimens/button.css"
  >Delete</button>
</main>`,
    css: `.specimen {
  display: grid;
  min-height: 100vh;
  align-content: center;
  gap: 12px;
  padding: 24px;
  background: #f8f8f7;
}
.button {
  height: 34px;
  border: 0;
  border-radius: 5px;
  font: 600 12px/1 Inter, ui-sans-serif, system-ui, sans-serif;
}
.primary {
  color: #ffffff;
  background: #2457c5;
}
.secondary {
  color: #39404c;
  background: #ffffff;
}
.danger {
  color: #b42318;
  background: #ffe6e3;
}`,
  }
}
