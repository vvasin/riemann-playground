# Riemann playground

A single-page interactive article that explains the Riemann hypothesis from scratch, in 9 steps. Built with Vite and TypeScript, no runtime dependencies, no network requests. Deployed to GitHub Pages by `.github/workflows/ci.yml`.

```sh
npm run dev        # dev server
npm run build      # type-check + production build into dist/
npm run lint       # eslint + stylelint + prettier --check
npm test           # unit tests (vitest)
npm run test:e2e   # build + browser tests (playwright, uses installed Google Chrome)
npm run lint:html  # validate dist/index.html (run after build)
```

## Audience and writing style

- The reader knows arithmetic, primes, rational and irrational numbers, complex numbers, powers, sums, sin/cos and π, but has never seen how these fit together. They do not know calculus (integrals, derivatives) or analytic continuation. Any concept beyond that list must be explained on the page before it is used.
- The owner wants **plain, direct wording**: short declarative sentences, no catchy or "engaging" phrasing, no rhetorical headings, no hype ("astonishing", "magic", "orchestra", "the key is…"). Headings state the content of the step. Each step ends with one "Key point:" box.
- Every claim shown must be mathematically valid and not misleading. Hypothetical scenarios must be labelled as hypothetical, and caveats should sit next to the numbers they qualify.

## Structure

- `index.html`: page shell (top bar, hero, footer). Chapters are pulled in with `<html-include src="…">`, which `plugins/html-include.ts` inlines at build time.
- `src/chapters/<id>.html` + `<id>.ts`: one pair per step. Each `.ts` exports `mount<Name>()`; plot chapters return their `draw` function, which `src/main.ts` re-runs on resize. Each chapter keeps its own state in local variables.
- `src/math/`: pure functions (`primes`, `li`, `complex`, `zeta`, `psi`, `explicit-formula`), with colocated `*.test.ts`.
- `src/data/`: `ZERO_HEIGHTS` (first 50 zero heights), `PUBLISHED_PRIME_COUNTS` (π(10^k), k = 4…12).
- `src/ui/`: `dom` (element lookup and event helpers), `plot` (canvas plots via `createPlot`), `choices` (toggle-button groups), `colors` (canvas palette).
- `src/format.ts`: number formatting; `src/nav.ts`: active nav link and reading progress.
- `src/styles/`: `tokens` → `base` → `layout` → `topbar` → `hero` → `controls` → `prose` → `panel` → `widgets`, imported in this order by `index.css`. Responsive overrides sit next to the rules they change.

| #   | id           | Content                                                             | Interaction                                                         |
| --- | ------------ | ------------------------------------------------------------------- | ------------------------------------------------------------------- |
| 1   | `primes`     | primes, π(x)                                                        | number grid 2–100 + slider                                          |
| 2   | `estimate`   | li(x), x/ln x, prime number theorem, the error li − π               | canvas `estimatePlot`, range buttons up to 10⁵                      |
| 3   | `zeta`       | ζ(s) as a sum, s > 1 needed                                         | s = 1…4 buttons, term slider                                        |
| 4   | `product`    | Euler product via unique factorization + geometric series           | pick terms from the sums for 2 and 3; product slider                |
| 5   | `zeros`      | complex s, extension via η(s)/(1 − 2/2^s), trivial/nontrivial zeros | σ slider → `zeroMap` + `zetaLine` (live \|ζ(σ+it)\|)                |
| 6   | `wave`       | ψ(x), explicit formula, one pair of zeros = one wave                | zero buttons, linear/log axis, `wavePlot`                           |
| 7   | `synth`      | sum of N waves rebuilds the ψ staircase                             | one N slider shared by `synthPlot` and `barPlot`                    |
| 8   | `hypothesis` | statement, what is known, the 2026 proof, why ½, why it matters     | β slider for a hypothetical zero: `hypoWave`, `hypoScale` (log-log) |
| 9   | `proof`      | Schoenfeld bound, other consequences, what RH does not give         | 10^k slider over published π(10^k) values                           |

The top nav (`.chapter-nav`) and the hero "Overview" list link to these ids. Update both, the include list in `index.html`, and the "Step N of 9" labels if steps are added or reordered; the e2e test checks they agree.

Slider controls use `.control` > `.control-head` (`<label for>` + `<output for>`) + `<input type="range">`. Do not nest the `<output>` inside the `<label>`.

## Verified facts (do not "correct" these without a source)

- RH is proven: Levent Alpöge released a Lean proof (about 17 million lines) on 20 Nov 2026; the Lean FRO and Mathlib Initiative joint statement of 21 Nov 2026 (leanprover-community.github.io/blog/posts/riemann-hypothesis/) certifies that it proves Mathlib's `RiemannHypothesis` and that the proof is correct. The page states this in the hero and step 8, notes that human study of the ideas and the Clay prize process are ongoing, and does not mention the generalized RH (not covered by the statement).
- Schoenfeld (1976): under RH, |π(x) − li(x)| < √x·ln x/(8π) for x ≥ 2657, and the converse also holds. Before the RH proof, it was already proven for x up to about 10²⁶ from zeros checked by computer (Büthe; Johnston, arXiv 2109.02249). The page says so.
- The constants of the best bound proven without RH (Platt–Trudgian 2021, Johnston–Yang) were **not** confirmed, so the page describes that bound only in words.
- With N = 50, the bars in step 7 pick out every prime and prime power up to 30. Their bars are all higher than every other bar, which stays within ±0.9. Across all N, the bars stay in [−0.88, 3.86].
- Checked numbers (the zeta values are not shown on the page; they validate `zeta`): ζ(½+10i) = 1.5449 − 0.1153i, ζ(−1) = −1/12, li(10¹²) = 37,607,950,280.8. There are 16 primes between 1001 and 1100, the gap after 1129 is 22, and H_n > 10 first at n = 12,367.
- Other cited results: Hardy 1914 (infinitely many zeros on the line), Conrey 1989 (> 40%), Cramér 1920 (prime gaps under RH), Littlewood 1914 (π − li changes sign).

## Testing

- `npm test`: unit tests for the math and formatting, pinning the verified numbers above.
- `npm run test:e2e`: Playwright at 1280px and 390px. Checks no page/console errors, no horizontal scroll, nav/overview/step labels, and drives every control and reads its readout.
- For visual changes, also screenshot each `section.chapter` at 1280px and 390px.

Keep the page free of runtime dependencies and network requests. Keep comments to a minimum; prefer clear names.
