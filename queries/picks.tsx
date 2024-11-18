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

const addPicks = async (picks: InsertionChoice[], groupid: string) => {
  const url: string = `${process.env.NEXT_PUBLIC_API_URL}/picks/${groupid}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
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

      // update the cache
      const picksNow = [...oldPicks, ...newPicks];

      queryClient.setQueryData(['picks', groupid], picksNow);
    },
  });
};

const getPicks = async (group_id: string): Promise<FetchedChoice[]> => {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/picks/${group_id}`;

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error('Network response was not okay');
  }

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
