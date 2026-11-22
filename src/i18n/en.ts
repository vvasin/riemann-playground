export const en = {
  primes: {
    notPrime: "{{n}} is not prime: {{n}} = {{factor}} × {{other}}.",
    prime: "{{n}} is prime.",
    primeChecked:
      "{{n}} is prime: no number from 2 to {{root}} divides it. (Checking up to √{{n}} is enough.)",
    list: "Primes up to {{n}}: {{primes}}.",
    cellPrime: "{{n}}, prime",
  },
  estimate: {
    upTo: "up to {{x}}",
    hover: "At x = {{x}}: π(x) = {{pi}}, li(x) = {{li}}, x / ln x = {{xlog}}.",
    explain:
      "At x = {{x}}: li(x) − π(x) = {{error}}, which is {{percent}}% of π(x). The estimate x / ln x is off by {{xlogPercent}}%.",
  },
  zeta: {
    more_one: "+ {{count}} more term",
    more_other: "+ {{count}} more terms",
    shareFirst:
      "The first term gives {{share}}% of the total. The remaining infinitely many terms add up to {{rest}}.",
    share_other:
      "The first {{count}} terms give {{share}}% of the total. The remaining infinitely many terms add up to {{rest}}.",
    moreThan: "more than {{value}}",
    noLimit: "none (grows forever)",
    divergent:
      "For s = 1 the sum keeps growing. After n terms it is about ln n + 0.577. It passes 10 only after 12,367 terms, and passes 100 after about 1.5 × 10⁴³ terms, but it never stops growing.",
  },
  product: {
    first: "1 × 1 = 1, the first term of ζ(2) (n = 1)",
    because: "{{product}}, because {{n}} = {{factors}}",
  },
  zeros: {
    strip: "critical strip\n(0 < σ < 1)",
    sumWide: "sum works\nhere (σ > 1)",
    sumNarrow: "sum\nworks",
    onLine: "ζ = 0 on this line (10 zeros for t ≤ 50)",
    zeroNote:
      "On the line σ = ½ the graph touches 0 at t = 14.13, 21.02, 25.01, 30.42, 32.94, 37.59, 40.92, 43.33, 48.01 and 49.77. These are the nontrivial zeros.",
    smallest: "Smallest value: {{value}}",
    minNote:
      "On the line σ = {{sigma}}, the smallest value of |ζ| for t from 0 to 50 is {{value}}, near t = {{at}}. It never reaches 0, so this part of the line has no zeros.",
    nearPole: "Near t = 0 the graph goes off the top because ζ is infinite at s = 1.",
  },
  wave: {
    zero: "Zero {{n}}",
    linear:
      "Ordinary axis: equal distances mean adding the same amount to x. The oscillations get wider toward the right.",
    log: "Logarithmic axis: equal distances mean multiplying x by the same factor. The same oscillations are now evenly spaced.",
    info: "Zero {{n}}: ρ = ½ + {{gamma}}i. One full oscillation takes ln x up by 2π/γ = {{period}}, that is, x is multiplied by {{factor}}.",
    hover: "At x = {{x}} this pair adds {{value}} to ψ(x).",
  },
  synth: {
    hoverHint: "Hover over or tap the graph to compare values at one x.",
    hover_one: "At x = {{x}}: exact ψ(x) = {{psi}}, formula with {{count}} pair = {{approx}}.",
    hover_other: "At x = {{x}}: exact ψ(x) = {{psi}}, formula with {{count}} pairs = {{approx}}.",
  },
  hypothesis: {
    coincide:
      "With β = ½ the two zeros are the same, so the waves coincide. Move the slider to the right.",
    explain:
      "At x = {{x}} the hypothetical wave is about {{ratio}} times larger than the real one, and equals {{hypoPercent}}% of x. The real wave is {{realPercent}}% of x. As x grows, the real wave becomes a smaller and smaller share of x; the closer β is to 1, the more slowly this happens for the hypothetical one.",
  },
  proof: {
    explain:
      "The actual error is {{share}}% of the bound. Compared with the number of primes, the bound is {{boundPercent}}% of π(x).",
  },
};
