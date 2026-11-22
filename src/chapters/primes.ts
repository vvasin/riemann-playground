import { isPrime, primeCount, primesUpTo, smallestFactor } from "../math/primes";
import { t } from "../i18n";
import { byId, onSlider, setText } from "../ui/dom";

const GRID_MAX = 100;

function describe(n: number): string {
  if (!isPrime(n)) {
    const factor = smallestFactor(n);
    return t("primes.notPrime", { n, factor, other: n / factor });
  }
  const root = Math.floor(Math.sqrt(n));
  return root < 2 ? t("primes.prime", { n }) : t("primes.primeChecked", { n, root });
}

function abbreviate(primes: number[]): string {
  if (primes.length <= 12) return primes.join(", ");
  return `${primes.slice(0, 6).join(", ")}, …, ${primes.slice(-3).join(", ")}`;
}

function createCell(n: number, onSelect: () => void): HTMLButtonElement {
  const cell = document.createElement("button");
  cell.type = "button";
  cell.className = isPrime(n) ? "num is-prime" : "num";
  cell.textContent = String(n);
  cell.addEventListener("click", onSelect);
  return cell;
}

export function mountPrimes(): () => void {
  const slider = onSlider("primeLimit", select);
  let limit = Number(slider.value);

  const cells = Array.from({ length: GRID_MAX - 1 }, (_, i) =>
    createCell(i + 2, () => {
      select(i + 2);
    }),
  );
  byId("primeGrid").replaceChildren(...cells);

  function select(n: number) {
    limit = n;
    render();
  }

  function render() {
    slider.value = String(limit);
    setText("primeLimitValue", limit);
    setText("primeCountText", `π(${limit}) = ${primeCount(limit)}`);
    setText(
      "numberExplanation",
      `${describe(limit)} ${t("primes.list", { n: limit, primes: abbreviate(primesUpTo(limit)) })}`,
    );
    cells.forEach((cell, i) => {
      const n = i + 2;
      cell.classList.toggle("outside", n > limit);
      cell.classList.toggle("chosen", n === limit);
      cell.setAttribute("aria-pressed", String(n === limit));
      cell.setAttribute("aria-label", isPrime(n) ? t("primes.cellPrime", { n }) : String(n));
    });
  }

  render();
  return render;
}
