'use client';

import { useGetWeeksForCurrentYear } from '@/queries/weeks';
import { QueryClientProvider } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

import { UserScore, WeekScores, AllScores } from '@/types/bets_and_odds';

import seGetScoresForGroup from '@/queries/scores';
/*
This Page will allow you to show th scores of the group members
by week
and total scores

You can select any of the week_ids or select "all" that shows
the total score with a 
week by week graph
*/

import queryClient from '@/queries/queryclient';
import { group } from 'console';

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

  const {
    data: groupScores,
    isLoading: isScoresLoading,
    isError: isScoresError,
  } = seGetScoresForGroup(id);

  console.log('groupScores', groupScores);

  const TotalScores = useMemo(() => {
    if (!groupScores) return {};
    // Reduce a map of total scores by user
    const totalScores: { [key: string]: number } = {};

    groupScores.forEach((weekScores: WeekScores) => {
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
  }, [groupScores]);

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
        {weeks?.map((week) => (
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

export default PageWithProvider;
