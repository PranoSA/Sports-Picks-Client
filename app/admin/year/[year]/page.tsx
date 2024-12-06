'use client';
import Link from 'next/link';
/*
    This Will Be WHere the Admin Can add 

    Years
    And
    Weeks to Year 

    And set the time in local time zone of start / end dates of week


*/

import { useEffect, useState } from 'react';

//trash icon
import { FaTrash, FaPlus, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
//import "go to" or "visit" icon
import { FaArrowRight } from 'react-icons/fa';

import { useAddWeeks, useGetWeeks, useDeleteWeek } from '@/queries/weeks';
import { FetchedWeek, InsertionWeek } from '@/types/bets_and_odds';

//Page With Provider will wrap page with useQueryClientProvider
import { QueryClientProvider } from '@tanstack/react-query';
import queryClient from '@/queries/queryclient';

const PageWithQuery = ({
  params,
}: {
  params: {
    year: string;
  };
}) => {
  //wraps Page component with useQuery
  return (
    <QueryClientProvider client={queryClient}>
      <Page params={params} />
    </QueryClientProvider>
  );
};

const Page: React.FC<{
  params: {
    year: string;
  };
}> = ({ params: { year } }) => {
  const { data: weeks, isLoading, isError, error } = useGetWeeks(year);

  const addWeeks = useAddWeeks();

  const [newWeek, setNewWeek] = useState<InsertionWeek>({
    year_id: year,
    week_id: '',
    start_date: new Date(),
    end_date: new Date(),
    week_name: '',
  });

  const [autoAddWeeks, setAutoAddWeeks] = useState<boolean>(false);
  const [autoAddNumber, setAutoAddNumber] = useState<number>(1);

  const [auto1Week, setAuto1Week] = useState<boolean>(false);

  useEffect(() => {
    if (auto1Week) {
      const end_date = new Date(newWeek.start_date);
      //add 6days, 23hours, 59minutes, 59seconds
      end_date.setDate(end_date.getDate() + 6);
      end_date.setHours(end_date.getHours() + 23);
      end_date.setMinutes(end_date.getMinutes() + 59);
      end_date.setSeconds(end_date.getSeconds() + 59);

      setNewWeek({
        ...newWeek,
        end_date: end_date,
      });
    }
  }, [auto1Week, newWeek]);

  const addWeek = async () => {
    if (autoAddWeeks) {
      const newWeeks = Array.from({ length: autoAddNumber }, (_, index) => {
        const start = new Date(newWeek.start_date);
        start.setDate(start.getDate() + 7 * index);
        const end = new Date(newWeek.end_date);
        end.setDate(end.getDate() + 7 * index);
        return {
          ...newWeek,
          start_date: start,
          end_date: end,
          week_id: `${start.toISOString()}-${end.toISOString()}`,
          week_name: `${newWeek.week_name} ${index + 1}`,
        };
      });
      addWeeks.mutate(newWeeks);
    } else {
      addWeeks.mutate([newWeek]);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error: </div>;
  }

  if (!weeks) {
    return <div>No Weeks Found</div>;
  }

  return (
    <div className="p-4 flex flex-col items-center">
      <form
        className="w-full max-w-lg flex flex-col gap-4 mb-4 p-4 bg-white dark:bg-gray-800 rounded shadow-md"
        onSubmit={(e) => {
          e.preventDefault();
          addWeek();
        }}
      >
        <div className="flex flex-col">
          <label className="mb-2">Week week_name</label>
          <input
            className="p-2 border rounded dark:text-gray-800"
            type="text"
            placeholder="Week week_name"
            value={newWeek.week_name}
            onChange={(e) =>
              setNewWeek({ ...newWeek, week_name: e.target.value })
            }
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-2">Start Date</label>
          <input
            className="p-2 border rounded dark:text-gray-800"
            type="date"
            value={newWeek.start_date.toISOString().split('T')[0]}
            onChange={(e) =>
              setNewWeek({ ...newWeek, start_date: new Date(e.target.value) })
            }
          />
        </div>
        {auto1Week ? (
          <div></div>
        ) : (
          <div className="flex flex-col">
            <label className="mb-2">End Date</label>
            <input
              className="p-2 border rounded dark:text-gray-800"
              type="date"
              value={newWeek.end_date.toISOString().split('T')[0]}
              onChange={(e) =>
                setNewWeek({ ...newWeek, end_date: new Date(e.target.value) })
              }
            />
            {/* Button to toggle auto 1 week */}
            <button
              className="p-2 bg-blue-500 text-white rounded"
              onClick={() => setAuto1Week(true)}
            >
              Auto 1 Week
            </button>
          </div>
        )}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={autoAddWeeks}
            onChange={() => setAutoAddWeeks(!autoAddWeeks)}
          />
          <label>Auto Add Weeks</label>
        </div>
        {autoAddWeeks && (
          <div className="flex flex-col">
            <label className="mb-2">Number of Weeks</label>
            <input
              className="p-2 border rounded dark:text-gray-800"
              type="number"
              min="1"
              value={autoAddNumber}
              onChange={(e) => setAutoAddNumber(parseInt(e.target.value, 10))}
            />
          </div>
        )}
        <button className="p-2 bg-green-500 text-white rounded" type="submit">
          Add Week
        </button>
      </form>
      <WeekDisplay year_id={year} />
    </div>
  );
};

const WeekDisplay: React.FC<{ year_id: string }> = ({ year_id }) => {
  const { data: weeks, isLoading, isError, error } = useGetWeeks(year_id);

  const deleteWeek = useDeleteWeek();

  const [editedWeek, setEditedWeek] = useState<null | FetchedWeek>(null);

  //set to dark mode
  useEffect(() => {
    document.body.classList.add('dark');
  }, []);

  const setweek_name = (week_name: string) => {
    if (!editedWeek) {
      return;
    }
    setEditedWeek({ ...editedWeek, week_name });
  };

  const submitChangedWeek = () => {
    if (!editedWeek) {
      return;
    }
    console.log(editedWeek);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error:</div>;
  }

  if (!weeks) {
    return <div>No Weeks Found</div>;
  }

  return (
    <div className="p-4 flex flex-col items-center">
      <h1 className="text-xl mb-4">Weeks for Year {year_id}</h1>
      <ul className="space-y-4 w-full max-w-lg">
        {weeks.map((week, index) => (
          <li
            key={index}
            className="p-4 border rounded flex justify-between items-center bg-white dark:bg-gray-800 shadow-md"
          >
            <span>
              {week.week_name} ({week.start_date.toDateString()} -{' '}
              {week.end_date.toDateString()})
            </span>

            <Link
              href={`/admin/year/${year_id}/week/${week.week_id}`}
              className="p-4"
            >
              <FaArrowRight
                className=" text-white  dark:text-neonPurple cursor-pointer"
                size={32}
              />
            </Link>
            <button
              className="p-2 bg-red-500 text-white rounded"
              onClick={() =>
                deleteWeek.mutate({ week_id: week.week_id, year_id })
              }
            >
              <FaTrash />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PageWithQuery;
