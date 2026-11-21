import { PUBLISHED_PRIME_COUNTS } from "../data/prime-counts";
import { fixed, integer, oneDecimal, powerOfTen } from "../format";
import { li } from "../math/li";
import { byId, onSlider, setText } from "../ui/dom";

export const schoenfeldBound = (x: number): number => (Math.sqrt(x) * Math.log(x)) / (8 * Math.PI);

export function mountProof(): void {
  const slider = onSlider("proofExponent", render);

  function render(exponent: number) {
    const x = 10 ** exponent;
    const count = PUBLISHED_PRIME_COUNTS[exponent];
    const estimate = li(x);
    const error = estimate - count;
    const bound = schoenfeldBound(x);
    const share = error / bound;

    setText("proofExponentValue", powerOfTen(exponent));
    setText("proofPi", integer(count));
    setText("proofLi", oneDecimal(estimate));
    setText("proofError", oneDecimal(error));
    setText("proofBound", oneDecimal(bound));
    byId("proofMeter").style.width = `${Math.min(100, 100 * share)}%`;
    setText(
      "proofExplain",
      `The actual error is ${fixed(100 * share, 1)}% of the bound. Compared with the number of primes, the bound is ${fixed((100 * bound) / count, bound / count < 0.001 ? 4 : 3)}% of π(x).`,
    );
  }

  render(Number(slider.value));
}
