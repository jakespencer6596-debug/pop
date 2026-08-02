import { cn } from "@/lib/cn";
import type { StandingRow } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";

/**
 * Round 1 or money round standings. When `advancingCount` is set, a labeled
 * line marks the advancement cut.
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
            return (
              <tr
                key={row.playerId}
                className={cn(
                  advancing && !dark && "bg-info/5",
                  advancing && dark && "bg-white/5",
                )}
              >
                <td
                  className={cn(
                    "num font-semibold",
                    cutRow && "border-b-2 border-b-brand",
                  )}
                >
                  {row.rank}
                </td>
                <td className={cn(cutRow && "border-b-2 border-b-brand")}>
                  <span
                    className={cn(
                      "font-medium",
                      dark ? "text-white" : "text-ink",
                    )}
                  >
                    {row.name}
                  </span>
                  {advancing && (
                    <Badge tone="info" className="ml-2">
                      Advancing
                    </Badge>
                  )}
                </td>
                <td
                  className={cn(
                    "num font-semibold",
                    dark ? "text-night-win" : "text-positive",
                    cutRow && "border-b-2 border-b-brand",
                  )}
                >
                  {row.wins}
                </td>
                <td
                  className={cn(
                    "num",
                    dark ? "text-night-muted" : "text-danger",
                    cutRow && "border-b-2 border-b-brand",
                  )}
                >
                  {row.losses}
                </td>
                <td
                  className={cn(
                    "num font-medium",
                    cutRow && "border-b-2 border-b-brand",
                  )}
                >
                  {row.pointDifferential > 0
                    ? `+${row.pointDifferential}`
                    : row.pointDifferential}
                </td>
                <td
                  className={cn("num", cutRow && "border-b-2 border-b-brand")}
                >
                  {row.pointsFor}
                </td>
                <td
                  className={cn("num", cutRow && "border-b-2 border-b-brand")}
                >
                  {row.pointsAgainst}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
