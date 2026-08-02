import { describe, expect, it } from "vitest";
import {
  computeStandings,
  selectAdvancers,
  type FinalGame,
  type PlayerRef,
} from "./standings";

const players: PlayerRef[] = [
  { id: "a", name: "Ana" },
  { id: "b", name: "Ben" },
  { id: "c", name: "Cam" },
  { id: "d", name: "Dee" },
];

describe("computeStandings", () => {
  it("credits wins, losses, and point totals to every player on a team", () => {
    const games: FinalGame[] = [
      { teamA: ["a", "b"], teamB: ["c", "d"], scoreA: 11, scoreB: 7 },
    ];
    const rows = computeStandings(players, games);
    const ana = rows.find((r) => r.playerId === "a")!;
    const cam = rows.find((r) => r.playerId === "c")!;

    expect(ana.wins).toBe(1);
    expect(ana.losses).toBe(0);
    expect(ana.pointsFor).toBe(11);
    expect(ana.pointsAgainst).toBe(7);
    expect(ana.pointDifferential).toBe(4);

    expect(cam.wins).toBe(0);
    expect(cam.losses).toBe(1);
    expect(cam.pointsFor).toBe(7);
    expect(cam.pointsAgainst).toBe(11);
    expect(cam.pointDifferential).toBe(-4);
  });

  it("sums results across multiple games", () => {
    const games: FinalGame[] = [
      { teamA: ["a", "b"], teamB: ["c", "d"], scoreA: 11, scoreB: 7 },
      { teamA: ["a", "c"], teamB: ["b", "d"], scoreA: 9, scoreB: 11 },
    ];
    const rows = computeStandings(players, games);
    const ana = rows.find((r) => r.playerId === "a")!;
    expect(ana.gamesPlayed).toBe(2);
    expect(ana.wins).toBe(1);
    expect(ana.losses).toBe(1);
    expect(ana.pointsFor).toBe(20);
    expect(ana.pointsAgainst).toBe(18);
    expect(ana.pointDifferential).toBe(2);
  });

  it("ranks by wins first", () => {
    const games: FinalGame[] = [
      { teamA: ["a"], teamB: ["b"], scoreA: 11, scoreB: 0 },
      { teamA: ["c"], teamB: ["b"], scoreA: 11, scoreB: 9 },
      { teamA: ["c"], teamB: ["a"], scoreA: 11, scoreB: 9 },
    ];
    const rows = computeStandings(players, games);
    // Cam: 2 wins. Ana: 1 win. Ben: 0 wins. Dee: no games.
    expect(rows[0].playerId).toBe("c");
    expect(rows[1].playerId).toBe("a");
  });

  it("breaks win ties by point differential, then points for", () => {
    const games: FinalGame[] = [
      // Ana beats Ben 11-5 (diff +6), Cam beats Dee 11-9 (diff +2)
      { teamA: ["a"], teamB: ["b"], scoreA: 11, scoreB: 5 },
      { teamA: ["c"], teamB: ["d"], scoreA: 11, scoreB: 9 },
    ];
    const rows = computeStandings(players, games);
    expect(rows[0].playerId).toBe("a");
    expect(rows[1].playerId).toBe("c");
  });

  it("breaks diff ties by points for, then fewest points against", () => {
    const p = [
      { id: "x", name: "Xio" },
      { id: "y", name: "Yan" },
      { id: "z", name: "Zed" },
      { id: "w", name: "Wes" },
    ];
    const games: FinalGame[] = [
      // Xio: 12-10 (diff 2, pf 12). Yan: 11-9 (diff 2, pf 11).
      { teamA: ["x"], teamB: ["z"], scoreA: 12, scoreB: 10 },
      { teamA: ["y"], teamB: ["w"], scoreA: 11, scoreB: 9 },
    ];
    const rows = computeStandings(p, games);
    expect(rows[0].playerId).toBe("x");
    expect(rows[1].playerId).toBe("y");
  });

  it("falls back to name for a fully tied pair, so ordering is deterministic", () => {
    const games: FinalGame[] = [
      { teamA: ["a", "b"], teamB: ["c", "d"], scoreA: 11, scoreB: 7 },
    ];
    const rows = computeStandings(players, games);
    // Ana and Ben have identical results; Ana sorts first by name.
    expect(rows[0].playerId).toBe("a");
    expect(rows[1].playerId).toBe("b");
  });

  it("assigns dense 1-based ranks", () => {
    const rows = computeStandings(players, [
      { teamA: ["a", "b"], teamB: ["c", "d"], scoreA: 11, scoreB: 7 },
    ]);
    expect(rows.map((r) => r.rank)).toEqual([1, 2, 3, 4]);
  });
});

describe("selectAdvancers", () => {
  it("takes the top N rows in order", () => {
    const rows = computeStandings(players, [
      { teamA: ["a"], teamB: ["b"], scoreA: 11, scoreB: 3 },
      { teamA: ["c"], teamB: ["d"], scoreA: 11, scoreB: 8 },
    ]);
    const advancers = selectAdvancers(rows, 2);
    expect(advancers.map((r) => r.playerId)).toEqual(["a", "c"]);
  });
});
