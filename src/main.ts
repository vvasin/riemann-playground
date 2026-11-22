import { mountEstimate } from "./chapters/estimate";
import { mountHypothesis } from "./chapters/hypothesis";
import { mountPrimes } from "./chapters/primes";
import { mountProduct } from "./chapters/product";
import { mountProof } from "./chapters/proof";
import { mountSynth } from "./chapters/synth";
import { mountWave } from "./chapters/wave";
import { mountZeros } from "./chapters/zeros";
import { mountZeta } from "./chapters/zeta";
import { onLanguageChange } from "./i18n";
import { mountLanguageSelect, translatePage } from "./i18n/page";
import { mountNavigation } from "./nav";

translatePage();

const plots = [mountEstimate(), mountZeros(), mountWave(), mountSynth(), mountHypothesis()];
const renders = [
  mountLanguageSelect(),
  mountPrimes(),
  mountZeta(),
  mountProduct(),
  mountProof(),
  ...plots,
];
const run = (list: (() => void)[]) => {
  list.forEach((draw) => {
    draw();
  });
};

const updateNavigation = mountNavigation();
run(renders);

onLanguageChange(() => {
  translatePage();
  run(renders);
  updateNavigation();
});

let frame = 0;
window.addEventListener("resize", () => {
  cancelAnimationFrame(frame);
  frame = requestAnimationFrame(() => {
    run(plots);
  });
});
