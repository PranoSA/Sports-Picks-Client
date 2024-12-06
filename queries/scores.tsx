import { useMutation, useQuery } from '@tanstack/react-query';

const getToken = () => {
  return localStorage.getItem('accessToken');
};

const getScoresForGroup = async (groupId: string) => {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/scores/${groupId}`;

  console.log('url', url);

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

export const useGetScoresForGroup = (groupId: string) => {
  return useQuery({
    queryKey: ['scores', groupId],
    queryFn: () => getScoresForGroup(groupId),
  });
};
