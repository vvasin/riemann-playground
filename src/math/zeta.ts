import { type Complex, divide, inversePower, multiply } from "./complex";

const BERNOULLI = [
  1 / 6,
  -1 / 30,
  1 / 42,
  -1 / 30,
  5 / 66,
  -691 / 2730,
  7 / 6,
  -3617 / 510,
  43867 / 798,
  -174611 / 330,
];

export function zeta(sigma: number, t: number): Complex {
  const s: Complex = [sigma, t];
  const cutoff = Math.max(15, Math.ceil(Math.abs(t) / 3) + 10);
  let re = 0;
  let im = 0;
  for (let n = 1; n < cutoff; n++) {
    const term = inversePower(n, s);
    re += term[0];
    im += term[1];
  }

  const last = inversePower(cutoff, s);
  const tail = divide([last[0] * cutoff, last[1] * cutoff], [sigma - 1, t]);
  re += tail[0] + last[0] / 2;
  im += tail[1] + last[1] / 2;

  let rising = s;
  let power: Complex = [last[0] / cutoff, last[1] / cutoff];
  let factorial = 2;
  BERNOULLI.forEach((bernoulli, i) => {
    const k = i + 1;
    const correction = multiply(rising, power);
    re += (bernoulli / factorial) * correction[0];
    im += (bernoulli / factorial) * correction[1];
    rising = multiply(multiply(rising, [sigma + 2 * k - 1, t]), [sigma + 2 * k, t]);
    power = [power[0] / (cutoff * cutoff), power[1] / (cutoff * cutoff)];
    factorial *= (2 * k + 1) * (2 * k + 2);
  });
  return [re, im];
}

export function zetaAbs(sigma: number, t: number): number {
  const [re, im] = zeta(sigma, t);
  return Math.hypot(re, im);
}
