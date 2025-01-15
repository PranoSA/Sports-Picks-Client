'use client';

import { useGetWeeksForCurrentYear } from '@/queries/weeks';
import { QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

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

  useEffect(() => {
    //set local storage bearer token
    if (typeof window !== 'undefined' && session) {
      localStorage.setItem('accessToken', session.accessToken as string);
      //set date_redeemed -> store unix timestamp
      const now_time = Date.now();
      const unix_time = Math.floor(now_time / 1000);

      localStorage.setItem('date_redeemed', unix_time.toString());
    }
  }, [session]);

  const {
    data: groupScoresUnfiltered,
    isLoading: isScoresLoading,
    isError: isScoresError,
  } = seGetScoresForGroup(id);

  const groupScores = useMemo(() => {
    //find index of current week -> This should be the last week
    if (!weeks) return [];

    const last_week_index = weeks?.findIndex((week) => {
      const date = new Date();
      return week.start_date < date && week.end_date > date;
    });

    if (!last_week_index) return [];

    if (last_week_index === -1) return [];

    if (!groupScoresUnfiltered) return [];

    //trim weeKScores to only include weeks that have started
    const meaningful_scores = groupScoresUnfiltered.slice(
      0,
      last_week_index + 1
    );

    return meaningful_scores;
  }, [groupScoresUnfiltered, weeks]);

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

  const scores_two_weeks_ago: WeekScores = useMemo(() => {
    if (!groupScores) return [];

    if (!weeks) return [];

    //find the index of the current week in weeks
    const week_index = weeks?.findIndex((week) => {
      const date = new Date();
      return week.start_date < date && week.end_date > date;
    });

    if (week_index === -1) return [];

    //if week_index is less than 2, just return
    // {"user_id": 0}, for all users
    if (week_index < 2) {
      console.log('week_index', week_index);

      const scores = groupScores[0].map((userScore) => {
        return {
          user_id: userScore.user_id,
          score: 0,
          week: weeks[0].week_id,
          potential: 0,
        };
      });

      return scores;
    }

    //find the scores for the week
    const scores = groupScores[week_index - 2];

    return scores;
  }, [groupScores, weeks]);

  const this_weeks_potential_scores = useMemo(() => {
    if (!groupScores) return [];

    if (!weeks) return [];

    if (groupScores.length === 0) return [];

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

  const communative_points_including_this_week = useMemo(() => {
    if (!groupScores) return [];

    const scores: { [key: string]: number } = {};

    groupScores.forEach((weekScores: WeekScores) => {
      weekScores.forEach((userScore: UserScore) => {
        const { user_id, score } = userScore;
        if (scores[user_id]) {
          scores[user_id] += score;
        } else {
          scores[user_id] = score;
        }
      });
    });

    return scores;
  }, [groupScores]);

  const cummulative_points_last_week = useMemo(() => {
    if (!groupScores) return [];

    const scores: { [key: string]: number } = {};

    const current_week_index = weeks?.findIndex(
      (week) => {
        const date = new Date();
        return week.start_date < date && week.end_date > date;
      },
      [weeks]
    );

    if (!current_week_index) return {};

    if (current_week_index === -1) return {};

    const last_week_index = current_week_index - 1;

    if (last_week_index < 0) return {};

    const LastWeekScores = groupScores[last_week_index];

    return LastWeekScores;
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

  //if groupScores empty array
  if (groupScores.length === 0) {
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
        scores_two_weeks_ago={scores_two_weeks_ago}
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
  scores_two_weeks_ago: WeekScores;
}> = ({
  last_weeks_scores,
  this_weeks_scores,
  All_Scores,
  this_weeks_potential_scores,
  scores_two_weeks_ago,
}) => {
  const unsorted_users = Array.from(
    new Set(All_Scores.flat().map((d) => d.user_id))
  ).sort();

  const [myUserId, setMyUserId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      //get the token from local storage
      const token = localStorage.getItem('accessToken');

      if (!token) {
        return;
      }

      //get the user_id from the token
      const token_parts = token?.split('.');

      if (token_parts) {
        try {
          const payload = JSON.parse(atob(token_parts[1]));

          console.log('payload', payload);

          setMyUserId(payload.preferred_username);
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  console.log('this_weeks_scores', this_weeks_scores);
  console.log('last_weeks_scores', last_weeks_scores);
  console.log('All_Scores', All_Scores);
  console.log('unsorted_users', unsorted_users);

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

  console.log('sorted users', users);

  console.log('scores_by_user', scores_by_user);
  //const scores as of last week, by getting the cummulativescores
  //and subtracting the last week
  const scores_last_week_unsorted: { [key: string]: number } = {};

  users.forEach((user) => {
    const last_week_score = last_weeks_scores.find((d) => d.user_id === user);
    if (last_week_score) {
      scores_last_week_unsorted[user] =
        scores_by_user[user][scores_by_user[user].length - 1] -
        last_week_score.score;
    } else {
      scores_last_week_unsorted[user] = 0;
    }
  });

  const scores_two_weeks_ago_unsorted: { [key: string]: number } = {};

  users.forEach((user) => {
    const two_weeks_ago_score = scores_two_weeks_ago.find(
      (d) => d.user_id === user
    );

    console.log('Scores Two Weeks Ago', scores_two_weeks_ago);

    const last_week_score = last_weeks_scores.find((d) => d.user_id === user);

    if (two_weeks_ago_score) {
      scores_two_weeks_ago_unsorted[user] =
        scores_by_user[user][scores_by_user[user].length - 1] -
        two_weeks_ago_score.score -
        (last_week_score?.score || 0);
    } else {
      scores_two_weeks_ago_unsorted[user] = 0;
    }
  });

  const scores_last_week = Object.fromEntries(
    Object.entries(scores_last_week_unsorted).sort(([, a], [, b]) => b - a)
  );

  const scores_two_weeks_ago_now = Object.fromEntries(
    Object.entries(scores_two_weeks_ago_unsorted).sort(([, a], [, b]) => b - a)
  );

  const scores_total = Object.fromEntries(
    Object.entries(scores_by_user).map(([user, scores]) => [
      user,
      scores[scores.length - 1],
    ])
  );

  console.log('scores_total', scores_total);

  console.log('scores_last_week', scores_last_week);

  console.log("users'", users);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Score Chart</h2>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full bg-white text-black">
          <thead>
            <tr>
              <th className="py-2 px-4 bg-gray-200 text-left">Place #.</th>
              <th className="py-2 px-4 bg-gray-200 text-left">Username</th>
              {/* Place */}

              <th className="py-2 px-4 bg-gray-200 text-left">Score</th>
              <th className="py-2 px-4 bg-gray-200 text-left">Weekly Score</th>
              {/* Potential Points For Week*/}
              <th className="py-2 px-4 bg-gray-200 text-left">
                Potential Points
              </th>
              <th className="py-2 px-4 bg-gray-200 text-left">Rank Change</th>
              {/* Last Week Rank Change*/}
              <th className="py-2 px-4 bg-gray-200 text-left">
                Last Week Rank Change
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              //get the place of the user from last week
              //1 is the best, 2 is the second best
              //and so on

              const this_users_Score_last_week = scores_last_week[user];

              //create an array of only the values sorted by the score
              const last_weeks_scores_sorted = Object.entries(
                scores_last_week
              ).sort((a, b) => b[1] - a[1]);

              console.log('Last Week Scores Sorted', last_weeks_scores_sorted);

              //find the  index of the first instance of the user's score
              const users_sorted_by_score_tiebreaker_last_week_index =
                //DO NOT USE A REFERENCE TO THIS USER, ITS THE SCORE VALUE
                last_weeks_scores_sorted.findIndex(
                  (d) => d[1] === this_users_Score_last_week
                ) + 1;

              console.log(
                "Last Week's Placement",
                users_sorted_by_score_tiebreaker_last_week_index
              );

              //now find this week's placement
              const this_users_score = scores_total[user];

              //create an array of only the values sorted by the score
              const total_scores_sorted = Object.entries(scores_total).sort(
                (a, b) => b[1] - a[1]
              );

              console.log('Total Scores Sorted', total_scores_sorted);

              //find the  index of the first instance of the user's score
              const users_sorted_by_score_tiebreaker_this_week_index =
                total_scores_sorted.findIndex((d) => {
                  //DO NOIT USE A REFERENCE TO THIS USER< ITS THE SCORE VALUE
                  return d[1] === this_users_score;
                }) + 1;

              console.log(
                "This Week's Placement",
                users_sorted_by_score_tiebreaker_this_week_index
              );

              //now find the movement
              const movement =
                users_sorted_by_score_tiebreaker_last_week_index -
                users_sorted_by_score_tiebreaker_this_week_index;

              //use scores_total to get the current place (with tiebreaker)

              const total_scores = Object.entries(scores_total);

              //sort by score
              total_scores.sort((a, b) => {
                const score_a = a[1];
                const score_b = b[1];
                if (score_a === score_b) {
                  return scores_last_week[b[0]] - scores_last_week[a[0]];
                }
                return score_b - score_a;
              });

              //find placement of user two weeks ago
              const this_users_Score_two_weeks_ago =
                scores_two_weeks_ago_now[user];

              //create an array of only the values sorted by the score
              const two_weeks_ago_scores_sorted = Object.entries(
                scores_two_weeks_ago_now
              ).sort((a, b) => b[1] - a[1]);

              console.log(
                'Two Weeks Ago Scores Sorted',
                two_weeks_ago_scores_sorted
              );

              //find the  index of the first instance of the user's score
              const users_sorted_by_score_tiebreaker_two_weeks_ago_index =
                //DO NOT USE A REFERENCE TO THIS USER, ITS THE SCORE VALUE
                two_weeks_ago_scores_sorted.findIndex(
                  (d) => d[1] === this_users_Score_two_weeks_ago
                ) + 1;

              console.log('User', user);

              const scoreChange = movement;

              const movement_last_week =
                users_sorted_by_score_tiebreaker_last_week_index -
                users_sorted_by_score_tiebreaker_two_weeks_ago_index;

              const potential_points_this_week =
                this_weeks_potential_scores.find(
                  (d) => d.user_id === user
                )?.score;

              return (
                <tr
                  key={user}
                  //highlight if this user id is the same as the logged in user
                  className={
                    myUserId === user
                      ? 'bg-gray-200 border-2 border-green-700'
                      : ''
                  }
                >
                  {/* Place */}
                  <td className="py-2 px-4 border-b border-gray-200">
                    {users_sorted_by_score_tiebreaker_this_week_index}
                  </td>
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
                  {/* Last Week Rank Change*/}
                  <td className="py-2 px-4 border-b border-gray-200">
                    {movement_last_week > 0 ? (
                      <>
                        <FaArrowUp className="text-green-500 mr-1 text-green" />
                        <span>{movement_last_week}</span>
                      </>
                    ) : movement_last_week < 0 ? (
                      <>
                        <FaArrowDown className="text-red-500 mr-1 text-red" />
                        <span>{Math.abs(movement_last_week)}</span>
                      </>
                    ) : (
                      <>
                        <FaArrowCircleRight className="text-gray-500 mr-1" />
                        <span>{movement_last_week}</span>
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

  //find index of last meaningful week
  const last_week_index = weeks?.findIndex((week) => {
    const date = new Date();
    return week.start_date < date && week.end_date > date;
  });

  //trim weeKScores to only include weeks that have started
  const meaningful_scores = scores; //.slice(0, (last_week_index || 0) + 1);

  console.log('last_week_index', last_week_index);
  console.log('meaningful_scores', meaningful_scores);

  const cumulativeScores: { [key: string]: number[] } = {};
  users.forEach((user) => {
    cumulativeScores[user] = [];
    let cumulativeScore = 0;
    meaningful_scores.forEach((weekScores) => {
      const userScore = weekScores.find((d) => d.user_id === user);
      if (userScore) {
        cumulativeScore += userScore.score;
      }
      cumulativeScores[user].push(cumulativeScore);
    });
  });

  const data = {
    labels: meaningful_scores.map((s, index) => {
      if (weeksLoading) return 'loading';
      if (!weeks) return 'loading';
      const week_for_score = weeks.find((week) => week.week_id == s[0].week);
      if (!week_for_score) return 'loading';

      return week_for_score.end_date.toLocaleDateString();
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
