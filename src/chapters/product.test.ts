import { describe, expect, it } from "vitest";
import { describeTerm, eulerProduct } from "./product";

describe("product", () => {
  it("explains a picked term", () => {
    expect(describeTerm(2, 1)).toBe("1/4² × 1/3² = 1/12², because 12 = 2² × 3");
    expect(describeTerm(1, 0)).toBe("1/2² × 1 = 1/2²");
    expect(describeTerm(0, 0)).toBe("1 × 1 = 1, the first term of ζ(2) (n = 1)");
  });

  it("approaches ζ(2)", () => {
    expect(eulerProduct(0)).toBe(1);
    expect(eulerProduct(10)).toBeCloseTo(1.63307, 6);
    expect(eulerProduct(10)).toBeLessThan(Math.PI ** 2 / 6);
  });
});
