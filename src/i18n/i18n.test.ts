import { readdirSync, readFileSync } from "node:fs";
import { afterEach, describe, expect, it } from "vitest";
import { fixed, inWords, integer, scientific } from "../format";
import { en } from "./en";
import { setLanguage, t } from "./index";
import { ru } from "./ru";

interface Tree {
  [key: string]: string | Tree;
}

const PLURAL_SUFFIX = /_(zero|one|two|few|many|other)$/;

const SOURCES = [
  "index.html",
  ...readdirSync("src/chapters")
    .filter((file) => file.endsWith(".html"))
    .map((file) => `src/chapters/${file}`),
];

function leaves(tree: Tree, prefix = ""): [string, string][] {
  return Object.entries(tree).flatMap(([key, value]) =>
    typeof value === "string" ? [[prefix + key, value]] : leaves(value, `${prefix}${key}.`),
  );
}

const ruKeys = new Map(leaves(ru));
const baseKeys = (tree: Tree) =>
  new Set(leaves(tree).map(([key]) => key.replace(PLURAL_SUFFIX, "")));

const pageKeys = SOURCES.flatMap((file) =>
  [...readFileSync(file, "utf8").matchAll(/data-i18n(?:-[\w-]+)?="([^"]+)"/g)].map(
    (match) => match[1],
  ),
);

describe("translations", () => {
  afterEach(async () => {
    await setLanguage("en");
  });

  it("translate every marked element of the page", () => {
    expect(pageKeys.length).toBeGreaterThan(100);
    expect(pageKeys.filter((key) => !ruKeys.has(key))).toEqual([]);
  });

  it("translate every string used by the scripts", () => {
    const ru = baseKeys(Object.fromEntries(ruKeys));
    expect([...baseKeys(en)].filter((key) => !ru.has(key))).toEqual([]);
  });

  it("keep the links and the key points of the original", () => {
    const html = SOURCES.map((file) => readFileSync(file, "utf8")).join("");
    for (const [key, value] of ruKeys) {
      for (const [, href] of value.matchAll(/href="([^"]+)"/g)) {
        expect(html, key).toContain(`href="${href}"`);
      }
      if (key.endsWith(".prose")) expect(value.split('class="keypoint"'), key).toHaveLength(2);
    }
  });

  it("use Russian plural forms", async () => {
    await setLanguage("ru");
    expect(t("zeta.more", { count: 1 })).toBe("+ ещё 1 слагаемое");
    expect(t("zeta.more", { count: 3 })).toBe("+ ещё 3 слагаемых");
    expect(t("zeta.more", { count: 21 })).toBe("+ ещё 21 слагаемое");
    expect(t("synth.hover", { count: 1, x: "", psi: "", approx: "" })).toContain("с 1 парой");
  });

  it("format numbers for the language", async () => {
    await setLanguage("ru");
    expect(integer(1234567.6)).toBe("1\u00a0234\u00a0568");
    expect(fixed(1.5, 2)).toBe("1,50");
    expect(inWords(1e12).replace(/\s/g, " ")).toBe("1 триллион");
    expect(scientific(1.234e-7)).toBe("1,23 × 10⁻⁷");
  });
});
