import { describe, expect, it } from "vitest";
import { ZERO_HEIGHTS } from "../data/zeros";
import { pairWave, riseAt } from "./explicit-formula";
import { stepAt } from "./psi";

const numbers = Array.from({ length: 29 }, (_, i) => i + 2);

describe("explicit formula", () => {
  it("keeps each wave within its envelope", () => {
    const gamma = ZERO_HEIGHTS[0];
    for (let x = 2; x <= 100; x += 0.5) {
      expect(Math.abs(pairWave(x, 0.5, gamma))).toBeLessThanOrEqual(
        (2 * Math.sqrt(x)) / Math.hypot(0.5, gamma) + 1e-12,
      );
    }
  });

  it("picks out every prime power up to 30 with 50 pairs", () => {
    const rises = numbers.map((n) => riseAt(n, ZERO_HEIGHTS.length));
    const steps = rises.filter((_, i) => stepAt(numbers[i]) > 0);
    const others = rises.filter((_, i) => stepAt(numbers[i]) === 0).map(Math.abs);
    expect(Math.max(...others)).toBeLessThan(0.9);
    expect(Math.min(...steps)).toBeGreaterThan(Math.max(...others));
  });

  it("keeps the bar estimates within [−0.88, 3.86] for every N", () => {
    const rises = ZERO_HEIGHTS.flatMap((_, pairs) => numbers.map((n) => riseAt(n, pairs + 1)));
    expect(Math.min(...rises)).toBeGreaterThanOrEqual(-0.885);
    expect(Math.max(...rises)).toBeLessThanOrEqual(3.865);
  });
});
