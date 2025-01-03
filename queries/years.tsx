/**
 *
 * React Query for years
 *
 *
 * key: 'years'
 *
 *
 */

import { useQuery, useMutation } from '@tanstack/react-query';

import { FetchedYear, InsertionYear } from '@/types/bets_and_odds';

import queryClient from './queryclient';

const getToken = () => {
  return localStorage.getItem('accessToken');
};

export function useGetYears() {
  return useQuery<FetchedYear[]>({
    queryKey: ['years'],
    queryFn: async () => {
      const new_years = await fetchYears();
      return new_years;
    },
  });
}

const fetchYears = async (): Promise<FetchedYear[]> => {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/years`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  // if the response is not ok, throw an error
  if (!res.ok) {
    throw new Error('Network response was not ok');
  }

  type YearFromServer = FetchedYear & { start_date: string; end_date: string };

  const years_with_string_dates = (await res.json()) as YearFromServer[];

  // convert the string dates to Date objects
  const years = years_with_string_dates.map((year) => {
    return {
      ...year,
      start_date: new Date(year.start_date),
      end_date: new Date(year.end_date),
    };
  });

  return years;

  //return res.json();
};

const addYears = async (years: InsertionYear[]): Promise<FetchedYear[]> => {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/years`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(years),
  });

  // if the response is not ok, throw an error
  if (!res.ok) {
    throw new Error('Network response was not ok');
  }

  return res.json();
};

// now -> mutation to add a year
export function useAddYear() {
  return useMutation({
    mutationFn: (years: InsertionYear[]) => {
      const new_year = addYears(years);
      return new_year;
    },
    // on success, update the "years" query-> but don't fetch again
    onSuccess: async (newYear) => {
      const added_year = newYear;

      const old_years = queryClient.getQueryData(['years']) as FetchedYear[];

      queryClient.setQueryData(['years'], [...old_years, ...added_year]);
    },
  });
}

// Delete a year {year_id}
const deleteYear = async (year_id: string): Promise<InsertionYear> => {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/years/${year_id}`;

  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  // if the response is not ok, throw an error
  if (!res.ok) {
    throw new Error('Network response was not ok');
  }

  return res.json();
};

// now -> mutation to delete a year
export function useDeleteYear() {
  return useMutation({
    mutationFn: async (year_id: string) => {
      const deleted_year = await deleteYear(year_id);
      return deleted_year;
    },
    // on success, update the "years" query-> but don't fetch again
    onSuccess: async (deleted_year) => {
      const old_years = queryClient.getQueryData(['years']) as FetchedYear[];

      queryClient.setQueryData(
        ['years'],
        old_years.filter((year) => year.year_id !== deleted_year.year_id)
      );
    },
  });
}
