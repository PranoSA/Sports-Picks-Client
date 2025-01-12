/**
 *
 * Results will have extra client side logic to handle the data
 *
 *
 *
 */

// get previous weeks [just so you know what week you are on]
import { FetchedWeek } from '@/types/bets_and_odds';

import {
  UseQueryResult,
  useQuery,
  useMutation,
  UseMutationResult,
} from '@tanstack/react-query';

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

// get the previous weeks to this point [just so you know what week you are on]
const getWeeks = async (): Promise<FetchedWeek[]> => {
  const url: string = `${process.env.NEXT_PUBLIC_API_URL}/current_year/weeks`;

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error('Network response was not okay');
  }

  const weeks: FetchedWeek[] = await res.json();

  //now filter weeks to only include weeks that have already happened
  const now = new Date();

  const filteredWeeks = weeks.filter((week) => {
    const weekStart = new Date(week.end_date);
    return weekStart < now;
  });

  return filteredWeeks;
};

export const useGetWeeks = (): UseQueryResult<FetchedWeek[], unknown> => {
  return useQuery({
    queryKey: ['weeks'],
    queryFn: getWeeks,
  });
};

// the results will be [per_groupm, per_week]
//and return picks and results
