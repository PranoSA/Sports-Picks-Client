'use client';

import { useGetWeeksForCurrentYear } from '@/queries/weeks';
import { QueryClientProvider } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

import { UserScore, WeekScores, AllScores } from '@/types/bets_and_odds';

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
