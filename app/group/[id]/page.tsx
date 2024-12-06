'use client';
import { QueryClientProvider } from '@tanstack/react-query';

import queryClient from '@/queries/queryclient';

import Link from 'next/link';

import React, { useEffect, useMemo, useState } from 'react';
import { useGetGroupById } from '@/queries/groups';

import GroupMemberDropdown from '@/components/GroupMemberDropdown';

import WeekMenu from '@/components/WeekMenu';

//
const GroupHomePageWithProvider: React.FC<{
  params: {
    id: string;
  };
}> = ({ params: { id } }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <GroupHomePage params={{ id }} />
    </QueryClientProvider>
  );
};

const GroupHomePage: React.FC<{
  params: {
    id: string;
  };
}> = ({ params: { id } }) => {
  //get grou
  const { data: group, isLoading, isError } = useGetGroupById(id);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error fetching group</div>;
  }

  if (!group) {
    return <div>No group found</div>;
  }

  return (
    <div className="p-4 flex flex-col items-center">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-800 p-6 rounded shadow-md">
        <h1 className="text-2xl font-bold mb-4 dark:text-white">
          Group Details
        </h1>
        <div className="mb-4 dark:text-white">
          <span className="font-semibold">Group ID:</span> {id}
        </div>
        <div className="mb-4 dark:text-white">
          <span className="font-semibold">Group Name:</span> {group.group_name}
        </div>
        <div className="mb-4 dark:text-white">
          <GroupMemberDropdown group={group} />
        </div>
        <Link href={`/group/${id}/picks`}></Link>
      </div>
      <WeekMenu group={group} />
    </div>
  );
};

export default GroupHomePageWithProvider;
