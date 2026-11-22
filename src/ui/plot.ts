import { COLORS } from "./colors";
import { byId } from "./dom";

export interface Domain {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
}

interface Padding {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

interface PlotOptions extends Partial<Padding> {
  xTicks?: readonly number[];
  yTicks?: readonly number[];
  formatX?: (value: number) => string;
  formatY?: (value: number) => string;
}

interface Stroke {
  color: string;
  width?: number;
  dash?: number[];
}

interface CurveOptions extends Stroke {
  from: number;
  to: number;
  samples: number;
}

interface DotOptions {
  radius: number;
  color: string;
  hollow?: boolean;
}

const MAX_PIXEL_RATIO = 2;
const OFFSCREEN_LIMIT = 1e4;

const plotted = new WeakMap<HTMLCanvasElement, Plot>();

export class Plot {
  readonly ctx: CanvasRenderingContext2D;
  readonly width: number;
  readonly height: number;
  readonly domain: Domain;
  readonly padding: Padding;
  readonly innerWidth: number;
  readonly innerHeight: number;

  constructor(
    canvas: HTMLCanvasElement,
    width: number,
    height: number,
    domain: Domain,
    options: PlotOptions,
  ) {
    const ratio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D context is unavailable");
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

    this.ctx = ctx;
    this.width = width;
    this.height = height;
    this.domain = domain;
    this.padding = {
      left: options.left ?? 46,
      right: options.right ?? 12,
      top: options.top ?? 12,
      bottom: options.bottom ?? 28,
    };
    this.innerWidth = width - this.padding.left - this.padding.right;
    this.innerHeight = height - this.padding.top - this.padding.bottom;
    this.drawFrame(options);
  }

  x(value: number): number {
    const { x0, x1 } = this.domain;
    return this.padding.left + ((value - x0) / (x1 - x0)) * this.innerWidth;
  }

  y(value: number): number {
    const { y0, y1 } = this.domain;
    return this.padding.top + ((y1 - value) / (y1 - y0)) * this.innerHeight;
  }

  dataX(offsetX: number): number {
    const { x0, x1 } = this.domain;
    const fraction = Math.max(0, Math.min(1, (offsetX - this.padding.left) / this.innerWidth));
    return x0 + fraction * (x1 - x0);
  }

  curve(f: (x: number) => number, { from, to, samples, ...stroke }: CurveOptions): void {
    const { ctx } = this;
    ctx.beginPath();
    let drawing = false;
    for (let j = 0; j <= samples; j++) {
      const x = from + ((to - from) * j) / samples;
      const y = f(x);
      if (!Number.isFinite(y)) {
        drawing = false;
        continue;
      }
      const py = Math.max(-OFFSCREEN_LIMIT, Math.min(OFFSCREEN_LIMIT, this.y(y)));
      if (drawing) ctx.lineTo(this.x(x), py);
      else ctx.moveTo(this.x(x), py);
      drawing = true;
    }
    this.stroke(stroke);
  }

  polyline(points: readonly (readonly [number, number])[], stroke: Stroke): void {
    const { ctx } = this;
    ctx.beginPath();
    points.forEach(([x, y], i) => {
      if (i === 0) ctx.moveTo(this.x(x), this.y(y));
      else ctx.lineTo(this.x(x), this.y(y));
    });
    this.stroke(stroke);
  }

  verticalLine(x: number, color: string, dash = [3, 5]): void {
    const { ctx, padding } = this;
    ctx.beginPath();
    ctx.moveTo(this.x(x), padding.top);
    ctx.lineTo(this.x(x), padding.top + this.innerHeight);
    this.stroke({ color, width: 1, dash });
  }

  dot(x: number, y: number, { radius, color, hollow = false }: DotOptions): void {
    const { ctx } = this;
    ctx.beginPath();
    ctx.arc(this.x(x), this.y(y), radius, 0, 2 * Math.PI);
    if (hollow) {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();
    } else {
      ctx.fillStyle = color;
      ctx.fill();
    }
  }

  finish(): void {
    this.ctx.restore();
  }

  private stroke({ color, width = 2, dash = [] }: Stroke): void {
    const { ctx } = this;
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.setLineDash(dash);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  private drawFrame({ xTicks = [], yTicks = [], formatX = String, formatY = String }: PlotOptions) {
    const { ctx, padding, width, height, innerWidth, innerHeight } = this;
    ctx.clearRect(0, 0, width, height);
    ctx.font = "11px ui-sans-serif,system-ui,sans-serif";
    ctx.textBaseline = "middle";
    ctx.lineWidth = 1;

    for (const tick of xTicks) {
      this.gridLine(this.x(tick), padding.top, this.x(tick), height - padding.bottom);
      ctx.textAlign = "center";
      ctx.fillText(formatX(tick), this.x(tick), height - padding.bottom + 15);
    }
    for (const tick of yTicks) {
      this.gridLine(padding.left, this.y(tick), width - padding.right, this.y(tick));
      ctx.textAlign = "right";
      ctx.fillText(formatY(tick), padding.left - 7, this.y(tick));
    }

    ctx.strokeStyle = COLORS.frame;
    ctx.strokeRect(padding.left, padding.top, innerWidth, innerHeight);
    ctx.save();
    ctx.beginPath();
    ctx.rect(padding.left, padding.top, innerWidth, innerHeight);
    ctx.clip();
  }

  private gridLine(x0: number, y0: number, x1: number, y1: number): void {
    const { ctx } = this;
    ctx.strokeStyle = COLORS.grid;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
    ctx.fillStyle = COLORS.label;
  }
}

export function createPlot(id: string, domain: Domain, options: PlotOptions = {}): Plot | null {
  const canvas = byId(id, HTMLCanvasElement);
  const { width, height } = canvas.getBoundingClientRect();
  if (!width || !height) return null;
  const plot = new Plot(canvas, width, height, domain, options);
  plotted.set(canvas, plot);
  return plot;
}

export function onPlotHover(id: string, onChange: (x: number | null) => void): void {
  const canvas = byId(id, HTMLCanvasElement);
  const track = (event: PointerEvent) => {
    const plot = plotted.get(canvas);
    if (!plot) return;
    onChange(plot.dataX(event.clientX - canvas.getBoundingClientRect().left));
  };
  canvas.addEventListener("pointermove", track);
  canvas.addEventListener("pointerdown", track);
  canvas.addEventListener("pointerleave", (event) => {
    if (event.pointerType === "mouse") onChange(null);
  });
}

function niceStep(rough: number): number {
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  return [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((s) => s >= rough) ?? rough;
}

export function niceTicks(max: number): number[] {
  const step = niceStep(max / 4);
  const ticks: number[] = [];
  for (let value = 0; value <= max; value += step) ticks.push(value);
  return ticks;
}

export function ticksBetween(min: number, max: number, count: number): number[] {
  const step = niceStep((max - min) / count);
  const ticks: number[] = [];
  for (let k = Math.ceil(min / step); k * step <= max; k++) ticks.push(k * step + 0);
  return ticks;
}
