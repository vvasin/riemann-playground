import { fixed, scientific, superscript } from "../format";
import { type Choice, renderChoices } from "../ui/choices";
import { byId, createElement, onSlider, setText } from "../ui/dom";

const EXPONENTS: Choice<number>[] = [
  [1, "s = 1"],
  [2, "s = 2"],
  [3, "s = 3"],
  [4, "s = 4"],
];

const LIMITS = new Map([
  [2, { value: Math.PI ** 2 / 6, label: "π²/6 = 1.644934…" }],
  [3, { value: 1.2020569031595942, label: "1.202057…" }],
  [4, { value: Math.PI ** 4 / 90, label: "π⁴/90 = 1.082323…" }],
]);

const SHOWN_TERMS = 8;

const DIVERGENT_NOTE =
  "For s = 1 the sum keeps growing. After n terms it is about ln n + 0.577. It passes 10 only after 12,367 terms, and passes 100 after about 1.5 × 10⁴³ terms, but it never stops growing.";

export function partialSum(s: number, terms: number): number {
  let total = 0;
  for (let k = 1; k <= terms; k++) total += 1 / k ** s;
  return total;
}

function renderTerms(s: number, terms: number) {
  const items = Array.from({ length: Math.min(SHOWN_TERMS, terms) }, (_, i) => {
    const k = i + 1;
    return createElement("li", "", k === 1 ? "1" : `1/${k}${s === 1 ? "" : superscript(s)}`);
  });
  if (terms > SHOWN_TERMS)
    items.push(createElement("li", "more", `+ ${terms - SHOWN_TERMS} more terms`));
  byId("fractionStrip").replaceChildren(...items);
}

function describeShare(terms: number, percent: number, remainder: number): string {
  const head = terms === 1 ? "The first term gives" : `The first ${terms} terms give`;
  const share = percent > 99.9999 ? "more than 99.9999" : fixed(percent, percent > 99.99 ? 4 : 2);
  const rest = remainder < 1e-5 ? scientific(remainder) : fixed(remainder, 6);
  return `${head} ${share}% of the total. The remaining infinitely many terms add up to ${rest}.`;
}

export function mountZeta(): void {
  let s = 2;
  let terms = Number(byId("sumCount", HTMLInputElement).value);

  onSlider("sumCount", (value) => {
    terms = value;
    render();
  });

  const highlight = renderChoices("sChoice", EXPONENTS, (value) => {
    s = value;
    render();
  });

  function render() {
    const total = partialSum(s, terms);
    setText("sumCountValue", terms);
    setText("sumResult", fixed(total, 6));
    renderTerms(s, terms);

    const limit = LIMITS.get(s);
    const progress = byId("sumProgress");
    if (limit) {
      const percent = (100 * total) / limit.value;
      setText("sumLimit", limit.label);
      progress.style.visibility = "visible";
      byId("sumProgressFill").style.width = `${percent}%`;
      setText("sumExplain", describeShare(terms, percent, limit.value - total));
    } else {
      setText("sumLimit", "none (grows forever)");
      progress.style.visibility = "hidden";
      setText("sumExplain", DIVERGENT_NOTE);
    }
    highlight(s);
  }

  render();
}
