import { ZERO_HEIGHTS } from "../data/zeros";
import { fixed } from "../format";
import { pairWave } from "../math/explicit-formula";
import { COLORS } from "../ui/colors";
import { renderChoices } from "../ui/choices";
import { setPressed, setText } from "../ui/dom";
import { createPlot, onPlotHover } from "../ui/plot";

type Axis = "linear" | "log";

const X_MIN = 2;
const X_MAX = 30;
const ENVELOPE = { samples: 300, color: "rgba(134,201,255,.45)", width: 1.2, dash: [5, 4] };
const ZERO_CHOICES = ZERO_HEIGHTS.slice(0, 6).map((_, i) => [i, `Zero ${i + 1}`] as const);
const CAPTIONS: Record<Axis, string> = {
  linear:
    "Ordinary axis: equal distances mean adding the same amount to x. The oscillations get wider toward the right.",
  log: "Logarithmic axis: equal distances mean multiplying x by the same factor. The same oscillations are now evenly spaced.",
};

const scales = {
  linear: {
    toX: (u: number) => u,
    from: X_MIN,
    to: X_MAX,
    ticks: [2, 5, 10, 15, 20, 25, 30],
  },
  log: {
    toX: Math.exp,
    from: Math.log(X_MIN),
    to: Math.log(X_MAX),
    ticks: [2, 3, 5, 8, 13, 20, 30].map(Math.log),
  },
};

export function mountWave(): () => void {
  let zero = 0;
  let axis: Axis = "linear";
  let hover: number | null = null;

  const highlight = renderChoices("waveZeroButtons", ZERO_CHOICES, (value) => {
    zero = value;
    draw();
  });
  const axisButtons = [
    ...document.querySelectorAll<HTMLButtonElement>("#wave .axis-switch button"),
  ];
  for (const button of axisButtons) {
    button.addEventListener("click", () => {
      axis = button.dataset.axis as Axis;
      hover = null;
      draw();
    });
  }
  onPlotHover("wavePlot", (u) => {
    hover = u;
    draw();
  });

  function draw() {
    const gamma = ZERO_HEIGHTS[zero];
    const { toX, from, to, ticks } = scales[axis];
    const envelope = (x: number) => (2 * Math.sqrt(x)) / Math.hypot(0.5, gamma);
    const wave = (u: number) => pairWave(toX(u), 0.5, gamma);
    const amplitude = Math.ceil(envelope(X_MAX) * 1.15 * 10) / 10;

    const plot = createPlot(
      "wavePlot",
      { x0: from, x1: to, y0: -amplitude, y1: amplitude },
      {
        left: 40,
        xTicks: ticks,
        yTicks: [-amplitude, 0, amplitude],
        formatX: (u) => String(Math.round(toX(u))),
        formatY: (y) => fixed(y, 1),
      },
    );
    if (plot) {
      plot.curve((u) => envelope(toX(u)), { from, to, ...ENVELOPE });
      plot.curve((u) => -envelope(toX(u)), { from, to, ...ENVELOPE });
      plot.curve(wave, { from, to, samples: 1000, color: COLORS.blue, width: 2.4 });
      if (hover !== null) {
        plot.verticalLine(hover, COLORS.gold);
        plot.dot(hover, wave(hover), { radius: 4, color: COLORS.gold });
      }
      plot.finish();
    }

    setText("axisCaption", CAPTIONS[axis]);
    setText(
      "waveInfo",
      hover === null
        ? `Zero ${zero + 1}: ρ = ½ + ${fixed(gamma, 3)}i. One full oscillation takes ln x up by 2π/γ = ${fixed((2 * Math.PI) / gamma, 3)}, that is, x is multiplied by ${fixed(Math.exp((2 * Math.PI) / gamma), 3)}.`
        : `At x = ${fixed(toX(hover), 2)} this pair adds ${fixed(wave(hover), 3)} to ψ(x).`,
    );
    highlight(zero);
    for (const button of axisButtons) setPressed(button, button.dataset.axis === axis);
  }

  return draw;
}
