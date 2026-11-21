import { describe, expect, it } from "vitest";
import { ZERO_HEIGHTS } from "../data/zeros";
import { zeta, zetaAbs } from "./zeta";

describe("zeta", () => {
  it("matches known values", () => {
    expect(zeta(2, 0)[0]).toBeCloseTo(Math.PI ** 2 / 6, 12);
    expect(zeta(-1, 0)[0]).toBeCloseTo(-1 / 12, 12);
    const [re, im] = zeta(0.5, 10);
    expect(re).toBeCloseTo(1.5449, 4);
    expect(im).toBeCloseTo(-0.1153, 4);
  });

  it("vanishes at the tabulated zeros", () => {
    for (const gamma of ZERO_HEIGHTS) expect(zetaAbs(0.5, gamma)).toBeLessThan(1e-8);
  });
});
