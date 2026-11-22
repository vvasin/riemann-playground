import { expect, type Page, test } from "@playwright/test";

const CHAPTERS = [
  "primes",
  "estimate",
  "zeta",
  "product",
  "complex",
  "zeros",
  "wave",
  "synth",
  "hypothesis",
  "proof",
];

async function slide(page: Page, id: string, value: number) {
  await page.locator(`#${id}`).fill(String(value));
}

test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error" && !message.location().url.endsWith("favicon.ico")) {
      errors.push(message.text());
    }
  });
  await page.goto("./");
  await expect(page.locator("#primeGrid button")).toHaveCount(99);
  expect(errors).toEqual([]);
});

test.describe("layout", () => {
  test("has no horizontal scroll", async ({ page }) => {
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test("links every chapter from the top nav and the overview", async ({ page }) => {
    const hrefs = CHAPTERS.map((id) => `#${id}`);
    const sectionIds = await page.locator("section.chapter").evaluateAll((s) => s.map((e) => e.id));
    expect(sectionIds).toEqual(CHAPTERS);
    for (const list of [".chapter-nav a", ".steps a"]) {
      const links = await page
        .locator(list)
        .evaluateAll((a) => a.map((e) => e.getAttribute("href")));
      expect(links).toEqual(hrefs);
    }
    for (const [i, id] of CHAPTERS.entries()) {
      await expect(page.locator(`#${id} .step-label`)).toHaveText(
        `Step ${i + 1} of ${CHAPTERS.length}`,
      );
      await expect(page.locator(`#${id} .keypoint`)).toHaveCount(1);
    }
  });

  test("draws every plot", async ({ page }) => {
    const blank = await page
      .locator("canvas")
      .evaluateAll((canvases) =>
        (canvases as HTMLCanvasElement[])
          .filter((c) => c.width === 0 || c.height === 0)
          .map((c) => c.id),
      );
    expect(blank).toEqual([]);
  });
});

test.describe("controls", () => {
  test("step 1 counts primes", async ({ page }) => {
    await expect(page.locator("#primeCountText")).toHaveText("π(30) = 10");
    await slide(page, "primeLimit", 100);
    await expect(page.locator("#primeCountText")).toHaveText("π(100) = 25");
    await page.locator("#primeGrid button", { hasText: /^12$/ }).click();
    await expect(page.locator("#numberExplanation")).toContainText("12 is not prime: 12 = 2 × 6.");
    await expect(page.locator("#primeLimitValue")).toHaveText("12");
  });

  test("step 2 compares the estimates", async ({ page }) => {
    await expect(page.locator("#estPi")).toHaveText("168");
    await page.locator("#estimateRange button", { hasText: "100,000" }).click();
    await expect(page.locator("#estPi")).toHaveText("9,592");
    await expect(page.locator("#estimateRange button.active")).toHaveText("100,000");
  });

  test("step 3 adds terms of the sum", async ({ page }) => {
    await expect(page.locator("#sumResult")).toHaveText("1.549768");
    await page.locator("#sChoice button", { hasText: "s = 1" }).click();
    await expect(page.locator("#sumLimit")).toHaveText("none (grows forever)");
    await page.locator("#sChoice button", { hasText: "s = 2" }).click();
    await slide(page, "sumCount", 250);
    await expect(page.locator("#fractionStrip li")).toHaveCount(9);
    await expect(page.locator("#fractionStrip .more")).toHaveText("+ 242 more terms");
  });

  test("step 4 multiplies the Euler factors", async ({ page }) => {
    await expect(page.locator("#termResult")).toHaveText(
      "1/4² × 1/3² = 1/12², because 12 = 2² × 3",
    );
    await page.locator("#power2 button").nth(3).click();
    await expect(page.locator("#termResult")).toHaveText(
      "1/8² × 1/3² = 1/24², because 24 = 2³ × 3",
    );
    await slide(page, "factorCount", 10);
    await expect(page.locator("#productResult")).toHaveText("1.633070");
    await expect(page.locator("#factorList .inactive")).toHaveCount(0);
  });

  test("step 5 adds the terms as arrows", async ({ page }) => {
    await expect(page.locator("#sPreset button.active")).toHaveText("s = 2 + 5i");
    await expect(page.locator("#lastTerm")).toHaveText(
      "Term 10: length 0.010, angle −11.51 radians.",
    );
    await page.locator("#addTerm").click();
    await expect(page.locator("#termCountValue")).toHaveText("11");
    await expect(page.locator("#arrowExplain")).toContainText("ends at the point ζ(s)");

    await page.locator("#sPreset button", { hasText: "s = ½ + 5i" }).click();
    await expect(page.locator("#complexSigmaValue")).toHaveText("0.50");
    await expect(page.locator("#arrowExplain")).toContainText("spiral that keeps widening");

    await page.locator("#sPreset button", { hasText: "Zero" }).click();
    await page.locator("#sumSwitch button[data-sum=eta]").click();
    await expect(page.locator("#arrowValueLabel")).toHaveText("Value of η(s)");
    await expect(page.locator("#arrowValue")).toHaveText("0.000 + 0.000i");
    await expect(page.locator("#arrowExplain")).toContainText("This s is a zero of ζ");

    await slide(page, "complexSigma", 1);
    await slide(page, "complexT", 0);
    await expect(page.locator("#sPreset button.active")).toHaveCount(0);
    await expect(page.locator("#arrowExplain")).toContainText("ζ is infinite at s = 1");
    await page.locator("#sumSwitch button[data-sum=zeta]").click();
    await expect(page.locator("#arrowValue")).toHaveText("infinite");
  });

  test("step 6 finds zeros only on the critical line", async ({ page }) => {
    await expect(page.locator("#zetaMin")).toHaveText("ζ = 0 on this line (10 zeros for t ≤ 50)");
    await slide(page, "sigma", 0.8);
    await expect(page.locator("#sigmaValue")).toHaveText("0.80");
    await expect(page.locator("#zetaMin")).toHaveText(/^Smallest value: 0\.\d{3}$/);
  });

  test("step 7 switches zero and axis", async ({ page }) => {
    await page.locator("#waveZeroButtons button", { hasText: "Zero 2" }).click();
    await expect(page.locator("#waveInfo")).toContainText("Zero 2: ρ = ½ + 21.022i.");
    await page.locator("#wave .axis-switch button[data-axis=log]").click();
    await expect(page.locator("#axisCaption")).toContainText("Logarithmic axis");
    await expect(page.locator("#wave .axis-switch button[data-axis=log]")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  test("step 8 adds pairs of zeros", async ({ page }) => {
    await page.locator("#addPair").click();
    await expect(page.locator("#pairCountValue")).toHaveText("1");
    await page.locator("#allPairs").click();
    await expect(page.locator("#pairCount")).toHaveValue("50");
    await page.locator("#resetPairs").click();
    await expect(page.locator("#pairCountValue")).toHaveText("0");
  });

  test("step 9 compares a hypothetical zero", async ({ page }) => {
    await slide(page, "betaSlider", 0.5);
    await expect(page.locator("#hypoExplain")).toContainText("the waves coincide");
    await slide(page, "scaleExponent", 12);
    await expect(page.locator("#scaleX")).toHaveText("1 trillion");
  });

  test("step 10 compares the error with the bound", async ({ page }) => {
    await slide(page, "proofExponent", 12);
    await expect(page.locator("#proofExponentValue")).toHaveText("10¹²");
    await expect(page.locator("#proofPi")).toHaveText("37,607,912,018");
    await expect(page.locator("#proofLi")).toHaveText("37,607,950,280.8");
  });
});

test.describe("language", () => {
  test("switches to Russian and back, and remembers the choice", async ({ page }) => {
    const select = page.locator("#languageSelect");
    await expect(select).toHaveValue("en");
    await select.selectOption("ru");
    await expect(page.locator("html")).toHaveAttribute("lang", "ru");
    await expect(page.locator("#primes .step-label")).toHaveText("Шаг 1 из 10");
    await expect(page.locator("#numberExplanation")).toContainText("30 — составное число");
    await expect(page.locator("#waveZeroButtons button").first()).toHaveText("1-й нуль");

    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("lang", "ru");
    await expect(select).toHaveValue("ru");

    await select.selectOption("en");
    await expect(page.locator("#primes .step-label")).toHaveText("Step 1 of 10");
    await expect(page.locator("#zetaMin")).toHaveText("ζ = 0 on this line (10 zeros for t ≤ 50)");
    await expect(page).toHaveTitle("The Riemann Hypothesis, Step by Step");
  });

  test("reads the language from the address", async ({ page }) => {
    await page.goto("./?lang=ru");
    await expect(page.locator("html")).toHaveAttribute("lang", "ru");
    await expect(page.locator(".brand")).toHaveText("Гипотеза Римана");
  });
});

test.describe("in an unsupported browser language", () => {
  test.use({ locale: "de-DE" });

  test("defaults to English", async ({ page }) => {
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.locator("#languageSelect")).toHaveValue("en");
    await expect(page.locator("#primes .step-label")).toHaveText("Step 1 of 10");
    await page.goto("./?lang=xx");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  });
});

test.describe("in Russian", () => {
  test.use({ locale: "ru-RU" });

  test("is detected from the browser language", async ({ page }) => {
    await expect(page.locator("html")).toHaveAttribute("lang", "ru");
    await expect(page.locator("#languageSelect")).toHaveValue("ru");
    await expect(page).toHaveTitle("Гипотеза Римана шаг за шагом");
  });

  test("has no horizontal scroll", async ({ page }) => {
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test("keeps the links, step labels and key points", async ({ page }) => {
    const hrefs = CHAPTERS.map((id) => `#${id}`);
    for (const list of [".chapter-nav a", ".steps a"]) {
      const links = await page
        .locator(list)
        .evaluateAll((a) => a.map((e) => e.getAttribute("href")));
      expect(links).toEqual(hrefs);
    }
    for (const [i, id] of CHAPTERS.entries()) {
      await expect(page.locator(`#${id} .step-label`)).toHaveText(
        `Шаг ${i + 1} из ${CHAPTERS.length}`,
      );
      await expect(page.locator(`#${id} .keypoint`)).toHaveCount(1);
    }
  });

  test("formats the readouts", async ({ page }) => {
    await page.locator("#estimateRange button", { hasText: "100 000" }).click();
    await expect(page.locator("#estPi")).toHaveText("9 592");
    await expect(page.locator("#arrowSum")).toHaveText(/^\d,\d{3} [+−] \d,\d{3}i$/);
    await expect(page.locator("#lastTerm")).toHaveText(
      "Слагаемое 10: длина 0,010, угол −11,51 рад.",
    );
    await slide(page, "sigma", 0.8);
    await expect(page.locator("#sigmaValue")).toHaveText("0,80");
    await expect(page.locator("#zetaMin")).toHaveText(/^Наименьшее значение: 0,\d{3}$/);
    await slide(page, "pairCount", 1);
    await page.locator("#synthPlot").hover();
    await expect(page.locator("#synthHover")).toContainText("формула с 1 парой");
    await slide(page, "scaleExponent", 12);
    await expect(page.locator("#scaleX")).toHaveText("1 триллион");
    await slide(page, "proofExponent", 12);
    await expect(page.locator("#proofLi")).toHaveText("37 607 950 280,8");
  });
});
