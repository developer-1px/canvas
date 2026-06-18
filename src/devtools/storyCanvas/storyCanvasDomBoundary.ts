export function queryStoryCanvasElement<T extends Element = Element>(
  root: ParentNode,
  selector: string,
) {
  return root.querySelector<T>(selector);
}

export function queryStoryCanvasElements<T extends Element = Element>(
  root: ParentNode,
  selector: string,
) {
  return Array.from(root.querySelectorAll<T>(selector));
}

export function closestStoryCanvasElement<T extends Element = Element>(
  element: Element,
  selector: string,
) {
  return element.closest<T>(selector);
}

export function matchesStoryCanvasSelector(element: Element, selector: string) {
  return element.matches(selector);
}

export function createStoryCanvasElementWithClass<K extends keyof HTMLElementTagNameMap>(
  frameDocument: Document,
  tagName: K,
  className: string,
) {
  const element = frameDocument.createElement(tagName);
  element.className = className;
  return element;
}
