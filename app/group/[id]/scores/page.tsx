'use client';

import { useGetWeeksForCurrentYear } from '@/queries/weeks';
import { QueryClientProvider } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

import { UserScore, WeekScores, AllScores } from '@/types/bets_and_odds';

import { FaArrowUp, FaArrowDown, FaArrowCircleRight } from 'react-icons/fa';

import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

import seGetScoresForGroup from '@/queries/scores';
/*
This Page will allow you to show th scores of the group members
by week
and total scores

You can select any of the week_ids or select "all" that shows
the total score with a 
week by week graph
*/

import {
  SessionProvider,
  SessionProviderProps,
  signIn,
  signOut,
  useSession,
} from 'next-auth/react';

import queryClient from '@/queries/queryclient';

const PageWithAuthProvider: React.FC<{
  params: {
    id: string;
  };
}> = ({ params }) => {
  const sessionProviderProps: SessionProviderProps = {
    children: <PageWithProvider params={params} />,
  };

  return <SessionProvider {...sessionProviderProps} />;
};

const PageWithProvider: React.FC<{
  params: {
    id: string;
  };
}> = ({ params }) => {
  const { id } = params;
  return (
    <QueryClientProvider client={queryClient}>
      <Page id={id} />
    </QueryClientProvider>
  );
};

const Page: React.FC<{
  id: string;
}> = ({ id }) => {
  const { data: weeks, isLoading, isError } = useGetWeeksForCurrentYear();

  const [selectedWeek, setSelectedWeek] = useState<string>('all');

  const { data: session, status } = useSession();

  const {
    data: groupScores,
    isLoading: isScoresLoading,
    isError: isScoresError,
  } = seGetScoresForGroup(id);

  //filtered weeks memo
  //weeks that have started
  const filteredWeeks = useMemo(() => {
    if (!weeks) return [];
    return weeks.filter((week) => week.start_date < new Date());
  }, [weeks]);

  console.log('groupScores', groupScores);

  const TotalScores = useMemo(() => {
    if (!groupScores) return {};
    // Reduce a map of total scores by user
    const totalScores: { [key: string]: number } = {};

    if (!weeks) return {};

    //filter groupScores basedon the week start date
    const filteredGroupScores = groupScores.filter((weekScores) => {
      const week = weeks.find((week) => week.week_id == weekScores[0].week);

      if (!week) return false;

      return week.start_date < new Date();
    });

    filteredGroupScores.forEach((weekScores: WeekScores) => {
      weekScores.forEach((userScore: UserScore) => {
        const { user_id, score } = userScore;
        if (totalScores[user_id]) {
          totalScores[user_id] += score;
        } else {
          totalScores[user_id] = score;
        }
      });
    });

    return totalScores;
  }, [groupScores, weeks]);

  //now a memo that just reutnrs the score per the selected week
  const scoresByUserForWeek: { [key: string]: number } = useMemo(() => {
    if (!groupScores) return {};

    const scores_for_week = groupScores.find(
      (week_scores) => week_scores[0].week == selectedWeek
    );

    if (!scores_for_week) return {};

    const scores: { [key: string]: number } = {};

    scores_for_week.forEach((userScore: UserScore) => {
      const { user_id, score } = userScore;
      scores[user_id] = score;
    });

    return scores;
  }, [groupScores, selectedWeek]);

  const this_weeks_scores = useMemo(() => {
    //find the last week
    if (!groupScores) return [];

    if (!weeks) return [];

    //find the index of the current week in weeks
    const week_index = weeks?.findIndex((week) => {
      const date = new Date();
      return week.start_date < date && week.end_date > date;
    });

    if (week_index === -1) return [];

    //find the scores for the week
    const scores = groupScores[week_index];

    return scores;
  }, [groupScores, weeks]);

  const this_weeks_potential_scores = useMemo(() => {
    if (!groupScores) return [];

    if (!weeks) return [];

    //find the index of the current week in weeks
    const week_index = weeks?.findIndex((week) => {
      const date = new Date();
      return week.start_date < date && week.end_date > date;
    });

    if (week_index === -1) return [];

    //find from the raw data the potential
    const this_weeks_scores = groupScores[week_index];

    const scores_potential = this_weeks_scores.map((user_score) => {
      const { user_id, score, week, potential } = user_score;
      const potential_score = potential;
      return {
        user_id,
        score: potential_score,
        week,
        potential: potential_score,
      };
    });

    return scores_potential;
  }, [groupScores, weeks]);

  if (!session) {
    return (
      <div className="grid place-items-center h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md">
          <h1 className="text-3xl font-bold mb-4">
            Welcome to Sports Betting App
          </h1>
          <p className="mb-6">
            This app allows you to create groups, make choices, and track your
            bets. Join now and start making your picks!
          </p>
          <button
            onClick={() => signIn('keycloak')}
            className="p-4 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition duration-300"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error: </div>;
  }

  if (!groupScores) {
    return <div>No scores found</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Scores</h1>
      <select
        value={selectedWeek}
        onChange={(e) => setSelectedWeek(e.target.value)}
      >
        <option value="all">All</option>
        {filteredWeeks?.map((week) => (
          <option key={week.week_id} value={week.week_id}>
            {week.week_id}
          </option>
        ))}
      </select>
      {/* Now Show the scores */}
      <div>
        {selectedWeek === 'all' ? (
          <AllScoresComponent scores={TotalScores} />
        ) : (
          <WeekScoresComponent scores={scoresByUserForWeek} />
        )}
      </div>

      <ScoreGChart
        last_weeks_scores={this_weeks_scores}
        this_weeks_scores={this_weeks_scores}
        All_Scores={groupScores}
        this_weeks_potential_scores={this_weeks_potential_scores}
      />

      <ScoreGraph scores={groupScores} />
    </div>
  );
};

const AllScoresComponent: React.FC<{ scores: { [key: string]: number } }> = ({
  scores,
}) => {
  return (
    <div>
      <h2>Total Scores</h2>
      <ul>
        {Object.entries(scores).map(([user_id, score]) => (
          <li key={user_id}>
            {user_id}: {score}
          </li>
        ))}
      </ul>
    </div>
  );
};

//ScoresWeekComponent shows the scores for the selected week {so same arguments of ALlScoresComponent}
const WeekScoresComponent: React.FC<{ scores: { [key: string]: number } }> = ({
  scores,
}) => {
  return (
    <div>
      <h2>Week Scores</h2>
      <ul>
        {Object.entries(scores).map(([user_id, score]) => (
          <li key={user_id}>
            {user_id}: {score}
          </li>
        ))}
      </ul>
    </div>
  );
};

const ScoreGChart: React.FC<{
  last_weeks_scores: WeekScores;
  this_weeks_scores: WeekScores;
  All_Scores: AllScores;
  this_weeks_potential_scores: WeekScores;
}> = ({
  last_weeks_scores,
  this_weeks_scores,
  All_Scores,
  this_weeks_potential_scores,
}) => {
  const unsorted_users = Array.from(
    new Set(All_Scores.flat().map((d) => d.user_id))
  ).sort();

  console.log('this_weeks_scores', this_weeks_scores);
  console.log('last_weeks_scores', last_weeks_scores);
  console.log('All_Scores', All_Scores);

  const scores_by_user: { [key: string]: number[] } = {};

  unsorted_users.forEach((user) => {
    scores_by_user[user] = [];
    let cumulative_score = 0;
    All_Scores.forEach((week_scores) => {
      const user_score = week_scores.find((d) => d.user_id === user);
      if (user_score) {
        cumulative_score += user_score.score;
      }
      scores_by_user[user].push(cumulative_score);
    });
  });
  //sort by c
  const users = unsorted_users.sort((a, b) => {
    return (
      scores_by_user[b][scores_by_user[b].length - 1] -
      scores_by_user[a][scores_by_user[a].length - 1]
    );
  });

  //const scores as of last week, by getting the cummulativescores
  //and subtracting the last week
  const scores_last_week_unsorted: { [key: string]: number } = {};

  users.forEach((user) => {
    const last_week_score = last_weeks_scores.find((d) => d.user_id === user);
    if (last_week_score) {
      scores_last_week_unsorted[user] = last_week_score.score;
    } else {
      scores_last_week_unsorted[user] = 0;
    }
  });

  const scores_last_week = Object.fromEntries(
    Object.entries(scores_last_week_unsorted).sort(([, a], [, b]) => b - a)
  );

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Score Chart</h2>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full bg-white text-black">
          <thead>
            <tr>
              <th className="py-2 px-4 bg-gray-200 text-left">Username</th>
              <th className="py-2 px-4 bg-gray-200 text-left">Score</th>
              <th className="py-2 px-4 bg-gray-200 text-left">Weekly Score</th>
              {/* Potential Points For Week*/}
              <th className="py-2 px-4 bg-gray-200 text-left">
                Potential Points
              </th>
              <th className="py-2 px-4 bg-gray-200 text-left">Rank Change</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              //get the place of the user from last week
              //1 is the best, 2 is the second best
              //and so on
              const this_weeks_placement = users.indexOf(user) + 1;

              const last_weeks_placement =
                Object.keys(scores_last_week).findIndex((d) => d === user) + 1;

              const movement = this_weeks_placement - last_weeks_placement;

              const scoreChange = movement;

              const potential_points_this_week =
                this_weeks_potential_scores.find(
                  (d) => d.user_id === user
                )?.score;

              return (
                <tr key={user}>
                  <td className="py-2 px-4 border-b border-gray-200">{user}</td>
                  <td className="py-2 px-4 border-b border-gray-200">
                    {scores_by_user[user][scores_by_user[user].length - 1]}
                  </td>
                  <td className="py-2 px-4 border-b border-gray-200">
                    {this_weeks_scores.find((d) => d.user_id === user)?.score}
                  </td>
                  <td className="py-2 px-4 border-b border-gray-200">
                    {potential_points_this_week}
                  </td>

                  <td className="py-2 px-4 border-b border-gray-200">
                    {scoreChange > 0 ? (
                      <>
                        <FaArrowUp className="text-green-500 mr-1 text-green" />
                        <span>{scoreChange}</span>
                      </>
                    ) : scoreChange < 0 ? (
                      <>
                        <FaArrowDown className="text-red-500 mr-1 text-red" />
                        <span>{Math.abs(scoreChange)}</span>
                      </>
                    ) : (
                      <>
                        <FaArrowCircleRight className="text-gray-500 mr-1" />
                        <span>{scoreChange}</span>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ScoreGraph: React.FC<{ scores: AllScores }> = ({ scores }) => {
  const users = Array.from(new Set(scores.flat().map((d) => d.user_id))).sort();

  const {
    data: weeks,
    isLoading: weeksLoading,
    isError: weeksError,
  } = useGetWeeksForCurrentYear();

  const cumulativeScores: { [key: string]: number[] } = {};
  users.forEach((user) => {
    cumulativeScores[user] = [];
    let cumulativeScore = 0;
    scores.forEach((weekScores) => {
      const userScore = weekScores.find((d) => d.user_id === user);
      if (userScore) {
        cumulativeScore += userScore.score;
      }
      cumulativeScores[user].push(cumulativeScore);
    });
  });

  const data = {
    labels: scores.map((s, index) => {
      if (weeksLoading) return 'loading';
      if (!weeks) return 'loading';
      const week_for_score = weeks.find((week) => week.week_id == s[0].week);
      if (!week_for_score) return 'loading';

      return week_for_score.start_date.toLocaleDateString();
    }),
    datasets: users.map((user, index) => ({
      label: user,
      data: cumulativeScores[user],
      borderColor: `hsl(${(index * 360) / users.length}, 70%, 50%)`,
      backgroundColor: `hsl(${(index * 360) / users.length}, 70%, 50%, 0.5)`,
      fill: false,
      //set height to 500px
      height: 250,
    })),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Cumulative Scores by Week',
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Week',
        },
      },
      y: {
        min: 0,
        title: {
          display: true,
          text: 'Cumulative Score',
        },
      },
    },
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Score Graph</h2>
      <div className="" style={{ height: 500 }}>
        <Line data={data} options={options} height={300} />
      </div>
    </div>
  );
};

export default PageWithAuthProvider;
