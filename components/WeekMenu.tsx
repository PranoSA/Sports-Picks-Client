import {
  FetchedGroup,
  FetchedWeek,
  FetchedChoice,
  Bet,
} from '@/types/bets_and_odds';
import { useGetWeeks } from '../queries/weeks';

import Link from 'next/link';

type WeekMenuProps = {
  group: FetchedGroup;
};

import { useGetWeeksForCurrentYear } from '@/queries/weeks';
import {
  FaArrowDown,
  FaArrowUp,
  FaCheckCircle,
  FaClipboardList,
  FaClock,
  FaTimes,
} from 'react-icons/fa';
import { use, useMemo, useState, useEffect } from 'react';

//get games by week
import { useGetGamesByWeek } from '@/queries/games';
import { useGetGroupById } from '@/queries/groups';

//get bets placed by user
import { useGetPicks } from '@/queries/picks';

/**
 *
 * Here is how week menu will look ->
 *
 * You get a List of Fetched Weeeks
 *
 * FOr Every week with the end_date < today, you will have a "View Results" Button
 *
 * For Every week with the start_date <today and end_date > today, you will have a "Make Picks" Button
 *
 * For Every week with start_date>today, it will be "grayed out" and "upcoming" with a
 * timer to the start_date
 *
 *The Pick Links will be to the /group/:group_id/picks  
    The Results Links will be to the /group/:group_id/:week_id/results

 */

const WeekMenu: React.FC<WeekMenuProps> = ({ group }) => {
  const { data: weeks, isLoading, isError } = useGetWeeksForCurrentYear();
  const [showSummaryOfSelectedWeek, setShowSummaryOfSelectedWeek] =
    useState<boolean>(false);

  const [showWeekPickInformation, setShowWeekPickInformation] = useState<
    boolean[]
  >([]);

  //change the showWeekPickInformation to be an array of booleans
  //following the weeks
  useEffect(() => {
    if (weeks) {
      setShowWeekPickInformation(weeks.map((week) => false));
    }
  }, [weeks]);

  //query information about group
  const {
    data: group_data,
    isLoading: group_loading,
    isError: group_error,
  } = useGetGroupById(group.group_id);

  const {
    data: picks,
    isLoading: picks_loading,
    isError: picks_error,
  } = useGetPicks(group.group_id);

  const [current_time, set_current_time] = useState(new Date());

  type WeekStartsIn = {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  };

  const presentWeek = useMemo(() => {
    if (!weeks) {
      return;
    }
    return weeks.find((week) => {
      return (
        new Date(week.start_date) <= current_time &&
        new Date(week.end_date) >= current_time
      );
    });
  }, [current_time, weeks]);

  const future_weeks = useMemo(() => {
    if (!weeks) {
      return;
    }
    return weeks.filter((week) => {
      return new Date(week.start_date) > current_time;
    });
  }, [current_time, weeks]);

  const past_weeks = useMemo(() => {
    if (!weeks) {
      return;
    }
    return weeks.filter((week) => {
      return new Date(week.end_date) < current_time;
    });
  }, [current_time, weeks]);

  useEffect(() => {
    //tick every  second
    const interval = setInterval(() => {
      set_current_time(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const week_starts_in = useMemo(() => {
    const getWeekStartsIn = (week: FetchedWeek): WeekStartsIn => {
      const start_date = new Date(week.start_date);
      const diff = start_date.getTime() - current_time.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      return { days, hours, minutes, seconds };
    };

    if (!weeks) {
      return;
    }
    return weeks.map((week) => {
      return getWeekStartsIn(week);
    });
  }, [current_time, weeks]);

  const current_week_ends_in = useMemo(() => {
    if (!presentWeek) {
      return;
    }
    const end_date = new Date(presentWeek.end_date);
    const diff = end_date.getTime() - current_time.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return { days, hours, minutes, seconds };
  }, [current_time, presentWeek]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error fetching weeks</div>;
  }

  if (!weeks) {
    return <div>No weeks found</div>;
  }
  const now = new Date();

  return (
    <div className="space-y-4 text-black font-black">
      {/* Title : Present Week */}
      <h1 className="text-2xl font-bold dark:text-white text-white">
        Current Week
      </h1>

      {/* Start with display for current week */}

      {presentWeek && (
        <div className="p-4 border rounded bg-yellow-200 shadow-md">
          <h1 className="text-xl font-bold">{presentWeek.week_name}</h1>
          <h2 className="text-md mb-2">
            {new Date(presentWeek.start_date).toDateString()} -{' '}
            {new Date(presentWeek.end_date).toDateString()}
          </h2>
          <div className="flex gap-4 bg-yellow-200">
            <Link href={`/group/${group.group_id}/picks`}>
              <FaCheckCircle />
              <span className="ml-2">Make Picks</span>
            </Link>
          </div>
          {/*Information About when the week ends */}
          {current_week_ends_in && (
            <div>
              <h2 className="text-md mb-2">
                Week Ends In {current_week_ends_in.days} days,{' '}
                {current_week_ends_in.hours} hours,{' '}
                {current_week_ends_in.minutes} minutes,{' '}
                {current_week_ends_in.seconds} seconds
              </h2>
            </div>
          )}
          {/* Include information about the number of games that have started, the number of games that are pending */}
          {showWeekPickInformation && <WeekMenuComponent week={presentWeek} />}
          {showSummaryOfSelectedWeek ? (
            <div className="mt-4">
              <button onClick={() => setShowSummaryOfSelectedWeek(false)}>
                <FaArrowUp className="mr-2" />
              </button>
            </div>
          ) : (
            <div className="mt-4">
              <button onClick={() => setShowSummaryOfSelectedWeek(true)}>
                View Summary of Selections
                <FaArrowDown className="mr-2" />
              </button>
            </div>
          )}
          {showSummaryOfSelectedWeek && (
            <SummaryOfSelectionsPanel group={group} picks={picks || []} />
          )}
        </div>
      )}

      <h1 className="text-2xl font-bold dark:text-white text-white">
        Future Weeks
      </h1>

      {/* Display for future weeks */}
      {future_weeks &&
        future_weeks.map((week, index) => {
          const days_to_start = Math.floor(
            (new Date(week.start_date).getTime() - now.getTime()) /
              (1000 * 60 * 60 * 24)
          );

          const hours_to_start =
            Math.floor(
              (new Date(week.start_date).getTime() - now.getTime()) /
                (1000 * 60 * 60)
            ) -
            days_to_start * 24;

          const minutes_to_start =
            Math.floor(
              (new Date(week.start_date).getTime() - now.getTime()) /
                (1000 * 60)
            ) -
            days_to_start * 24 * 60 -
            hours_to_start * 60;

          const seconds_to_start =
            Math.floor(
              (new Date(week.start_date).getTime() - now.getTime()) / 1000
            ) -
            days_to_start * 24 * 60 * 60 -
            hours_to_start * 60 * 60 -
            minutes_to_start * 60;

          const week_starts_in: WeekStartsIn = {
            days: days_to_start,
            hours: hours_to_start,
            minutes: minutes_to_start,
            seconds: seconds_to_start,
          };

          return (
            <div
              key={week.week_id}
              className="p-4 border rounded bg-blue-200 shadow-md"
            >
              <h1 className="text-xl font-bold">{week.week_name}</h1>
              <h2 className="text-md mb-2">
                {new Date(week.start_date).toDateString()} -{' '}
                {new Date(week.end_date).toDateString()}
              </h2>
              <div className="flex gap-4">
                <div>
                  <FaClock />
                  <span className="ml-2">
                    Make Picks In {week_starts_in.days} days,{' '}
                    {week_starts_in.hours} hours, {week_starts_in.minutes}{' '}
                    minutes, {week_starts_in.seconds} seconds
                  </span>
                </div>
              </div>
              {/* Include information about the number of games that have started, the number of games that are pending */}
              <WeekMenuComponent week={week} />
            </div>
          );
        })}

      <h1 className="text-2xl font-bold dark:text-white text-white">
        Past Weeks
      </h1>

      {/* Display for past weeks */}
      {past_weeks &&
        past_weeks.map((week) => {
          return (
            <div
              key={week.week_id}
              className="p-4 border rounded bg-gray-200 shadow-md"
            >
              <h1 className="text-xl font-bold">{week.week_name}</h1>
              <h2 className="text-md mb-2">
                {new Date(week.start_date).toDateString()} -{' '}
                {new Date(week.end_date).toDateString()}
              </h2>
              <div className="flex gap-4">
                <Link href={`/group/${group.group_id}/${week.week_id}/results`}>
                  <FaClipboardList />
                  <span className="ml-2">Results</span>
                </Link>
              </div>
              {/* Include information about the number of games that have started, the number of games that are pending */}
              <WeekMenuComponent week={week} />
            </div>
          );
        })}
    </div>
  );
};

const WeekMenuComponent: React.FC<{ week: FetchedWeek }> = ({ week }) => {
  /* get games for the week */
  const { data: games, isLoading, isError } = useGetGamesByWeek(week.week_id);

  const [showPickInformation, setShowPickInformation] =
    useState<boolean>(false);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error fetching games</div>;
  }

  if (!games) {
    return <div>No games found</div>;
  }

  //now -> show the number of games that have started, the number of games that are pending
  //and the number of games that are completed, and the total number of games

  const games_started = games.filter((game) => {
    return game.kickoff < new Date();
  });

  const games_pending = games.filter((game) => {
    return game.kickoff < new Date() && !game.finished;
  });

  const games_completed = games.filter((game) => {
    return game.finished === true;
  });

  const total_games = games.length;

  //display this information in a nice way
  return (
    <div>
      <h1>{week.week_name}</h1>
      {showPickInformation ? (
        <button onClick={() => setShowPickInformation(false)}>
          <FaArrowUp className="mr-2" />
        </button>
      ) : (
        <button onClick={() => setShowPickInformation(true)}>
          Show Pick Informaition <FaArrowDown className="mr-2" />
        </button>
      )}
      {showPickInformation && (
        <div>
          <div>
            <h2>Games Started: {games_started.length}</h2>
            <h2>Games Pending: {games_pending.length}</h2>
            <h2>Games Completed: {games_completed.length}</h2>
            <h2>Total Games: {total_games}</h2>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 *
 * Summary of selections will show the bets assigned for the group
 * -> And the picks the user has made
 *
 * If the pick is mad -> Display a checkmark
 * If the pick is not made -> Display a warning
 */

type SummaryOfSelectionsPanelProps = {
  group: FetchedGroup;
  picks: FetchedChoice[];
};

const SummaryOfSelectionsPanel: React.FC<SummaryOfSelectionsPanelProps> = ({
  group,
  picks,
}) => {
  //the list of bets and choices
  //the list of picks made by the user

  const [showSummaryOfSelectedWeek, setShowSummaryOfSelectedWeek] =
    useState<boolean>(false);

  const bets = group.bets;

  type BetWithStatus = Bet & {
    completed_bet: boolean;
  };

  const bets_with_status: BetWithStatus[] = bets.map((bet) => {
    return { ...bet, completed_bet: false };
  });

  picks.forEach((pick) => {
    //find the choice
    const choice = pick.bet_id;

    bets_with_status[choice].completed_bet = true;
  });

  return (
    <div>
      <h1>Summary of Selections</h1>
      {bets_with_status.map((bet) => {
        return (
          <div key={bet.type + bet.num_points} className="flex flex-row">
            <span>
              {bet.type} - {bet.num_points}
            </span>
            <div className="ml-4">
              {bet.completed_bet ? (
                <FaCheckCircle title='"Made Selection' />
              ) : (
                <FaTimes title="No Selection Made" />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default WeekMenu;
