import { fixed, scientific, superscript } from "../format";
import { t } from "../i18n";
import { type Choice, renderChoices } from "../ui/choices";
import { byId, createElement, onSlider, setText } from "../ui/dom";

const EXPONENTS: Choice<number>[] = [
  [1, "s = 1"],
  [2, "s = 2"],
  [3, "s = 3"],
  [4, "s = 4"],
];

const LIMITS = new Map([
  [2, { value: Math.PI ** 2 / 6, prefix: "π²/6 = " }],
  [3, { value: 1.2020569031595942, prefix: "" }],
  [4, { value: Math.PI ** 4 / 90, prefix: "π⁴/90 = " }],
]);

const SHOWN_TERMS = 8;

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
    items.push(createElement("li", "more", t("zeta.more", { count: terms - SHOWN_TERMS })));
  byId("fractionStrip").replaceChildren(...items);
}

function describeShare(terms: number, percent: number, remainder: number): string {
  const share =
    percent > 99.9999
      ? t("zeta.moreThan", { value: fixed(99.9999, 4) })
      : fixed(percent, percent > 99.99 ? 4 : 2);
  const rest = remainder < 1e-5 ? scientific(remainder) : fixed(remainder, 6);
  return terms === 1
    ? t("zeta.shareFirst", { share, rest })
    : t("zeta.share", { count: terms, share, rest });
}

export function mountZeta(): () => void {
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
      setText("sumLimit", `${limit.prefix}${fixed(limit.value, 6)}…`);
      progress.style.visibility = "visible";
      byId("sumProgressFill").style.width = `${percent}%`;
      setText("sumExplain", describeShare(terms, percent, limit.value - total));
    } else {
      setText("sumLimit", t("zeta.noLimit"));
      progress.style.visibility = "hidden";
      setText("sumExplain", t("zeta.divergent"));
    }
    highlight(s);
  }

  render();
  return render;
}
