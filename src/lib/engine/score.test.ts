import { describe, expect, it } from "vitest";
import { validateFinalScore } from "./score";

describe("validateFinalScore", () => {
  it("accepts a normal finish", () => {
    expect(validateFinalScore(11, 7, 11, true).ok).toBe(true);
  });

  it("accepts a deuce finish that ends on a two-point lead", () => {
    expect(validateFinalScore(12, 10, 11, true).ok).toBe(true);
    expect(validateFinalScore(15, 13, 11, true).ok).toBe(true);
  });

  it("rejects ties", () => {
    expect(validateFinalScore(10, 10, 11, true).ok).toBe(false);
  });

  it("rejects a winner below the game target", () => {
    expect(validateFinalScore(10, 8, 11, true).ok).toBe(false);
  });

  it("rejects a one-point win when win-by-two is on", () => {
    expect(validateFinalScore(11, 10, 11, true).ok).toBe(false);
  });

  it("rejects an overtime score that did not stop at a two-point lead", () => {
    expect(validateFinalScore(14, 10, 11, true).ok).toBe(false);
  });

  it("accepts a one-point win when win-by-two is off", () => {
    expect(validateFinalScore(11, 10, 11, false).ok).toBe(true);
  });

  it("rejects negative and fractional scores", () => {
    expect(validateFinalScore(-1, 11, 11, true).ok).toBe(false);
    expect(validateFinalScore(11.5, 7, 11, true).ok).toBe(false);
  });
});
