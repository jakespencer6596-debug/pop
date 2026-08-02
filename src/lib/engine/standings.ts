export interface PlayerRef {
  id: string;
  name: string;
}

/** A completed game, expressed by the two team rosters and the final score. */
export interface FinalGame {
  teamA: string[];
  teamB: string[];
  scoreA: number;
  scoreB: number;
}

export interface StandingRow {
  playerId: string;
  name: string;
  gamesPlayed: number;
  wins: number;
  losses: number;
  pointsFor: number;
  pointsAgainst: number;
  pointDifferential: number;
  /** 1-based rank after all tiebreaks. Deterministic: no shared ranks. */
  rank: number;
}

/**
 * Compute individual standings from a set of final games.
 *
 * Ranking order: wins desc, point differential desc, points for desc,
 * points against asc, then name asc and id asc as stable final tiebreaks.
 */
export function computeStandings(
  players: readonly PlayerRef[],
  games: readonly FinalGame[],
): StandingRow[] {
  const rows = new Map<string, StandingRow>();
  for (const p of players) {
    rows.set(p.id, {
      playerId: p.id,
      name: p.name,
      gamesPlayed: 0,
      wins: 0,
      losses: 0,
      pointsFor: 0,
      pointsAgainst: 0,
      pointDifferential: 0,
      rank: 0,
    });
  }

  for (const game of games) {
    const aWon = game.scoreA > game.scoreB;
    creditTeam(rows, game.teamA, game.scoreA, game.scoreB, aWon);
    creditTeam(rows, game.teamB, game.scoreB, game.scoreA, !aWon);
  }

  const sorted = [...rows.values()].sort(compareStandings);
  sorted.forEach((row, i) => {
    row.rank = i + 1;
  });
  return sorted;
}

function creditTeam(
  rows: Map<string, StandingRow>,
  team: string[],
  pointsFor: number,
  pointsAgainst: number,
  won: boolean,
) {
  for (const playerId of team) {
    const row = rows.get(playerId);
    if (!row) continue; // game references a player outside the ranked set
    row.gamesPlayed += 1;
    if (won) row.wins += 1;
    else row.losses += 1;
    row.pointsFor += pointsFor;
    row.pointsAgainst += pointsAgainst;
    row.pointDifferential = row.pointsFor - row.pointsAgainst;
  }
}

export function compareStandings(a: StandingRow, b: StandingRow): number {
  if (a.wins !== b.wins) return b.wins - a.wins;
  if (a.pointDifferential !== b.pointDifferential) {
    return b.pointDifferential - a.pointDifferential;
  }
  if (a.pointsFor !== b.pointsFor) return b.pointsFor - a.pointsFor;
  if (a.pointsAgainst !== b.pointsAgainst) {
    return a.pointsAgainst - b.pointsAgainst;
  }
  const byName = a.name.localeCompare(b.name);
  if (byName !== 0) return byName;
  return a.playerId.localeCompare(b.playerId);
}

/** The top `numAdvancing` rows of a standings table, in seed order. */
export function selectAdvancers(
  standings: readonly StandingRow[],
  numAdvancing: number,
): StandingRow[] {
  return standings.slice(0, numAdvancing);
}
