import { byId, setPressed } from "./dom";

export type Choice<T> = readonly [value: T, label: string];

export function renderChoices<T>(
  containerId: string,
  choices: readonly Choice<T>[],
  onSelect: (value: T) => void,
): (selected: T) => void {
  const buttons = choices.map(([value, label]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = label;
    button.addEventListener("click", () => {
      onSelect(value);
    });
    return button;
  });
  byId(containerId).replaceChildren(...buttons);

  return (selected) => {
    buttons.forEach((button, i) => {
      setPressed(button, choices[i][0] === selected);
    });
  };
}
