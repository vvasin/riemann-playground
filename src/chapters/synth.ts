import { ZERO_HEIGHTS } from "../data/zeros";
import { fixed } from "../format";
import { psiApprox, riseAt } from "../math/explicit-formula";
import { isPrime } from "../math/primes";
import { PRIME_POWERS, psi, stepAt } from "../math/psi";
import { COLORS } from "../ui/colors";
import { byId, onClick, onSlider, setText } from "../ui/dom";
import { createPlot, onPlotHover } from "../ui/plot";

const MAX_PAIRS = ZERO_HEIGHTS.length;
const X_MIN = 1.5;
const X_MAX = 30;
const Y_MIN = -2;
const Y_MAX = 34;
const HOVER_HINT = "Hover over or tap the graph to compare values at one x.";

const nearStep = (x: number) => PRIME_POWERS.some((n) => Math.abs(x - n) < 0.16);

export function meanError(pairs: number): number {
  let total = 0;
  let count = 0;
  for (let x = 2.04; x < 29.95; x += 0.075) {
    if (nearStep(x)) continue;
    total += Math.abs(psiApprox(x, pairs) - psi(x));
    count++;
  }
  return total / count;
}

function staircase(): [number, number][] {
  const points: [number, number][] = [[X_MIN, 0]];
  for (let n = 2; n <= X_MAX; n++) points.push([n, psi(n - 1)], [n, psi(n)]);
  points.push([X_MAX, psi(X_MAX)]);
  return points;
}

function drawCurves(pairs: number, hover: number | null) {
  const plot = createPlot(
    "synthPlot",
    { x0: X_MIN, x1: X_MAX, y0: Y_MIN, y1: Y_MAX },
    { left: 34, xTicks: [2, 5, 10, 15, 20, 25, 30], yTicks: [0, 5, 10, 15, 20, 25, 30] },
  );
  if (!plot) return;
  for (const n of PRIME_POWERS.filter((n) => n <= X_MAX)) {
    plot.verticalLine(n, isPrime(n) ? "rgba(125,142,166,.35)" : "rgba(182,168,255,.55)", []);
  }
  plot.polyline(staircase(), { color: COLORS.mint, width: 2.6 });
  plot.curve((x) => psiApprox(x, pairs), {
    from: X_MIN,
    to: X_MAX,
    samples: 1200,
    color: COLORS.blue,
  });
  if (hover !== null) plot.verticalLine(hover, COLORS.gold);
  plot.finish();
}

function drawBars(pairs: number, [lo, hi]: number[]) {
  const numbers = Array.from({ length: hi - lo + 1 }, (_, i) => i + lo);
  const plot = createPlot(
    "barPlot",
    { x0: lo - 0.7, x1: hi + 0.7, y0: -1.5, y1: 4.3 },
    { left: 34, top: 16, xTicks: numbers, yTicks: [-1, 0, 1, 2, 3, 4] },
  );
  if (!plot) return;
  const { ctx } = plot;
  const x = (v: number) => plot.x(v);
  const y = (v: number) => plot.y(v);
  const barWidth = Math.min(20, (plot.innerWidth / numbers.length) * 0.26);

  for (const n of numbers) {
    const actual = stepAt(n);
    const estimate = riseAt(n, pairs);
    ctx.fillStyle = COLORS.mint;
    ctx.fillRect(
      x(n) - barWidth - 1,
      y(actual),
      barWidth,
      Math.max(actual > 0 ? 0 : 1.5, y(0) - y(actual)),
    );

    ctx.fillStyle = COLORS.blue;
    const top = y(Math.max(0, estimate));
    const bottom = y(Math.min(0, estimate));
    ctx.fillRect(x(n) + 1, top, barWidth, Math.max(1.5, bottom - top));

    if (actual > 0) {
      ctx.fillStyle = COLORS.mint;
      ctx.font = "bold 11px system-ui";
      ctx.textAlign = "center";
      ctx.fillText(isPrime(n) ? "p" : "pᵏ", x(n) - barWidth / 2, Math.max(9, y(actual) - 9));
    }
  }

  ctx.strokeStyle = COLORS.grey;
  ctx.beginPath();
  ctx.moveTo(plot.padding.left, y(0));
  ctx.lineTo(plot.padding.left + plot.innerWidth, y(0));
  ctx.stroke();
  plot.finish();
}

function describeHover(pairs: number, hover: number | null): string {
  if (hover === null) return HOVER_HINT;
  const x = Math.max(X_MIN, hover);
  return `At x = ${fixed(x, 2)}: exact ψ(x) = ${fixed(psi(x), 3)}, formula with ${pairs} pair${pairs === 1 ? "" : "s"} = ${fixed(psiApprox(x, pairs), 3)}.`;
}

export function mountSynth(): () => void {
  const slider = onSlider("pairCount", setPairs);
  const rangeSelect = byId("barRange", HTMLSelectElement);
  const barRange = () => rangeSelect.value.split(",").map(Number);
  let pairs = Number(slider.value);
  let hover: number | null = null;

  onClick("addPair", () => {
    setPairs(Math.min(MAX_PAIRS, pairs + 1));
  });
  onClick("allPairs", () => {
    setPairs(MAX_PAIRS);
  });
  onClick("resetPairs", () => {
    setPairs(0);
  });
  rangeSelect.addEventListener("change", () => {
    drawBars(pairs, barRange());
  });
  onPlotHover("synthPlot", (x) => {
    hover = x;
    draw();
  });

  function setPairs(value: number) {
    pairs = value;
    draw();
  }

  function draw() {
    drawCurves(pairs, hover);
    slider.value = String(pairs);
    setText("pairCountValue", pairs);
    setText("meanError", fixed(meanError(pairs), 3));
    setText("synthHover", describeHover(pairs, hover));
    drawBars(pairs, barRange());
  }

  return draw;
}
