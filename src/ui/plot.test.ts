import { describe, expect, it } from "vitest";
import { niceTicks, ticksBetween } from "./plot";

describe("niceTicks", () => {
  it("chooses round steps", () => {
    expect(niceTicks(100)).toEqual([0, 25, 50, 75, 100]);
    expect(niceTicks(190)).toEqual([0, 50, 100, 150]);
  });
});

describe("ticksBetween", () => {
  it("covers a range that may start below 0", () => {
    expect(ticksBetween(-0.3, 1.1, 4)).toEqual([0, 0.5, 1]);
    expect(ticksBetween(-25, 30, 4)).toEqual([-20, 0, 20]);
  });
});
