# riemann-playground

An interactive, step-by-step explanation of the Riemann hypothesis: what the zeta function is, how its zeros are connected to prime numbers, and what its proof establishes.

## Development

Requires Node.js 22+ and Google Chrome (for the browser tests).

```sh
npm install
npm run dev        # start the dev server
npm run build      # type-check and build into dist/
npm run lint       # ESLint, Stylelint, Prettier
npm test           # unit tests
npm run test:e2e   # build and run browser tests
npm run lint:html  # validate the built page
npm run format     # fix formatting and lint issues
```

## Layout

```
index.html            page shell; chapters are inlined from src/chapters/*.html
src/main.ts           mounts the chapters
src/chapters/         one .html + .ts pair per step
src/math/             zeta, li, primes, ψ and the explicit formula
src/data/             zero heights and published prime counts
src/ui/               DOM helpers, canvas plots, toggle buttons
src/i18n/             i18next setup, English script strings, Russian translation
src/styles/           CSS, one file per area
plugins/              Vite plugin for HTML includes
tests/e2e/            Playwright tests (unit tests sit next to the code as *.test.ts)
```

## Languages

The page is in English and Russian, using [i18next](https://www.i18next.com/) with `i18next-browser-languagedetector`. The language is taken from `?lang=en|ru`, then from the user's earlier choice, then from the browser's language settings; the selector in the top bar switches it. English text lives in the HTML; translations live in `src/i18n/`.

## Deployment

Every push to `main` runs the checks and deploys `dist/` to GitHub Pages. In the repository settings, set **Pages → Source** to **GitHub Actions**.
