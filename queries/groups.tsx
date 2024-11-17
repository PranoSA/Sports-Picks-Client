import {
  UseQueryResult,
  useMutation,
  useQuery,
  UseMutationResult,
} from '@tanstack/react-query';
import queryClient from './queryclient';

import { FetchedGroup, InsertionGroup } from '@/types/bets_and_odds';
/**
 *
 * Create Groups
 *
 *This will have stuff for creating groups
 Editing Groups, Deleting Groups


 Inviting Users To Groups,
 Modifying User Roles in Groups
 *
 */

// fetch the groups you belong to
const getGroups = async () => {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/groups`;

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error('Network response was not okay');
  }

  const data = await res.json();

  return data;
};

export const useGetGroups = (): UseQueryResult<FetchedGroup[], unknown> => {
  return useQuery({
    queryKey: ['groups'],
    queryFn: getGroups,
  });
};

//  create a group
const createGroup = async (group: InsertionGroup) => {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/groups`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(group),
  });

  if (!res.ok) {
    throw new Error('Network response was not okay');
  }

  return res.json();
};

export const useCreateGroup = (): UseMutationResult<
  FetchedGroup,
  unknown,
  InsertionGroup,
  unknown
> => {
  return useMutation({
    mutationFn: createGroup,
    onSuccess: () => {},
  });
};

const getGroupById = async (group_id: string): Promise<FetchedGroup> => {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/groups/${group_id}`;

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error('Network response was not okay');
  }

  const data = await res.json();

  return data;
};

export const useGetGroupById = (
  group_id: string
): UseQueryResult<FetchedGroup, unknown> => {
  return useQuery({
    queryKey: ['group', group_id],
    queryFn: () => getGroupById(group_id),
  });
};
// edit a group

// delete a group

// invite users to a group

// accept an invite to a group

//decline an invite to a group

// leave a group
