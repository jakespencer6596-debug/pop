import { cn } from "@/lib/cn";
import type { StandingRow } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";

/**
 * Round 1 or money round standings. When `advancingCount` is set, a gold
 * line marks the advancement cut and advancing rows get a subtle gold tint.
 */
export function StandingsTable({
  rows,
  advancingCount,
  dark,
}: {
  rows: StandingRow[];
  advancingCount?: number;
  dark?: boolean;
}) {
  return (
    <div className="overflow-x-auto">
      <table className={cn("pop-table", dark && "pop-table--dark")}>
        <thead>
          <tr>
            <th className="num w-10">Rank</th>
            <th>Player</th>
            <th className="num">W</th>
            <th className="num">L</th>
            <th className="num">Diff</th>
            <th className="num">PF</th>
            <th className="num">PA</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const advancing =
              advancingCount !== undefined && row.rank <= advancingCount;
            const cutRow =
              advancingCount !== undefined && row.rank === advancingCount;
            const leader = row.rank === 1 && row.gamesPlayed > 0;
            const cut = cutRow && "border-b-2 border-b-gold";
            return (
              <tr
                key={row.playerId}
                className={cn(
                  advancing && !dark && "bg-gold/10",
                  advancing && dark && "bg-white/5",
                )}
              >
                <td className={cn("num", cut)}>
                  <span
                    className={cn(
                      "font-display text-sm font-semibold",
                      dark && leader && "text-gold",
                    )}
                  >
                    {row.rank}
                  </span>
                </td>
                <td className={cn(cut)}>
                  <span
                    className={cn(
                      "font-medium",
                      dark && leader
                        ? "text-gold"
                        : dark
                          ? "text-white"
                          : "text-ink",
                    )}
                  >
                    {row.name}
                  </span>
                  {advancing && (
                    <Badge tone="gold" className="ml-2">
                      Advancing
                    </Badge>
                  )}
                </td>
                <td
                  className={cn(
                    "num font-semibold",
                    dark ? "text-night-win" : "text-positive",
                    cut,
                  )}
                >
                  {row.wins}
                </td>
                <td
                  className={cn(
                    "num",
                    dark ? "text-night-muted" : "text-danger",
                    cut,
                  )}
                >
                  {row.losses}
                </td>
                <td className={cn("num font-medium", cut)}>
                  {row.pointDifferential > 0
                    ? `+${row.pointDifferential}`
                    : row.pointDifferential}
                </td>
                <td className={cn("num", cut)}>{row.pointsFor}</td>
                <td className={cn("num", cut)}>{row.pointsAgainst}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
