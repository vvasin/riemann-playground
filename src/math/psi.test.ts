import { describe, expect, it } from "vitest";
import { PRIME_POWERS, psi, stepAt } from "./psi";

describe("psi", () => {
  it("steps by ln p at prime powers", () => {
    expect(PRIME_POWERS.slice(0, 8)).toEqual([2, 3, 4, 5, 7, 8, 9, 11]);
    expect(stepAt(8)).toBeCloseTo(Math.log(2));
    expect(stepAt(27)).toBeCloseTo(Math.log(3));
    expect(stepAt(12)).toBe(0);
  });

  it("is the sum of the steps", () => {
    expect(psi(1.9)).toBe(0);
    expect(psi(10)).toBeCloseTo(Math.log(2520));
  });
});
