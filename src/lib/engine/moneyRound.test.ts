import { describe, expect, it } from "vitest";
import {
  bracketNextPosition,
  generateRotatingDoubles,
  generateSinglesRoundRobin,
  planBracket,
  seedOrder,
} from "./moneyRound";
import { pairKey } from "./schedule";

const six = ["s1", "s2", "s3", "s4", "s5", "s6"];

describe("generateSinglesRoundRobin", () => {
  it("creates one game for every pair of 6 players", () => {
    const games = generateSinglesRoundRobin(six, 4);
    expect(games).toHaveLength(15);
    const seen = new Set<string>();
    for (const g of games) {
      const key = pairKey(g.sideA[0], g.sideB[0]);
      expect(seen.has(key)).toBe(false);
      seen.add(key);
    }
    expect(seen.size).toBe(15);
  });

  it("never schedules a player twice in the same wave", () => {
    const games = generateSinglesRoundRobin(six, 4);
    const byWave = new Map<number, string[]>();
    for (const g of games) {
      const list = byWave.get(g.wave) ?? [];
      list.push(g.sideA[0], g.sideB[0]);
      byWave.set(g.wave, list);
    }
    for (const list of byWave.values()) {
      expect(new Set(list).size).toBe(list.length);
    }
  });

  it("handles an odd field with a rotating bye", () => {
    const games = generateSinglesRoundRobin(six.slice(0, 5), 4);
    expect(games).toHaveLength(10);
  });
});

describe("generateRotatingDoubles", () => {
  it("gives 6 players a balanced load for 5 games each", () => {
    const games = generateRotatingDoubles(six, 5, 4, 1);
    const played = new Map<string, number>();
    for (const g of games) {
      for (const p of [...g.sideA, ...g.sideB]) {
        played.set(p, (played.get(p) ?? 0) + 1);
      }
    }
    expect(played.size).toBe(6);
    const counts = [...played.values()];
    const min = Math.min(...counts);
    const max = Math.max(...counts);
    expect(min).toBeGreaterThanOrEqual(5);
    expect(max - min).toBeLessThanOrEqual(1);
  });

  it("never schedules a player twice in the same wave", () => {
    const games = generateRotatingDoubles(six, 5, 4, 2);
    const byWave = new Map<number, string[]>();
    for (const g of games) {
      const list = byWave.get(g.wave) ?? [];
      list.push(...g.sideA, ...g.sideB);
      byWave.set(g.wave, list);
    }
    for (const list of byWave.values()) {
      expect(new Set(list).size).toBe(list.length);
    }
  });

  it("is deterministic for a fixed seed", () => {
    expect(generateRotatingDoubles(six, 5, 4, 9)).toEqual(
      generateRotatingDoubles(six, 5, 4, 9),
    );
  });
});

describe("seedOrder", () => {
  it("produces the standard order for 8", () => {
    expect(seedOrder(8)).toEqual([1, 8, 4, 5, 2, 7, 3, 6]);
  });
  it("produces the standard order for 4", () => {
    expect(seedOrder(4)).toEqual([1, 4, 2, 3]);
  });
});

describe("planBracket with 6 players", () => {
  const plan = planBracket(6);

  it("uses 3 rounds on a bracket of 8", () => {
    expect(plan.numRounds).toBe(3);
  });

  it("gives seeds 1 and 2 first-round byes", () => {
    const round1 = plan.matches.filter((m) => m.bracketRound === 1);
    expect(round1).toHaveLength(2);
    const pairings = round1.map((m) => [m.seedA, m.seedB]);
    expect(pairings).toContainEqual([4, 5]);
    expect(pairings).toContainEqual([3, 6]);
  });

  it("pre-places seeds 1 and 2 into opposite semifinals", () => {
    const semis = plan.matches.filter((m) => m.bracketRound === 2);
    expect(semis).toHaveLength(2);
    const semiSeeds = semis
      .flatMap((m) => [m.seedA, m.seedB])
      .filter((s) => s !== undefined);
    expect(semiSeeds.sort()).toEqual([1, 2]);
    const withOne = semis.find((m) => m.seedA === 1 || m.seedB === 1)!;
    const withTwo = semis.find((m) => m.seedA === 2 || m.seedB === 2)!;
    expect(withOne.bracketSlot).not.toBe(withTwo.bracketSlot);
  });

  it("creates one empty final", () => {
    const finals = plan.matches.filter((m) => m.bracketRound === 3);
    expect(finals).toHaveLength(1);
    expect(finals[0].seedA).toBeUndefined();
    expect(finals[0].seedB).toBeUndefined();
  });
});

describe("planBracket with a power-of-two field", () => {
  it("creates a full first round for 4 players with no byes", () => {
    const plan = planBracket(4);
    expect(plan.numRounds).toBe(2);
    const round1 = plan.matches.filter((m) => m.bracketRound === 1);
    expect(round1).toHaveLength(2);
    expect(round1.map((m) => [m.seedA, m.seedB])).toEqual([
      [1, 4],
      [2, 3],
    ]);
  });
});

describe("bracketNextPosition", () => {
  it("sends adjacent slots into the same next game on opposite sides", () => {
    expect(bracketNextPosition(0)).toEqual({ nextSlot: 0, side: "A" });
    expect(bracketNextPosition(1)).toEqual({ nextSlot: 0, side: "B" });
    expect(bracketNextPosition(2)).toEqual({ nextSlot: 1, side: "A" });
    expect(bracketNextPosition(3)).toEqual({ nextSlot: 1, side: "B" });
  });
});
