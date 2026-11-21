import { describe, expect, it } from "vitest";
import { li } from "./li";

describe("li", () => {
  it("matches the published value at 10^12", () => {
    expect(li(1e12)).toBeCloseTo(37_607_950_280.8, 0);
  });

  it("stays above π(x) for the published counts", () => {
    expect(li(1e6)).toBeCloseTo(78_627.5, 0);
    expect(li(1e8) - 5_761_455).toBeCloseTo(754.4, 0);
  });
});
