import { ZERO_HEIGHTS } from "../data/zeros";
import { complexNumber, fixed, signed } from "../format";
import { t } from "../i18n";
import type { Complex } from "../math/complex";
import { eta, partialSums, zeta } from "../math/zeta";
import { type Choice, renderChoices } from "../ui/choices";
import { COLORS } from "../ui/colors";
import { byId, onClick, onSlider, setPressed, setText } from "../ui/dom";
import { createPlot, type Plot, ticksBetween } from "../ui/plot";

type Sum = "zeta" | "eta";

const FIRST_ZERO = ZERO_HEIGHTS[0];
const PRESETS: Choice<Complex>[] = [
  [[2, 0], "s = 2"],
  [[2, 5], "s = 2 + 5i"],
  [[1, 5], "s = 1 + 5i"],
  [[0.5, 5], "s = ½ + 5i"],
  [[0.5, FIRST_ZERO], () => t("complex.zeroPreset", { t: fixed(FIRST_ZERO, 2) })],
];
const PADDING = { left: 40, right: 12, top: 12, bottom: 26 };
const ZERO_TOLERANCE = 1e-4;

export function viewBox(points: readonly Complex[], width: number, height: number) {
  const xs = points.map(([x]) => x);
  const ys = points.map(([, y]) => y);
  const [xMin, xMax, yMin, yMax] = [
    Math.min(...xs),
    Math.max(...xs),
    Math.min(...ys),
    Math.max(...ys),
  ];
  const scale = 1.12 * Math.max((xMax - xMin) / width, (yMax - yMin) / height, 1 / width);
  const [cx, cy] = [(xMin + xMax) / 2, (yMin + yMax) / 2];
  return {
    x0: cx - (scale * width) / 2,
    x1: cx + (scale * width) / 2,
    y0: cy - (scale * height) / 2,
    y1: cy + (scale * height) / 2,
  };
}

function decimalsFor(ticks: number[]): number {
  const step = ticks.length > 1 ? ticks[1] - ticks[0] : 1;
  for (let digits = 0; digits < 4; digits++) {
    if (Math.abs(Math.round(step * 10 ** digits) - step * 10 ** digits) < 1e-6) return digits;
  }
  return 4;
}

function arrow(plot: Plot, [x0, y0]: Complex, [x1, y1]: Complex, color: string, width: number) {
  const { ctx } = plot;
  const [ax, ay, bx, by] = [plot.x(x0), plot.y(y0), plot.x(x1), plot.y(y1)];
  const length = Math.hypot(bx - ax, by - ay);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(ax, ay);
  ctx.lineTo(bx, by);
  ctx.stroke();
  if (length < 10) return;
  const head = Math.min(9, length / 3);
  const angle = Math.atan2(by - ay, bx - ax);
  ctx.beginPath();
  ctx.moveTo(bx, by);
  ctx.lineTo(bx - head * Math.cos(angle - 0.4), by - head * Math.sin(angle - 0.4));
  ctx.lineTo(bx - head * Math.cos(angle + 0.4), by - head * Math.sin(angle + 0.4));
  ctx.closePath();
  ctx.fill();
}

function drawArrows(sums: readonly Complex[], value: Complex | null) {
  const canvas = byId("arrowPlot", HTMLCanvasElement);
  const { width, height } = canvas.getBoundingClientRect();
  const innerWidth = width - PADDING.left - PADDING.right;
  const innerHeight = height - PADDING.top - PADDING.bottom;
  if (innerWidth <= 0 || innerHeight <= 0) return;
  const domain = viewBox(value ? [...sums, value] : sums, innerWidth, innerHeight);
  const xTicks = ticksBetween(domain.x0, domain.x1, innerWidth > 360 ? 6 : 4);
  const yTicks = ticksBetween(domain.y0, domain.y1, 4);
  const format = (ticks: number[]) => (v: number) => fixed(v, decimalsFor(ticks));
  const plot = createPlot("arrowPlot", domain, {
    ...PADDING,
    xTicks,
    yTicks,
    formatX: format(xTicks),
    formatY: format(yTicks),
  });
  if (!plot) return;

  plot.polyline(
    [
      [domain.x0, 0],
      [domain.x1, 0],
    ],
    { color: COLORS.frame, width: 1 },
  );
  plot.polyline(
    [
      [0, domain.y0],
      [0, domain.y1],
    ],
    { color: COLORS.frame, width: 1 },
  );
  for (let n = 1; n < sums.length - 1; n++) arrow(plot, sums[n - 1], sums[n], COLORS.blue, 1.5);
  arrow(plot, sums[sums.length - 2], sums[sums.length - 1], COLORS.gold, 2.6);
  plot.dot(0, 0, { radius: 3, color: COLORS.grey });
  if (value) plot.dot(value[0], value[1], { radius: 6, color: COLORS.mint, hollow: true });
  plot.finish();
}

function describe(sum: Sum, [sigma, height]: Complex, zetaValue: Complex | null): string {
  if (sum === "eta") {
    if (!zetaValue) return t("complex.etaPole");
    if (Math.hypot(...zetaValue) < ZERO_TOLERANCE) return t("complex.etaZero");
    return t("complex.eta", { zeta: complexNumber(zetaValue, 3) });
  }
  if (sigma > 1) return t("complex.convergent");
  const note = zetaValue ? ` ${t("complex.extensionNote")}` : "";
  if (height === 0) return t("complex.line") + note;
  if (sigma === 1) return t("complex.circles", { radius: fixed(1 / height, 3) }) + note;
  return t("complex.spiral") + note;
}

function describeTerm(sum: Sum, n: number, [sigma, height]: Complex): string {
  const flipped = sum === "eta" && n % 2 === 0;
  const angle = -height * Math.log(n) + (flipped ? Math.PI : 0);
  return t(flipped ? "complex.termFlipped" : "complex.term", {
    n,
    length: fixed(n ** -sigma, 3),
    angle: signed(angle, 2),
  });
}

export function mountComplex(): () => void {
  let s: Complex = [2, 5];
  let sum: Sum = "zeta";
  const sigmaSlider = onSlider("complexSigma", (value) => {
    s = [value, s[1]];
    draw();
  });
  const tSlider = onSlider("complexT", (value) => {
    s = [s[0], value];
    draw();
  });
  const countSlider = onSlider("termCount", draw);
  const setCount = (change: number) => {
    countSlider.value = String(Number(countSlider.value) + change);
    draw();
  };
  onClick("addTerm", () => {
    setCount(1);
  });
  onClick("removeTerm", () => {
    setCount(-1);
  });

  const highlight = renderChoices("sPreset", PRESETS, (value) => {
    s = value;
    sigmaSlider.value = String(value[0]);
    tSlider.value = String(value[1]);
    draw();
  });
  const sumButtons = [...document.querySelectorAll<HTMLButtonElement>("#sumSwitch button")];
  for (const button of sumButtons) {
    button.addEventListener("click", () => {
      sum = button.dataset.sum as Sum;
      draw();
    });
  }

  function draw() {
    const count = Number(countSlider.value);
    const [sigma, height] = s;
    const atPole = sigma === 1 && height === 0;
    const zetaValue = atPole ? null : zeta(sigma, height);
    const etaValue: Complex = atPole ? [Math.LN2, 0] : eta(sigma, height);
    const value = sum === "zeta" ? zetaValue : etaValue;
    const sums = partialSums(s, count, sum === "eta");

    drawArrows(sums, value);
    setText("complexSigmaValue", fixed(sigma, 2));
    setText("complexTValue", fixed(height, 2));
    setText("termCountValue", count);
    setText("arrowSum", complexNumber(sums[count], 3));
    setText("arrowValueLabel", t(sum === "zeta" ? "complex.valueZeta" : "complex.valueEta"));
    setText("arrowValue", value ? complexNumber(value, 3) : t("complex.infinite"));
    setText("lastTerm", describeTerm(sum, count, s));
    setText("arrowExplain", describe(sum, s, zetaValue));
    highlight(PRESETS.find(([[a, b]]) => a === sigma && b === height)?.[0] ?? [NaN, NaN]);
    for (const button of sumButtons) setPressed(button, button.dataset.sum === sum);
  }

  return draw;
}
