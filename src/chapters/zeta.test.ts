import { describe, expect, it } from "vitest";
import { partialSum } from "./zeta";

describe("partialSum", () => {
  it("first passes 10 for s = 1 at n = 12,367", () => {
    expect(partialSum(1, 12_366)).toBeLessThan(10);
    expect(partialSum(1, 12_367)).toBeGreaterThan(10);
  });

  it("approaches π²/6 for s = 2", () => {
    expect(partialSum(2, 250)).toBeCloseTo(Math.PI ** 2 / 6, 2);
  });
});
