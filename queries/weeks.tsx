/**
 *
 * Bulk Add Weeks
 */

import { InsertionWeek, FetchedWeek } from '@/types/bets_and_odds';
import { useMutation, useQuery, UseQueryResult } from '@tanstack/react-query';
import { useAddYear } from './years';

import queryClient from './queryclient';

const getKey = (year_id: string) => ['weeks', year_id];

const getToken = () => {
  return localStorage.getItem('accessToken');
};

const AddWeeks = async (weeks: InsertionWeek[]) => {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/weeks`;

  console.log('weeks', weeks);

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(weeks),
  });

  // if the response is not ok, throw an error
  if (!res.ok) {
    throw new Error('Network response was not okay');
  }

  const data = await res.json();

  console.log('data add', data);

  return data;

  return res.json();
};

export function useAddWeeks() {
  return useMutation({
    mutationFn: async (weeks: InsertionWeek[]) => {
      const new_weeks = await AddWeeks(weeks);
      return weeks;
    },
    onSuccess: (newWeeks) => {
      // key i
      const old_weeks = queryClient.getQueryData<FetchedWeek[]>(
        getKey(newWeeks[0].year_id)
      );

      if (!old_weeks) {
        return;
      }

      const weeks_now = [...old_weeks, ...newWeeks];

      queryClient.setQueryData(getKey(newWeeks[0].year_id), weeks_now);
    },
  });
}

const getWeeks = async (year_id: string) => {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/weeks/${year_id}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!res.ok) {
    throw new Error('Network response was not okay');
  }

  const data = await res.json();

  console.log('dat retreeve', data);

  type WeekFromServer = FetchedWeek & {
    start_date: string;
    end_date: string;
  };

  const weeks: FetchedWeek = data.map((week: WeekFromServer) => {
    return {
      week_id: week.week_id,
      year_id: week.year_id,
      week_name: week.week_name,
      start_date: new Date(week.start_date),
      end_date: new Date(week.end_date),
    };
  });

  return weeks;

  //return data;

  return res.json();
};

export function useGetWeeks(
  year_id: string
): UseQueryResult<FetchedWeek[], unknown> {
  return useQuery({
    queryKey: getKey(year_id),
    queryFn: () => getWeeks(year_id),
  });
}

const deleteWeek = async (week_id: string, year_id: string) => {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/weeks/${week_id}/${year_id}`;

  console.log('Year ID DElete', year_id);

  const res = await fetch(url, {
    method: 'DELETE',
  });

  if (!res.ok) {
    console.log('res week not okay', res);
    throw new Error('Network response was not okay');
  }

  return {
    week_id,
    year_id,
  };

  //return res.json();
};

export function useDeleteWeek() {
  return useMutation({
    mutationFn: async ({
      week_id,
      year_id,
    }: {
      week_id: string;
      year_id: string;
    }) => {
      const deletedWeek = await deleteWeek(week_id, year_id);
      console.log('deletedWeek', deletedWeek);
      return {
        week_id,
        year_id,
      };
    },
    onSuccess: (deletedWeek) => {
      console.log('Succesfully Deleted Week', deletedWeek);
      const weeks = queryClient.getQueryData<FetchedWeek[]>(
        getKey(deletedWeek.year_id)
      );

      console.log('weeks', weeks);

      if (!weeks) {
        return;
      }

      const newWeeks = weeks.filter(
        (week) => week.week_id !== deletedWeek.week_id
      );

      console.log('newWeeks', newWeeks);
      console.log('deletedWeek.year_id', deletedWeek.year_id);
      console.log('weeks', weeks);

      queryClient.setQueryData(getKey(deletedWeek.year_id), newWeeks);
    },
  });
}

const getWeeksForCurrentYear = async () => {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/weeks/current_year`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!res.ok) {
    throw new Error('Network response was not okay');
  }

  type ServerResponseWeek = FetchedWeek & {
    start_date: string;
    end_date: string;
  };

  const data = (await res.json()) as ServerResponseWeek[];

  console.log('data', data);

  const weeks: FetchedWeek[] = data.map((week) => {
    return {
      week_id: week.week_id,
      year_id: week.year_id,
      week_name: week.week_name,
      start_date: new Date(week.start_date),
      end_date: new Date(week.end_date),
    };
  });

  console.log('weeks', weeks);

  return weeks;
};

export function useGetWeeksForCurrentYear(): UseQueryResult<
  FetchedWeek[],
  unknown
> {
  return useQuery({
    queryKey: ['weeks', 'current_year'],
    queryFn: getWeeksForCurrentYear,
  });
}
