import { byId } from "../ui/dom";
import { type Language, LANGUAGES, language, setLanguage, t } from "./index";

const PREFIX = "data-i18n";
const originals = new WeakMap<Element, Map<string, string>>();

function original(element: Element, target: string, read: () => string): string {
  let saved = originals.get(element);
  if (!saved) originals.set(element, (saved = new Map<string, string>()));
  if (!saved.has(target)) saved.set(target, read());
  return saved.get(target) ?? "";
}

function translateElement(element: Element) {
  for (const { name, value: key } of [...element.attributes]) {
    if (name === PREFIX) {
      const defaultValue = original(element, "", () => element.innerHTML);
      element.innerHTML = t(key, { defaultValue });
    } else if (name.startsWith(`${PREFIX}-`)) {
      const attribute = name.slice(PREFIX.length + 1);
      const defaultValue = original(
        element,
        attribute,
        () => element.getAttribute(attribute) ?? "",
      );
      element.setAttribute(attribute, t(key, { defaultValue }));
    }
  }
}

export function translatePage(): void {
  document.documentElement.lang = language();
  for (const element of document.querySelectorAll("*")) translateElement(element);
}

export function mountLanguageSelect(): () => void {
  const select = byId("languageSelect", HTMLSelectElement);
  select.addEventListener("change", () => {
    const choice = LANGUAGES.find((lng) => lng === select.value);
    if (choice) void setLanguage(choice);
  });
  return () => {
    select.value = language() satisfies Language;
  };
}
