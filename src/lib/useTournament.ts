"use client";

import useSWR from "swr";
import { swrFetcher } from "./api";
import type { TournamentDetailDTO, TournamentPublicDTO } from "./types";

export function useTournament(id: string, options?: { poll?: boolean }) {
  return useSWR<TournamentDetailDTO>(
    `/api/tournaments/${id}`,
    swrFetcher<TournamentDetailDTO>,
    {
      refreshInterval: options?.poll ? 4000 : 0,
      keepPreviousData: true,
    },
  );
}

export function usePublicTournament(id: string) {
  return useSWR<TournamentPublicDTO>(
    `/api/tournaments/${id}/public`,
    swrFetcher<TournamentPublicDTO>,
    {
      refreshInterval: 4000,
      keepPreviousData: true,
    },
  );
}
