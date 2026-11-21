export function byId(id: string): HTMLElement;
export function byId<T extends HTMLElement>(id: string, type: new () => T): T;
export function byId(id: string, type = HTMLElement): HTMLElement {
  const element = document.getElementById(id);
  if (!(element instanceof type)) throw new Error(`Expected #${id} to be ${type.name}`);
  return element;
}

export function setText(id: string, text: string | number): void {
  byId(id).textContent = String(text);
}

export function onSlider(id: string, handler: (value: number) => void): HTMLInputElement {
  const slider = byId(id, HTMLInputElement);
  slider.addEventListener("input", () => {
    handler(Number(slider.value));
  });
  return slider;
}

export function onClick(id: string, handler: () => void): void {
  byId(id).addEventListener("click", handler);
}

export function setPressed(button: HTMLElement, pressed: boolean): void {
  button.classList.toggle("active", pressed);
  button.setAttribute("aria-pressed", String(pressed));
}

export function createElement<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className: string,
  text: string,
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);
  if (className) element.className = className;
  element.textContent = text;
  return element;
}
