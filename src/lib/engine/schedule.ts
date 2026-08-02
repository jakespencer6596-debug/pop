import { createRng, shuffle } from "./rng";

export interface ScheduledGame {
  court: number;
  teamA: [string, string];
  teamB: [string, string];
}

export interface ScheduledRound {
  games: ScheduledGame[];
}

export interface GeneratedSchedule {
  rounds: ScheduledRound[];
  stats: {
    /** Number of partnerships that occur more than once, counted per extra occurrence. */
    partnerRepeats: number;
    /** Highest number of times any two players face each other. */
    maxOpponentCount: number;
  };
}

export function pairKey(a: string, b: string): string {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

const SCHEDULE_ATTEMPTS = 40;
const MATCHING_TRIES = 80;
const GROUPING_TRIES = 60;

/**
 * Generate a rotating-partner doubles schedule.
 *
 * Every round each player is placed on exactly one court and one team, so
 * nobody is double-booked and nobody sits out. Across rounds the generator
 * minimizes repeated partners (zero for the standard 16-player, 6-round
 * configuration) and spreads opponents evenly.
 *
 * Deterministic: the same players, settings, and seed always produce the
 * same schedule. Pass a different seed to reshuffle.
 */
export function generateRoundRobinSchedule(options: {
  playerIds: readonly string[];
  numCourts: number;
  numRounds: number;
  seed?: number;
}): GeneratedSchedule {
  const { playerIds, numCourts, numRounds } = options;
  const seed = options.seed ?? 1;
  const n = playerIds.length;

  if (n < 4 || n % 4 !== 0) {
    throw new Error("Player count must be a positive multiple of 4.");
  }
  if (n / 4 > numCourts) {
    throw new Error(
      `${n} players need ${n / 4} courts but only ${numCourts} are available.`,
    );
  }
  if (numRounds < 1) {
    throw new Error("Number of rounds must be at least 1.");
  }
  // Sort a copy so the result does not depend on incoming order.
  const ids = [...playerIds].sort();

  let best: GeneratedSchedule | null = null;
  for (let attempt = 0; attempt < SCHEDULE_ATTEMPTS; attempt++) {
    const rng = createRng(seed * 100003 + attempt * 7919 + 17);
    const candidate = buildSchedule(ids, numRounds, rng);
    if (!candidate) continue;
    if (!best || isBetter(candidate.stats, best.stats)) {
      best = candidate;
    }
    if (best.stats.partnerRepeats === 0) break;
  }
  if (!best) {
    throw new Error("Could not build a schedule for this configuration.");
  }
  return best;
}

function isBetter(
  a: GeneratedSchedule["stats"],
  b: GeneratedSchedule["stats"],
): boolean {
  if (a.partnerRepeats !== b.partnerRepeats) {
    return a.partnerRepeats < b.partnerRepeats;
  }
  return a.maxOpponentCount < b.maxOpponentCount;
}

function buildSchedule(
  ids: string[],
  numRounds: number,
  rng: () => number,
): GeneratedSchedule | null {
  const partnerCount = new Map<string, number>();
  const opponentCount = new Map<string, number>();
  const rounds: ScheduledRound[] = [];

  for (let r = 0; r < numRounds; r++) {
    const pairs = buildPartnerPairs(ids, partnerCount, rng);
    if (!pairs) return null;
    const games = groupPairsIntoGames(pairs, opponentCount, rng);
    for (const game of games) {
      bump(partnerCount, pairKey(game.teamA[0], game.teamA[1]));
      bump(partnerCount, pairKey(game.teamB[0], game.teamB[1]));
      for (const a of game.teamA) {
        for (const b of game.teamB) {
          bump(opponentCount, pairKey(a, b));
        }
      }
    }
    rounds.push({ games });
  }

  let partnerRepeats = 0;
  for (const count of partnerCount.values()) {
    if (count > 1) partnerRepeats += count - 1;
  }
  let maxOpponentCount = 0;
  for (const count of opponentCount.values()) {
    maxOpponentCount = Math.max(maxOpponentCount, count);
  }
  return { rounds, stats: { partnerRepeats, maxOpponentCount } };
}

function bump(map: Map<string, number>, key: string) {
  map.set(key, (map.get(key) ?? 0) + 1);
}

/**
 * Pair every player with a partner they have not partnered before, using
 * greedy matching over shuffled orders with retries. Falls back to the
 * least-used partnerships when a fresh perfect matching cannot be found,
 * so a valid round always comes back.
 */
function buildPartnerPairs(
  ids: string[],
  partnerCount: Map<string, number>,
  rng: () => number,
): Array<[string, string]> | null {
  for (let attempt = 0; attempt < MATCHING_TRIES; attempt++) {
    const order = shuffle(ids, rng);
    const pairs = greedyMatch(order, (a, b) =>
      (partnerCount.get(pairKey(a, b)) ?? 0) === 0 ? 0 : Infinity,
    );
    if (pairs) return pairs;
  }
  // Fallback: allow repeats but prefer the least-partnered pairs.
  for (let attempt = 0; attempt < MATCHING_TRIES; attempt++) {
    const order = shuffle(ids, rng);
    const pairs = greedyMatch(
      order,
      (a, b) => partnerCount.get(pairKey(a, b)) ?? 0,
    );
    if (pairs) return pairs;
  }
  return null;
}

/**
 * Greedy perfect matching over `order`: repeatedly take the first unmatched
 * player and join them with the lowest-cost eligible player. Returns null
 * when a player cannot be matched (cost Infinity everywhere).
 */
function greedyMatch(
  order: string[],
  cost: (a: string, b: string) => number,
): Array<[string, string]> | null {
  const unmatched = [...order];
  const pairs: Array<[string, string]> = [];
  while (unmatched.length > 0) {
    const a = unmatched.shift()!;
    let bestIndex = -1;
    let bestCost = Infinity;
    for (let i = 0; i < unmatched.length; i++) {
      const c = cost(a, unmatched[i]);
      if (c < bestCost) {
        bestCost = c;
        bestIndex = i;
      }
    }
    if (bestIndex === -1 || bestCost === Infinity) return null;
    const b = unmatched.splice(bestIndex, 1)[0];
    pairs.push([a, b]);
  }
  return pairs;
}

/**
 * Combine partner pairs into games of pair vs pair, minimizing how often
 * the four cross-team opponent relationships have already occurred.
 */
function groupPairsIntoGames(
  pairs: Array<[string, string]>,
  opponentCount: Map<string, number>,
  rng: () => number,
): ScheduledGame[] {
  const matchupCost = (x: [string, string], y: [string, string]) => {
    let total = 0;
    for (const a of x) {
      for (const b of y) {
        const c = opponentCount.get(pairKey(a, b)) ?? 0;
        total += c * c;
      }
    }
    return total;
  };

  let best: Array<[[string, string], [string, string]]> | null = null;
  let bestTotal = Infinity;
  for (let attempt = 0; attempt < GROUPING_TRIES; attempt++) {
    const order = shuffle(pairs, rng);
    const remaining = [...order];
    const matchups: Array<[[string, string], [string, string]]> = [];
    let total = 0;
    while (remaining.length > 0) {
      const x = remaining.shift()!;
      let bestIndex = 0;
      let bestCost = Infinity;
      for (let i = 0; i < remaining.length; i++) {
        const c = matchupCost(x, remaining[i]);
        if (c < bestCost) {
          bestCost = c;
          bestIndex = i;
        }
      }
      const y = remaining.splice(bestIndex, 1)[0];
      matchups.push([x, y]);
      total += bestCost;
    }
    if (total < bestTotal) {
      bestTotal = total;
      best = matchups;
    }
    if (bestTotal === 0) break;
  }

  return (best ?? []).map(([teamA, teamB], i) => ({
    court: i + 1,
    teamA,
    teamB,
  }));
}
