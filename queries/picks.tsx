import {
  FetchedGame,
  FetchedChoice,
  InsertionChoice,
} from '@/types/bets_and_odds';

import {
  UseQueryResult,
  useQuery,
  useMutation,
  UseMutationResult,
} from '@tanstack/react-query';

import queryClient from './queryclient';

const getToken = () => {
  return localStorage.getItem('accessToken');
};

const addPicks = async (picks: InsertionChoice[], groupid: string) => {
  const url: string = `${process.env.NEXT_PUBLIC_API_URL}/picks/${groupid}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(picks),
  });

  if (!res.ok) {
    throw new Error('Network response was not okay');
  }
};

export const useAddPicks = (
  groupid: string
): UseMutationResult<
  InsertionChoice[],
  unknown,
  InsertionChoice[],
  unknown
> => {
  return useMutation({
    mutationFn: async (picks: InsertionChoice[]) => {
      await addPicks(picks, groupid);
      // Assuming the API returns the newly created picks
      //const newPicks: FetchedChoice[] = await getPicks(groupid);
      return picks;
    },
    onSuccess: (newPicks) => {
      // get old picks
      const oldPicks = queryClient.getQueryData<FetchedChoice[]>([
        'picks',
        groupid,
      ]);

      if (!oldPicks) {
        return;
      }

      queryClient.setQueryData(['picks', groupid], newPicks);
    },
  });
};

const getPicks = async (group_id: string): Promise<FetchedChoice[]> => {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/picks/${group_id}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!res.ok) {
    throw new Error('Network response was not okay');
  }

  const picks = await res.json();

  //filter picks -> only one of a particular bet_id
  const filteredPicks = picks.filter(
    (pick: FetchedChoice, index: number, self: FetchedChoice[]) => {
      return index === self.findIndex((t) => t.bet_id === pick.bet_id);
    }
  );

  return filteredPicks;

  return res.json();
};

export const useGetPicks = (
  groupid: string
): UseQueryResult<FetchedChoice[], unknown> => {
  return useQuery({
    queryKey: ['picks', groupid],
    queryFn: () => getPicks(groupid),
  });
};

/**
 *
 * Getting Week by week results will be next
 */

const getPicksByWeekId = async (
  group_id: string,
  week_id: string
): Promise<FetchedChoice[]> => {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/picks/${group_id}/${week_id}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!res.ok) {
    throw new Error('Network response was not okay');
  }

  return res.json();
};

export const useGetPicksByWeekId = (
  groupid: string,
  weekid: string
): UseQueryResult<FetchedChoice[], unknown> => {
  return useQuery({
    queryKey: ['picks', groupid, weekid],
    queryFn: () => getPicksByWeekId(groupid, weekid),
  });
};
