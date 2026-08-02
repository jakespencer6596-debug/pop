import { describe, expect, it } from "vitest";
import { generateRoundRobinSchedule, pairKey } from "./schedule";

const sixteen = Array.from(
  { length: 16 },
  (_, i) => `p${String(i + 1).padStart(2, "0")}`,
);

describe("generateRoundRobinSchedule (16 players, 4 courts, 6 rounds)", () => {
  const schedule = generateRoundRobinSchedule({
    playerIds: sixteen,
    numCourts: 4,
    numRounds: 6,
    seed: 1,
  });

  it("produces 6 rounds of 4 games", () => {
    expect(schedule.rounds).toHaveLength(6);
    for (const round of schedule.rounds) {
      expect(round.games).toHaveLength(4);
    }
  });

  it("never double-books a player within a round", () => {
    for (const round of schedule.rounds) {
      const seen = new Set<string>();
      for (const game of round.games) {
        for (const p of [...game.teamA, ...game.teamB]) {
          expect(seen.has(p)).toBe(false);
          seen.add(p);
        }
      }
    }
  });

  it("includes every player in every round, so nobody is benched", () => {
    for (const round of schedule.rounds) {
      const seen = new Set<string>();
      for (const game of round.games) {
        for (const p of [...game.teamA, ...game.teamB]) seen.add(p);
      }
      expect(seen.size).toBe(16);
    }
  });

  it("gives each player exactly 6 games", () => {
    const counts = new Map<string, number>();
    for (const round of schedule.rounds) {
      for (const game of round.games) {
        for (const p of [...game.teamA, ...game.teamB]) {
          counts.set(p, (counts.get(p) ?? 0) + 1);
        }
      }
    }
    expect(counts.size).toBe(16);
    for (const count of counts.values()) {
      expect(count).toBe(6);
    }
  });

  it("never repeats a partnership", () => {
    expect(schedule.stats.partnerRepeats).toBe(0);
    const partners = new Set<string>();
    for (const round of schedule.rounds) {
      for (const game of round.games) {
        for (const team of [game.teamA, game.teamB]) {
          const key = pairKey(team[0], team[1]);
          expect(partners.has(key)).toBe(false);
          partners.add(key);
        }
      }
    }
  });

  it("keeps the opponent distribution within a small spread", () => {
    const opponents = new Map<string, number>();
    for (const round of schedule.rounds) {
      for (const game of round.games) {
        for (const a of game.teamA) {
          for (const b of game.teamB) {
            const key = pairKey(a, b);
            opponents.set(key, (opponents.get(key) ?? 0) + 1);
          }
        }
      }
    }
    let max = 0;
    for (const count of opponents.values()) max = Math.max(max, count);
    // 12 opponent slots per player across 15 possible opponents: facing
    // anyone more than 3 times would be a badly skewed draw.
    expect(max).toBeLessThanOrEqual(3);
  });

  it("assigns courts 1 through 4 in every round", () => {
    for (const round of schedule.rounds) {
      const courts = round.games.map((g) => g.court).sort();
      expect(courts).toEqual([1, 2, 3, 4]);
    }
  });
});

describe("generateRoundRobinSchedule determinism", () => {
  it("returns an identical schedule for the same seed", () => {
    const a = generateRoundRobinSchedule({
      playerIds: sixteen,
      numCourts: 4,
      numRounds: 6,
      seed: 42,
    });
    const b = generateRoundRobinSchedule({
      playerIds: sixteen,
      numCourts: 4,
      numRounds: 6,
      seed: 42,
    });
    expect(a).toEqual(b);
  });

  it("does not depend on the incoming player order", () => {
    const reversed = [...sixteen].reverse();
    const a = generateRoundRobinSchedule({
      playerIds: sixteen,
      numCourts: 4,
      numRounds: 6,
      seed: 7,
    });
    const b = generateRoundRobinSchedule({
      playerIds: reversed,
      numCourts: 4,
      numRounds: 6,
      seed: 7,
    });
    expect(a).toEqual(b);
  });
});

describe("generateRoundRobinSchedule other configurations", () => {
  it("handles 8 players on 2 courts without double-booking", () => {
    const eight = sixteen.slice(0, 8);
    const schedule = generateRoundRobinSchedule({
      playerIds: eight,
      numCourts: 2,
      numRounds: 6,
      seed: 3,
    });
    expect(schedule.rounds).toHaveLength(6);
    for (const round of schedule.rounds) {
      expect(round.games).toHaveLength(2);
      const seen = new Set<string>();
      for (const game of round.games) {
        for (const p of [...game.teamA, ...game.teamB]) {
          expect(seen.has(p)).toBe(false);
          seen.add(p);
        }
      }
      expect(seen.size).toBe(8);
    }
    // 8 players over 6 rounds only have 7 possible partners, so repeats can
    // be forced late; the generator must still keep them rare.
    expect(schedule.stats.partnerRepeats).toBeLessThanOrEqual(1);
  });

  it("handles 12 players on 3 courts with zero partner repeats", () => {
    const twelve = sixteen.slice(0, 12);
    const schedule = generateRoundRobinSchedule({
      playerIds: twelve,
      numCourts: 3,
      numRounds: 6,
      seed: 5,
    });
    expect(schedule.stats.partnerRepeats).toBe(0);
  });

  it("rejects player counts that are not a multiple of 4", () => {
    expect(() =>
      generateRoundRobinSchedule({
        playerIds: sixteen.slice(0, 10),
        numCourts: 4,
        numRounds: 6,
      }),
    ).toThrow();
  });

  it("rejects a field that does not fit the courts", () => {
    expect(() =>
      generateRoundRobinSchedule({
        playerIds: sixteen,
        numCourts: 3,
        numRounds: 6,
      }),
    ).toThrow();
  });
});
