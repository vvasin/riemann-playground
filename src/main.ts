import { mountEstimate } from "./chapters/estimate";
import { mountHypothesis } from "./chapters/hypothesis";
import { mountPrimes } from "./chapters/primes";
import { mountProduct } from "./chapters/product";
import { mountProof } from "./chapters/proof";
import { mountSynth } from "./chapters/synth";
import { mountWave } from "./chapters/wave";
import { mountZeros } from "./chapters/zeros";
import { mountZeta } from "./chapters/zeta";
import { mountNavigation } from "./nav";

mountPrimes();
mountZeta();
mountProduct();
mountProof();

const plots = [mountEstimate(), mountZeros(), mountWave(), mountSynth(), mountHypothesis()];
const drawPlots = () => {
  plots.forEach((draw) => {
    draw();
  });
};

mountNavigation();
drawPlots();

let frame = 0;
window.addEventListener("resize", () => {
  cancelAnimationFrame(frame);
  frame = requestAnimationFrame(drawPlots);
});
