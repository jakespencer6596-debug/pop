export interface ScoreValidation {
  ok: boolean;
  message?: string;
}

/**
 * Validate a final score against the tournament's game target and win-by-two
 * rule. The organizer can override a failed validation for unusual finishes,
 * so a failure here is advisory rather than absolute.
 */
export function validateFinalScore(
  scoreA: number,
  scoreB: number,
  gameTarget: number,
  winByTwo: boolean,
): ScoreValidation {
  if (!Number.isInteger(scoreA) || !Number.isInteger(scoreB)) {
    return { ok: false, message: "Scores must be whole numbers." };
  }
  if (scoreA < 0 || scoreB < 0) {
    return { ok: false, message: "Scores cannot be negative." };
  }
  if (scoreA === scoreB) {
    return { ok: false, message: "A game cannot end in a tie." };
  }

  const winner = Math.max(scoreA, scoreB);
  const loser = Math.min(scoreA, scoreB);

  if (winner < gameTarget) {
    return {
      ok: false,
      message: `The winning score must be at least ${gameTarget}.`,
    };
  }
  if (winByTwo) {
    if (winner - loser < 2) {
      return { ok: false, message: "The winner must lead by 2 or more." };
    }
    if (winner > gameTarget && winner - loser !== 2) {
      return {
        ok: false,
        message: `A game past ${gameTarget} ends the moment a team leads by 2.`,
      };
    }
  }
  return { ok: true };
}
