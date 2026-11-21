import { ZERO_HEIGHTS } from "../data/zeros";

export function pairWave(x: number, beta: number, gamma: number): number {
  const angle = gamma * Math.log(x);
  return (
    (-2 * x ** beta * (beta * Math.cos(angle) + gamma * Math.sin(angle))) /
    (beta * beta + gamma * gamma)
  );
}

export const smoothPart = (x: number): number =>
  x - Math.log(2 * Math.PI) - 0.5 * Math.log(1 - 1 / (x * x));

export function psiApprox(x: number, pairs: number): number {
  let value = smoothPart(x);
  for (let i = 0; i < pairs; i++) value += pairWave(x, 0.5, ZERO_HEIGHTS[i]);
  return value;
}

export const riseAt = (n: number, pairs: number): number =>
  psiApprox(n + 0.45, pairs) - psiApprox(n - 0.45, pairs);
