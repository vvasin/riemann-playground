const EULER_GAMMA = 0.5772156649015329;

export function li(x: number): number {
  const lnX = Math.log(x);
  let sum = 0;
  let factorial = 1;
  let oddReciprocals = 0;
  for (let n = 1; n < 400; n++) {
    factorial *= n;
    const odd = n % 2 === 1;
    if (odd) oddReciprocals += 1 / n;
    const term = (((odd ? 1 : -1) * lnX ** n) / (factorial * 2 ** (n - 1))) * oddReciprocals;
    sum += term;
    if (n > 2 * lnX && Math.abs(term) < 1e-17 * Math.abs(sum)) break;
  }
  return EULER_GAMMA + Math.log(lnX) + Math.sqrt(x) * sum;
}
