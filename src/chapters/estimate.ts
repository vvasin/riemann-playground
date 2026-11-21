import { li } from "../math/li";
import { primeCount } from "../math/primes";
import { fixed, integer, oneDecimal } from "../format";
import { COLORS } from "../ui/colors";
import { type Choice, renderChoices } from "../ui/choices";
import { setText } from "../ui/dom";
import { createPlot, niceTicks, onPlotHover } from "../ui/plot";

const RANGES: Choice<number>[] = [
  [100, "up to 100"],
  [1000, "1,000"],
  [10000, "10,000"],
  [100000, "100,000"],
];

const xOverLog = (x: number) => x / Math.log(x);

function describeHover(hover: number | null): string {
  if (hover === null) return "";
  const x = Math.max(2, hover);
  return `At x = ${integer(x)}: π(x) = ${integer(primeCount(x))}, li(x) = ${oneDecimal(li(x))}, x / ln x = ${oneDecimal(xOverLog(x))}.`;
}

export function mountEstimate(): () => void {
  let max = 1000;
  let hover: number | null = null;

  const highlight = renderChoices("estimateRange", RANGES, (value) => {
    max = value;
    hover = null;
    draw();
  });
  onPlotHover("estimatePlot", (x) => {
    hover = x;
    draw();
  });

  function drawPlot() {
    const yMax = li(max) * 1.08;
    const xTicks =
      max <= 100 ? [0, 20, 40, 60, 80, 100] : [0, 0.2, 0.4, 0.6, 0.8, 1].map((f) => f * max);
    const plot = createPlot(
      "estimatePlot",
      { x0: 0, x1: max, y0: 0, y1: yMax },
      { left: 50, xTicks, yTicks: niceTicks(yMax), formatX: integer, formatY: integer },
    );
    if (!plot) return;
    plot.curve(xOverLog, {
      from: 2,
      to: max,
      samples: 600,
      color: COLORS.violet,
      width: 1.8,
      dash: [5, 4],
    });
    plot.curve(li, { from: 2, to: max, samples: 600, color: COLORS.blue, width: 2.2 });
    plot.curve(primeCount, {
      from: 0,
      to: max,
      samples: Math.min(4000, Math.max(800, max * 4)),
      color: COLORS.mint,
    });
    if (hover !== null) plot.verticalLine(hover, COLORS.gold);
    plot.finish();
  }

  function draw() {
    drawPlot();
    const count = primeCount(max);
    const error = li(max) - count;
    setText("estPiLabel", `π(${integer(max)})`);
    setText("estPi", integer(count));
    setText("estLi", oneDecimal(li(max)));
    setText("estXlog", oneDecimal(xOverLog(max)));
    setText(
      "estimateExplain",
      `At x = ${integer(max)}: li(x) − π(x) = ${fixed(error, 1)}, which is ${fixed((100 * error) / count, 2)}% of π(x). The estimate x / ln x is off by ${fixed((100 * (count - xOverLog(max))) / count, 1)}%.`,
    );
    setText("estimateHover", describeHover(hover));
    highlight(max);
  }

  return draw;
}
