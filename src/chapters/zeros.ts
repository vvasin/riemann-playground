import { ZERO_HEIGHTS } from "../data/zeros";
import { fixed } from "../format";
import { zetaAbs } from "../math/zeta";
import { COLORS } from "../ui/colors";
import { onSlider, setText } from "../ui/dom";
import { createPlot } from "../ui/plot";

const HEIGHT = 50;
const Y_MAX = 4;
const SHOWN_ZEROS = ZERO_HEIGHTS.slice(0, 10);
const ZERO_NOTE =
  "On the line σ = ½ the graph touches 0 at t = 14.13, 21.02, 25.01, 30.42, 32.94, 37.59, 40.92, 43.33, 48.01 and 49.77. These are the nontrivial zeros.";

export function findMinimum(sigma: number): { value: number; at: number } {
  let value = Infinity;
  let at = 0;
  const scan = (from: number, to: number, step: number) => {
    for (let t = from; t <= to; t += step) {
      const v = zetaAbs(sigma, t);
      if (v < value) {
        value = v;
        at = t;
      }
    }
  };
  scan(0, HEIGHT, 0.01);
  scan(at - 0.01, at + 0.01, 0.0002);
  return { value, at };
}

function drawMap(sigma: number) {
  const plot = createPlot(
    "zeroMap",
    { x0: -5, x1: 2, y0: -4, y1: 52 },
    {
      left: 34,
      bottom: 26,
      xTicks: [-4, -3, -2, -1, 0, 0.5, 1, 2],
      yTicks: [0, 10, 20, 30, 40, 50],
      formatX: (x) => (x === 0.5 ? "½" : x < 0 ? `−${-x}` : String(x)),
    },
  );
  if (!plot) return;
  const { ctx, padding, innerHeight } = plot;
  const x = (v: number) => plot.x(v);
  const y = (v: number) => plot.y(v);

  ctx.fillStyle = "rgba(102,233,195,.09)";
  ctx.fillRect(x(0), padding.top, x(1) - x(0), innerHeight);

  ctx.font = "11px system-ui";
  ctx.fillStyle = COLORS.mint;
  ctx.textAlign = "right";
  ctx.fillText("critical strip", x(-0.12), y(47));
  ctx.fillText("(0 < σ < 1)", x(-0.12), y(44.5));

  ctx.fillStyle = COLORS.label;
  ctx.textAlign = "left";
  const [first, second, left] =
    plot.innerWidth > 420 ? ["sum works", "here (σ > 1)", 1.08] : ["sum", "works", 1.06];
  ctx.fillText(first, x(left), y(30));
  ctx.fillText(second, x(left), y(27.5));

  ctx.strokeStyle = "rgba(255,212,140,.35)";
  ctx.setLineDash([4, 5]);
  ctx.beginPath();
  ctx.moveTo(x(0.5), padding.top);
  ctx.lineTo(x(0.5), padding.top + innerHeight);
  ctx.stroke();
  ctx.setLineDash([]);

  plot.polyline(
    [
      [sigma, 0],
      [sigma, HEIGHT],
    ],
    { color: COLORS.gold, width: 2.4 },
  );
  for (const gamma of SHOWN_ZEROS) plot.dot(0.5, gamma, { radius: 4.5, color: COLORS.mint });
  for (const t of [-2, -4]) plot.dot(t, 0, { radius: 5, color: COLORS.violet, hollow: true });

  const px = x(1);
  const py = y(0);
  ctx.strokeStyle = COLORS.rose;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(px - 5, py - 5);
  ctx.lineTo(px + 5, py + 5);
  ctx.moveTo(px + 5, py - 5);
  ctx.lineTo(px - 5, py + 5);
  ctx.stroke();
  plot.finish();
}

function drawLine(sigma: number) {
  const plot = createPlot(
    "zetaLine",
    { x0: 0, x1: HEIGHT, y0: 0, y1: Y_MAX },
    { left: 34, bottom: 26, xTicks: [0, 10, 20, 30, 40, 50], yTicks: [0, 1, 2, 3, 4] },
  );
  if (!plot) return;
  for (const gamma of SHOWN_ZEROS) plot.verticalLine(gamma, "rgba(102,233,195,.35)", [2, 3]);
  plot.curve((t) => Math.min(Y_MAX * 2, zetaAbs(sigma, t)), {
    from: 0,
    to: HEIGHT,
    samples: 1000,
    color: COLORS.gold,
  });
  plot.finish();
}

function describeMinimum(sigma: number) {
  const { value, at } = findMinimum(sigma);
  if (value < 1e-3) {
    setText("zetaMin", "ζ = 0 on this line (10 zeros for t ≤ 50)");
    setText("zetaMinNote", ZERO_NOTE);
    return;
  }
  const nearPole =
    sigma >= 0.95 && sigma <= 1.05
      ? " Near t = 0 the graph goes off the top because ζ is infinite at s = 1."
      : "";
  setText("zetaMin", `Smallest value: ${fixed(value, 3)}`);
  setText(
    "zetaMinNote",
    `On the line σ = ${fixed(sigma, 2)}, the smallest value of |ζ| for t from 0 to 50 is ${fixed(value, 3)}, near t = ${fixed(at, 2)}. It never reaches 0, so this part of the line has no zeros.${nearPole}`,
  );
}

export function mountZeros(): () => void {
  const slider = onSlider("sigma", draw);

  function draw() {
    const sigma = Number(slider.value);
    drawMap(sigma);
    drawLine(sigma);
    setText("sigmaValue", fixed(sigma, 2));
    describeMinimum(sigma);
  }

  return draw;
}
