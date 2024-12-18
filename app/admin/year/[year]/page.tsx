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

  type WeekInterferesResponse = {
    interferes: boolean;
    interfering_week: FetchedWeek | null;
  };

  const checkNoWeekInterferesWithNewWeek = (): WeekInterferesResponse => {
    //check every
    if (!weeks) return { interferes: true, interfering_week: null };

    //now check every week
    for (const week of weeks) {
      if (
        week.start_date <= newWeek.start_date &&
        week.end_date >= newWeek.start_date
      ) {
        return {
          interferes: true,
          interfering_week: week,
        };
      }

      if (
        week.start_date <= newWeek.end_date &&
        week.end_date >= newWeek.end_date
      ) {
        return {
          interferes: true,
          interfering_week: week,
        };
      }
    }

    return {
      interferes: false,
      interfering_week: null,
    };
  };

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

      //check if any weeks interfere
      for (const week of newWeeks) {
        const { interferes, interfering_week } =
          checkNoWeekInterferesWithNewWeek();
        if (interferes) {
          console.log(
            `Week ${week.week_name} interferes with ${interfering_week?.week_name}`
          );
          alert(
            `Week ${week.week_name} interferes with ${interfering_week?.week_name}`
          );
          return;
        }
      }

      addWeeks.mutate(newWeeks);
    } else {
      //check if any weeks interfere
      const { interferes, interfering_week } =
        checkNoWeekInterferesWithNewWeek();

      if (interferes) {
        console.log(
          `Week ${newWeek.week_name} interferes with ${interfering_week?.week_name}`
        );
        alert(
          `Week ${newWeek.week_name} interferes with ${interfering_week?.week_name}`
        );
        return;
      }

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
    <div className="p-4 flex flex-col items-center dark:bg-gray-900 min-h-screen">
      <form
        className="w-full max-w-lg flex flex-col gap-4 mb-4 p-4 bg-gray-800 text-gray-100 rounded shadow-md"
        onSubmit={(e) => {
          e.preventDefault();
          addWeek();
        }}
      >
        <div className="flex flex-col">
          <label className="mb-2">Week Name</label>
          <input
            className="p-2 border rounded bg-gray-700 text-gray-100"
            type="text"
            placeholder="Week Name"
            value={newWeek.week_name}
            onChange={(e) =>
              setNewWeek({ ...newWeek, week_name: e.target.value })
            }
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-2">Start Date</label>
          <input
            className="p-2 border rounded bg-gray-700 text-gray-100"
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
              className="p-2 border rounded bg-gray-700 text-gray-100"
              type="date"
              value={newWeek.end_date.toISOString().split('T')[0]}
              onChange={(e) =>
                setNewWeek({ ...newWeek, end_date: new Date(e.target.value) })
              }
            />
            {/* Button to toggle auto 1 week */}
            <button
              className="p-2 mt-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-300"
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
            className="form-checkbox h-5 w-5 text-blue-600"
          />
          <label>Auto Add Weeks</label>
        </div>
        {autoAddWeeks && (
          <div className="flex flex-col">
            <label className="mb-2">Number of Weeks</label>
            <input
              className="p-2 border rounded bg-gray-700 text-gray-100"
              type="number"
              min="1"
              value={autoAddNumber}
              onChange={(e) => setAutoAddNumber(parseInt(e.target.value, 10))}
            />
          </div>
        )}
        <button
          className="p-2 bg-green-500 text-white rounded hover:bg-green-600 transition duration-300"
          type="submit"
        >
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
    <div className="p-4 flex flex-col items-center dark:bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
        Weeks for Year {year_id}
      </h1>
      <ul className="space-y-4 w-full max-w-lg">
        {weeks.map((week, index) => (
          <li
            key={index}
            className="p-4 border rounded flex justify-between items-center bg-white dark:bg-gray-800 shadow-md"
          >
            <span className="text-gray-900 dark:text-gray-100">
              {week.week_name} ({week.start_date.toDateString()} -{' '}
              {week.end_date.toDateString()})
            </span>
            <div className="flex items-center space-x-4">
              <Link
                href={`/admin/year/${year_id}/week/${week.week_id}`}
                className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-300"
              >
                <FaArrowRight size={16} />
              </Link>
              <button
                className="p-2 bg-red-500 text-white rounded hover:bg-red-600 transition duration-300"
                onClick={() =>
                  deleteWeek.mutate({ week_id: week.week_id, year_id })
                }
              >
                <FaTrash size={16} />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PageWithQuery;
