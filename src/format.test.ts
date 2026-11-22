import { describe, expect, it } from "vitest";
import {
  complexNumber,
  inWords,
  integer,
  oneDecimal,
  powerOfTen,
  scientific,
  superscript,
} from "./format";

describe("format", () => {
  it("writes superscripts", () => {
    expect(superscript(12)).toBe("¹²");
    expect(superscript("-3.5")).toBe("⁻³·⁵");
    expect(powerOfTen(8)).toBe("10⁸");
  });

  it("formats numbers", () => {
    expect(integer(1234567.6)).toBe("1,234,568");
    expect(oneDecimal(1234.56)).toBe("1,234.6");
    expect(inWords(2.5e9)).toBe("2.5 billion");
    expect(scientific(1.234e-7)).toBe("1.23 × 10⁻⁷");
  });

  it("writes complex numbers with minus signs and without −0", () => {
    expect(complexNumber([-1.23456, 0.5], 3)).toBe("−1.235 + 0.500i");
    expect(complexNumber([0.0001, -0.0002], 3)).toBe("0.000 + 0.000i");
    expect(complexNumber([2, -0.25], 2)).toBe("2.00 − 0.25i");
  });
});
