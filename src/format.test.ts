import { describe, expect, it } from "vitest";
import { inWords, integer, oneDecimal, powerOfTen, scientific, superscript } from "./format";

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
});
