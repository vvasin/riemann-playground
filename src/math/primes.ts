export const SIEVE_LIMIT = 100_000;

const composite = sieve(SIEVE_LIMIT);
const cumulativeCounts = countPrimes(composite);

function sieve(limit: number): Uint8Array {
  const marks = new Uint8Array(limit + 1);
  marks[0] = marks[1] = 1;
  for (let i = 2; i * i <= limit; i++) {
    if (marks[i]) continue;
    for (let j = i * i; j <= limit; j += i) marks[j] = 1;
  }
  return marks;
}

function countPrimes(marks: Uint8Array): Int32Array {
  const counts = new Int32Array(marks.length);
  for (let n = 1; n < marks.length; n++) counts[n] = counts[n - 1] + (marks[n] ? 0 : 1);
  return counts;
}

export const isPrime = (n: number): boolean =>
  Number.isInteger(n) && n >= 2 && n <= SIEVE_LIMIT && !composite[n];

export const primeCount = (x: number): number =>
  x < 2 ? 0 : cumulativeCounts[Math.min(SIEVE_LIMIT, Math.floor(x))];

export function primesUpTo(limit: number): number[] {
  const primes: number[] = [];
  for (let n = 2; n <= limit; n++) if (isPrime(n)) primes.push(n);
  return primes;
}

export function smallestFactor(n: number): number {
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return d;
  return n;
}
