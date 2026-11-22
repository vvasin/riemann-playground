import { describe, expect, it } from "vitest";
import { ZERO_HEIGHTS } from "../data/zeros";
import { inversePower, multiply, divide } from "./complex";
import { eta, partialSums, zeta, zetaAbs } from "./zeta";

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

describe("partialSums", () => {
  it("approach ζ(s) for σ > 1", () => {
    const sums = partialSums([2, 5], 2000, false);
    const [re, im] = zeta(2, 5);
    expect(sums[2000][0]).toBeCloseTo(re, 3);
    expect(sums[2000][1]).toBeCloseTo(im, 3);
  });

  it("wind around ζ(s) for 0 < σ < 1, at distance about N^(1−σ)/|1 − s|", () => {
    const s = [0.5, 5] as const;
    const count = 4000;
    const sum = partialSums(s, count, false)[count];
    const last = inversePower(count, s);
    const spiral = divide(multiply([count, 0], last), [0.5, -5]);
    const drift = [spiral[0] + last[0] / 2, spiral[1] + last[1] / 2];
    const [re, im] = zeta(...s);
    expect(sum[0] - drift[0]).toBeCloseTo(re, 2);
    expect(sum[1] - drift[1]).toBeCloseTo(im, 2);
    expect(Math.hypot(sum[0] - re, sum[1] - im)).toBeGreaterThan(10);
  });

  it("with alternating signs, approach η(s) and close in on 0 at a zero", () => {
    expect(eta(2, 0)[0]).toBeCloseTo(Math.PI ** 2 / 12, 12);
    const sums = partialSums([0.5, 10], 20_001, true);
    const [re, im] = eta(0.5, 10);
    const mid = (k: number) => (sums[20_000][k] + sums[20_001][k]) / 2;
    expect(mid(0)).toBeCloseTo(re, 3);
    expect(mid(1)).toBeCloseTo(im, 3);
    const atZero = partialSums([0.5, ZERO_HEIGHTS[0]], 20_000, true)[20_000];
    expect(Math.hypot(...atZero)).toBeLessThan(0.005);
  });
});
