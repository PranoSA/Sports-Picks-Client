import {
  UseQueryResult,
  useMutation,
  useQuery,
  UseMutationResult,
} from '@tanstack/react-query';
import queryClient from './queryclient';

import {
  FetchedGroup,
  FetchedGroup_User,
  InsertionGroup,
  JoinGroup,
} from '@/types/bets_and_odds';
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

const getToken = () => {
  return localStorage.getItem('accessToken');
};

// fetch the groups you belong to
const getGroups = async () => {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/groups`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

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
      Authorization: `Bearer ${getToken()}`,
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

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

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

//get group users
const getGroupUsers = async (group_id: string): Promise<FetchedGroup_User> => {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/groups/${group_id}/users`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!res.ok) {
    throw new Error('Network response was not okay');
  }

  const data = await res.json();

  return data;
};

export const useGetGroupUsers = (
  group_id: string
): UseQueryResult<FetchedGroup_User[], unknown> => {
  return useQuery({
    queryKey: ['group_users', group_id],
    queryFn: () => getGroupUsers(group_id),
  });
};

//join a group
const joinGroup = async (
  joinGroup: JoinGroup
): Promise<FetchedGroup_User[]> => {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/groups/${joinGroup.group_id}/users`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(joinGroup),
  });

  if (!res.ok) {
    throw new Error('Network response was not okay');
  }

  return res.json();
};

export const useJoinGroup = (): UseMutationResult<
  FetchedGroup_User[],
  unknown,
  JoinGroup,
  unknown
> => {
  return useMutation({
    mutationFn: async (groupToJoin: JoinGroup) => {
      const res = await joinGroup(groupToJoin);
      return res;
    },
    onSuccess: () => {},
  });
};
