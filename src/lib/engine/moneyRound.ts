import { createRng, shuffle } from "./rng";
import { pairKey } from "./schedule";

export interface MoneyGame {
  /** 0-based wave index. Games in the same wave can run at the same time. */
  wave: number;
  court: number;
  sideA: string[];
  sideB: string[];
}

/**
 * Singles round robin: every player faces every other player once, arranged
 * with the circle method so no player appears twice in the same wave.
 */
export function generateSinglesRoundRobin(
  playerIds: readonly string[],
  numCourts: number,
): MoneyGame[] {
  const ids = [...playerIds];
  const hasBye = ids.length % 2 === 1;
  if (hasBye) ids.push("__bye__");
  const n = ids.length;
  const waves = n - 1;
  const half = n / 2;
  const games: MoneyGame[] = [];

  // Circle method: fix ids[0], rotate the rest each wave.
  const rotation = ids.slice(1);
  for (let w = 0; w < waves; w++) {
    const lineup = [ids[0], ...rotation];
    let court = 1;
    for (let i = 0; i < half; i++) {
      const a = lineup[i];
      const b = lineup[n - 1 - i];
      if (a === "__bye__" || b === "__bye__") continue;
      games.push({ wave: w, court, sideA: [a], sideB: [b] });
      court = court >= numCourts ? 1 : court + 1;
    }
    rotation.unshift(rotation.pop()!);
  }
  return games;
}

/**
 * Rotating-partner doubles among the advancers with balanced byes. Each
 * player plays `gamesEach` games, give or take one when the player count
 * times gamesEach is not divisible by 4.
 */
export function generateRotatingDoubles(
  playerIds: readonly string[],
  gamesEach: number,
  numCourts: number,
  seed = 1,
): MoneyGame[] {
  const ids = [...playerIds].sort();
  const n = ids.length;
  if (n < 4) {
    throw new Error("Rotating doubles needs at least 4 players.");
  }
  const totalGames = Math.ceil((n * gamesEach) / 4);
  const rng = createRng(seed * 7907 + 3);
  const played = new Map<string, number>(ids.map((id) => [id, 0]));
  const partnerCount = new Map<string, number>();
  const opponentCount = new Map<string, number>();

  const raw: Array<{ sideA: string[]; sideB: string[] }> = [];
  for (let g = 0; g < totalGames; g++) {
    // Take the four players with the fewest games so byes stay balanced.
    const sorted = shuffle(ids, rng).sort(
      (a, b) => played.get(a)! - played.get(b)!,
    );
    const four = sorted.slice(0, 4);
    const [teamA, teamB] = bestSplit(four, partnerCount, opponentCount);
    raw.push({ sideA: teamA, sideB: teamB });
    for (const p of four) played.set(p, played.get(p)! + 1);
    partnerCount.set(
      pairKey(teamA[0], teamA[1]),
      (partnerCount.get(pairKey(teamA[0], teamA[1])) ?? 0) + 1,
    );
    partnerCount.set(
      pairKey(teamB[0], teamB[1]),
      (partnerCount.get(pairKey(teamB[0], teamB[1])) ?? 0) + 1,
    );
    for (const a of teamA) {
      for (const b of teamB) {
        opponentCount.set(
          pairKey(a, b),
          (opponentCount.get(pairKey(a, b)) ?? 0) + 1,
        );
      }
    }
  }
  return packIntoWaves(raw, numCourts);
}

function bestSplit(
  four: string[],
  partnerCount: Map<string, number>,
  opponentCount: Map<string, number>,
): [string[], string[]] {
  const [p0, p1, p2, p3] = four;
  const splits: Array<[string[], string[]]> = [
    [
      [p0, p1],
      [p2, p3],
    ],
    [
      [p0, p2],
      [p1, p3],
    ],
    [
      [p0, p3],
      [p1, p2],
    ],
  ];
  let best = splits[0];
  let bestCost = Infinity;
  for (const [a, b] of splits) {
    const partners =
      (partnerCount.get(pairKey(a[0], a[1])) ?? 0) +
      (partnerCount.get(pairKey(b[0], b[1])) ?? 0);
    let opponents = 0;
    for (const x of a) {
      for (const y of b) {
        opponents += opponentCount.get(pairKey(x, y)) ?? 0;
      }
    }
    const cost = partners * 100 + opponents;
    if (cost < bestCost) {
      bestCost = cost;
      best = [a, b];
    }
  }
  return best;
}

/** Assign sequential games to the earliest wave with a free court and no player conflict. */
function packIntoWaves(
  games: Array<{ sideA: string[]; sideB: string[] }>,
  numCourts: number,
): MoneyGame[] {
  const waves: Array<{ players: Set<string>; count: number }> = [];
  const out: MoneyGame[] = [];
  for (const game of games) {
    const participants = [...game.sideA, ...game.sideB];
    let waveIndex = waves.findIndex(
      (w) =>
        w.count < numCourts && participants.every((p) => !w.players.has(p)),
    );
    if (waveIndex === -1) {
      waves.push({ players: new Set(), count: 0 });
      waveIndex = waves.length - 1;
    }
    const wave = waves[waveIndex];
    for (const p of participants) wave.players.add(p);
    wave.count += 1;
    out.push({
      wave: waveIndex,
      court: wave.count,
      sideA: game.sideA,
      sideB: game.sideB,
    });
  }
  return out;
}

export interface BracketMatch {
  /** 1-based bracket round. Round 1 is the first playable round for the field. */
  bracketRound: number;
  /** 0-based slot within the round. */
  bracketSlot: number;
  /** Seeds present at creation time. Undefined means "winner feeds in later". */
  seedA?: number;
  seedB?: number;
}

export interface BracketPlan {
  /** Number of bracket rounds, final included. */
  numRounds: number;
  matches: BracketMatch[];
}

/**
 * Single-elimination bracket for `numPlayers` seeds (1 is best). When the
 * field is not a power of two, top seeds receive first-round byes and are
 * pre-placed into round 2. For 6 players: 3 v 6 and 4 v 5 play round 1,
 * seeds 1 and 2 wait in the semifinals.
 */
export function planBracket(numPlayers: number): BracketPlan {
  if (numPlayers < 2) {
    throw new Error("A bracket needs at least 2 players.");
  }
  let size = 2;
  while (size < numPlayers) size *= 2;
  const numRounds = Math.log2(size);
  const order = seedOrder(size);

  const matches: BracketMatch[] = [];
  // Round 1 pairings from the standard seed order. Seeds beyond the field
  // are byes: the real seed advances straight into round 2.
  const round2Prefill = new Map<number, { side: "A" | "B"; seed: number }[]>();
  for (let slot = 0; slot < size / 2; slot++) {
    const s1 = order[slot * 2];
    const s2 = order[slot * 2 + 1];
    const real1 = s1 <= numPlayers;
    const real2 = s2 <= numPlayers;
    if (real1 && real2) {
      matches.push({
        bracketRound: 1,
        bracketSlot: slot,
        seedA: s1,
        seedB: s2,
      });
    } else if (real1 || real2) {
      const seed = real1 ? s1 : s2;
      const target = bracketNextPosition(slot);
      const list = round2Prefill.get(target.nextSlot) ?? [];
      list.push({ side: target.side, seed });
      round2Prefill.set(target.nextSlot, list);
    }
  }
  // Later rounds: create every match; prefill round 2 with bye advancers.
  for (let round = 2; round <= numRounds; round++) {
    const slots = size / Math.pow(2, round);
    for (let slot = 0; slot < slots; slot++) {
      const match: BracketMatch = { bracketRound: round, bracketSlot: slot };
      if (round === 2) {
        for (const fill of round2Prefill.get(slot) ?? []) {
          if (fill.side === "A") match.seedA = fill.seed;
          else match.seedB = fill.seed;
        }
      }
      matches.push(match);
    }
  }
  return { numRounds, matches };
}

/** Where the winner of a bracket slot goes in the next round. */
export function bracketNextPosition(bracketSlot: number): {
  nextSlot: number;
  side: "A" | "B";
} {
  return {
    nextSlot: Math.floor(bracketSlot / 2),
    side: bracketSlot % 2 === 0 ? "A" : "B",
  };
}

/** Standard bracket seed order for a power-of-two size, e.g. 8 -> 1,8,4,5,2,7,3,6. */
export function seedOrder(size: number): number[] {
  let order = [1];
  while (order.length < size) {
    const len = order.length * 2;
    const next: number[] = [];
    for (const s of order) {
      next.push(s, len + 1 - s);
    }
    order = next;
  }
  return order;
}
