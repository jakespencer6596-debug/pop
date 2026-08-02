import type { StandingRow } from "@/lib/engine/standings";

export type TournamentStatus =
  "SETUP" | "ROUND_ROBIN" | "MONEY_ROUND" | "COMPLETED";
export type RoundPhase = "ROUND_ROBIN" | "MONEY_ROUND";
export type RoundStatus = "SCHEDULED" | "IN_PROGRESS" | "COMPLETED";
export type GameStatus = "SCHEDULED" | "IN_PROGRESS" | "FINAL";
export type MatchType = "SINGLES" | "DOUBLES";
export type MoneyRoundFormat = "ROUND_ROBIN" | "BRACKET";
export type PaymentStatus = "UNPAID" | "PAID";
export type PaymentMethod = "VENMO" | "CASH";

export interface PlayerDTO {
  id: string;
  name: string;
  contact: string | null;
  checkedIn: boolean;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod | null;
  seed: number | null;
}

export interface PublicPlayerDTO {
  id: string;
  name: string;
  seed: number | null;
}

export interface GameTeamMember {
  id: string;
  name: string;
}

export interface GameDTO {
  id: string;
  court: number | null;
  matchType: MatchType;
  scoreA: number | null;
  scoreB: number | null;
  status: GameStatus;
  bracketRound: number | null;
  bracketSlot: number | null;
  nextGameId: string | null;
  teamA: GameTeamMember[];
  teamB: GameTeamMember[];
}

export interface RoundDTO {
  id: string;
  number: number;
  phase: RoundPhase;
  status: RoundStatus;
  games: GameDTO[];
}

export interface TournamentSettingsDTO {
  id: string;
  name: string;
  venue: string | null;
  date: string | null;
  status: TournamentStatus;
  numCourts: number;
  gameTarget: number;
  winByTwo: boolean;
  roundRobinGames: number;
  numAdvancing: number;
  moneyRoundFormat: MoneyRoundFormat;
  moneyRoundMatchType: MatchType;
  moneyRoundGames: number;
  entryFeeCents: number;
  prizePoolCents: number;
  venmoHandle: string | null;
  venmoNote: string | null;
}

export interface PlacementDTO {
  playerId: string;
  name: string;
  seed: number | null;
  place: number;
}

export interface TournamentDetailDTO extends TournamentSettingsDTO {
  players: PlayerDTO[];
  rounds: RoundDTO[];
  roundRobinStandings: StandingRow[];
  moneyRoundStandings: StandingRow[] | null;
  roundRobinComplete: boolean;
  roundRobinGamesTotal: number;
  roundRobinGamesFinal: number;
  champion: PlacementDTO | null;
  placements: PlacementDTO[];
}

export interface TournamentSummaryDTO extends TournamentSettingsDTO {
  playerCount: number;
}

/** Public payload: same shape minus player contact and payment details. */
export interface TournamentPublicDTO extends Omit<
  TournamentDetailDTO,
  "players"
> {
  players: PublicPlayerDTO[];
}

export type { StandingRow };
