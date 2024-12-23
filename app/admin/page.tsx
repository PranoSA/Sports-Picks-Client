/**
 *
 *
 * This page you add seasons
 *
 * Just have it be a form that takes in the year
 * then makes the season
 * that year - year + 1
 */
'use client';

import { useEffect, useState } from 'react';

import queryClient from '@/queries/queryclient';
import { QueryClientProvider } from '@tanstack/react-query';

import { useGetYears, useAddYear, useDeleteYear } from '@/queries/years';
import { FetchedYear, InsertionYear } from '@/types/bets_and_odds';

import Link from 'next/link';
import { FaTrash } from 'react-icons/fa';

const PageWithQuery = () => {
  //wraps Page component with useQuery
  return (
    <QueryClientProvider client={queryClient}>
      <Page />
    </QueryClientProvider>
  );
};

const Page: React.FC = () => {
  const [year, setYear] = useState<string>('');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());

  const { data: years, isLoading, isError, error } = useGetYears();

  const [yearsToAdd, setYearsToAdd] = useState<InsertionYear[]>([]);

  const [repeatAmount, setRepeatAmount] = useState<number>(1);

  const addYear = useAddYear();

  //set to dark mode
  useEffect(() => {
    document.body.classList.add('dark');
  }, []);

  type CheckYearResponse = {
    interferes: boolean;
    interfering_year: FetchedYear | null;
  };

  const checkNoYearInterferesWithNewYear = (): CheckYearResponse => {
    //check every
    if (!years) return { interferes: true, interfering_year: null };

    //now check every year
    for (const year of years) {
      if (year.start_date <= startDate && year.end_date >= startDate) {
        return {
          interferes: true,
          interfering_year: year,
        };
      }

      if (year.start_date <= endDate && year.end_date >= endDate) {
        return {
          interferes: true,
          interfering_year: year,
        };
      }
    }

    return {
      interferes: false,
      interfering_year: null,
    };
  };

  const insertYearsWithRepeat = () => {
    // take the year and repeat ammount
    // loop through the repeat amount, incrementing the start_date and end_date by 1 year each time
    // name each year the Year - Year + 1 value of the start_date
    // add the year to the yearsToAdd array

    const last_start_date = new Date(startDate);
    const last_end_date = new Date(endDate);

    const yearsToAdd: InsertionYear[] = [];

    for (let i = 0; i < repeatAmount; i++) {
      const new_year: InsertionYear = {
        year_id: `${last_start_date.getFullYear()}-${last_end_date.getFullYear()}`,
        start_date: new Date(last_start_date),
        end_date: new Date(last_end_date),
      };

      yearsToAdd.push(new_year);

      last_start_date.setFullYear(last_start_date.getFullYear() + 1);
      last_end_date.setFullYear(last_end_date.getFullYear() + 1);
    }
    return yearsToAdd;
  };

  //submit years to add
  const submitYears = async () => {
    const yearsToAdd = insertYearsWithRepeat();

    //check if any years interfere with the new years
    for (const year of yearsToAdd) {
      const { interferes, interfering_year } =
        checkNoYearInterferesWithNewYear();
      if (interferes) {
        console.log('interferes with year:', interfering_year);
        alert('Interferes with year: ' + interfering_year?.year_id);
        return;
      }
    }

    //console.log(yearsToAdd);
    await addYear.mutateAsync(yearsToAdd);
  };

  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  return (
    <div className="flex flex-col items-center p-4">
      <h1 className="text-2xl font-bold mb-4">Add Season</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submitYears();
        }}
        className="flex flex-col gap-4 w-full max-w-md"
      >
        <input
          type="text"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          placeholder="Year"
          className="p-2 border rounded dark:bg-gray-800 dark:text-gray-200"
        />
        <div className="flex gap-4">
          <div className="flex flex-col w-1/2">
            <label className="mb-2">Start Date</label>
            <input
              type="date"
              value={formatDate(startDate)}
              onChange={(e) => setStartDate(new Date(e.target.value))}
              className="p-2 border rounded dark:bg-gray-800 dark:text-gray-200"
            />
          </div>
          <div className="flex flex-col w-1/2">
            <label className="mb-2">End Date</label>
            <input
              type="date"
              value={formatDate(endDate)}
              onChange={(e) => setEndDate(new Date(e.target.value))}
              className="p-2 border rounded dark:bg-gray-800 dark:text-gray-200"
            />
          </div>
        </div>
        <input
          type="number"
          value={repeatAmount}
          onChange={(e) => setRepeatAmount(parseInt(e.target.value))}
          placeholder="Repeat Amount"
          className="p-2 border rounded dark:bg-gray-800 dark:text-gray-200"
        />
        <button type="submit" className="p-2 bg-blue-500 text-white rounded">
          Add
        </button>
      </form>
      <div className="mt-8 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">List of Seasons</h2>
        <ListOfYears />
      </div>
    </div>
  );
};

const ListOfYears: React.FC = () => {
  const { data: years, isLoading, isError, error } = useGetYears();

  const deleteYear = useDeleteYear();

  const handleDelete = async (year_id: string) => {
    await deleteYear.mutateAsync(year_id);
  };

  //
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error: {error.stack}</div>;
  }

  if (!years) {
    return <div>No years found</div>;
  }

  const current_year = years.find((year) => {
    const current_date = new Date();
    return (
      new Date(year.start_date) <= current_date &&
      new Date(year.end_date) >= current_date
    );
  });

  return (
    <div className="space-y-4">
      {years.map((year) => (
        <div
          key={year.year_id}
          className={`p-4 border-4  rounded dark:bg-gray-800 dark:text-gray-200  ${
            current_year?.year_id === year.year_id
              ? 'border-neonGreen'
              : 'border-gray-500'
          }`}
        >
          <h2 className="text-lg font-semibold">{year.year_id}</h2>
          <p>
            {' '}
            {year.start_date.toDateString()} - {year.end_date.toDateString()}
          </p>
          <div className="flex flex-row justify-around">
            <div
              className="flex flex-row space-y-2 p-2 cursor-pointer dark:text-red"
              onClick={() => handleDelete(year.year_id)}
            >
              <FaTrash className="mr-2 dark:text-red-700" />
              <h2 className="dark:text-red-700"> Delete Year </h2>
            </div>
            <Link href={`/admin/year/${year.year_id}`}>
              <button className="p-2 text-white rounded dark:text-neonPurple">
                <p className="dark:text-neonPurple text-neonPink">
                  {' '}
                  Visit Year{' '}
                </p>
              </button>
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PageWithQuery;
