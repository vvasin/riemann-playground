import { describe, expect, it } from "vitest";
import { isPrime, primeCount, primesUpTo, smallestFactor } from "./primes";

describe("primes", () => {
  it("recognises primes", () => {
    expect(primesUpTo(30)).toEqual([2, 3, 5, 7, 11, 13, 17, 19, 23, 29]);
    expect(isPrime(1)).toBe(false);
    expect(isPrime(2.5)).toBe(false);
    expect(isPrime(99991)).toBe(true);
  });

  it("counts primes up to x", () => {
    expect(primeCount(10)).toBe(4);
    expect(primeCount(100)).toBe(25);
    expect(primeCount(10_000)).toBe(1229);
    expect(primeCount(100_000)).toBe(9592);
    expect(primeCount(1.5)).toBe(0);
  });

  it("matches the gaps quoted in step 1", () => {
    expect(primeCount(1100) - primeCount(1000)).toBe(16);
    expect(primesUpTo(1151).slice(-2)).toEqual([1129, 1151]);
  });

  it("finds the smallest factor", () => {
    expect(smallestFactor(91)).toBe(7);
    expect(smallestFactor(97)).toBe(97);
  });
});
