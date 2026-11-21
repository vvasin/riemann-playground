import { describe, expect, it } from "vitest";
import { niceTicks } from "./plot";

describe("niceTicks", () => {
  it("chooses round steps", () => {
    expect(niceTicks(100)).toEqual([0, 25, 50, 75, 100]);
    expect(niceTicks(190)).toEqual([0, 50, 100, 150]);
  });
});
