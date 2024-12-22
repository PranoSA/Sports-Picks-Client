/**
 *
 * List All your groups here
 * Links so you can navigate to the group page
 */
'use client';

import { useGetGroups } from '@/queries/groups';
import { QueryClientProvider } from '@tanstack/react-query';
import queryClient from '@/queries/queryclient';
import Link from 'next/link';

const PageWithProvider = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <GroupsPage />
    </QueryClientProvider>
  );
};

function GroupsPage() {
  const { data, isLoading, isError } = useGetGroups();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error fetching groups</div>;
  }

  if (!data) {
    return <div>No groups found</div>;
  }

  return (
    <div>
      <h1>Groups</h1>
      <ul>
        {data.map((group) => (
          <li key={group.group_id}>
            <Link href={`/group/${group.group_id}`}>{group.group_name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PageWithProvider;
