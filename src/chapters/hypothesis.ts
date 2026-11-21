import { ZERO_HEIGHTS } from "../data/zeros";
import { fixed, inWords, powerOfTen } from "../format";
import { pairWave } from "../math/explicit-formula";
import { COLORS } from "../ui/colors";
import { onSlider, setText } from "../ui/dom";
import { createPlot } from "../ui/plot";

const GAMMA = ZERO_HEIGHTS[0];
const CRITICAL = 0.5;

const waveSize = (x: number, beta: number) => (2 * x ** beta) / Math.hypot(beta, GAMMA);

function drawWaves(beta: number) {
  let peak = 0;
  for (let x = 2; x <= 100; x += 0.25) {
    peak = Math.max(
      peak,
      Math.abs(pairWave(x, beta, GAMMA)),
      Math.abs(pairWave(x, CRITICAL, GAMMA)),
    );
  }
  const amplitude = Math.ceil(peak * 1.1);
  const plot = createPlot(
    "hypoWave",
    { x0: 2, x1: 100, y0: -amplitude, y1: amplitude },
    { left: 34, xTicks: [2, 20, 40, 60, 80, 100], yTicks: [-amplitude, 0, amplitude] },
  );
  if (!plot) return;
  const span = { from: 2, to: 100, samples: 1200 };
  plot.curve((x) => pairWave(x, CRITICAL, GAMMA), { ...span, color: COLORS.blue });
  plot.curve((x) => pairWave(x, beta, GAMMA), { ...span, color: COLORS.rose });
  plot.finish();
}

function drawScale(beta: number, exponent: number) {
  const plot = createPlot(
    "hypoScale",
    { x0: 0, x1: 12, y0: -1, y1: 12.5 },
    {
      left: 40,
      xTicks: [0, 2, 4, 6, 8, 10, 12],
      yTicks: [0, 3, 6, 9, 12],
      formatX: powerOfTen,
      formatY: powerOfTen,
    },
  );
  if (!plot) return;
  const realOffset = Math.log10(2 / Math.hypot(CRITICAL, GAMMA));
  const hypoOffset = Math.log10(2 / Math.hypot(beta, GAMMA));
  const span = { from: 0, to: 12, samples: 10, width: 2.2 };
  plot.curve((u) => u, { ...span, color: COLORS.grey, width: 2 });
  plot.curve((u) => CRITICAL * u + realOffset, { ...span, color: COLORS.blue });
  plot.curve((u) => beta * u + hypoOffset, { ...span, color: COLORS.rose });
  plot.verticalLine(exponent, COLORS.gold);
  plot.dot(exponent, CRITICAL * exponent + realOffset, { radius: 4, color: COLORS.blue });
  plot.dot(exponent, beta * exponent + hypoOffset, { radius: 4, color: COLORS.rose });
  plot.dot(exponent, exponent, { radius: 4, color: COLORS.grey });
  plot.finish();
}

const percentOf = (part: number, whole: number, smallDigits: number) =>
  fixed((100 * part) / whole, part / whole < 0.001 ? smallDigits : 2);

function describe(beta: number, exponent: number): string {
  if (beta === CRITICAL) {
    return "With β = ½ the two zeros are the same, so the waves coincide. Move the slider to the right.";
  }
  const x = 10 ** exponent;
  const real = waveSize(x, CRITICAL);
  const hypo = waveSize(x, beta);
  return `At x = ${powerOfTen(exponent)} the hypothetical wave is about ${inWords(hypo / real)} times larger than the real one, and equals ${percentOf(hypo, x, 4)}% of x. The real wave is ${percentOf(real, x, 6)}% of x. As x grows, the real wave becomes a smaller and smaller share of x; the closer β is to 1, the more slowly this happens for the hypothetical one.`;
}

export function mountHypothesis(): () => void {
  const betaSlider = onSlider("betaSlider", draw);
  const exponentSlider = onSlider("scaleExponent", draw);

  function draw() {
    const beta = Number(betaSlider.value);
    const exponent = Number(exponentSlider.value);
    const x = 10 ** exponent;
    setText("betaValue", fixed(beta, 2));
    setText("betaLegend", fixed(beta, 2));
    drawWaves(beta);
    drawScale(beta, exponent);
    setText("scaleExponentValue", powerOfTen(exponent));
    setText("scaleX", inWords(x));
    setText("scaleReal", inWords(waveSize(x, CRITICAL)));
    setText("scaleHypo", inWords(waveSize(x, beta)));
    setText("hypoExplain", describe(beta, exponent));
  }

  return draw;
}
