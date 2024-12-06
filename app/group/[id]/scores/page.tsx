import { useGetWeeksForCurrentYear } from '@/queries/weeks';
import { QueryClientProvider } from '@tanstack/react-query';
/*
This Page will allow you to show th scores of the group members
by week
and total scores

You can select any of the week_ids or select "all" that shows
the total score with a 
week by week graph
*/

import queryClient from '@/queries/queryclient';

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

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error: </div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Scores</h1>
      <select>
        <option value="all">All</option>
        {weeks?.map((week) => (
          <option key={week.week_id} value={week.week_id}>
            {week.week_id}
          </option>
        ))}
      </select>
    </div>
  );
};

export default PageWithProvider;
