export type Complex = readonly [re: number, im: number];

export const multiply = ([a, b]: Complex, [c, d]: Complex): Complex => [
  a * c - b * d,
  a * d + b * c,
];

export function divide([a, b]: Complex, [c, d]: Complex): Complex {
  const norm = c * c + d * d;
  return [(a * c + b * d) / norm, (b * c - a * d) / norm];
}

export function inversePower(n: number, [sigma, t]: Complex): Complex {
  const lnN = Math.log(n);
  const size = Math.exp(-sigma * lnN);
  return [size * Math.cos(t * lnN), -size * Math.sin(t * lnN)];
}
