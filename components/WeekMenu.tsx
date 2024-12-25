import { FetchedGroup, FetchedWeek } from '@/types/bets_and_odds';
import { useGetWeeks } from '../queries/weeks';

import Link from 'next/link';

type WeekMenuProps = {
  group: FetchedGroup;
};

import { useGetWeeksForCurrentYear } from '@/queries/weeks';
import { FaCheckCircle, FaClipboardList, FaClock } from 'react-icons/fa';
import { use, useMemo, useState, useEffect } from 'react';

//get games by week
import { useGetGamesByWeek } from '@/queries/games';

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

  const [current_time, set_current_time] = useState(new Date());

  type WeekStartsIn = {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  };

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
      {weeks.map((week, index) => {
        const isPast = new Date(week.end_date) < now;
        const isCurrent =
          new Date(week.start_date) <= now && new Date(week.end_date) >= now;
        const isFuture = new Date(week.start_date) > now;

        let bgColor = 'bg-gray-200';
        let buttonText = 'Results';
        let buttonIcon = <FaClipboardList />;
        let buttonLink = `/group/${group.group_id}/${week.week_id}/results`;

        if (isCurrent) {
          bgColor = 'bg-yellow-200';
          buttonText = 'Make Picks';
          buttonIcon = <FaCheckCircle />;
          buttonLink = `/group/${group.group_id}/picks`;
        } else if (isFuture) {
          bgColor = 'bg-blue-200';
          buttonText = 'Upcoming';
          buttonIcon = <FaClock />;
          buttonLink = '#';
        }

        return (
          <div
            key={week.week_id}
            className={`p-4 border rounded ${bgColor} shadow-md`}
          >
            <h1 className="text-xl font-bold">{week.week_name}</h1>
            <h2 className="text-md mb-2">
              {new Date(week.start_date).toDateString()} -{' '}
              {new Date(week.end_date).toDateString()}
            </h2>
            <div className="flex gap-4">
              <Link href={buttonLink}>
                {buttonIcon}
                <span className="ml-2">{buttonText}</span>
              </Link>
              {isPast && (
                <Link href={`/group/${group.group_id}/${week.week_id}/results`}>
                  <FaClipboardList />
                  <span className="ml-2">Results</span>
                </Link>
              )}

              {/* If in future, show an clock with days, hours, minutes, seconds */}
              {isFuture && week_starts_in && (
                <div>
                  <FaClock />
                  <span className="ml-2">
                    Make Picks In {week_starts_in[index].days} days,{' '}
                    {week_starts_in[index].hours} hours,{' '}
                    {week_starts_in[index].minutes} minutes,{' '}
                    {week_starts_in[index].seconds} seconds
                  </span>
                </div>
              )}
              <WeekMenuComponent week={week} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

const WeekMenuComponent: React.FC<{ week: FetchedWeek }> = ({ week }) => {
  /* get games for the week */
  const { data: games, isLoading, isError } = useGetGamesByWeek(week.week_id);

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
      <div>
        <div>
          <h2>Games Started: {games_started.length}</h2>
          <h2>Games Pending: {games_pending.length}</h2>
          <h2>Games Completed: {games_completed.length}</h2>
          <h2>Total Games: {total_games}</h2>
        </div>
      </div>
    </div>
  );
};
export default WeekMenu;
