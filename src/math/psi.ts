import { primesUpTo } from "./primes";

export const PSI_LIMIT = 100;

const stepHeights = vonMangoldt(PSI_LIMIT);
let runningTotal = 0;
const cumulativeSteps = stepHeights.map((step) => (runningTotal += step));

function vonMangoldt(limit: number): number[] {
  const heights = Array<number>(limit + 1).fill(0);
  for (const p of primesUpTo(limit)) {
    for (let power = p; power <= limit; power *= p) heights[power] = Math.log(p);
  }
  return heights;
}

export const PRIME_POWERS = stepHeights.flatMap((step, n) => (step > 0 ? [n] : []));

export const stepAt = (n: number): number => stepHeights[n] ?? 0;

export const psi = (x: number): number =>
  x < 2 ? 0 : cumulativeSteps[Math.min(PSI_LIMIT, Math.floor(x))];
