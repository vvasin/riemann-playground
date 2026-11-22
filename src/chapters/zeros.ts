import { ZERO_HEIGHTS } from "../data/zeros";
import { fixed } from "../format";
import { zetaAbs } from "../math/zeta";
import { t } from "../i18n";
import { COLORS } from "../ui/colors";
import { onSlider, setText } from "../ui/dom";
import { createPlot } from "../ui/plot";

const HEIGHT = 50;
const Y_MAX = 4;
const SHOWN_ZEROS = ZERO_HEIGHTS.slice(0, 10);

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
  t("zeros.strip")
    .split("\n")
    .forEach((line, i) => {
      ctx.fillText(line, x(-0.12), y(47 - 2.5 * i));
    });

  ctx.fillStyle = COLORS.label;
  ctx.textAlign = "left";
  const wide = plot.innerWidth > 420;
  const left = x(wide ? 1.08 : 1.06);
  t(wide ? "zeros.sumWide" : "zeros.sumNarrow")
    .split("\n")
    .forEach((line, i) => {
      ctx.fillText(line, left, y(30 - 2.5 * i), x(2) - left - 2);
    });

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
    setText("zetaMin", t("zeros.onLine"));
    setText("zetaMinNote", t("zeros.zeroNote"));
    return;
  }
  const note = t("zeros.minNote", {
    sigma: fixed(sigma, 2),
    value: fixed(value, 3),
    at: fixed(at, 2),
  });
  const nearPole = sigma >= 0.95 && sigma <= 1.05 ? ` ${t("zeros.nearPole")}` : "";
  setText("zetaMin", t("zeros.smallest", { value: fixed(value, 3) }));
  setText("zetaMinNote", note + nearPole);
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
