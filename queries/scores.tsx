import { useMutation, useQuery } from '@tanstack/react-query';

import { UserScore, WeekScores, AllScores } from '@/types/bets_and_odds';

const getToken = () => {
  return localStorage.getItem('accessToken');
};

const isPretendPerson = () => {
  //for alternative_uuid
  return localStorage.getItem('pretend_person');
};

const getHeaders = () => {
  //check if pretendPerson is set
  if (isPretendPerson()) {
    return new Headers({
      Authorization: `Bearer ${getToken()}`,
      alternative_uuid: isPretendPerson() || '',
    });
  }

  return new Headers({
    Authorization: `Bearer ${getToken()}`,
  });
};

const getScoresForGroup = async (groupId: string) => {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/scores/${groupId}`;

  console.log('url', url);

  const res = await fetch(url, {
    headers: getHeaders(),
  });

  if (!res.ok) {
    throw new Error('Network response was not okay');
  }

  const results = (await res.json()) as AllScores;

  return results;

  return res.json();
};

export const useGetScoresForGroup = (groupId: string) => {
  return useQuery<AllScores, unknown>({
    queryKey: ['scores', groupId],
    queryFn: () => getScoresForGroup(groupId),
  });
};

export default useGetScoresForGroup;
