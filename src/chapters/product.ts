import { fixed, superscript } from "../format";
import { primesUpTo } from "../math/primes";
import { renderChoices } from "../ui/choices";
import { byId, createElement, onSlider, setText } from "../ui/dom";

const EXPONENTS = [0, 1, 2, 3];
const FIRST_PRIMES = primesUpTo(29);

const termLabel = (base: number) => (base === 1 ? "1" : `1/${base}²`);
const primePower = (p: number, exponent: number) =>
  `${p}${exponent > 1 ? superscript(exponent) : ""}`;

export function describeTerm(exponent2: number, exponent3: number): string {
  const a = 2 ** exponent2;
  const b = 3 ** exponent3;
  const n = a * b;
  if (n === 1) return "1 × 1 = 1, the first term of ζ(2) (n = 1)";
  const product = `${termLabel(a)} × ${termLabel(b)} = 1/${n}²`;
  if (exponent2 + exponent3 === 1) return product;
  const factors = [
    exponent2 ? primePower(2, exponent2) : "",
    exponent3 ? primePower(3, exponent3) : "",
  ].filter(Boolean);
  return `${product}, because ${n} = ${factors.join(" × ")}`;
}

export function eulerProduct(primeCount: number): number {
  let value = 1;
  for (const p of FIRST_PRIMES.slice(0, primeCount)) value /= 1 - 1 / p ** 2;
  return value;
}

function mountTermPicker() {
  const exponents = { 2: 2, 3: 1 };
  const highlights = ([2, 3] as const).map((p) => {
    const choices = EXPONENTS.map((e) => [e, termLabel(p ** e)] as const);
    const highlight = renderChoices(`power${p}`, choices, (exponent) => {
      exponents[p] = exponent;
      render();
    });
    return () => {
      highlight(exponents[p]);
    };
  });

  function render() {
    highlights.forEach((highlight) => {
      highlight();
    });
    setText("termResult", describeTerm(exponents[2], exponents[3]));
  }

  render();
}

function mountProductSlider() {
  const factors = FIRST_PRIMES.map((p) => createElement("li", "factor", `p = ${p}`));
  byId("factorList").replaceChildren(...factors);
  const slider = onSlider("factorCount", render);

  function render(count: number) {
    setText("factorCountValue", count);
    setText("productResult", fixed(eulerProduct(count), 6));
    factors.forEach((factor, i) => factor.classList.toggle("inactive", i >= count));
  }

  render(Number(slider.value));
}

export function mountProduct(): void {
  mountTermPicker();
  mountProductSlider();
}
